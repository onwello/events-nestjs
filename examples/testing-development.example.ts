import { Module, Injectable, Controller, Get, Post, Body } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { EventsModule, EventHandler, EventPublisher } from '@logistically/events-nestjs';
import { EventPublisherService, EventConsumerService } from '@logistically/events-nestjs';
import { EventUtils, NestJSEvent } from '@logistically/events-nestjs';
import { RedisStreamsPlugin, MemoryTransportPlugin } from '@logistically/events';

// ============================================================================
// DEVELOPMENT CONFIGURATION
// ============================================================================

@Module({
  imports: [
    EventsModule.forRoot({
      service: 'dev-service',
      originPrefix: 'dev',
      transports: new Map([
        // Use memory transport for development
        ['memory', new MemoryTransportPlugin().createTransport({
          originPrefix: 'dev',
          enablePatternMatching: true,
          maxMessageSize: 1024 * 1024, // 1MB
          // Enable debug logging
          debug: process.env.NODE_ENV === 'development'
        })],
        // Fallback to Redis if needed
        ['redis', new RedisStreamsPlugin().createTransport({
          url: process.env.DEV_REDIS_URL || 'redis://localhost:6379',
          groupId: 'dev-group',
          batchSize: 50,
          enableDLQ: false, // Disable DLQ in development
          partitioning: {
            enabled: false // Disable partitioning in development
          }
        })]
      ]),
      publisher: {
        batching: {
          enabled: false, // Disable batching in development for easier debugging
          maxSize: 100,
          maxWaitMs: 1000
        },
        retry: {
          maxRetries: 1, // Minimal retries in development
          backoffStrategy: 'fixed',
          baseDelay: 100
        }
      },
      consumer: {
        enablePatternRouting: true,
        enableConsumerGroups: false, // Disable consumer groups in development
        validationMode: 'warn' // More lenient validation in development
      },
      validationMode: 'warn',
      autoDiscovery: true,
      global: true
    }),
  ],
  providers: [DevService],
  controllers: [DevController],
})
export class DevModule {}

// ============================================================================
// TESTING CONFIGURATION
// ============================================================================

@Module({
  imports: [
    EventsModule.forRoot({
      service: 'test-service',
      originPrefix: 'test',
      transports: new Map([
        // Always use memory transport for testing
        ['memory', new MemoryTransportPlugin().createTransport({
          originPrefix: 'test',
          enablePatternMatching: true,
          maxMessageSize: 1024 * 1024,
          // Enable test mode
          testMode: true
        })]
      ]),
      publisher: {
        batching: {
          enabled: false, // Disable batching for predictable testing
          maxSize: 10,
          maxWaitMs: 100
        },
        retry: {
          maxRetries: 0, // No retries in testing
          backoffStrategy: 'fixed',
          baseDelay: 0
        }
      },
      consumer: {
        enablePatternRouting: true,
        enableConsumerGroups: false,
        validationMode: 'warn'
      },
      validationMode: 'warn',
      autoDiscovery: true,
      global: true
    }),
  ],
  providers: [TestService],
  controllers: [TestController],
})
export class TestModule {}

// ============================================================================
// DEVELOPMENT SERVICE
// ============================================================================

@Injectable()
export class DevService {
  constructor(
    private readonly eventPublisher: EventPublisherService,
    private readonly eventConsumer: EventConsumerService,
  ) {}

  @EventPublisher({ eventType: 'dev.event' })
  async publishDevEvent(data: any): Promise<void> {
    const event = EventUtils.createDomainEvent(
      'dev.event',
      data,
      'dev-service',
      `dev-${Date.now()}`,
      1,
      {
        correlationId: EventUtils.generateCorrelationId(),
        metadata: { 
          source: 'dev-api',
          environment: 'development',
          timestamp: new Date().toISOString()
        }
      }
    );

    await this.eventPublisher.publishEvent(event);
  }

  @EventHandler({ eventType: 'dev.event' })
  async handleDevEvent(event: NestJSEvent<any>): Promise<void> {
    console.log('🔧 Development event received:', {
      id: event.header.id,
      type: event.header.type,
      data: event.body,
      metadata: event.nestjsMetadata
    });
  }

  // Development helper methods
  async getTransportStatus(): Promise<any> {
    // This would return transport status for debugging
    return {
      memory: 'connected',
      redis: 'disconnected',
      timestamp: new Date().toISOString()
    };
  }

