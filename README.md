# @logistically/events-nestjs

A NestJS integration library for the `@logistically/events` event system, providing integration with NestJS applications including automatic event handler discovery, decorators, and services.

## Features

- **NestJS Integration** - Designed for NestJS with decorators and dependency injection
- **Automatic Event Handler Discovery** - Automatically discovers and registers event handlers using decorators
- **Performance Optimizations** - Intelligent caching, batch processing, and performance monitoring
- **Multiple Transport Support** - Redis Streams, Memory, and custom transport plugins
- **Pattern-Based Event Routing** - Flexible event routing with wildcard support
- **Type Safety** - Full TypeScript support with proper typing
- **Minimal Configuration** - Minimal setup required with sensible defaults
- **Global Module Support** - Can be configured as a global module for app-wide access

## Installation

```bash
npm install @logistically/events-nestjs @logistically/events
```

## Quick Start

### 1. Import the Module

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

### 2. Create Event Handlers

```typescript
import { Injectable } from '@nestjs/common';
import { AutoEvents, AutoEventHandler, NestJSEvent } from '@logistically/events-nestjs';

@Injectable()
@AutoEvents()
export class UserService {
  @AutoEventHandler({ eventType: 'user.created' })
  async handleUserCreated(event: NestJSEvent<{ id: number; email: string }>) {
    console.log('User created:', event.body);
  }

  @AutoEventHandler({ eventType: 'order.*' })
  async handleAllOrderEvents(event: NestJSEvent<any>) {
    console.log('Order event received:', event.body);
  }
}
```

### 3. Publish Events

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

That's it! Your event handlers will be automatically discovered and registered.

## Core Concepts

### Event System

This library integrates with the `@logistically/events` core library, which provides:

- **Event Publishing** - Publish events to multiple transports
- **Event Consumption** - Consume events with pattern matching
- **Transport Plugins** - Redis Streams, Memory, and custom transports
- **Event Routing** - Pattern-based routing between transports
- **Batching & Performance** - Configurable batching strategies
- **Reliability** - Dead letter queues, retries, and error handling

