import { Injectable, Logger } from '@nestjs/common';
import { EventPublisherService, AutoEventHandlerProvider, EventHandlerMetadata, NestJSEvent } from '@logistically/events-nestjs';

export interface User {
  id: number;
  name: string;
  email: string;
  createdAt: string;
}

@Injectable()
export class UsersService implements AutoEventHandlerProvider {
  private readonly logger = new Logger(UsersService.name);
  private users: User[] = [
    {
      id: 1,
      name: 'John Doe',
      email: 'john@example.com',
      createdAt: '2025-08-27T10:00:00.000Z'
    },
    {
      id: 2,
      name: 'Jane Smith',
      email: 'jane@example.com',
      createdAt: '2025-08-27T11:00:00.000Z'
    }
  ];

  constructor(
    private readonly eventPublisher: EventPublisherService,
  ) {}

  findAll(): User[] {
    return this.users;
  }

  findOne(id: number): User | undefined {
    return this.users.find(user => user.id === id);
  }

  async create(name: string, email: string): Promise<User> {
    const user: User = {
      id: this.users.length + 1,
      name,
      email,
      createdAt: new Date().toISOString()
    };

    this.users.push(user);

    // Publish user created event
    await this.eventPublisher.publish('user.created', {
      user,
      timestamp: new Date().toISOString()
    });

    this.logger.log(`User created: ${JSON.stringify(user)}`);
    return user;
  }

  async update(id: number, name: string, email: string): Promise<User | undefined> {
    const user = this.users.find(u => u.id === id);
    if (!user) {
      return undefined;
    }

    user.name = name;
    user.email = email;

    // Publish user updated event
    await this.eventPublisher.publish('user.updated', {
      userId: id,
      user,
      timestamp: new Date().toISOString()
    });

    this.logger.log(`User ${id} updated: ${JSON.stringify(user)}`);
    return user;
  }

  async delete(id: number): Promise<boolean> {
    const userIndex = this.users.findIndex(u => u.id === id);
    if (userIndex === -1) {
      return false;
    }

    this.users.splice(userIndex, 1);

    // Publish user deleted event
    await this.eventPublisher.publish('user.deleted', {
      userId: id,
      timestamp: new Date().toISOString()
    });

    this.logger.log(`User ${id} deleted`);
    return true;
  }

  // Interface-based approach: Implement AutoEventHandlerProvider
  getEventHandlers(): EventHandlerMetadata[] {
    return [
      {
        eventType: 'order.*',
        methodName: 'handleAllOrderEvents',
        priority: 1,
        async: true,
        retry: {
          maxAttempts: 3,
          backoffMs: 1000
        }
      },
      {
        eventType: 'order.created',
        methodName: 'handleOrderCreated',
        priority: 2,
        async: true
      },
      {
        eventType: 'order.updated',
        methodName: 'handleOrderUpdated',
        priority: 2,
        async: true
      }
    ];
  }

  getServiceInstance(): any {
    return this;
  }

  validateEventHandlers(): boolean {
    // Custom validation logic
    const handlers = this.getEventHandlers();
    return handlers.every(handler => 
      typeof this[handler.methodName as keyof this] === 'function'
    );
  }

  onEventHandlersRegistered(handlers: EventHandlerMetadata[]): void {
    this.logger.log(`Registered ${handlers.length} event handlers for UsersService`);
  }

  // Event handler methods
  async handleAllOrderEvents(event: NestJSEvent<any>) {
    this.logger.log(`All order events received: ${JSON.stringify(event)}`);
  }

  async handleOrderCreated(event: NestJSEvent<any>) {
    this.logger.log(`Order created event received: ${JSON.stringify(event)}`);
    // Handle order creation logic
  }

  async handleOrderUpdated(event: NestJSEvent<any>) {
    this.logger.log(`Order updated event received: ${JSON.stringify(event)}`);
    // Handle order update logic
  }
}
