import { Module, Injectable, Controller, Get } from '@nestjs/common';
import { EventsModule, EventHandler, EventPublisher, EventSubscriber } from '@logistically/events-nestjs';
import { EventPublisherService, EventConsumerService, EventSystemService } from '@logistically/events-nestjs';
import { EventUtils, NestJSEvent } from '@logistically/events-nestjs';
import { RedisStreamsPlugin, MemoryTransportPlugin } from '@logistically/events';

// ============================================================================
// ADVANCED CONFIGURATION EXAMPLE
// ============================================================================

@Module({
  imports: [
    EventsModule.forRoot({
      service: 'advanced-ecommerce-service',
      originPrefix: 'us.east',
      
      // Advanced Redis configuration with Cluster/Sentinel support
      transports: new Map([
        ['redis', new RedisStreamsPlugin().createTransport({
          // Basic Redis configuration
          url: process.env.REDIS_URL || 'redis://localhost:6379',
          groupId: 'ecommerce-consumer-group',
          batchSize: 200,
          
          // Advanced Redis features
          cluster: {
            enabled: process.env.REDIS_CLUSTER_ENABLED === 'true',
            nodes: process.env.REDIS_CLUSTER_NODES?.split(',') || [
              'redis://localhost:7000',
              'redis://localhost:7001',
              'redis://localhost:7002'
            ],
            options: {
              maxRedirections: 16,
              retryDelayOnFailover: 100,
              enableOfflineQueue: false
            }
          },
          
          // Sentinel configuration
          sentinel: {
            enabled: process.env.REDIS_SENTINEL_ENABLED === 'true',
            hosts: process.env.REDIS_SENTINEL_HOSTS?.split(',') || [
              { host: 'localhost', port: 26379 },
              { host: 'localhost', port: 26380 }
            ],
            name: process.env.REDIS_SENTINEL_NAME || 'mymaster',
            password: process.env.REDIS_SENTINEL_PASSWORD
          },
          
          // Advanced partitioning
          partitioning: {
            enabled: true,
            strategy: 'hash', // 'hash' | 'round-robin' | 'key-based' | 'dynamic'
            partitionCount: 8,
            partitionKeyExtractor: (event) => event.body?.userId || event.header.id
          },
          
          // Message ordering
          ordering: {
            enabled: true,
            strategy: 'global-sequence', // 'global-sequence' | 'causal' | 'processing-lock'
            maxOutOfOrderMessages: 100
          },
          
          // Advanced DLQ
          enableDLQ: true,
          dlqStreamPrefix: 'dlq:ecommerce:',
          dlqRetention: {
            maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
            maxSize: 10000
          },
          
          // Schema management
          schemaValidation: {
            enabled: true,
            strictMode: false,
            allowUnknownFields: true
          },
          
          // Message replay
          replay: {
            enabled: true,
            maxReplayAge: 24 * 60 * 60 * 1000, // 24 hours
            replayBatchSize: 50
          },
          
          // Advanced routing
          routing: {
            patternMatching: true,
            contentBasedRouting: {
              enabled: true,
              rules: [
                {
                  condition: (event) => event.body?.priority === 'high',
                  target: 'priority-queue'
                },
                {
                  condition: (event) => event.body?.category === 'payment',
                  target: 'payment-queue'
                }
              ]
            }
          },
          
          // Metrics and monitoring
          metrics: {
            enabled: true,
            interval: 5000, // 5 seconds
            includePartitionMetrics: true,
            includeConsumerMetrics: true
          }
        })],
        
        ['memory', new MemoryTransportPlugin().createTransport({
          originPrefix: 'test',
          enablePatternMatching: true,
          maxMessageSize: 1024 * 1024 // 1MB
        })]
      ]),
      
      // Advanced publisher configuration
      publisher: {
        batching: {
          enabled: true,
          maxSize: 2000,
          maxWaitMs: 200,
          maxConcurrentBatches: 10,
          strategy: 'partition', // 'size' | 'time' | 'partition'
          partitionStrategy: {
            keyExtractor: (event) => event.body?.userId,
            partitionCount: 8
          }
        },
        
        retry: {
          maxRetries: 5,
          backoffStrategy: 'fibonacci', // 'exponential' | 'fixed' | 'fibonacci'
          baseDelay: 1000,
          maxDelay: 30000,
          jitter: true
        },
        
        rateLimiting: {
          maxRequests: 1000,
          timeWindow: 60000, // 1 minute
          strategy: 'sliding-window' // 'sliding-window' | 'token-bucket'
        }
      },
      
      // Advanced consumer configuration
      consumer: {
        enablePatternRouting: true,
        enableConsumerGroups: true,
        validationMode: 'strict',
        
        // Consumer rebalancing
        rebalancing: {
          enabled: true,
          strategy: 'auto', // 'auto' | 'manual'
          rebalanceInterval: 30000 // 30 seconds
        },
        
        // Advanced error handling
        errorHandling: {
          retryPolicy: {
            maxRetries: 3,
            backoffStrategy: 'exponential',
            baseDelay: 1000
          },
          deadLetterQueue: {
            enabled: true,
            maxRetries: 3,
            errorClassification: true
          }
        }
      },
      
      // Global settings
      validationMode: 'strict',
      autoDiscovery: true,
      global: true
    }),
  ],
  providers: [AdvancedEcommerceService, MetricsService],
  controllers: [AdvancedEcommerceController],
})
export class AdvancedFeaturesModule {}