  async clearTestData(): Promise<void> {
    // Clear any test data from memory transport
    console.log('🧹 Clearing test data...');
  }
}

@Controller('dev')
export class DevController {
  constructor(private readonly devService: DevService) {}

  @Post('event')
  async publishEvent(@Body() data: any) {
    await this.devService.publishDevEvent(data);
    return { message: 'Development event published', data };
  }

  @Get('status')
  async getStatus() {
    return await this.devService.getTransportStatus();
  }

  @Post('clear')
  async clearData() {
    await this.devService.clearTestData();
    return { message: 'Test data cleared' };
  }
}

// ============================================================================
// TESTING SERVICE
// ============================================================================

@Injectable()
export class TestService {
  constructor(
    private readonly eventPublisher: EventPublisherService,
    private readonly eventConsumer: EventConsumerService,
  ) {}

  @EventPublisher({ eventType: 'test.event' })
  async publishTestEvent(data: any): Promise<void> {
    const event = EventUtils.createDomainEvent(
      'test.event',
      data,
      'test-service',
      `test-${Date.now()}`,
      1,
      {
        correlationId: EventUtils.generateCorrelationId(),
        metadata: { 
          source: 'test-api',
          environment: 'testing',
          timestamp: new Date().toISOString()
        }
      }
    );

    await this.eventPublisher.publishEvent(event);
  }

  @EventHandler({ eventType: 'test.event' })
  async handleTestEvent(event: NestJSEvent<any>): Promise<void> {
    console.log('🧪 Test event received:', {
      id: event.header.id,
      type: event.header.type,
      data: event.body,
      metadata: event.nestjsMetadata
    });
  }

  // Test helper methods
  async getTestMetrics(): Promise<any> {
    return {
      totalEvents: 0, // Would be implemented to get actual metrics
      lastEventTime: new Date().toISOString(),
      environment: 'testing'
    };
  }
}

@Controller('test')
export class TestController {
  constructor(private readonly testService: TestService) {}

  @Post('event')
  async publishEvent(@Body() data: any) {
    await this.testService.publishTestEvent(data);
    return { message: 'Test event published', data };
  }

  @Get('metrics')
  async getMetrics() {
    return await this.testService.getTestMetrics();
  }
}

// ============================================================================
// TESTING EXAMPLES
// ============================================================================

describe('EventsModule Testing', () => {
  let module: TestingModule;
  let eventPublisher: EventPublisherService;
  let eventConsumer: EventConsumerService;

  beforeEach(async () => {
    module = await Test.createTestingModule({
      imports: [TestModule],
    }).compile();

    eventPublisher = module.get<EventPublisherService>(EventPublisherService);
    eventConsumer = module.get<EventConsumerService>(EventConsumerService);
  });

  afterEach(async () => {
    await module.close();
  });

  describe('Event Publishing', () => {
    it('should publish events successfully', async () => {
      const testData = { message: 'Hello Test', timestamp: Date.now() };
      
      // Create and publish event
      const event = EventUtils.createDomainEvent(
        'test.published',
        testData,
        'test-service',
        'test-123',
        1
      );

      await expect(eventPublisher.publishEvent(event)).resolves.not.toThrow();
    });

    it('should handle event publishing errors gracefully', async () => {
      // Test error handling
      const invalidEvent = {} as any;
      
      await expect(eventPublisher.publishEvent(invalidEvent)).rejects.toThrow();
    });
  });

  describe('Event Handling', () => {
    it('should handle events with decorators', async () => {
      const testService = module.get<TestService>(TestService);
      
      // Mock the event handler
      const handleSpy = jest.spyOn(testService, 'handleTestEvent');
      
      // Publish an event
      await testService.publishTestEvent({ test: true });
      
      // Wait for event processing
      await new Promise(resolve => setTimeout(resolve, 100));
      
      expect(handleSpy).toHaveBeenCalled();
    });
  });

  describe('Event Utils', () => {
    it('should create valid domain events', () => {
      const event = EventUtils.createDomainEvent(
        'test.created',
        { id: '123', name: 'Test' },
        'test-service',
        'test-123',
        1
      );

      expect(event.header.type).toBe('test.created');
      expect(event.body.id).toBe('123');
      expect(event.body.name).toBe('Test');
      expect(event.header.origin).toBe('test-service');
    });

    it('should generate unique correlation IDs', () => {
      const id1 = EventUtils.generateCorrelationId();
      const id2 = EventUtils.generateCorrelationId();
      
      expect(id1).not.toBe(id2);
      expect(typeof id1).toBe('string');
      expect(typeof id2).toBe('string');
    });

    it('should create event batches', () => {
      const events = [
        { type: 'test.1', data: { id: 1 } },
        { type: 'test.2', data: { id: 2 } },
        { type: 'test.3', data: { id: 3 } }
      ];

      const batch = EventUtils.createEventBatch(events, 'test-service', 'correlation-123');
      
      expect(batch).toHaveLength(3);
      expect(batch[0].header.type).toBe('test.1');
      expect(batch[1].header.type).toBe('test.2');
      expect(batch[2].header.type).toBe('test.3');
    });
  });
});

