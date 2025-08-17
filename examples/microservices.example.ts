import { Module, Injectable, Controller, Get, Post, Body } from '@nestjs/common';
import { EventsModule, EventHandler, EventPublisher, EventSubscriber } from '@logistically/events-nestjs';
import { EventPublisherService, EventConsumerService } from '@logistically/events-nestjs';
import { EventUtils, NestJSEvent } from '@logistically/events-nestjs';
import { RedisStreamsPlugin, MemoryTransportPlugin } from '@logistically/events';

// ============================================================================
// USER SERVICE MODULE
// ============================================================================

@Module({
  imports: [
    EventsModule.forRoot({
      service: 'user-service',
      originPrefix: 'us.east',
      transports: new Map([
        ['redis', new RedisStreamsPlugin().createTransport({
          url: process.env.USER_SERVICE_REDIS_URL || 'redis://localhost:6379',
          groupId: 'user-service-group',
          batchSize: 100,
          enableDLQ: true,
          partitioning: {
            enabled: true,
            strategy: 'hash',
            partitionCount: 4,
            partitionKeyExtractor: (event) => event.body?.userId || event.header.id
          }
        })],
        ['memory', new MemoryTransportPlugin().createTransport({})]
      ]),
      publisher: {
        batching: {
          enabled: true,
          maxSize: 500,
          strategy: 'partition',
          partitionStrategy: {
            keyExtractor: (event) => event.body?.userId,
            partitionCount: 4
          }
        }
      },
      consumer: {
        enablePatternRouting: true,
        enableConsumerGroups: true,
        validationMode: 'warn'
      },
      global: true
    }),
  ],
  providers: [UserService],
  controllers: [UserController],
})
export class UserServiceModule {}

@Injectable()
export class UserService {
  constructor(
    private readonly eventPublisher: EventPublisherService,
    private readonly eventConsumer: EventConsumerService,
  ) {}

  @EventPublisher({ eventType: 'user.created' })
  async createUser(userData: { email: string; name: string }): Promise<string> {
    const userId = `user-${Date.now()}`;
    
    const event = EventUtils.createDomainEvent(
      'user.created',
      { userId, ...userData },
      'user-service',
      userId,
      1,
      {
        correlationId: EventUtils.generateCorrelationId(),
        metadata: { source: 'user-api' }
      }
    );

    await this.eventPublisher.publishEvent(event);
    return userId;
  }

  @EventPublisher({ eventType: 'user.updated' })
  async updateUser(userId: string, changes: any): Promise<void> {
    const event = EventUtils.createDomainEvent(
      'user.updated',
      { userId, changes },
      'user-service',
      userId,
      2
    );

    await this.eventPublisher.publishEvent(event);
  }

  @EventHandler({ eventType: 'user.profile.requested' })
  async handleProfileRequest(event: NestJSEvent<any>): Promise<void> {
    console.log(`Profile requested for user: ${event.body.userId}`);
    
    // Publish profile data
    const profileEvent = EventUtils.createDomainEvent(
      'user.profile.provided',
      { userId: event.body.userId, profile: { /* user profile data */ } },
      'user-service',
      event.body.userId,
      3,
      {
        correlationId: event.nestjsMetadata?.correlationId,
        causationId: event.header.id
      }
    );

    await this.eventPublisher.publishEvent(profileEvent);
  }
}

@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post()
  async createUser(@Body() userData: { email: string; name: string }) {
    const userId = await this.userService.createUser(userData);
    return { userId, message: 'User created successfully' };
  }

  @Post(':id')
  async updateUser(@Body() changes: any) {
    await this.userService.updateUser(changes.userId, changes);
    return { message: 'User updated successfully' };
  }
}

// ============================================================================
// ORDER SERVICE MODULE
// ============================================================================

@Module({
  imports: [
    EventsModule.forRoot({
      service: 'order-service',
      originPrefix: 'us.east',
      transports: new Map([
        ['redis', new RedisStreamsPlugin().createTransport({
          url: process.env.ORDER_SERVICE_REDIS_URL || 'redis://localhost:6379',
          groupId: 'order-service-group',
          batchSize: 200,
          enableDLQ: true,
          partitioning: {
            enabled: true,
            strategy: 'hash',
            partitionCount: 8,
            partitionKeyExtractor: (event) => event.body?.orderId || event.header.id
          }
        })],
        ['memory', new MemoryTransportPlugin().createTransport({})]
      ]),
      publisher: {
        batching: {
          enabled: true,
          maxSize: 1000,
          strategy: 'partition',
          partitionStrategy: {
            keyExtractor: (event) => event.body?.orderId,
            partitionCount: 8
          }
        },
        retry: {
          maxRetries: 3,
          backoffStrategy: 'exponential'
        }
      },
      consumer: {
        enablePatternRouting: true,
        enableConsumerGroups: true,
        validationMode: 'strict'
      },
      global: true
    }),
  ],
  providers: [OrderService],
  controllers: [OrderController],
})
export class OrderServiceModule {}