// ============================================================================
// ADVANCED SERVICE EXAMPLE
// ============================================================================

@Injectable()
export class AdvancedEcommerceService {
  constructor(
    private readonly eventPublisher: EventPublisherService,
    private readonly eventConsumer: EventConsumerService,
    private readonly eventSystem: EventSystemService,
  ) {}

  // Advanced event publishing with partitioning
  @EventPublisher({ 
    eventType: 'order.created',
    options: {
      partitionKey: 'userId',
      priority: 'high',
      ttl: 24 * 60 * 60 * 1000 // 24 hours
    }
  })
  async createOrder(userId: string, orderData: any): Promise<string> {
    const orderId = `order-${Date.now()}`;
    
    // Create event with advanced metadata
    const event = EventUtils.createDomainEvent(
      'order.created',
      { 
        orderId, 
        userId, 
        ...orderData,
        priority: 'high',
        category: 'order'
      },
      'ecommerce-service',
      orderId,
      1,
      {
        correlationId: EventUtils.generateCorrelationId(),
        causationId: `user-${userId}`,
        metadata: {
          source: 'web-api',
          version: '2.0',
          tags: ['order', 'high-priority']
        }
      }
    );

    await this.eventPublisher.publishEvent(event);
    return orderId;
  }

  // Batch publishing with partitioning
  async createOrderBatch(orders: Array<{ userId: string; data: any }>): Promise<void> {
    const events = orders.map(order => 
      EventUtils.createDomainEvent(
        'order.created',
        { orderId: `order-${Date.now()}-${Math.random()}`, ...order },
        'ecommerce-service',
        order.userId,
        1
      )
    );

    // Publish batch with partition strategy
    await this.eventPublisher.publishBatch('order.created', events.map(e => e.body), {
      partitionKey: 'userId',
      maxSize: 100,
      maxWaitMs: 500
    });
  }

  // Pattern-based event handling
  @EventHandler({ 
    eventType: 'order.*',
    priority: 1,
    async: true
  })
  async handleAllOrderEvents(event: NestJSEvent<any>): Promise<void> {
    console.log(`Handling order event: ${event.header.type}`);
    
    // Route based on event type
    switch (event.header.type) {
      case 'order.created':
        await this.processOrderCreated(event);
        break;
      case 'order.updated':
        await this.processOrderUpdated(event);
        break;
      case 'order.cancelled':
        await this.processOrderCancelled(event);
        break;
    }
  }

