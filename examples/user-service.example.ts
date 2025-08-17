import { Injectable } from '@nestjs/common';
import { EventHandler, EventPublisher } from '@logistically/events-nestjs';
import { EventPublisherService, EventConsumerService } from '@logistically/events-nestjs';
import { EventUtils, NestJSEvent } from '@logistically/events-nestjs';

export interface UserCreatedEvent {
  userId: string;
  email: string;
  name: string;
}

export interface UserUpdatedEvent {
  userId: string;
  changes: Partial<{
    email: string;
    name: string;
  }>;
}

@Injectable()
export class UserService {
  constructor(
    private readonly eventPublisher: EventPublisherService,
    private readonly eventConsumer: EventConsumerService,
  ) {}

  @EventPublisher({ eventType: 'user.created' })
  async createUser(email: string, name: string): Promise<string> {
    const userId = `user-${Date.now()}`;
    
    // Create the event using EventUtils
    const event = EventUtils.createDomainEvent<UserCreatedEvent>(
      'user.created',
      { userId, email, name },
      'user-service',
      userId,
      1
    );

    // Publish the event
    await this.eventPublisher.publishEvent(event);

    return userId;
  }

  @EventPublisher({ eventType: 'user.updated' })
  async updateUser(userId: string, changes: Partial<{ email: string; name: string }>): Promise<void> {
    // Create the event using EventUtils
    const event = EventUtils.createDomainEvent<UserUpdatedEvent>(
      'user.updated',
      { userId, changes },
      'user-service',
      userId,
      2
    );

    // Publish the event
    await this.eventPublisher.publishEvent(event);
  }

  @EventHandler({ eventType: 'user.created' })
  async handleUserCreated(event: NestJSEvent<UserCreatedEvent>): Promise<void> {
    console.log(`User created: ${event.body.userId} - ${event.body.email}`);
    
    // Here you could:
    // - Send welcome email
    // - Create user profile
    // - Initialize user preferences
    // - etc.
  }

  @EventHandler({ eventType: 'user.updated' })
  async handleUserUpdated(event: NestJSEvent<UserUpdatedEvent>): Promise<void> {
    console.log(`User updated: ${event.body.userId}`, event.body.changes);
    
    // Here you could:
    // - Update user profile
    // - Send notification
    // - Update search index
    // - etc.
  }

  // Manual event publishing example
  async publishUserDeleted(userId: string): Promise<void> {
    const event = EventUtils.createEvent(
      'user.deleted',
      { userId, deletedAt: new Date().toISOString() },
      'user-service',
      { correlationId: EventUtils.generateCorrelationId() }
    );

    await this.eventPublisher.publishEvent(event);
  }

  // Batch event publishing example
  async publishUserBatch(users: Array<{ userId: string; action: string }>): Promise<void> {
    const events = EventUtils.createEventBatch(
      users.map(user => ({
        type: `user.${user.action}`,
        data: { userId: user.userId, timestamp: new Date().toISOString() },
      })),
      'user-service',
      EventUtils.generateCorrelationId()
    );

    // Publish each event individually (you could also implement batch publishing)
    for (const event of events) {
      await this.eventPublisher.publishEvent(event);
    }
  }
}
