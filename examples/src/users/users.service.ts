import { Injectable, Logger } from '@nestjs/common';
import { EventPublisherService, AutoEventHandler, NestJSEvent, AutoEvents, EventDiscoveryService } from '@logistically/events-nestjs';

export interface User {
  id: number;
  email: string;
  name: string;
  createdAt: Date;
}

@Injectable()
@AutoEvents() // TRUE ENTERPRISE DX - Zero manual work needed!
export class UsersService {
  private readonly logger = new Logger(UsersService.name);
  private users: User[] = [
    { id: 1, email: 'john@example.com', name: 'John Doe', createdAt: new Date() },
    { id: 2, email: 'jane@example.com', name: 'Jane Smith', createdAt: new Date() }
  ];

  constructor(
    private readonly eventPublisher: EventPublisherService,
    private readonly eventDiscoveryService: EventDiscoveryService, // Inject for auto-registration
  ) {}

  async createUser(email: string, name: string): Promise<User> {
    const user: User = {
      id: this.users.length + 1,
      email,
      name,
      createdAt: new Date()
    };

    this.users.push(user);

    // Publish event
    await this.eventPublisher.publish('user.registered', {
      id: user.id,
      email: user.email,
      name: user.name,
      createdAt: user.createdAt
    });

    this.logger.log(`User created: ${JSON.stringify(user)}`);
    return user;
  }

  async getUsers(): Promise<User[]> {
    return this.users;
  }

  async getUser(id: number): Promise<User | null> {
    return this.users.find(user => user.id === id) || null;
  }

  @AutoEventHandler({ eventType: 'user.registered' })
  async handleUserRegistered(event: NestJSEvent<User>) {
    this.logger.log(`🎉 Auto-handler: User registered event received: ${JSON.stringify(event.body)}`);
    
    // Business logic for user registration
    // e.g., send welcome email, create user profile, etc.
  }

  @AutoEventHandler({ eventType: 'order.created' })
  async handleOrderCreated(event: NestJSEvent<{ id: number; userId: number; items: string[]; total: number }>) {
    this.logger.log(`🎉 Auto-handler: Order created event received: ${JSON.stringify(event.body)}`);
    
    // Business logic for order creation
    // e.g., update user order history, send order confirmation, etc.
  }
}
