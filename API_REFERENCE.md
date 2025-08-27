# API Reference

Complete API reference for `@logistically/events-nestjs`.

## Module

### `EventsModule`

Main module for integrating the event system with NestJS.

```typescript
import { EventsModule } from '@logistically/events-nestjs';

@Module({
  imports: [
    EventsModule.forRoot(options),
    EventsModule.forFeature()
  ]
})
export class AppModule {}
```

#### `EventsModule.forRoot(options)`

Configures the root event system.

```typescript
EventsModule.forRoot({
  service: 'my-app',           // Service name
  originPrefix: 'my-app',      // Origin prefix
  autoDiscovery: true,         // Enable auto-discovery
  global: true,                // Global module
  transports: new Map([...]),  // Transport configuration
  routing: { ... },            // Event routing
  publisher: { ... },          // Publisher configuration
  consumer: { ... },           // Consumer configuration
  validationMode: 'strict',    // Validation mode
  debug: false                 // Debug mode
})
```

#### `EventsModule.forFeature()`

Provides event services for feature modules.

```typescript
EventsModule.forFeature()
```

## Decorators

### `@AutoEvents(options?)`

Marks a service for automatic event handler discovery.

```typescript
@AutoEvents({ enabled: true, priority: 0 })
export class MyService {}
```

**Options:**
- `enabled` (boolean): Enable/disable auto-discovery
- `priority` (number): Handler registration priority

### `@AutoEventHandler(options)`

Marks a method as an event handler.

```typescript
@AutoEventHandler({ eventType: 'user.created' })
async handleUserCreated(event: NestJSEvent<User>) {}
```

**Options:**
- `eventType` (string): Event type pattern (supports wildcards)
- `priority` (number): Handler priority
- `async` (boolean): Whether handler is async
- `retry` (object): Retry configuration

## Services

### `EventPublisherService`

Publishes events to the event system.

```typescript
constructor(private readonly eventPublisher: EventPublisherService) {}

// Publish single event
await this.eventPublisher.publish('user.created', userData);

// Publish batch
await this.eventPublisher.publishBatch('user.created', users);

// Publish with options
await this.eventPublisher.publish('user.created', userData, {
  headers: { correlationId: '123' },
  partitionKey: 'userId'
});
```

**Methods:**
- `publish(eventType, data, options?)` - Publish single event
- `publishBatch(eventType, dataArray, options?)` - Publish batch of events
- `publishEvent(event)` - Publish pre-built event
- `getStats()` - Get publisher statistics

### `EventConsumerService`

Consumes events from the event system.

```typescript
constructor(private readonly eventConsumer: EventConsumerService) {}

// Subscribe to specific event
await this.eventConsumer.subscribe('user.created', handler);

// Subscribe to pattern
await this.eventConsumer.subscribePattern('user.*', handler);

// Subscribe with options
await this.eventConsumer.subscribe('user.created', handler, {
  groupId: 'my-group',
  priority: 1
});
```

**Methods:**
- `subscribe(eventType, handler, options?)` - Subscribe to specific event
- `subscribePattern(pattern, handler, options?)` - Subscribe to pattern
- `unsubscribe(eventType, handler)` - Unsubscribe from event
- `getStats()` - Get consumer statistics

### `EventSystemService`

Manages the core event system.

```typescript
constructor(private readonly eventSystem: EventSystemService) {}

// Get system status
const status = await this.eventSystem.getStatus();

// Check connection
const connected = this.eventSystem.isConnected();

// Get event system instance
const system = this.eventSystem.getEventSystem();
```

**Methods:**
- `getStatus()` - Get system health status
- `isConnected()` - Check if system is connected
- `getEventSystem()` - Get core event system instance
- `onModuleInit()` - Initialize event system
- `onModuleDestroy()` - Cleanup event system

### `EventDiscoveryService`

Manages automatic event handler discovery.

```typescript
constructor(private readonly eventDiscoveryService: EventDiscoveryService) {}

// Manual registration
const count = await this.eventDiscoveryService.registerEventHandlers(this);

// Add service for auto-registration
this.eventDiscoveryService.addServiceForAutoRegistration(service);

// Get discovery statistics
const stats = this.eventDiscoveryService.getDiscoveryStats();
```

**Methods:**
- `registerEventHandlers(instance)` - Register handlers for service
- `addServiceForAutoRegistration(instance)` - Add service to discovery queue
- `getDiscoveryStats()` - Get discovery statistics
- `triggerRegistration()` - Manually trigger registration

### `EventHandlerRegistryService`

Manages event handler registration and routing.

```typescript
constructor(private readonly handlerRegistry: EventHandlerRegistryService) {}

// Register handler manually
await this.handlerRegistry.registerHandler('user.created', handler, options);

// Get registered handlers
const handlers = this.handlerRegistry.getHandlers('user.created');
```

**Methods:**
- `registerHandler(eventType, handler, options?)` - Register event handler
- `getHandlers(eventType)` - Get handlers for event type
- `unregisterHandler(eventType, handler)` - Unregister handler
- `getAllHandlers()` - Get all registered handlers

### `AutoEventHandlerService`

Provides automatic event handler functionality.

```typescript
constructor(private readonly autoHandlerService: AutoEventHandlerService) {}

// Get service instance
const instance = AutoEventHandlerService.getInstance();
```

**Methods:**
- `getInstance()` - Get service singleton instance
- `registerHandler(instance, methodKey, metadata)` - Register auto handler

