import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { EventPublisherService, AutoEventHandler, EventDiscoveryService, NestJSEvent } from '@logistically/events-nestjs';

export interface Order {
  id: number;
  userId: number;
  items: string[];
  total: number;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  createdAt: Date;
}

@Injectable()
export class OrdersService implements OnModuleInit {
  private readonly logger = new Logger(OrdersService.name);
  private orders: Order[] = [
    {
      id: 1,
      userId: 1,
      items: ['Laptop', 'Mouse'],
      total: 1299.99,
      status: 'pending',
      createdAt: new Date()
    }
  ];

  constructor(
    private readonly eventPublisher: EventPublisherService,
    private readonly eventDiscoveryService: EventDiscoveryService,
  ) {}

  async onModuleInit() {
    // Register this service's event handlers
    await this.eventDiscoveryService.registerEventHandlers(this);
  }

  async findAll(): Promise<Order[]> {
    this.logger.log('Fetching all orders');
    await this.eventPublisher.publish('orders.fetched', { count: this.orders.length });
    return this.orders;
  }

  async findOne(id: number): Promise<Order | null> {
    this.logger.log(`Fetching order ${id}`);
    const order = this.orders.find(o => o.id === id);
    if (order) {
      await this.eventPublisher.publish('order.fetched', { orderId: id });
    }
    return order || null;
  }

  async create(userId: number, items: string[], total: number, status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled' = 'pending'): Promise<Order> {
    this.logger.log(`Creating order for user ${userId}`);
    const order: Order = {
      id: this.orders.length + 1,
      userId,
      items,
      total,
      status,
      createdAt: new Date()
    };
    this.orders.push(order);
    await this.eventPublisher.publish('order.created', { order });
    return order;
  }

  async updateStatus(id: number, status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled'): Promise<Order | null> {
    this.logger.log(`Updating order ${id} status to ${status}`);
    const order = this.orders.find(o => o.id === id);
    if (order) {
      order.status = status;
      await this.eventPublisher.publish('order.status.updated', { orderId: id, status });
    }
    return order || null;
  }

  // Event handlers using AutoEventHandler decorators - these will be automatically discovered
  @AutoEventHandler({ eventType: 'user.*' })
  async handleUserCreated(event: NestJSEvent<any>) {
    this.logger.log(`All user events received: ${JSON.stringify(event)}`);
    // Handle user creation logic
  }

  @AutoEventHandler({ eventType: 'user.updated' })
  async handleUserUpdated(event: NestJSEvent<any>) {
    this.logger.log(`User updated event received: ${JSON.stringify(event)}`);
    // Handle user update logic
  }

  @AutoEventHandler({ eventType: 'order.created' })
  async handleOrderCreated(event: NestJSEvent<any>) {
    this.logger.log(`Order created event received: ${JSON.stringify(event)}`);
    // Handle order creation logic
  }
}