@Injectable()
export class OrderService {
  constructor(
    private readonly eventPublisher: EventPublisherService,
    private readonly eventConsumer: EventConsumerService,
  ) {}

  @EventPublisher({ eventType: 'order.created' })
  async createOrder(orderData: { userId: string; items: any[]; total: number }): Promise<string> {
    const orderId = `order-${Date.now()}`;
    
    const event = EventUtils.createDomainEvent(
      'order.created',
      { orderId, ...orderData },
      'order-service',
      orderId,
      1,
      {
        correlationId: EventUtils.generateCorrelationId(),
        causationId: `user-${orderData.userId}`
      }
    );

    await this.eventPublisher.publishEvent(event);
    return orderId;
  }

  @EventHandler({ eventType: 'user.created' })
  async handleUserCreated(event: NestJSEvent<any>): Promise<void> {
    console.log(`User created event received in order service: ${event.body.userId}`);
    
    // Initialize user's order history
    const initEvent = EventUtils.createDomainEvent(
      'order.history.initialized',
      { userId: event.body.userId, orderCount: 0 },
      'order-service',
      event.body.userId,
      1,
      {
        correlationId: event.nestjsMetadata?.correlationId,
        causationId: event.header.id
      }
    );

    await this.eventPublisher.publishEvent(initEvent);
  }

  @EventHandler({ eventType: 'payment.processed' })
  async handlePaymentProcessed(event: NestJSEvent<any>): Promise<void> {
    console.log(`Payment processed for order: ${event.body.orderId}`);
    
    // Update order status
    const updateEvent = EventUtils.createDomainEvent(
      'order.status.updated',
      { 
        orderId: event.body.orderId, 
        status: 'paid',
        paymentId: event.body.paymentId 
      },
      'order-service',
      event.body.orderId,
      2,
      {
        correlationId: event.nestjsMetadata?.correlationId,
        causationId: event.header.id
      }
    );

    await this.eventPublisher.publishEvent(updateEvent);
  }
}

@Controller('orders')
export class OrderController {
  constructor(private readonly orderService: OrderService) {}

  @Post()
  async createOrder(@Body() orderData: { userId: string; items: any[]; total: number }) {
    const orderId = await this.orderService.createOrder(orderData);
    return { orderId, message: 'Order created successfully' };
  }
}

// ============================================================================
// PAYMENT SERVICE MODULE
// ============================================================================

@Module({
  imports: [
    EventsModule.forRoot({
      service: 'payment-service',
      originPrefix: 'us.east',
      transports: new Map([
        ['redis', new RedisStreamsPlugin().createTransport({
          url: process.env.PAYMENT_SERVICE_REDIS_URL || 'redis://localhost:6379',
          groupId: 'payment-service-group',
          batchSize: 100,
          enableDLQ: true,
          partitioning: {
            enabled: true,
            strategy: 'hash',
            partitionCount: 4,
            partitionKeyExtractor: (event) => event.body?.paymentId || event.header.id
          }
        })],
        ['memory', new MemoryTransportPlugin().createTransport({})]
      ]),
      publisher: {
        batching: {
          enabled: true,
          maxSize: 500,
          strategy: 'partition',
          partitionStrategy: {
            keyExtractor: (event) => event.body?.paymentId,
            partitionCount: 4
          }
        }
      },
      consumer: {
        enablePatternRouting: true,
        enableConsumerGroups: true,
        validationMode: 'strict'
      },
      global: true
    }),
  ],
  providers: [PaymentService],
  controllers: [PaymentController],
})
export class PaymentServiceModule {}

@Injectable()
export class PaymentService {
  constructor(
    private readonly eventPublisher: EventPublisherService,
    private readonly eventConsumer: EventConsumerService,
  ) {}

  @EventPublisher({ eventType: 'payment.processed' })
  async processPayment(paymentData: { orderId: string; amount: number; method: string }): Promise<string> {
    const paymentId = `payment-${Date.now()}`;
    
    // Simulate payment processing
    const success = Math.random() > 0.1; // 90% success rate
    
    if (success) {
      const event = EventUtils.createDomainEvent(
        'payment.processed',
        { paymentId, ...paymentData, status: 'success' },
        'payment-service',
        paymentId,
        1,
        {
          correlationId: EventUtils.generateCorrelationId(),
          causationId: `order-${paymentData.orderId}`
        }
      );

      await this.eventPublisher.publishEvent(event);
      return paymentId;
    } else {
      const event = EventUtils.createDomainEvent(
        'payment.failed',
        { paymentId, ...paymentData, status: 'failed', reason: 'insufficient_funds' },
        'payment-service',
        paymentId,
        1,
        {
          correlationId: EventUtils.generateCorrelationId(),
          causationId: `order-${paymentData.orderId}`
        }
      );

      await this.eventPublisher.publishEvent(event);
      throw new Error('Payment failed');
    }
  }

