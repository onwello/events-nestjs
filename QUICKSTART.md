# Quick Start Guide

Get up and running with `@logistically/events-nestjs` in under 3 minutes.

## Prerequisites

- Node.js 18+ 
- NestJS application
- Redis (optional, for production)

## Installation

```bash
npm install @logistically/events-nestjs @logistically/events
```

## Step 1: Basic Setup (30 seconds)

Add the module to your `app.module.ts`:

```typescript
import { Module } from '@nestjs/common';
import { EventsModule } from '@logistically/events-nestjs';

@Module({
  imports: [
    EventsModule.forRoot({
      service: 'my-app',
      autoDiscovery: true,
      global: true
    })
  ]
})
export class AppModule {}
```

## Step 2: Create Event Handlers (1 minute)

Create a service with event handlers:

```typescript
import { Injectable } from '@nestjs/common';
import { AutoEvents, AutoEventHandler, NestJSEvent } from '@logistically/events-nestjs';

@Injectable()
@AutoEvents()
export class UserService {
  @AutoEventHandler({ eventType: 'user.created' })
  async handleUserCreated(event: NestJSEvent<{ id: number; email: string }>) {
    console.log('User created:', event.body);
    // Send welcome email, create profile, etc.
  }

  @AutoEventHandler({ eventType: 'order.*' })
  async handleAllOrderEvents(event: NestJSEvent<any>) {
    console.log('Order event received:', event.body);
    // Update user order history, etc.
  }
}
```

## Step 3: Publish Events (30 seconds)

Inject and use the event publisher:

```typescript
import { Injectable } from '@nestjs/common';
import { EventPublisherService } from '@logistically/events-nestjs';

@Injectable()
export class OrderService {
  constructor(private readonly eventPublisher: EventPublisherService) {}

  async createOrder(orderData: any) {
    // Your business logic here
    
    // Publish event
    await this.eventPublisher.publish('order.created', orderData);
  }
}
```

## Step 4: Test It (1 minute)

Start your application and create some data:

```bash
# Start your app
npm run start:dev

# In another terminal, test the API
curl -X POST http://localhost:3000/users \
  -H "Content-Type: application/json" \
  -d '{"email": "test@example.com", "name": "Test User"}'
```

You should see the event handler logs in your console!

## What Just Happened?

1. **Automatic Discovery**: The `@AutoEvents()` decorator automatically discovered your service
2. **Handler Registration**: Event handlers were automatically registered with the event system
3. **Event Processing**: When you published an event, it was automatically consumed by your handlers

## Next Steps

### Add Redis for Production

```typescript
import { RedisStreamsPlugin } from '@logistically/events';

EventsModule.forRoot({
  service: 'my-app',
  autoDiscovery: true,
  global: true,
  transports: new Map([
    ['redis', new RedisStreamsPlugin().createTransport({
      url: 'redis://localhost:6379',
      groupId: 'my-app-group'
    })]
  ])
})
```

### Pattern-Based Routing

```typescript
EventsModule.forRoot({
  // ... other config
  routing: {
    routes: [
      { pattern: 'user.*', transport: 'redis' },
      { pattern: 'order.*', transport: 'redis' },
      { pattern: 'system.*', transport: 'memory' }
    ]
  }
})
```

### Advanced Configuration

```typescript
EventsModule.forRoot({
  service: 'my-app',
  autoDiscovery: true,
  global: true,
  
  // Publisher batching
  publisher: {
    batching: {
      enabled: true,
      maxSize: 1000,
      maxWaitMs: 100
    }
  },
  
  // Consumer settings
  consumer: {
    enablePatternRouting: true,
    enableConsumerGroups: true
  }
})
```

## Alternative Approaches

### Manual Event Handler Registration

If you prefer manual control:

```typescript
import { Injectable, OnModuleInit } from '@nestjs/common';
import { EventConsumerService } from '@logistically/events-nestjs';

@Injectable()
export class UserService implements OnModuleInit {
  constructor(private readonly eventConsumer: EventConsumerService) {}

  async onModuleInit() {
    // Subscribe to events manually
    await this.eventConsumer.subscribe('user.created', this.handleUserCreated.bind(this));
    await this.eventConsumer.subscribePattern('order.*', this.handleOrderEvents.bind(this));
  }

  private async handleUserCreated(event: any) {
    console.log('User created:', event.body);
  }

  private async handleOrderEvents(event: any) {
    console.log('Order event:', event.body);
  }
}
```

### Global Event Handlers

For app-wide event handling:

