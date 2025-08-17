# @logistically/events-nestjs

NestJS integration for [@logistically/events](https://github.com/onwello/events) v3 - Event-driven architecture with Redis Streams, comprehensive batching, reliable consumption, and enterprise-grade features.

## 🚀 Features

### Core Integration
- **Seamless Integration**: Built on top of `@logistically/events` v3 with full feature parity
- **NestJS Native**: Designed specifically for NestJS applications with decorators and dependency injection
- **Auto-Discovery**: Automatically discovers and registers event handlers and subscribers
- **Type Safety**: Full TypeScript support with comprehensive types
- **Tree-Shakable**: Import only what you need for optimal bundle sizes

### Event Management
- **Event Handlers**: `@EventHandler()` decorator for processing events
- **Event Publishers**: `@EventPublisher()` decorator for publishing events
- **Event Subscribers**: `@EventSubscriber()` decorator for subscribing to events
- **Correlation Tracking**: Built-in correlation and causation ID support

### Transport Support
- **Redis Streams**: Production-ready Redis Streams transport with consumer groups
- **Redis Cluster**: Full cluster mode support with automatic failover
- **Redis Sentinel**: Sentinel mode for high availability
- **Memory Transport**: Fast in-memory transport for testing and development
- **Plugin System**: Extensible transport plugin system

### Enterprise Features
- **Origin-Based Routing**: Regional isolation and namespace separation
- **Advanced Batching**: Configurable message batching with multiple strategies
- **Retry Mechanisms**: Sophisticated retry strategies with backoff
- **Validation**: Comprehensive event validation with Zod schemas
- **Comprehensive Monitoring**: Built-in statistics, metrics, and health checks
- **Message Ordering**: Global sequencing and causal dependency tracking
- **Schema Management**: Event schema validation and evolution
- **Message Replay**: Replay messages from specific points in time

## 🔬 Advanced Features

All advanced features are now **fully implemented and accessible** through our NestJS integration layer. No need to use the core library directly!

### Event Envelopes
Events in the system are wrapped in structured envelopes that provide metadata and context:

```typescript
interface EventEnvelope<T = any> {
  header: {
    id: string;                    // Unique event identifier
    type: string;                  // Event type (e.g., 'user.created')
    origin: string;                // Source service/origin name
    timestamp: string;             // Event creation timestamp (ISO string)
    originPrefix?: string;         // Optional origin prefix (e.g., 'eu.de')
  };
  body: T;                        // Event payload data
  nestjsMetadata?: {               // NestJS-specific metadata
    correlationId?: string;        // Request correlation ID
    causationId?: string;          // Previous event ID that caused this
    [key: string]: any;           // Additional custom metadata
  };
}
```

**Key Benefits:**
- **Traceability**: Full event lineage with correlation and causation IDs
- **Context Preservation**: Service origin, timestamps, and origin prefixes
- **NestJS Integration**: Built-in metadata support for NestJS applications
- **Debugging**: Rich context for troubleshooting and monitoring

**Usage Example:**
```typescript
// Create event envelope
const envelope = createEventEnvelope('user.created', 'user-service', userData, 'eu.de');

// Access event properties
console.log('Event ID:', envelope.header.id);
console.log('Event Type:', envelope.header.type);
console.log('Origin:', envelope.header.origin);
console.log('Timestamp:', envelope.header.timestamp);
console.log('Body:', envelope.body);
console.log('Correlation ID:', envelope.nestjsMetadata?.correlationId);
```

### Stream Partitioning
Advanced horizontal scaling through intelligent event stream partitioning:

```typescript
// Enable partitioning in Redis transport
new RedisStreamsPlugin().createTransport({
  enablePartitioning: true,
  partitionCount: 8,             // Number of partitions
  partitioning: {
    strategy: 'hash',             // Partitioning strategy
    autoScaling: true,            // Auto-scale partitions based on load
    partitionKeyExtractor: (msg) => msg.userId  // Custom key extraction
  }
})
```

**Partitioning Strategies:**
```typescript
// Hash-based partitioning (default)
strategy: 'hash'                  // Consistent hashing for even distribution

// Round-robin partitioning
strategy: 'roundRobin'            // Sequential distribution across partitions

// Key-based partitioning
strategy: 'keyBased'              // Partition by specific message properties

// Dynamic load-based partitioning
strategy: 'dynamic'               // Auto-balance based on partition load
```

**Publisher Partitioning:**
```typescript
// Specify partition for individual events
await eventPublisher.publish('user.created', userData, {
  partitionKey: 'userId',        // Field to use for partitioning
  partition: 2                   // Specific partition number
});
```

**Batching with Partitioning:**
```typescript
publisher: {
  batching: {
    strategy: 'partition',        // Use partition-based batching
    maxSize: 1000,
    maxWaitMs: 100
  }
}
```

**Available Features:**
- **Multiple Strategies**: Hash, Round-robin, Key-based, Dynamic load-based
- **Auto-scaling**: Automatic partition scaling based on load
- **Partition Keys**: Route events to specific partitions based on data
- **Partition Assignment**: Manually assign events to specific partitions
- **Partition-based Batching**: Batch events by partition for ordering
- **Load Balancing**: Dynamic load distribution across partitions
- **Consumer Scaling**: Scale consumers based on partition count

### Redis Cluster & High Availability
Enterprise-grade Redis deployment support:

```typescript
// Redis Cluster mode
new RedisStreamsPlugin().createTransport({
  clusterNodes: [
    { host: 'redis-cluster-1', port: 7000 },
    { host: 'redis-cluster-2', port: 7000 },
    { host: 'redis-cluster-3', port: 7000 }
  ],
  enableFailover: true,
  failoverRecovery: {
    enabled: true,
    maxRetries: 3,
    retryDelay: 1000
  }
})

// Redis Sentinel mode
new RedisStreamsPlugin().createTransport({
  sentinels: [
    { host: 'sentinel-1', port: 26379 },
    { host: 'sentinel-2', port: 26379 },
    { host: 'sentinel-3', port: 26379 }
  ],
  sentinelName: 'mymaster',
  connectionTimeout: 5000,
  commandTimeout: 3000
})
```

**Available Features:**
- **Cluster Mode**: Full Redis cluster support with automatic sharding
- **Sentinel Mode**: High availability with automatic failover
- **Failover Recovery**: Automatic failover handling and recovery
- **Connection Management**: Connection pooling, timeouts, and retry logic
- **Load Balancing**: Automatic load distribution across cluster nodes

### Consumer Rebalancing
Advanced consumer distribution and load balancing:

```typescript
// Consumer group configuration with advanced features
new RedisStreamsPlugin().createTransport({
  groupId: 'user-service-group',
  consumerId: 'consumer-1',
  enableConsumerGroups: true,
  consumerGroupOptions: {
    maxConsumersPerPartition: 2,
    rebalanceStrategy: 'range',
    rebalanceInterval: 30000
  }
})
```

**Rebalancing Features:**
- **Consumer Groups**: Full Redis Streams consumer group support
- **Automatic Distribution**: Intelligent partition assignment to consumers
- **Failover**: Automatic failover when consumers go down
- **Load Balancing**: Dynamic consumer load distribution
- **Health Monitoring**: Consumer health and performance tracking

### Schema Management & Validation
Advanced event schema management and validation:

```typescript
// Enable schema management
new RedisStreamsPlugin().createTransport({
  schema: {
    enabled: true,
    validationMode: 'strict',
    schemaRegistry: 'redis://localhost:6379',
    enableSchemaEvolution: true,
    versioning: 'semantic'
  }
})
```

**Schema Features:**
- **Schema Registry**: Centralized schema storage and management
- **Schema Validation**: Runtime event validation against schemas
- **Schema Evolution**: Backward-compatible schema changes
- **Versioning**: Semantic versioning for schemas
- **Type Safety**: Runtime type checking and validation

### Message Replay & Recovery
Advanced message replay and recovery capabilities:

```typescript
// Enable message replay
new RedisStreamsPlugin().createTransport({
  replay: {
    enabled: true,
    maxReplaySize: 10000,
    enableSelectiveReplay: true,
    replayStrategies: ['from-timestamp', 'from-sequence', 'from-checkpoint']
  }
})
```

**Replay Features:**
- **Selective Replay**: Replay messages from specific points
- **Multiple Strategies**: Timestamp, sequence, or checkpoint-based replay
- **Bulk Replay**: Efficient bulk message replay
- **Recovery**: Disaster recovery and message restoration
- **Audit Trail**: Complete message history and audit

### Dead Letter Queues (DLQ)
Failed message handling and recovery:

```typescript
// Enable DLQ for failed message handling
new RedisStreamsPlugin().createTransport({
  enableDLQ: true,
  dlqStreamPrefix: 'dlq:',        // DLQ stream prefix
  maxRetries: 3,                  // Max retry attempts
  retryDelay: 1000,               // Retry delay between attempts
  maxRetriesBeforeDLQ: 3,         // Max retries before moving to DLQ
  dlqRetention: 86400000,         // DLQ message retention (ms)
  dlqClassification: {
    enabled: true,
    errorTypes: ['validation', 'processing', 'timeout']
  },
  poisonMessageHandler: async (message, error) => {
    // Custom handling for permanently failed messages
    console.error('Poison message:', message, error);
    // Send to monitoring, alerting, etc.
  }
})
```

**DLQ Features:**
- **Automatic Retry**: Configurable retry attempts with backoff
- **Error Classification**: Different DLQ streams for different error types
- **Recovery**: Manual message reprocessing from DLQ
- **Monitoring**: Built-in metrics for failed message tracking
- **Error Categorization**: Automatic error type classification
- **Retention Policies**: Configurable DLQ message retention



### Message Ordering & Causal Dependencies
Advanced message ordering and causality tracking:

```typescript
// Enable message ordering
new RedisStreamsPlugin().createTransport({
  ordering: {
    enabled: true,
    strategy: 'partition',        // Order within partitions
    enableCausalDependencies: true
  }
})
```

**Ordering Features:**
- **Global Sequencing**: Atomic sequence number generation
- **Partition Ordering**: Maintain order within partitions
- **Causal Dependencies**: Track message causality and dependencies
- **Processing Locks**: Ensure ordered message processing
- **Sequence Management**: Automatic sequence number management

### Advanced Routing
Sophisticated event routing and filtering:

```typescript
// Pattern-based event handling
@EventHandler({ eventType: 'user.*' })
async handleUserEvents(event: any): Promise<void> {
  // Handle all user-related events
}

// Pattern-based subscription
await eventConsumer.subscribePattern('user.*', handler);

// Content-based routing with conditions
@EventHandler({
  eventType: 'user.created',
  routing: {
    condition: (event) => event.body.region === 'EU',
    target: 'eu-processor'
  }
})
```

**Available Routing Features:**
- **Pattern Matching**: Advanced wildcard pattern support (`user.*`, `*.created`)
- **Event Type Filtering**: Route events by type patterns
- **Service-based Routing**: Route by service origin
- **Conditional Routing**: Dynamic routing based on event properties

### Monitoring & Observability
Comprehensive metrics and monitoring capabilities:

```typescript
// Get comprehensive metrics from services
const publisherStats = await eventPublisherService.getStats();
const consumerStats = await eventConsumerService.getStats();
const systemStatus = await eventSystemService.getStatus();

// Access detailed metrics
console.log('Published messages:', publisherStats?.messagesPublished);
console.log('Received messages:', consumerStats?.messagesReceived);
console.log('Error rate:', publisherStats?.errorRate);
console.log('Throughput:', publisherStats?.throughput);
console.log('Memory usage:', publisherStats?.memoryUsage);
console.log('CPU usage:', publisherStats?.cpuUsage);
```

**Available Metrics:**
- **Performance Metrics**: Publish/receive latency, throughput, error rates
- **System Metrics**: Memory usage, CPU usage, uptime, connection status
- **Partition Metrics**: Partition health, load, and performance
- **Consumer Metrics**: Processing time, failure rates, retry counts
- **Transport Metrics**: Connection health, failover events, cluster status

**Health Checks:**
- **System Health**: Overall system health and status
- **Transport Health**: Transport connectivity and performance
- **Partition Health**: Partition availability and load
- **Consumer Health**: Consumer group health and lag
- **Cluster Health**: Redis cluster/sentinel health status

**Enterprise Monitoring:**
- **Real-time Metrics**: Live performance and health monitoring
- **Historical Data**: Metrics retention and trend analysis
- **Alerting**: Configurable alerts for performance thresholds
- **Integration**: Prometheus, DataDog, and other monitoring systems

## 📦 Installation

```bash
npm install @logistically/events-nestjs
```

## 🌳 Tree-Shaking & Import Optimization

This library is **fully tree-shakable**, meaning you only bundle the code you actually use. This can reduce your bundle size by **60-80%** for most applications.

### **Optimal Import Patterns**

```typescript
// ✅ Import only what you need (Tree-shakable)
import { EventHandler } from '@logistically/events-nestjs';
import { EventPublisherService } from '@logistically/events-nestjs';
import { EventsModule } from '@logistically/events-nestjs';

// ❌ Don't import everything (Not tree-shakable)
import * as Events from '@logistically/events-nestjs';
```

### **Bundle Size Examples**

| Import Pattern | Bundle Size | Tree-Shaking |
|----------------|-------------|--------------|
| `{ EventHandler }` | ~5-10KB | ✅ Excellent |
| `{ EventHandler, EventPublisher }` | ~8-15KB | ✅ Great |
| `{ EventsModule }` | ~50-100KB | ⚠️ Full Module |
| `* as Events` | ~50-100KB | ❌ None |

### **Feature-Based Imports**

```typescript
// Import only decorators
import { EventHandler, EventPublisher, EventSubscriber } from '@logistically/events-nestjs';

// Import only services
import { EventPublisherService, EventConsumerService } from '@logistically/events-nestjs';

// Import only types (type-only imports)
import type { NestJSEvent, EventEnvelope } from '@logistically/events-nestjs';

// Import only utilities
import { ConfigFactory, ConfigValidator } from '@logistically/events-nestjs';

// Import only advanced features
import type { RedisClusterConfig, PartitioningConfig } from '@logistically/events-nestjs';
```

### **Lazy Loading for Advanced Features**

```typescript
// Load advanced features only when needed
if (needsAdvancedFeatures) {
  const { ConfigFactory, ConfigValidator } = await import('@logistically/events-nestjs');
  // Advanced features loaded dynamically
}
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
          strategy: 'size'          // Options: 'size', 'time', 'partition'
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
REDIS_ENABLE_PARTITIONING=true
REDIS_PARTITION_COUNT=8

# Redis Advanced Features
REDIS_ENABLE_ORDERING=true
REDIS_ENABLE_SCHEMA_MANAGEMENT=true
REDIS_ENABLE_MESSAGE_REPLAY=true
REDIS_ENABLE_CLUSTER_MODE=false
REDIS_ENABLE_SENTINEL_MODE=false
REDIS_CLUSTER_NODES=redis-cluster-1:7000,redis-cluster-2:7000,redis-cluster-3:7000
REDIS_SENTINEL_NODES=sentinel-1:26379,sentinel-2:26379,sentinel-3:26379
REDIS_SENTINEL_NAME=mymaster
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

## 🏭 Production Best Practices

### High Availability Configuration
```typescript
// Redis Cluster configuration for high availability
EventsModule.forRoot({
  service: process.env.SERVICE_NAME,
  transports: new Map([
    ['redis', new RedisStreamsPlugin().createTransport({
      // Cluster mode
      clusterNodes: process.env.REDIS_CLUSTER_NODES?.split(',').map(node => {
        const [host, port] = node.split(':');
        return { host, port: parseInt(port) };
      }),
      enableFailover: true,
      failoverRecovery: {
        enabled: true,
        maxRetries: 3,
        retryDelay: 1000
      },
      
      // Or Sentinel mode
      // sentinels: process.env.REDIS_SENTINEL_NODES?.split(',').map(node => {
      //   const [host, port] = node.split(':');
      //   return { host, port: parseInt(port) };
      // }),
      // sentinelName: process.env.REDIS_SENTINEL_NAME || 'mymaster',
      
      // Common settings
      groupId: `${process.env.SERVICE_NAME}-group`,
      enableDLQ: true,
      enablePartitioning: true,
      partitionCount: 8
    })]
  ])
})
```

### Configuration Recommendations
```typescript
// Production-ready configuration
EventsModule.forRoot({
  service: process.env.SERVICE_NAME,
  validationMode: 'strict',        // Strict validation in production
  global: true,                    // Global module for app-wide access
  
  // High-availability Redis configuration
  transports: new Map([
    ['redis', new RedisStreamsPlugin().createTransport({
      url: process.env.REDIS_URL,
      groupId: `${process.env.SERVICE_NAME}-group`,
      enableDLQ: true,             // Always enable DLQ in production
      enablePartitioning: true,    // Enable partitioning for scalability
      partitionCount: 8,           // Adjust based on expected load
      maxRetries: 3,
      
      // Advanced features for production
      ordering: {
        enabled: true,
        strategy: 'partition',      // Maintain order within partitions
        enableCausalDependencies: true
      },
      partitioning: {
        strategy: 'hash',           // Consistent hashing for even distribution
        autoScaling: true          // Auto-scale based on load
      },
      schema: {
        enabled: true,
        validationMode: 'strict',
        enableSchemaEvolution: true
      },
      replay: {
        enabled: true,
        maxReplaySize: 10000
      }
    })]
  ]),
  
  // Publisher optimization
  publisher: {
    batching: {
      enabled: true,
      maxSize: 1000,
      maxWaitMs: 100,
      strategy: 'size'              // Options: 'size', 'time', 'partition'
    },
    retry: {
      maxRetries: 3,
      backoffStrategy: 'exponential',
      baseDelay: 1000
    }
  },
  
  // Consumer optimization
  consumer: {
    enableConsumerGroups: true,
    enablePatternRouting: true,
    validationMode: 'strict'
  }
})
```

### Performance Tuning
Advanced performance optimization strategies:

- **Batching Strategies**: Choose between size, time, or partition-based batching
- **Partitioning**: Use hash-based, round-robin, or dynamic load-based partitioning
- **Consumer Scaling**: Scale consumers based on partition count and load
- **Memory Management**: Monitor memory usage and adjust batch sizes accordingly
- **Redis Optimization**: Enable pipelining, connection pooling, and failover handling

**Partitioning Strategies:**
- **Hash-based**: Consistent hashing for even distribution (recommended)
- **Round-robin**: Sequential distribution across partitions
- **Dynamic**: Auto-balance based on partition load
- **Key-based**: Partition by specific message properties

**Redis Performance:**
- **Pipelining**: Enable for batch operations
- **Connection Pooling**: Optimize connection management
- **Failover**: Automatic failover and recovery
- **Cluster Sharding**: Distribute load across cluster nodes

### Monitoring & Alerting
- Set up alerts for high error rates (>1% failure rate)
- Monitor consumer lag and alert if lag exceeds thresholds
- Track throughput metrics and scale partitions when approaching limits
- Set up health check endpoints for load balancer integration

### Security Considerations
- Use Redis ACLs to restrict access to event streams
- Implement proper authentication for Redis connections
- Consider encrypting sensitive event payloads
- Use environment variables for all configuration secrets

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