  @EventHandler({ eventType: 'order.created' })
  async handleOrderCreated(event: NestJSEvent<any>): Promise<void> {
    console.log(`Order created event received in payment service: ${event.body.orderId}`);
    
    // Request payment for the order
    const paymentRequestEvent = EventUtils.createDomainEvent(
      'payment.requested',
      { 
        orderId: event.body.orderId, 
        amount: event.body.total,
        method: 'credit_card' // default method
      },
      'payment-service',
      event.body.orderId,
      1,
      {
        correlationId: event.nestjsMetadata?.correlationId,
        causationId: event.header.id
      }
    );

    await this.eventPublisher.publishEvent(paymentRequestEvent);
  }
}

@Controller('payments')
export class PaymentController {
  constructor(private readonly paymentService: PaymentService) {}

  @Post()
  async processPayment(@Body() paymentData: { orderId: string; amount: number; method: string }) {
    const paymentId = await this.paymentService.processPayment(paymentData);
    return { paymentId, message: 'Payment processed successfully' };
  }
}

// ============================================================================
// INVENTORY SERVICE MODULE
// ============================================================================

@Module({
  imports: [
    EventsModule.forRoot({
      service: 'inventory-service',
      originPrefix: 'us.east',
      transports: new Map([
        ['redis', new RedisStreamsPlugin().createTransport({
          url: process.env.INVENTORY_SERVICE_REDIS_URL || 'redis://localhost:6379',
          groupId: 'inventory-service-group',
          batchSize: 150,
          enableDLQ: true,
          partitioning: {
            enabled: true,
            strategy: 'hash',
            partitionCount: 6,
            partitionKeyExtractor: (event) => event.body?.productId || event.header.id
          }
        })],
        ['memory', new MemoryTransportPlugin().createTransport({})]
      ]),
      publisher: {
        batching: {
          enabled: true,
          maxSize: 750,
          strategy: 'partition',
          partitionStrategy: {
            keyExtractor: (event) => event.body?.productId,
            partitionCount: 6
          }
        }
      },
      consumer: {
        enablePatternRouting: true,
        enableConsumerGroups: true,
        validationMode: 'warn'
      },
      global: true
    }),
  ],
  providers: [InventoryService],
  controllers: [InventoryController],
})
export class InventoryServiceModule {}

@Injectable()
export class InventoryService {
  constructor(
    private readonly eventPublisher: EventPublisherService,
    private readonly eventConsumer: EventConsumerService,
  ) {}

  @EventHandler({ eventType: 'order.created' })
  async handleOrderCreated(event: NestJSEvent<any>): Promise<void> {
    console.log(`Order created event received in inventory service: ${event.body.orderId}`);
    
    // Check inventory for all items
    const inventoryCheckEvent = EventUtils.createDomainEvent(
      'inventory.checked',
      { 
        orderId: event.body.orderId,
        items: event.body.items,
        available: true // simplified for example
      },
      'inventory-service',
      event.body.orderId,
      1,
      {
        correlationId: event.nestjsMetadata?.correlationId,
        causationId: event.header.id
      }
    );

    await this.eventPublisher.publishEvent(inventoryCheckEvent);
  }

  @EventHandler({ eventType: 'payment.processed' })
  async handlePaymentProcessed(event: NestJSEvent<any>): Promise<void> {
    console.log(`Payment processed event received in inventory service: ${event.body.paymentId}`);
    
    // Reserve inventory for the order
    const reservationEvent = EventUtils.createDomainEvent(
      'inventory.reserved',
      { 
        orderId: event.body.orderId,
        items: [], // would contain actual item details
        reservedUntil: new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours
      },
      'inventory-service',
      event.body.orderId,
      1,
      {
        correlationId: event.nestjsMetadata?.correlationId,
        causationId: event.header.id
      }
    );

    await this.eventPublisher.publishEvent(reservationEvent);
  }
}

@Controller('inventory')
export class InventoryController {
  constructor(private readonly inventoryService: InventoryService) {}

  @Get('status')
  async getInventoryStatus() {
    return { message: 'Inventory service is running' };
  }
}