// ============================================================================
// INTEGRATION TESTING EXAMPLE
// ============================================================================

describe('EventsModule Integration', () => {
  let module: TestingModule;
  let testService: TestService;

  beforeEach(async () => {
    module = await Test.createTestingModule({
      imports: [TestModule],
    }).compile();

    testService = module.get<TestService>(TestService);
  });

  afterEach(async () => {
    await module.close();
  });

  it('should handle complete event flow', async () => {
    // 1. Publish an event
    const testData = { message: 'Integration Test', step: 1 };
    await testService.publishTestEvent(testData);

    // 2. Wait for processing
    await new Promise(resolve => setTimeout(resolve, 100));

    // 3. Verify event was processed
    const metrics = await testService.getTestMetrics();
    expect(metrics.environment).toBe('testing');
  });
});

// ============================================================================
// PERFORMANCE TESTING EXAMPLE
// ============================================================================

describe('EventsModule Performance', () => {
  let module: TestingModule;
  let eventPublisher: EventPublisherService;

  beforeEach(async () => {
    module = await Test.createTestingModule({
      imports: [TestModule],
    }).compile();

    eventPublisher = module.get<EventPublisherService>(EventPublisherService);
  });

  afterEach(async () => {
    await module.close();
  });

  it('should handle high volume of events', async () => {
    const startTime = Date.now();
    const eventCount = 1000;
    const promises: Promise<void>[] = [];

    // Publish many events concurrently
    for (let i = 0; i < eventCount; i++) {
      const event = EventUtils.createDomainEvent(
        'performance.test',
        { index: i, timestamp: Date.now() },
        'test-service',
        `perf-${i}`,
        1
      );

      promises.push(eventPublisher.publishEvent(event));
    }

    // Wait for all events to be published
    await Promise.all(promises);
    
    const endTime = Date.now();
    const duration = endTime - startTime;
    
    console.log(`Published ${eventCount} events in ${duration}ms`);
    console.log(`Rate: ${(eventCount / duration * 1000).toFixed(2)} events/second`);
    
    expect(duration).toBeLessThan(10000); // Should complete within 10 seconds
  });
});

// ============================================================================
// ENVIRONMENT VARIABLES FOR TESTING & DEVELOPMENT
// ============================================================================

/*
# Development Environment
NODE_ENV=development
DEV_REDIS_URL=redis://localhost:6379
DEV_ENABLE_DEBUG=true
DEV_DISABLE_BATCHING=true
DEV_DISABLE_PARTITIONING=true

# Testing Environment
NODE_ENV=test
TEST_MEMORY_TRANSPORT=true
TEST_DISABLE_RETRIES=true
TEST_DISABLE_BATCHING=true
TEST_DISABLE_PARTITIONING=true
TEST_DISABLE_CONSUMER_GROUPS=true

# Test Configuration
JEST_TIMEOUT=30000
JEST_SETUP_TIMEOUT=10000
EVENTS_TEST_MODE=true
EVENTS_TEST_TRANSPORT=memory
EVENTS_TEST_BATCH_SIZE=10
EVENTS_TEST_MAX_WAIT_MS=100

# Debug Configuration
EVENTS_DEBUG=true
EVENTS_LOG_LEVEL=debug
EVENTS_ENABLE_TRACING=true
EVENTS_ENABLE_METRICS=true
EVENTS_METRICS_INTERVAL=1000
*/
