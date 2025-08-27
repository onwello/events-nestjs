import { Test, TestingModule } from '@nestjs/testing';
import { EventsModule } from '../../modules/events.module';
import { EventPublisherService } from '../../services/event-publisher.service';
import { EventConsumerService } from '../../services/event-consumer.service';
import { EventDiscoveryService } from '../../services/event-discovery.service';
import { RedisStreamsPlugin } from '@logistically/events';

describe('Simple Redis Integration Tests', () => {
  let module: TestingModule;
  let eventPublisherService: EventPublisherService;
  let eventConsumerService: EventConsumerService;
  let eventDiscoveryService: EventDiscoveryService;

  beforeAll(async () => {
    module = await Test.createTestingModule({
      imports: [
        EventsModule.forRoot({
          service: 'simple-redis-test',
          transports: new Map([
            ['redis', new RedisStreamsPlugin().createTransport({
              url: 'redis://localhost:6379',
              groupId: 'simple-redis-test-group'
            })]
          ]),
          routing: {
            routes: [
              { pattern: 'test.simple.*', transport: 'redis' }
            ],
            validationMode: 'warn',
            topicMapping: {},
            defaultTopicStrategy: 'namespace'
          },
          autoDiscovery: false
        })
      ]
    }).compile();

    await module.init();

    eventPublisherService = module.get<EventPublisherService>(EventPublisherService);
    eventConsumerService = module.get<EventConsumerService>(EventConsumerService);
    eventDiscoveryService = module.get<EventDiscoveryService>(EventDiscoveryService);
  });

  afterAll(async () => {
    await module.close();
  });

  beforeEach(async () => {
    // Wait for services to be ready
    await new Promise(resolve => setTimeout(resolve, 100));
  });

  it('should initialize Redis transport successfully', async () => {
    expect(eventPublisherService).toBeDefined();
    expect(eventConsumerService).toBeDefined();
    expect(eventDiscoveryService).toBeDefined();
  });

  it('should publish events to Redis transport', async () => {
    const testEvent = { id: 1, message: 'Simple Redis test' };
    
    // This should not throw if Redis transport is working
    await expect(
      eventPublisherService.publish('test.simple.event', testEvent)
    ).resolves.not.toThrow();
  });

  it('should handle multiple rapid publishes', async () => {
    const promises = [];
    for (let i = 0; i < 5; i++) {
      promises.push(
        eventPublisherService.publish('test.simple.rapid', { id: i, message: `Rapid test ${i}` })
      );
    }
    
    await expect(Promise.all(promises)).resolves.not.toThrow();
  });

  it('should handle different event types', async () => {
    const eventTypes = [
      'test.simple.type1',
      'test.simple.type2',
      'test.simple.type3'
    ];

    for (const eventType of eventTypes) {
      await expect(
        eventPublisherService.publish(eventType, { message: `Test for ${eventType}` })
      ).resolves.not.toThrow();
    }
  });

  it('should handle large event payloads', async () => {
    const largePayload = {
      id: 999,
      message: 'Large payload test',
      data: Array(1000).fill(0).map((_, i) => ({ index: i, value: `item-${i}` })),
      metadata: {
        timestamp: new Date().toISOString(),
        version: '1.0.0',
        source: 'test'
      }
    };

    await expect(
      eventPublisherService.publish('test.simple.large', largePayload)
    ).resolves.not.toThrow();
  });

  it('should handle special characters in event types', async () => {
    const specialEventTypes = [
      'test.simple.with-dash',
      'test.simple.with_underscore',
      'test.simple.with.dot',
      'test.simple.with:colon',
      'test.simple.with/slash'
    ];

    for (const eventType of specialEventTypes) {
      await expect(
        eventPublisherService.publish(eventType, { message: `Special chars: ${eventType}` })
      ).resolves.not.toThrow();
    }
  });
});