// ============================================================================
// NOTIFICATION SERVICE MODULE
// ============================================================================

@Module({
  imports: [
    EventsModule.forRoot({
      service: 'notification-service',
      originPrefix: 'us.east',
      transports: new Map([
        ['redis', new RedisStreamsPlugin().createTransport({
          url: process.env.NOTIFICATION_SERVICE_REDIS_URL || 'redis://localhost:6379',
          groupId: 'notification-service-group',
          batchSize: 100,
          enableDLQ: true,
          partitioning: {
            enabled: true,
            strategy: 'hash',
            partitionCount: 4,
            partitionKeyExtractor: (event) => event.body?.userId || event.header.id
          }
        })],
        ['memory', new MemoryTransportPlugin().createTransport({})]
      ]),
      consumer: {
        enablePatternRouting: true,
        enableConsumerGroups: true,
        validationMode: 'warn'
      },
      global: true
    }),
  ],
  providers: [NotificationService],
  controllers: [NotificationController],
})
export class NotificationServiceModule {}

@Injectable()
export class NotificationService {
  constructor(
    private readonly eventPublisher: EventPublisherService,
    private readonly eventConsumer: EventConsumerService,
  ) {}

  @EventHandler({ eventType: 'user.created' })
  async handleUserCreated(event: NestJSEvent<any>): Promise<void> {
    console.log(`User created event received in notification service: ${event.body.userId}`);
    
    // Send welcome email
    const welcomeEvent = EventUtils.createDomainEvent(
      'notification.sent',
      { 
        userId: event.body.userId,
        type: 'welcome_email',
        status: 'sent'
      },
      'notification-service',
      event.body.userId,
      1,
      {
        correlationId: event.nestjsMetadata?.correlationId,
        causationId: event.header.id
      }
    );

    await this.eventPublisher.publishEvent(welcomeEvent);
  }

  @EventHandler({ eventType: 'order.created' })
  async handleOrderCreated(event: NestJSEvent<any>): Promise<void> {
    console.log(`Order created event received in notification service: ${event.body.orderId}`);
    
    // Send order confirmation
    const confirmationEvent = EventUtils.createDomainEvent(
      'notification.sent',
      { 
        userId: event.body.userId,
        type: 'order_confirmation',
        orderId: event.body.orderId,
        status: 'sent'
      },
      'notification-service',
      event.body.orderId,
      1,
      {
        correlationId: event.nestjsMetadata?.correlationId,
        causationId: event.header.id
      }
    );

    await this.eventPublisher.publishEvent(confirmationEvent);
  }

  @EventHandler({ eventType: 'payment.processed' })
  async handlePaymentProcessed(event: NestJSEvent<any>): Promise<void> {
    console.log(`Payment processed event received in notification service: ${event.body.paymentId}`);
    
    // Send payment confirmation
    const paymentEvent = EventUtils.createDomainEvent(
      'notification.sent',
      { 
        userId: event.body.userId,
        type: 'payment_confirmation',
        orderId: event.body.orderId,
        paymentId: event.body.paymentId,
        status: 'sent'
      },
      'notification-service',
      event.body.paymentId,
      1,
      {
        correlationId: event.nestjsMetadata?.correlationId,
        causationId: event.header.id
      }
    );

    await this.eventPublisher.publishEvent(paymentEvent);
  }
}

@Controller('notifications')
export class NotificationController {
  constructor(private readonly notificationService: NotificationService) {}

  @Get('status')
  async getNotificationStatus() {
    return { message: 'Notification service is running' };
  }
}

// ============================================================================
// ENVIRONMENT VARIABLES FOR MICROSERVICES
// ============================================================================

/*
# Microservices Configuration
USER_SERVICE_REDIS_URL=redis://localhost:6379
ORDER_SERVICE_REDIS_URL=redis://localhost:6379
PAYMENT_SERVICE_REDIS_URL=redis://localhost:6379
INVENTORY_SERVICE_REDIS_URL=redis://localhost:6379
NOTIFICATION_SERVICE_REDIS_URL=redis://localhost:6379

# Service-specific settings
USER_SERVICE_PARTITION_COUNT=4
ORDER_SERVICE_PARTITION_COUNT=8
PAYMENT_SERVICE_PARTITION_COUNT=4
INVENTORY_SERVICE_PARTITION_COUNT=6
NOTIFICATION_SERVICE_PARTITION_COUNT=4

# Cross-service communication
EVENTS_CORRELATION_ID_HEADER=x-correlation-id
EVENTS_CAUSATION_ID_HEADER=x-causation-id
EVENTS_REQUEST_EVENTS=true
EVENTS_RESPONSE_EVENTS=true
*/
