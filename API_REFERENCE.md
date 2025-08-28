# API Reference

API reference for `@logistically/events-nestjs` v2.0.0.

This document provides API documentation for services, decorators, types, and configuration options available in the library.

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
- `publish(eventType: string, data: any, options?: PublishOptions): Promise<void>` - Publish single event
- `publishBatch(eventType: string, dataArray: any[], options?: PublishOptions): Promise<void>` - Publish batch of events
- `publishEvent(event: NestJSEvent<any>): Promise<void>` - Publish pre-built event
- `getStats(): PublisherStats` - Get publisher statistics

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

// Manually trigger registration
await this.eventDiscoveryService.triggerRegistration();
```

**Methods:**
- `registerEventHandlers(instance: any): Promise<number>` - Register handlers, returns count
- `addServiceForAutoRegistration(instance: any): void` - Add to discovery queue
- `getDiscoveryStats(): { pending: number; registered: number; queueLength: number; retryCount: number }` - Get discovery statistics
- `triggerRegistration(): Promise<void>` - Manually trigger registration

### `EventMetadataExplorer`

Explores instances for event handler metadata.

```typescript
constructor(private readonly metadataExplorer: EventMetadataExplorer) {}

// Explore instance for handlers
const handlers = this.metadataExplorer.explore(instance);

// Check if instance has handlers
const hasHandlers = this.metadataExplorer.hasEventHandlers(instance);

// Get event types
const eventTypes = this.metadataExplorer.getEventTypes(instance);

// Cache statistics
const cacheStats = this.metadataExplorer.getCacheStats();
```

**Methods:**
- `explore(instance: any): EventHandlerMetadata[]` - Get handler metadata
- `hasEventHandlers(instance: any): boolean` - Check if instance has handlers
- `getEventTypes(instance: any): string[]` - Get event types
- `getCacheStats(): CacheStats` - Get cache performance data
- `invalidateCache(instance: any): void` - Invalidate instance cache
- `clearCache(): void` - Clear all cache

### `EventListenersController`

Orchestrates registration of discovered handlers.

```typescript
constructor(private readonly listenersController: EventListenersController) {}

// Register discovered handlers
await this.listenersController.registerDiscoveredHandlers(instance);
```

**Methods:**
- `registerDiscoveredHandlers(instance: any): Promise<void>` - Register all discovered handlers

### `EventModuleScanner`

Orchestrates global automatic discovery.

```typescript
constructor(private readonly moduleScanner: EventModuleScanner) {}

// Scan for event handlers
await this.moduleScanner.scanForEventHandlers();
```

**Methods:**
- `scanForEventHandlers(): Promise<void>` - Scan and register all handlers

### `AutoRegistrationTriggerService`

Triggers automatic registration during module initialization.

```typescript
constructor(private readonly triggerService: AutoRegistrationTriggerService) {}

// Trigger registration
await this.triggerService.triggerRegistration();
```

**Methods:**
- `triggerRegistration(): Promise<void>` - Trigger auto-registration process

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

Event object passed to handlers. This extends the core `EventEnvelope<T>` from `@logistically/events`.

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

### `AutoEventHandlerOptions`

Options for auto event handlers.

```typescript
interface AutoEventHandlerOptions {
  eventType: string;          // Event type pattern
  priority?: number;          // Handler priority
  async?: boolean;            // Whether handler is async
  retry?: RetryOptions;       // Retry configuration
  [key: string]: any;         // Additional options
}
```

### `RetryOptions`

Retry configuration for event handlers.

```typescript
interface RetryOptions {
  maxAttempts: number;        // Maximum retry attempts
  backoffStrategy: 'fixed' | 'exponential'; // Backoff strategy
  baseDelay: number;          // Base delay in milliseconds
  maxDelay: number;           // Maximum delay in milliseconds
}
```

### `SubscriptionOptions`

Options for event subscriptions.

```typescript
interface SubscriptionOptions {
  groupId?: string;            // Consumer group ID
  priority?: number;           // Handler priority
  batchSize?: number;          // Batch size for processing
  maxConcurrent?: number;      // Maximum concurrent handlers
  timeout?: number;            // Handler timeout in milliseconds
}
```

### `HandlerOptions`

Options for event handler registration.

```typescript
interface HandlerOptions {
  priority?: number;            // Handler priority
  async?: boolean;              // Whether handler is async
  retry?: RetryOptions;         // Retry configuration
  timeout?: number;             // Handler timeout in milliseconds
  metadata?: Record<string, any>; // Additional metadata
}
```

### `EventHandler`

Event handler function signature.

```typescript
type EventHandler<T = any> = (event: NestJSEvent<T>) => Promise<void> | void;
```

### `Transport`

Event transport interface.

```typescript
interface Transport {
  name: string;                 // Transport name
  connect(): Promise<void>;     // Connect to transport
  disconnect(): Promise<void>;  // Disconnect from transport
  isConnected(): boolean;       // Check connection status
  publish(topic: string, message: any): Promise<void>; // Publish message
  subscribe(topic: string, handler: Function): Promise<void>; // Subscribe to topic
  unsubscribe(topic: string, handler: Function): Promise<void>; // Unsubscribe from topic
  close(): Promise<void>;       // Close transport
  getStatus(): Promise<any>;    // Get transport status
  getMetrics(): Promise<any>;   // Get transport metrics
}
```

### `RoutingConfig`

Event routing configuration.

```typescript
interface RoutingConfig {
  routes: Route[];              // Route definitions
  validationMode: 'strict' | 'warn' | 'ignore'; // Validation mode
  topicMapping: Record<string, string>; // Topic mapping
  defaultTopicStrategy: 'namespace' | 'flat' | 'custom'; // Default topic strategy
}

