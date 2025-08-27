import { Injectable, Logger } from '@nestjs/common';
import { EventPublisherService, AutoEventHandler, NestJSEvent, AutoEvents, EventDiscoveryService } from '@logistically/events-nestjs';

export interface Order {
  id: number;
  userId: number;
  items: string[];
  total: number;
  status: string;
  createdAt: Date;
}

@Injectable()
@AutoEvents() // TRUE ENTERPRISE DX - Zero manual work needed!
export class OrdersService {
  private readonly logger = new Logger(OrdersService.name);
  private orders: Order[] = [
    { id: 1, userId: 1, items: ['Laptop', 'Mouse'], total: 1299.99, status: 'pending', createdAt: new Date() },
    { id: 2, userId: 2, items: ['Keyboard'], total: 89.99, status: 'shipped', createdAt: new Date() }
  ];

  constructor(
    private readonly eventPublisher: EventPublisherService,
    private readonly eventDiscoveryService: EventDiscoveryService, // Inject for auto-registration
  ) {}

  async createOrder(userId: number, items: string[], total: number): Promise<Order> {
    const order: Order = {
      id: this.orders.length + 1,
      userId,
      items,
      total,
      status: 'pending',
      createdAt: new Date()
    };

    this.orders.push(order);

    // Publish event
    await this.eventPublisher.publish('order.created', {
      id: order.id,
      userId: order.userId,
      items: order.items,
      total: order.total,
      status: order.status,
      createdAt: order.createdAt
    });

    this.logger.log(`Order created: ${JSON.stringify(order)}`);
    return order;
  }

  async getOrders(): Promise<Order[]> {
    return this.orders;
  }

  async getOrder(id: number): Promise<Order | null> {
    return this.orders.find(order => order.id === id) || null;
  }

  @AutoEventHandler({ eventType: 'order.created' })
  async handleOrderCreated(event: NestJSEvent<Order>) {
    this.logger.log(`🎉 Auto-handler: Order created event received: ${JSON.stringify(event.body)}`);
    
    // Business logic for order created
    // e.g., send confirmation email, update inventory, etc.
  }

  @AutoEventHandler({ eventType: 'user.registered' })
  async handleUserRegistered(event: NestJSEvent<{ id: number; email: string }>) {
    this.logger.log(`🎉 Auto-handler: User registered event received: ${JSON.stringify(event.body)}`);
    
    // Business logic for new user
    // e.g., send welcome email, create default preferences, etc.
  }
}