  // High-priority event handling
  @EventHandler({ 
    eventType: 'payment.*',
    priority: 10, // Higher priority
    async: true
  })
  async handlePaymentEvents(event: NestJSEvent<any>): Promise<void> {
    console.log(`Processing payment event: ${event.header.type}`);
    
    // Process payment events with high priority
    if (event.body?.priority === 'high') {
      await this.processHighPriorityPayment(event);
    }
  }

  // Event subscription with pattern matching
  @EventSubscriber({
    eventTypes: ['user.*', 'inventory.*'],
    options: {
      groupId: 'ecommerce-processor',
      batchSize: 50,
      enablePatternMatching: true
    }
  })
  async subscribeToUserAndInventoryEvents(): Promise<void> {
    // This will automatically subscribe to user.* and inventory.* events
    console.log('Subscribed to user and inventory events');
  }

  // Manual event subscription
  async subscribeToCustomEvents(): Promise<void> {
    await this.eventConsumer.subscribePattern('custom.*', async (event) => {
      console.log(`Custom event received: ${event.header.type}`);
    }, {
      groupId: 'custom-processor',
      batchSize: 25
    });
  }

  // Get system metrics
  async getSystemMetrics() {
    const system = this.eventSystem.getEventSystem();
    const metrics = await system.getMetrics();
    
    return {
      publisher: await system.publisher.getMetrics(),
      consumer: await system.consumer.getMetrics(),
      system: metrics,
      partitions: await system.getPartitionMetrics(),
      consumers: await system.getConsumerMetrics()
    };
  }

  // Get partition information
  async getPartitionInfo() {
    const system = this.eventSystem.getEventSystem();
    return {
      partitionCount: system.getPartitionCount(),
      partitionDistribution: await system.getPartitionDistribution(),
      consumerDistribution: await system.getConsumerDistribution()
    };
  }

  // Replay messages from specific point
  async replayMessages(fromTimestamp: number, eventTypes?: string[]): Promise<void> {
    const system = this.eventSystem.getEventSystem();
    await system.replayMessages(fromTimestamp, eventTypes);
  }

  private async processOrderCreated(event: NestJSEvent<any>): Promise<void> {
    // Process order creation
    console.log(`Processing order creation: ${event.body.orderId}`);
  }

  private async processOrderUpdated(event: NestJSEvent<any>): Promise<void> {
    // Process order update
    console.log(`Processing order update: ${event.body.orderId}`);
  }

  private async processOrderCancelled(event: NestJSEvent<any>): Promise<void> {
    // Process order cancellation
    console.log(`Processing order cancellation: ${event.body.orderId}`);
  }

  private async processHighPriorityPayment(event: NestJSEvent<any>): Promise<void> {
    // Process high priority payment
    console.log(`Processing high priority payment: ${event.body.paymentId}`);
  }
}

// ============================================================================
// METRICS SERVICE EXAMPLE
// ============================================================================

@Injectable()
export class MetricsService {
  constructor(private readonly eventSystem: EventSystemService) {}

  // Get comprehensive metrics
  async getComprehensiveMetrics() {
    const system = this.eventSystem.getEventSystem();
    
    return {
      timestamp: new Date().toISOString(),
      service: system.getServiceName(),
      
      // Publisher metrics
      publisher: {
        totalPublished: await system.publisher.getTotalPublished(),
        publishedLastHour: await system.publisher.getPublishedLastHour(),
        batchMetrics: await system.publisher.getBatchMetrics(),
        partitionMetrics: await system.publisher.getPartitionMetrics(),
        errorRate: await system.publisher.getErrorRate()
      },
      
      // Consumer metrics
      consumer: {
        totalConsumed: await system.consumer.getTotalConsumed(),
        consumedLastHour: await system.consumer.getConsumedLastHour(),
        consumerGroups: await system.consumer.getConsumerGroupMetrics(),
        partitionDistribution: await system.consumer.getPartitionDistribution(),
        processingLatency: await system.consumer.getProcessingLatency()
      },
      
      // System metrics
      system: {
        uptime: system.getUptime(),
        memoryUsage: process.memoryUsage(),
        cpuUsage: process.cpuUsage(),
        activeConnections: await system.getActiveConnections(),
        partitionHealth: await system.getPartitionHealth()
      },
      
      // Transport metrics
      transports: await system.getTransportMetrics()
    };
  }
}

