# @logistically/events-nestjs

A NestJS integration library for the `@logistically/events` event system, providing seamless integration with NestJS applications including automatic event handler discovery, decorators, and services.

## Features

- **NestJS Native Integration** - Built specifically for NestJS with decorators and dependency injection
- **Automatic Event Handler Discovery** - Automatically discovers and registers event handlers using decorators
- **Enterprise Performance Optimizations** - Intelligent caching, batch processing, and performance monitoring
- **Multiple Transport Support** - Redis Streams, Memory, and custom transport plugins
- **Pattern-Based Event Routing** - Flexible event routing with wildcard support
- **Type Safety** - Full TypeScript support with proper typing
- **Zero Configuration** - Works out of the box with sensible defaults
- **Global Module Support** - Can be configured as a global module for app-wide access
- **Built-in Performance Monitoring** - Real-time metrics and automatic performance warnings

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

Marks a service for automatic event handler discovery.

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

#### `PerformanceMonitorService`

Provides comprehensive performance monitoring and metrics (available when `autoDiscovery` is enabled).

```typescript
constructor(private readonly performanceMonitor: PerformanceMonitorService) {}

// Get performance metrics
const metrics = this.performanceMonitor.getMetrics();

// Get performance recommendations
const recommendations = this.performanceMonitor.getRecommendations();

// Get performance summary
const summary = this.performanceMonitor.getPerformanceSummary();
```

### Event Object

#### `NestJSEvent<T>`

The event object passed to handlers.

```typescript
interface NestJSEvent<T> {
  body: T;                    // Event payload
  metadata: {                 // Event metadata
    eventType: string;
    timestamp: Date;
    origin: string;
    correlationId?: string;
  };
  headers?: Record<string, any>; // Custom headers
}
```

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

## Performance & Optimizations

This library includes performance optimizations designed for production environments with high event throughput and low latency requirements.

### Built-in Performance Features

#### **Intelligent Discovery Loop**
- **Event-driven processing** instead of continuous polling
- **Conditional timers** that only run when there's work to do
- **Automatic cleanup** of resources during module lifecycle

#### **Metadata Caching System**
- **TTL-based caching** (5-minute expiration) for method metadata
- **WeakMap implementation** for automatic memory management
- **Cache hit rate tracking** for performance monitoring
- **Eliminates redundant method scanning** on repeated calls

#### **Batch Processing**
- **Configurable batch sizes** for discovery queue processing
- **Efficient resource utilization** for large numbers of handlers
- **Reduced overhead** per operation

#### **Exponential Backoff Retry Strategy**
- **Smart retry logic** starting at 100ms with exponential doubling
- **Prevents thundering herd** problems in distributed systems
- **Configurable maximum retry attempts**

#### **Performance Monitoring Service**
```typescript
// Automatically included when autoDiscovery is enabled
@Injectable()
export class PerformanceMonitorService {
  getMetrics(): PerformanceMetrics {
    // Real-time performance data
    return {
      cache: { hits: number, misses: number, hitRate: number },
      discovery: { pending: number, registered: number, retryCount: number },
      memory: { heapUsed: number, heapTotal: number, external: number },
      timing: { lastDiscoveryRun: number, averageProcessingTime: number }
    };
  }
}
```

### Performance Metrics

The library automatically tracks:
- **Cache performance** (hit rates, miss patterns)
- **Discovery efficiency** (queue processing times, retry counts)
- **Memory usage** (heap utilization, external memory)
- **Processing latency** (average response times, throughput)

### Performance Warnings

Automatic alerts for:
- **Low cache hit rates** (< 50%)
- **High memory usage** (> 100MB)
- **Slow discovery processing** (> 1000ms)
- **Excessive retry attempts** (> 10)

### Configuration for Performance

```typescript
EventsModule.forRoot({
  service: 'high-performance-app',
  autoDiscovery: true, // Required for performance monitoring
  
  // Performance-focused transport configuration
  transports: new Map([
    ['redis', new RedisStreamsPlugin().createTransport({
      enablePublisherBatching: true,
      maxBatchSize: 1000,
      maxWaitMs: 50
    })]
  ]),
  
  // Publisher performance settings
  publisher: {
    batching: {
      enabled: true,
      maxSize: 1000,
      maxWaitMs: 50
    },
    retry: {
      enabled: true,
      maxAttempts: 3
    }
  }
})
```

For detailed performance benchmarks and optimization strategies, see [@logistically/events Performance](https://github.com/onwello/events/).

**📖 Performance Documentation**: See [PERFORMANCE.md](./PERFORMANCE.md) for comprehensive details about built-in optimizations and monitoring.

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

## Migration Guide

### From Manual Registration

**Before:**
```typescript
export class UserService implements OnModuleInit {
  constructor(private readonly eventDiscoveryService: EventDiscoveryService) {}

  async onModuleInit() {
    await this.eventDiscoveryService.registerEventHandlers(this);
  }
}
```

**After:**
```typescript
@AutoEvents()
export class UserService {
  // No manual registration needed!
}
```

### From Base Classes

**Before:**
```typescript
export class UserService extends AutoEventsBase {
  // Inherits registration logic
}
```

**After:**
```typescript
@AutoEvents()
export class UserService {
  // Clean, inheritance-free approach
}
```

**Note:** The `AutoEventsBase` class has been removed. Use the `@AutoEvents()` decorator instead.

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

#### Performance Issues

1. **Enable performance monitoring** by setting `autoDiscovery: true`
2. **Check performance metrics** using `PerformanceMonitorService.getMetrics()`
3. **Monitor cache hit rates** - low rates indicate inefficient metadata scanning
4. **Enable batching** in publisher configuration for high-volume scenarios
5. **Adjust batch sizes and timing** based on your throughput requirements
6. **Use appropriate transport** for event volume and latency requirements
7. **Monitor memory usage** and adjust cache TTL if needed
8. **Review performance warnings** logged by the monitoring service

For detailed troubleshooting and performance optimization, see [@logistically/events Troubleshooting](https://github.com/onwello/events/).

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
