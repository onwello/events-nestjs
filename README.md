# @logistically/events-nestjs

NestJS integration for [@logistically/events](https://github.com/onwello/events) v3 - Event-driven architecture with Redis Streams, comprehensive batching, reliable consumption, and enterprise-grade features.

## 🚀 Features

### Core Integration
- **Seamless Integration**: Built on top of `@logistically/events` v3 with full feature parity
- **NestJS Native**: Designed specifically for NestJS applications with decorators and dependency injection
- **Auto-Discovery**: Automatically discovers and registers event handlers and subscribers
- **Type Safety**: Full TypeScript support with comprehensive types

### Event Management
- **Event Handlers**: `@EventHandler()` decorator for processing events
- **Event Publishers**: `@EventPublisher()` decorator for publishing events
- **Event Subscribers**: `@EventSubscriber()` decorator for subscribing to events
- **Correlation Tracking**: Built-in correlation and causation ID support

### Transport Support
- **Redis Streams**: Production-ready Redis Streams transport with consumer groups
- **Memory Transport**: Fast in-memory transport for testing and development
- **Plugin System**: Extensible transport plugin system

### Enterprise Features
- **Origin-Based Routing**: Regional isolation and namespace separation
- **Batching**: Configurable message batching for high throughput
- **Retry Mechanisms**: Sophisticated retry strategies with backoff
- **Validation**: Comprehensive event validation with Zod schemas
- **Monitoring**: Built-in statistics and metrics

## 📦 Installation

```bash
npm install @logistically/events-nestjs
```

## 🏗️ Quick Start

### Basic Setup

```typescript
import { Module } from '@nestjs/common';
import { EventsModule } from '@logistically/events-nestjs';
import { RedisStreamsPlugin, MemoryTransportPlugin } from '@logistically/events';

@Module({
  imports: [
    EventsModule.forRoot({
      service: 'my-service',
      transports: new Map([
        ['redis', new RedisStreamsPlugin().createTransport({
          url: 'redis://localhost:6379',
          groupId: 'my-service-group'
        })],
        ['memory', new MemoryTransportPlugin().createTransport({})]
      ])
    })
  ]
})
export class AppModule {}
```

### Environment-Based Configuration

```typescript
import { Module } from '@nestjs/common';
import { EventsModule } from '@logistically/events-nestjs';
import { ConfigFactory } from '@logistically/events-nestjs';

@Module({
  imports: [
    EventsModule.forRoot({
      // Minimal configuration - environment variables provide defaults
      service: process.env.SERVICE_NAME || 'my-service',
      transports: new Map([
        ['redis', new RedisStreamsPlugin().createTransport({
          url: process.env.REDIS_URL || 'redis://localhost:6379',
          groupId: process.env.REDIS_GROUP_ID || 'nestjs-group'
        })]
      ])
    })
  ]
})
export class AppModule {}
```

### Using ConfigFactory for Advanced Configuration

```typescript
import { Module } from '@nestjs/common';
import { EventsModule, ConfigFactory } from '@logistically/events-nestjs';

@Module({
  imports: [
    EventsModule.forRoot(
      ConfigFactory.mergeWithDefaults({
        service: 'my-service',
        transports: new Map([
          ['redis', new RedisStreamsPlugin().createTransport(
            ConfigFactory.createRedisConfig()
          )]
        ]),
        validationMode: 'strict',
        global: true
      })
    )
  ]
})
export class AppModule {}
```

### Using Event Handlers

```typescript
import { Injectable } from '@nestjs/common';
import { EventHandler, EventPublisher } from '@logistically/events-nestjs';
import { EventPublisherService } from '@logistically/events-nestjs';

@Injectable()
export class UserService {
  constructor(private readonly eventPublisher: EventPublisherService) {}

  @EventPublisher({ eventType: 'user.created' })
  async createUser(email: string, name: string): Promise<string> {
    const userId = `user-${Date.now()}`;
    
    // Publish the event
    await this.eventPublisher.publish('user.created', { userId, email, name });
    
    return userId;
  }

  @EventHandler({ eventType: 'user.created' })
  async handleUserCreated(event: any): Promise<void> {
    console.log('User created:', event.body);
    // Handle the event (send email, create profile, etc.)
  }
}
```

### Advanced Configuration

```typescript
import { Module } from '@nestjs/common';
import { EventsModule } from '@logistically/events-nestjs';
import { RedisStreamsPlugin } from '@logistically/events';

@Module({
  imports: [
    EventsModule.forRoot({
      service: 'user-service',
      originPrefix: 'eu.de',
      transports: new Map([
        ['redis', new RedisStreamsPlugin().createTransport({
          url: 'redis://localhost:6379',
          groupId: 'user-service-group',
          batchSize: 100,
          enableDLQ: true,
          dlqStreamPrefix: 'dlq:',
          maxRetries: 3
        })]
      ]),
      // Enable publisher batching for high throughput
      publisher: {
        batching: {
          enabled: true,
          maxSize: 1000,
          maxWaitMs: 100,
          maxConcurrentBatches: 5,
          strategy: 'size'
        },
        retry: {
          maxRetries: 3,
          backoffStrategy: 'exponential',
          baseDelay: 1000,
          maxDelay: 10000
        }
      },
      // Enable consumer features
      consumer: {
        enablePatternRouting: true,
        enableConsumerGroups: true,
        validationMode: 'warn'
      },
      validationMode: 'strict',
      autoDiscovery: true,
      global: true
    })
  ]
})
export class AppModule {}
```

## 🔧 API Reference

### Decorators

#### `@EventHandler(options)`
Registers a method as an event handler.

```typescript
@EventHandler({ 
  eventType: 'user.created',
  priority: 1,
  async: true,
  retry: {
    maxAttempts: 3,
    backoffMs: 1000
  }
})
async handleUserCreated(event: any): Promise<void> {
  // Handle the event
}
```

#### `@EventPublisher(options)`
Marks a method as an event publisher.

```typescript
@EventPublisher({ 
  eventType: 'user.created',
  waitForPublish: true
})
async createUser(data: any): Promise<void> {
  // Method logic
}
```

#### `@EventSubscriber(options)`
Registers a method as an event subscriber.

```typescript
@EventSubscriber({ 
  eventType: 'user.*',
  subscriptionOptions: {
    groupId: 'email-service',
    pattern: true
  }
})
async handleUserEvents(event: any): Promise<void> {
  // Handle user events
}
```

### Services

#### `EventPublisherService`
Service for publishing events.

```typescript
constructor(private readonly eventPublisher: EventPublisherService) {}

// Publish a single event
await this.eventPublisher.publish('user.created', { userId: '123' });

// Publish a batch of events
await this.eventPublisher.publishBatch('user.created', users);

// Publish a NestJS event
await this.eventPublisher.publishEvent(event);
```

#### `EventConsumerService`
Service for consuming events.

```typescript
constructor(private readonly eventConsumer: EventConsumerService) {}

// Subscribe to an event type
await this.eventConsumer.subscribe('user.created', handler);

// Subscribe to a pattern
await this.eventConsumer.subscribePattern('user.*', handler);
```

#### `EventSystemService`
Service for managing the core event system.

```typescript
constructor(private readonly eventSystem: EventSystemService) {}

// Get system status
const status = await this.eventSystem.getStatus();

// Check connection
const connected = this.eventSystem.isConnected();
```

### Utilities

#### `EventUtils`
Utility functions for working with events.

```typescript
import { EventUtils } from '@logistically/events-nestjs';

// Create an event
const event = EventUtils.createEvent('user.created', data, 'user-service');

// Create a domain event
const domainEvent = EventUtils.createDomainEvent(
  'user.created', 
  data, 
  'user-service', 
  'user-123', 
  1
);

// Generate correlation ID
const correlationId = EventUtils.generateCorrelationId();

// Create event batch
const events = EventUtils.createEventBatch(eventData, 'user-service');
```

## 🧪 Testing

For testing, use the Memory Transport plugin:

```typescript
import { MemoryTransportPlugin } from '@logistically/events';

@Module({
  imports: [
    EventsModule.forRoot({
      service: 'test-service',
      transports: new Map([
        ['memory', new MemoryTransportPlugin().createTransport({})]
      ]),
      validationMode: 'warn'
    })
  ]
})
export class TestModule {}
```

## 🌍 Environment Variables

The package supports extensive environment variable configuration. Here are the key variables:

### Required Variables
- `SERVICE_NAME` - Your service name
- `REDIS_URL` - Redis connection URL

### Optional Variables with Defaults
```bash
# Core configuration
EVENTS_ORIGIN_PREFIX=eu.de
EVENTS_VALIDATION_MODE=warn
EVENTS_GLOBAL=true
EVENTS_AUTO_DISCOVERY=true

# Publisher configuration
EVENTS_BATCHING_ENABLED=true
EVENTS_BATCHING_MAX_SIZE=1000
EVENTS_BATCHING_MAX_WAIT_MS=100
EVENTS_RETRY_MAX_ATTEMPTS=3

# Consumer configuration
EVENTS_PATTERN_ROUTING=false
EVENTS_CONSUMER_GROUPS=true

# Redis transport
REDIS_GROUP_ID=nestjs-group
REDIS_BATCH_SIZE=100
REDIS_ENABLE_DLQ=true
```

### Using Environment Variables

```typescript
// Set environment variables
process.env.SERVICE_NAME = 'user-service';
process.env.REDIS_URL = 'redis://localhost:6379';
process.env.EVENTS_VALIDATION_MODE = 'strict';

// The module will automatically use these values
EventsModule.forRoot({
  transports: new Map([...])
})
```

## 📚 Examples

See the `examples/` directory for complete working examples:

- `user-service.example.ts` - Complete user service with events
- `app.module.example.ts` - Module configuration examples

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

## 📄 License

MIT License - see LICENSE file for details.

## 🔗 Links

- [@logistically/events](https://github.com/onwello/events) - Core events library
- [NestJS](https://nestjs.com/) - Progressive Node.js framework
- [Redis](https://redis.io/) - In-memory data structure store