```typescript
import { Injectable } from '@nestjs/common';
import { GlobalEventHandlerService } from '@logistically/events-nestjs';

@Injectable()
export class GlobalEventHandler {
  constructor(private readonly globalHandlerService: GlobalEventHandlerService) {}

  async onModuleInit() {
    // Register global handlers
    await this.globalHandlerService.registerGlobalHandler('user.*', this.handleAllUserEvents.bind(this));
  }

  private async handleAllUserEvents(event: any) {
    console.log('Global user event handler:', event.body);
  }
}
```

## Common Patterns

### Cross-Service Event Handling

```typescript
@Injectable()
@AutoEvents()
export class NotificationService {
  @AutoEventHandler({ eventType: 'user.created' })
  async sendWelcomeEmail(event: NestJSEvent<User>) {
    // Send welcome email when user is created
  }

  @AutoEventHandler({ eventType: 'order.created' })
  async sendOrderConfirmation(event: NestJSEvent<Order>) {
    // Send order confirmation
  }
}
```

### Wildcard Event Handling

```typescript
@AutoEventHandler({ eventType: '*.created' })
async handleAllCreatedEvents(event: NestJSEvent<any>) {
  // Handle any event ending with 'created'
}

@AutoEventHandler({ eventType: 'user.*' })
async handleAllUserEvents(event: NestJSEvent<any>) {
  // Handle all user-related events
}
```

### Error Handling

```typescript
@AutoEventHandler({ eventType: 'user.created' })
async handleUserCreated(event: NestJSEvent<User>) {
  try {
    // Your logic here
  } catch (error) {
    // Handle errors - they won't break the event system
    console.error('Handler error:', error);
  }
}
```

### Batch Event Publishing

```typescript
@Injectable()
export class BulkUserService {
  constructor(private readonly eventPublisher: EventPublisherService) {}

  async createMultipleUsers(users: User[]) {
    // Publish events in batch for better performance
    await this.eventPublisher.publishBatch('user.created', users);
  }
}
```

## Transport Options

### Memory Transport (Development/Testing)

```typescript
import { MemoryTransportPlugin } from '@logistically/events';

transports: new Map([
  ['memory', new MemoryTransportPlugin().createTransport()]
])
```

### Redis Streams (Production)

```typescript
import { RedisStreamsPlugin } from '@logistically/events';

transports: new Map([
  ['redis', new RedisStreamsPlugin().createTransport({
    url: 'redis://localhost:6379',
    groupId: 'my-app-group',
    batchSize: 100,
    enableDLQ: true,
    maxRetries: 3
  })]
])
```

### Multiple Transports

```typescript
transports: new Map([
  ['redis', new RedisStreamsPlugin().createTransport({...})],
  ['memory', new MemoryTransportPlugin().createTransport()],
  ['custom', new CustomTransportPlugin().createTransport({...})]
])
```

## Troubleshooting

### Handlers Not Working?

1. **Check decorators**: Ensure you have both `@AutoEvents()` and `@AutoEventHandler()`
2. **Verify injection**: Make sure `EventDiscoveryService` is injected
3. **Check logs**: Look for discovery and registration logs
4. **Enable debug**: Add `debug: true` to your module config

### Events Not Being Received?

1. **Check transport**: Verify Redis connection if using Redis
2. **Check patterns**: Ensure event types match your handler patterns
3. **Check routing**: Verify event routing configuration

### Performance Issues?

1. **Enable batching**: Configure publisher batching
2. **Adjust batch sizes**: Optimize for your use case
3. **Use appropriate transport**: Redis for persistence, Memory for speed
4. **Monitor metrics**: Use built-in statistics

## Testing

### Unit Testing

```typescript
import { Test } from '@nestjs/testing';
import { EventsModule } from '@logistically/events-nestjs';

describe('UserService', () => {
  let service: UserService;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      imports: [
        EventsModule.forRoot({
          service: 'test',
          autoDiscovery: true
        })
      ],
      providers: [UserService]
    }).compile();

    service = module.get<UserService>(UserService);
  });

  it('should handle user created events', async () => {
    // Test your event handler
  });
});
```

### Integration Testing

```typescript
const module = await Test.createTestingModule({
  imports: [
    EventsModule.forRoot({
      service: 'test',
      autoDiscovery: true,
      transports: new Map([
        ['memory', new MemoryTransportPlugin().createTransport()]
      ])
    })
  ]
}).compile();
```

## That's It!

You now have a fully functional event-driven system with automatic discovery. The library handles all the complexity of event registration, routing, and consumption automatically.

## Need More?

- **Complete API Reference**: See [API_REFERENCE.md](API_REFERENCE.md)
- **Advanced Configuration**: See [@logistically/events](https://github.com/onwello/events/)
- **Examples**: Check the `examples/` directory
- **Main Documentation**: See [README.md](README.md)