// ============================================================================
// CONTROLLER EXAMPLE
// ============================================================================

@Controller('events')
export class AdvancedEcommerceController {
  constructor(
    private readonly eventService: AdvancedEcommerceService,
    private readonly metricsService: MetricsService
  ) {}

  @Get('metrics')
  async getMetrics() {
    return await this.metricsService.getComprehensiveMetrics();
  }

  @Get('partitions')
  async getPartitionInfo() {
    return await this.eventService.getPartitionInfo();
  }

  @Get('health')
  async getHealth() {
    const metrics = await this.metricsService.getComprehensiveMetrics();
    return {
      status: 'healthy',
      timestamp: metrics.timestamp,
      uptime: metrics.system.uptime,
      activeConnections: metrics.system.activeConnections
    };
  }
}

// ============================================================================
// ENVIRONMENT VARIABLES FOR ADVANCED FEATURES
// ============================================================================

/*
# Advanced Redis Configuration
REDIS_CLUSTER_ENABLED=true
REDIS_CLUSTER_NODES=redis://localhost:7000,redis://localhost:7001,redis://localhost:7002
REDIS_SENTINEL_ENABLED=false
REDIS_SENTINEL_HOSTS=localhost:26379,localhost:26380
REDIS_SENTINEL_NAME=mymaster
REDIS_SENTINEL_PASSWORD=

# Advanced Partitioning
REDIS_ENABLE_PARTITIONING=true
REDIS_PARTITION_COUNT=8
REDIS_PARTITION_STRATEGY=hash

# Message Ordering
REDIS_ENABLE_ORDERING=true
REDIS_ORDERING_STRATEGY=global-sequence
REDIS_MAX_OUT_OF_ORDER=100

# Advanced DLQ
REDIS_DLQ_ENABLED=true
REDIS_DLQ_STREAM_PREFIX=dlq:ecommerce:
REDIS_DLQ_MAX_AGE=604800000
REDIS_DLQ_MAX_SIZE=10000

# Schema Management
REDIS_SCHEMA_VALIDATION=true
REDIS_SCHEMA_STRICT_MODE=false
REDIS_SCHEMA_ALLOW_UNKNOWN=true

# Message Replay
REDIS_REPLAY_ENABLED=true
REDIS_REPLAY_MAX_AGE=86400000
REDIS_REPLAY_BATCH_SIZE=50

# Advanced Routing
REDIS_CONTENT_BASED_ROUTING=true
REDIS_PATTERN_MATCHING=true

# Metrics and Monitoring
REDIS_METRICS_ENABLED=true
REDIS_METRICS_INTERVAL=5000
REDIS_INCLUDE_PARTITION_METRICS=true
REDIS_INCLUDE_CONSUMER_METRICS=true

# Publisher Advanced Features
EVENTS_PARTITION_STRATEGY=partition
EVENTS_PARTITION_KEY_EXTRACTOR=userId
EVENTS_RATE_LIMITING_MAX_REQUESTS=1000
EVENTS_RATE_LIMITING_TIME_WINDOW=60000
EVENTS_RATE_LIMITING_STRATEGY=sliding-window

# Consumer Advanced Features
EVENTS_REBALANCING_ENABLED=true
EVENTS_REBALANCING_STRATEGY=auto
EVENTS_REBALANCING_INTERVAL=30000
EVENTS_ERROR_CLASSIFICATION=true
EVENTS_DLQ_MAX_RETRIES=3
*/