### `GlobalEventHandlerService`

Manages global event handlers.

```typescript
constructor(private readonly globalHandlerService: GlobalEventHandlerService) {}

// Register global handler
await this.globalHandlerService.registerGlobalHandler('user.*', handler);
```

**Methods:**
- `registerGlobalHandler(pattern, handler)` - Register global handler
- `getGlobalHandlers()` - Get all global handlers

### `SimpleEventHandlerService`

Provides simple event handler functionality.

```typescript
constructor(private readonly simpleHandlerService: SimpleEventHandlerService) {}

// Register simple handler
await this.simpleHandlerService.registerHandler('user.created', handler);
```

**Methods:**
- `registerHandler(eventType, handler)` - Register simple handler
- `getHandlers(eventType)` - Get handlers for event type

## Types

### `NestJSEvent<T>`

Event object passed to handlers.

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

### `AutoEventHandlerOptions`

Options for auto event handlers.

```typescript
interface AutoEventHandlerOptions {
  eventType: string;          // Event type pattern
  priority?: number;          // Handler priority
  async?: boolean;            // Whether handler is async
  retry?: any;                // Retry configuration
  [key: string]: any;         // Additional options
}
```

### `AutoRegisterEventsOptions`

Options for auto events decorator.

```typescript
interface AutoRegisterEventsOptions {
  enabled: boolean;           // Enable/disable auto-registration
  priority?: number;          // Registration priority
}
```

### `NestJSEventsModuleOptions`

Module configuration options.

```typescript
interface NestJSEventsModuleOptions {
  service: string;            // Service name
  originPrefix?: string;      // Origin prefix
  autoDiscovery?: boolean;    // Enable auto-discovery
  global?: boolean;           // Global module
  transports?: Map<string, any>; // Transport configuration
  routing?: any;              // Event routing
  publisher?: any;            // Publisher configuration
  consumer?: any;             // Consumer configuration
  validationMode?: string;    // Validation mode
  debug?: boolean;            // Debug mode
}
```

## Configuration

### Transport Configuration

```typescript
import { RedisStreamsPlugin, MemoryTransportPlugin } from '@logistically/events';

const transports = new Map([
  ['redis', new RedisStreamsPlugin().createTransport({
    url: 'redis://localhost:6379',
    groupId: 'my-app-group',
    batchSize: 100,
    enableDLQ: true,
    maxRetries: 3
  })],
  ['memory', new MemoryTransportPlugin().createTransport()]
]);
```

For complete transport options, see [@logistically/events Transports](https://github.com/onwello/events/).

### Routing Configuration

```typescript
routing: {
  routes: [
    { pattern: 'user.*', transport: 'redis' },
    { pattern: 'order.*', transport: 'redis' },
    { pattern: 'system.*', transport: 'memory' }
  ],
  validationMode: 'warn',
  topicMapping: {},
  defaultTopicStrategy: 'namespace'
}
```

For complete routing options, see [@logistically/events Routing](https://github.com/onwello/events/).

### Publisher Configuration

```typescript
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
}
```

For complete publisher options, see [@logistically/events Publisher](https://github.com/onwello/events/).

### Consumer Configuration

```typescript
consumer: {
  enablePatternRouting: true,
  enableConsumerGroups: true,
  validationMode: 'warn',
  batchSize: 100,
  maxConcurrentHandlers: 10
}
```

For complete consumer options, see [@logistically/events Consumer](https://github.com/onwello/events/).

## Pattern Examples

### Wildcard Patterns

- `user.*` - All user events
- `*.created` - All creation events
- `order.*.completed` - Order completion events
- `user.*.verified` - User verification events

### Event Type Examples

- `user.created`
- `user.updated`
- `user.deleted`
- `order.created`
- `order.shipped`
- `order.delivered`
- `payment.processed`
- `notification.sent`

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

const module = await Test.createTestingModule({
  imports: [
    EventsModule.forRoot({
      service: 'test',
      autoDiscovery: true
    })
  ],
  providers: [MyService]
}).compile();
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

## Common Issues

### Handlers Not Registered

1. Check `@AutoEvents()` decorator
2. Verify `EventDiscoveryService` injection
3. Ensure `autoDiscovery: true` in module config
4. Check for `@AutoEventHandler()` decorators

### Events Not Received

1. Verify transport configuration
2. Check event routing patterns
3. Ensure consumer is initialized
4. Verify Redis connection (if using Redis)

### Performance Issues

1. Enable publisher batching
2. Adjust batch sizes and timing
3. Use appropriate transport for volume
4. Monitor memory usage

For detailed troubleshooting and performance optimization, see [@logistically/events Troubleshooting](https://github.com/onwello/events/).

## Debug Mode

```typescript
EventsModule.forRoot({
  service: 'my-app',
  autoDiscovery: true,
  debug: true  // Enable debug logging
})
```

## Environment Variables

```bash
# Core
SERVICE_NAME=my-app
REDIS_URL=redis://localhost:6379
REDIS_GROUP_ID=my-app-group

# Features
EVENTS_AUTO_DISCOVERY=true
EVENTS_GLOBAL=true
EVENTS_DEBUG=false

# For complete environment variable options, see @logistically/events
```

## Related Links

- [@logistically/events](https://github.com/onwello/events/) - Core events library with detailed configuration, features, and benchmarks
- [NestJS](https://nestjs.com/) - Progressive Node.js framework
- [Redis](https://redis.io/) - In-memory data structure store