For detailed information about the core event system, see [@logistically/events](https://github.com/onwello/events/).

### NestJS Integration

The library provides NestJS-specific features:

- **Module Integration** - `EventsModule` for easy setup
- **Service Injection** - Injectable services for publishing and consuming
- **Decorator Support** - Decorators for automatic handler registration
- **Dependency Injection** - Full NestJS DI integration
- **Lifecycle Hooks** - Integration with NestJS lifecycle

## Configuration

### Basic Configuration

```typescript
EventsModule.forRoot({
  service: 'my-app',           // Service name for event routing
  originPrefix: 'my-app',      // Origin prefix for events
  autoDiscovery: true,         // Enable automatic handler discovery
  global: true                 // Make module globally available
})
```

### Advanced Configuration

```typescript
import { RedisStreamsPlugin, MemoryTransportPlugin } from '@logistically/events';

EventsModule.forRoot({
  service: 'my-app',
  originPrefix: 'my-app',
  autoDiscovery: true,
  global: true,
  
  // Transport configuration
  transports: new Map([
    ['redis', new RedisStreamsPlugin().createTransport({
      url: 'redis://localhost:6379',
      groupId: 'my-app-group'
    })],
    ['memory', new MemoryTransportPlugin().createTransport()]
  ]),
  
  // Event routing
  routing: {
    routes: [
      { pattern: 'user.*', transport: 'redis' },
      { pattern: 'order.*', transport: 'redis' },
      { pattern: 'system.*', transport: 'memory' }
    ]
  },
  
  // Publisher configuration
  publisher: {
    batching: {
      enabled: true,
      maxSize: 1000,
      maxWaitMs: 100
    }
  },
  
  // Consumer configuration
  consumer: {
    enablePatternRouting: true,
    enableConsumerGroups: true
  }
})
```

For complete configuration options, see [@logistically/events Configuration](https://github.com/onwello/events/).

## API Reference

### Decorators

#### `@AutoEvents(options?)`

Simple decorator for automatic event handler discovery.

```typescript
@AutoEvents({ enabled: true, priority: 0 })
export class MyService {}
```

**Options:**
- `enabled` (boolean): Enable/disable auto-discovery for this service
- `priority` (number): Priority for handler registration order

#### `@AutoEventHandler(options)`

Marks a method as an event handler.

```typescript
@AutoEventHandler({ eventType: 'user.created' })
async handleUserCreated(event: NestJSEvent<User>) {
  // Handle event
}
```

**Options:**
- `eventType` (string): Event type pattern (supports wildcards like `user.*`)
- `priority` (number): Handler priority within the same event type
- `async` (boolean): Whether the handler is async
- `retry` (object): Retry configuration

### Services

#### `EventPublisherService`

Publishes events to the event system.

```typescript
constructor(private readonly eventPublisher: EventPublisherService) {}

// Publish single event
await this.eventPublisher.publish('user.created', userData);

// Publish batch
await this.eventPublisher.publishBatch('user.created', users);
```

#### `EventConsumerService`

Consumes events from the event system.

```typescript
constructor(private readonly eventConsumer: EventConsumerService) {}

// Subscribe to specific event
await this.eventConsumer.subscribe('user.created', handler);

// Subscribe to pattern
await this.eventConsumer.subscribePattern('user.*', handler);
```

#### `EventSystemService`

Manages the core event system.

```typescript
constructor(private readonly eventSystem: EventSystemService) {}

// Get system status
const status = await this.eventSystem.getStatus();

// Check connection
const connected = this.eventSystem.isConnected();
```

#### `EventDiscoveryService`

Manages automatic event handler discovery and registration.

```typescript
constructor(private readonly eventDiscoveryService: EventDiscoveryService) {}

// Manual registration
const count = await this.eventDiscoveryService.registerEventHandlers(this);
```

### Event Object

#### `NestJSEvent<T>`

The event object passed to handlers. This extends the core `EventEnvelope<T>` from `@logistically/events`.

```typescript
interface NestJSEvent<T = any> extends EventEnvelope<T> {
  nestjsMetadata?: NestJSEventMetadata;
}

interface NestJSEventMetadata {
  correlationId?: string;
  causationId?: string;
  [key: string]: any;
}
```

The event object inherits all properties from `EventEnvelope<T>` which includes:
- `body: T` - The event payload data
- `header` - Event metadata (id, type, origin, timestamp, etc.)
- `nestjsMetadata` - Optional NestJS-specific metadata

## Transport Plugins

### Redis Streams

```typescript
import { RedisStreamsPlugin } from '@logistically/events';

const redisTransport = new RedisStreamsPlugin().createTransport({
  url: 'redis://localhost:6379',
  groupId: 'my-app-group',
  batchSize: 100,
  enableDLQ: true,
  maxRetries: 3
});
```

### Memory Transport

```typescript
import { MemoryTransportPlugin } from '@logistically/events';

const memoryTransport = new MemoryTransportPlugin().createTransport();
```

For complete transport configuration options, see [@logistically/events Transports](https://github.com/onwello/events/).

## Event Routing

### Pattern-Based Routing

```typescript
routing: {
  routes: [
    { pattern: 'user.*', transport: 'redis' },      // All user events to Redis
    { pattern: 'order.created', transport: 'redis' }, // Specific event to Redis
    { pattern: 'system.*', transport: 'memory' }     // System events to memory
  ]
}
```

### Wildcard Support

- `user.*` - All user events
- `order.*.created` - Order events ending with 'created'
- `*.notification` - All notification events

For advanced routing configuration, see [@logistically/events Routing](https://github.com/onwello/events/).

## Error Handling

### Handler Error Handling

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

### Dead Letter Queue (Redis)

```typescript
const redisTransport = new RedisStreamsPlugin().createTransport({
  enableDLQ: true,
  dlqStreamPrefix: 'dlq:',
  maxRetries: 3
});
```

For comprehensive error handling strategies, see [@logistically/events Error Handling](https://github.com/onwello/events/).

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
import { Test } from '@nestjs/testing';
import { EventsModule } from '@logistically/events-nestjs';

describe('Event Integration', () => {
  let app: INestApplication;

  beforeEach(async () => {
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

    app = module.createNestApplication();
    await app.init();
  });

  afterEach(async () => {
    await app.close();
  });
});
```

## Troubleshooting

### Common Issues

#### Handlers Not Being Registered

1. Ensure `autoDiscovery: true` is set in module configuration
2. Verify the service has the `@AutoEvents()` decorator
3. Check that `EventDiscoveryService` is injected into the service
4. Verify event handler methods have the `@AutoEventHandler()` decorator

#### Events Not Being Received

1. Check transport configuration
2. Verify event routing patterns
3. Ensure consumer is properly initialized
4. Check Redis connection (if using Redis transport)

### Debug Mode

Enable debug logging:

```typescript
EventsModule.forRoot({
  service: 'my-app',
  autoDiscovery: true,
  debug: true  // Enable debug logging
})
```

## Examples

See the `examples/` directory for complete working examples:

- **Basic Setup** - Simple event handler registration
- **Cross-Service Communication** - Services handling events from other services
- **Pattern-Based Routing** - Event routing between transports
- **Redis Integration** - Production-ready Redis Streams setup

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

## License

MIT License - see LICENSE file for details.

## Related Links

- [@logistically/events](https://github.com/onwello/events/) - Core events library with detailed configuration, features, and benchmarks
- [NestJS](https://nestjs.com/) - Progressive Node.js framework
- [Redis](https://redis.io/) - In-memory data structure store
