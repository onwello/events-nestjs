import { Injectable, Logger } from '@nestjs/common';
import { EventPublisherService, AutoEventHandler, NestJSEvent, AutoEventHandlerBase, EventDiscoveryService } from '@logistically/events-nestjs';

export interface Order {
  id: number;
  userId: number;
  items: string[];
  total: number;
  status: 'pending' | 'processing' | 'completed' | 'cancelled';
  createdAt: string;
}

@Injectable()
export class OrdersService extends AutoEventHandlerBase {
  private readonly logger = new Logger(OrdersService.name);
  private orders: Order[] = [
    {
      id: 1,
      userId: 1,
      items: ['Laptop', 'Mouse'],
      total: 1299.99,
      status: 'completed',
      createdAt: '2025-08-27T10:00:00.000Z'
    },
    {
      id: 2,
      userId: 2,
      items: ['Keyboard'],
      total: 89.99,
      status: 'pending',
      createdAt: '2025-08-27T11:00:00.000Z'
    }
  ];

  constructor(
    private readonly eventPublisher: EventPublisherService,
    eventDiscoveryService: EventDiscoveryService,
  ) {
    super(eventDiscoveryService);
  }

  findAll(): Order[] {
    return this.orders;
  }

  findOne(id: number): Order | undefined {
    return this.orders.find(order => order.id === id);
  }

  async create(userId: number, items: string[], total: number): Promise<Order> {
    const order: Order = {
      id: this.orders.length + 1,
      userId,
      items,
      total,
      status: 'pending',
      createdAt: new Date().toISOString()
    };

    this.orders.push(order);

    // Publish order created event
    await this.eventPublisher.publish('order.created', {
      order,
      timestamp: new Date().toISOString()
    });

    this.logger.log(`Order created: ${JSON.stringify(order)}`);
    return order;
  }

  async updateStatus(id: number, status: Order['status']): Promise<Order | undefined> {
    const order = this.orders.find(o => o.id === id);
    if (!order) {
      return undefined;
    }

    order.status = status;

    // Publish order updated event
    await this.eventPublisher.publish('order.updated', {
      orderId: id,
      order,
      timestamp: new Date().toISOString()
    });

    this.logger.log(`Order ${id} status updated to: ${status}`);
    return order;
  }

  // Pattern-based handler for all user events
  @AutoEventHandler({ eventType: 'user.*' })
  async handleAllUserEvents(event: NestJSEvent<any>) {
    this.logger.log(`All user events received: ${JSON.stringify(event)}`);
    // Handle any user event
  }

  // Specific handler for user updates
  @AutoEventHandler({ eventType: 'user.updated' })
  async handleUserUpdated(event: NestJSEvent<any>) {
    this.logger.log(`User updated event received: ${JSON.stringify(event)}`);
    // Handle user update logic
  }

  // Specific handler for order creation
  @AutoEventHandler({ eventType: 'order.created' })
  async handleOrderCreated(event: NestJSEvent<any>) {
    this.logger.log(`Order created event received: ${JSON.stringify(event)}`);
    // Handle order creation logic
  }
}