interface Route {
  pattern: string;               // Event pattern (supports wildcards)
  transport: string;             // Transport name
  priority?: number;             // Route priority
  options?: Record<string, any>; // Additional options
}
```

### `PublisherConfig`

Publisher configuration options.

```typescript
interface PublisherConfig {
  batching?: {
    enabled: boolean;            // Enable batching
    maxSize: number;             // Maximum batch size
    maxWaitMs: number;           // Maximum wait time
    maxConcurrentBatches: number; // Maximum concurrent batches
    strategy: 'size' | 'time' | 'hybrid'; // Batching strategy
  };
  retry?: {
    enabled: boolean;            // Enable retries
    maxAttempts: number;         // Maximum retry attempts
    backoffStrategy: 'fixed' | 'exponential'; // Backoff strategy
    baseDelay: number;           // Base delay in milliseconds
    maxDelay: number;            // Maximum delay in milliseconds
  };
}
```

### `ConsumerConfig`

Consumer configuration options.

```typescript
interface ConsumerConfig {
  enablePatternRouting: boolean; // Enable pattern-based routing
  enableConsumerGroups: boolean; // Enable consumer groups
  validationMode: 'strict' | 'warn' | 'ignore'; // Validation mode
  batchSize: number;             // Batch size for processing
  maxConcurrentHandlers: number; // Maximum concurrent handlers
  maxWaitMs: number;             // Maximum wait time for batches
}
```

### `EventRouter`

Event routing service.

```typescript
interface EventRouter {
  resolveTopic(eventType: string): string; // Resolve event type to topic
  resolveTransport(eventType: string): string; // Resolve event type to transport
  getRoutes(): Route[]; // Get all configured routes
  validateRoute(route: Route): boolean; // Validate route configuration
}
```

### `EventHandlerRegistry`

Event handler registry interface.

```typescript
interface EventHandlerRegistry {
  registerHandler(eventType: string, handler: EventHandler, options?: HandlerOptions): Promise<void>;
  unregisterHandler(eventType: string, handler: EventHandler): Promise<void>;
  getHandlers(eventType: string): EventHandler[];
  getAllHandlers(): Map<string, EventHandler[]>;
  hasHandlers(eventType: string): boolean;
  clearHandlers(eventType?: string): void;
}
```

### `EventSystem`

Core event system interface.

```typescript
interface EventSystem {
  connect(): Promise<void>; // Connect to event system
  disconnect(): Promise<void>; // Disconnect from event system
  isConnected(): boolean; // Check connection status
  getStatus(): Promise<SystemStatus>; // Get system status
  getMetrics(): Promise<any>; // Get system metrics
  close(): Promise<void>; // Close event system
}
```

### `EventHandlerMetadata`

Metadata for discovered event handlers.

```typescript
interface EventHandlerMetadata {
  methodKey: string;         // Method name
  eventType: string;         // Event type pattern
  priority?: number;         // Handler priority
  async?: boolean;           // Whether handler is async
  instance: any;             // Service instance
  metadata?: Record<string, any>; // Additional metadata
}
```

### `EventDiscoveryOptions`

Options for event discovery.

```typescript
interface EventDiscoveryOptions {
  enabled: boolean;           // Enable discovery
  priority: number;           // Discovery priority
  autoRegister: boolean;      // Auto-register discovered handlers
  scanInterval: number;       // Scan interval in milliseconds
  maxRetries: number;         // Maximum retry attempts
  retryDelay: number;         // Retry delay in milliseconds
}
```

### `EventMetadataExplorerOptions`

Options for metadata exploration.

```typescript
interface EventMetadataExplorerOptions {
  cacheEnabled: boolean;      // Enable metadata caching
  cacheTTL: number;           // Cache TTL in milliseconds
  scanPrototypes: boolean;    // Scan prototype chain
  includeInherited: boolean;  // Include inherited methods
  filterMethods: (method: string) => boolean; // Method filter function
}
```



### `NestJSEventsModuleOptions`

Module configuration options.

```typescript
interface NestJSEventsModuleOptions {
  service: string;            // Service name
  originPrefix?: string;      // Origin prefix
  autoDiscovery?: boolean;    // Enable auto-discovery (required for performance monitoring)
  global?: boolean;           // Global module
  transports?: Map<string, any>; // Transport configuration
  routing?: any;              // Event routing
  publisher?: any;            // Publisher configuration
  consumer?: any;             // Consumer configuration
  validationMode?: string;    // Validation mode
  debug?: boolean;            // Debug mode
}
```



### `DiscoveryStats`

Event discovery service statistics.

```typescript
interface DiscoveryStats {
  pending: number;           // Services waiting for registration
  registered: number;        // Successfully registered services
  queueLength: number;       // Current queue length
  retryCount: number;        // Total retry attempts
}
```

### `EventHandlerMetadata`

Metadata for discovered event handlers.

```typescript
interface EventHandlerMetadata {
  methodKey: string;         // Method name
  eventType: string;         // Event type pattern
  priority?: number;         // Handler priority
  async?: boolean;           // Whether handler is async
  instance: any;             // Service instance
}
```

### `CacheStats`

Cache performance statistics.

```typescript
interface CacheStats {
  hits: number;              // Cache hits
  misses: number;            // Cache misses
  hitRate: number;           // Hit rate percentage
  size: number;              // Current cache size
}
```

### `PublishOptions`

Options for publishing events.

```typescript
interface PublishOptions {
  headers?: Record<string, any>;  // Custom headers
  partitionKey?: string;          // Partition key for ordering
  correlationId?: string;         // Correlation ID for tracing
  priority?: number;              // Event priority
  ttl?: number;                   // Time to live in milliseconds
}
```

### `PublisherStats`

Publisher service statistics.

```typescript
interface PublisherStats {
  eventsPublished: number;        // Total events published
  batchesPublished: number;       // Total batches published
  averageBatchSize: number;       // Average batch size
  publishLatency: number;         // Average publish latency in ms
  errorCount: number;             // Total publish errors
  lastActivity: Date;             // Last publish activity
}
```

### `ConsumerStats`

Consumer service statistics.

```typescript
interface ConsumerStats {
  eventsReceived: number;         // Total events received
  handlersExecuted: number;       // Total handlers executed
  averageProcessingTime: number;  // Average processing time in ms
  errorCount: number;             // Total consumer errors
  activeSubscriptions: number;    // Current active subscriptions
  lastActivity: Date;             // Last consumer activity
}
```

### `SystemStatus`

Event system health status.

```typescript
interface SystemStatus {
  connected: boolean;              // Connection status
  healthy: boolean;                // System health
  uptime: number;                  // System uptime in seconds
  version: string;                 // System version
  transports: string[];            // Available transports
  lastActivity: Date;              // Last system activity
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

1. **Enable performance monitoring** by setting `autoDiscovery: true`
2. **Check performance metrics** using `PerformanceMonitorService.getMetrics()`
3. **Monitor cache hit rates** - low rates indicate inefficient metadata scanning
4. **Enable batching** in publisher configuration for high-volume scenarios
5. **Adjust batch sizes and timing** based on your throughput requirements
6. **Use appropriate transport** for event volume and latency requirements
7. **Monitor memory usage** and adjust cache TTL if needed
8. **Review performance warnings** logged by the monitoring service

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
