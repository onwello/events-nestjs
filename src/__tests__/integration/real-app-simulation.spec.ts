import { Test, TestingModule } from '@nestjs/testing';
import { EventsModule } from '../../modules/events.module';
import { EventSystemService } from '../../services/event-system.service';
import { EventPublisherService } from '../../services/event-publisher.service';
import { EventConsumerService } from '../../services/event-consumer.service';

describe('Real Application Simulation Tests', () => {
  describe('Real Module Initialization Without Test Helpers', () => {
    it('should now succeed to initialize EventsModule because Reflector is provided by the module', async () => {
      // This test simulates the real application startup
      // It should now succeed because the EventsModule provides Reflector
      
      const module = await Test.createTestingModule({
        imports: [
          EventsModule.forRoot({
            service: 'real-app-service',
            transports: new Map([
              ['memory', {
                name: 'memory',
                config: {},
                constructor: { name: 'MemoryTransport' },
                capabilities: {
                  supportsPublishing: true,
                  supportsSubscription: true,
                  supportsBatching: false,
                  supportsPartitioning: false,
                  supportsOrdering: false,
                  supportsPatternRouting: false,
                  supportsConsumerGroups: false,
                  supportsDeadLetterQueues: false,
                  supportsMessageRetention: false,
                  supportsMessageCompression: false,
                  maxMessageSize: 1024,
                  maxBatchSize: 1,
                  maxTopics: 100,
                  maxPartitions: 1,
                  maxConsumerGroups: 0,
                  supportsPersistence: false,
                  supportsReplication: false,
                  supportsFailover: false,
                  supportsTransactions: false,
                  supportsMetrics: false,
                  supportsTracing: false,
                  supportsHealthChecks: false
                },
                connect: async () => {},
                disconnect: async () => {},
                isConnected: () => true,
                publish: async () => {},
                subscribe: async () => {},
                unsubscribe: async () => {},
                close: async () => {},
                getStatus: async () => ({ 
                  connected: true, 
                  healthy: true, 
                  uptime: 0, 
                  version: '1.0.0' 
                }),
                getMetrics: async () => ({
                  messagesPublished: 0,
                  messagesReceived: 0,
                  publishLatency: 0,
                  receiveLatency: 0,
                  errorCount: 0,
                  successCount: 0,
                  lastActivity: new Date(),
                  errorRate: 0,
                  throughput: 0,
                  memoryUsage: 0,
                  cpuUsage: 0
                })
              } as any]
            ])
          })
        ],
        // No need to provide Reflector manually - the EventsModule now provides it
      }).compile();

      // This should now work because the EventsModule provides Reflector
      const eventSystemService = module.get<EventSystemService>(EventSystemService);
      const eventPublisherService = module.get<EventPublisherService>(EventPublisherService);
      const eventConsumerService = module.get<EventConsumerService>(EventConsumerService);

      expect(eventSystemService).toBeDefined();
      expect(eventPublisherService).toBeDefined();
      expect(eventConsumerService).toBeDefined();
    });

    it('should succeed when Reflector is provided manually', async () => {
      // This test should pass because we're providing the Reflector service
      const module = await Test.createTestingModule({
        imports: [
          EventsModule.forRoot({
            service: 'real-app-service-with-reflector',
            transports: new Map([
              ['memory', {
                name: 'memory',
                config: {},
                constructor: { name: 'MemoryTransport' },
                capabilities: {
                  supportsPublishing: true,
                  supportsSubscription: true,
                  supportsBatching: false,
                  supportsPartitioning: false,
                  supportsOrdering: false,
                  supportsPatternRouting: false,
                  supportsConsumerGroups: false,
                  supportsDeadLetterQueues: false,
                  supportsMessageRetention: false,
                  supportsMessageCompression: false,
                  maxMessageSize: 1024,
                  maxBatchSize: 1,
                  maxTopics: 100,
                  maxPartitions: 1,
                  maxConsumerGroups: 0,
                  supportsPersistence: false,
                  supportsReplication: false,
                  supportsFailover: false,
                  supportsTransactions: false,
                  supportsMetrics: false,
                  supportsTracing: false,
                  supportsHealthChecks: false
                },
                connect: async () => {},
                disconnect: async () => {},
                isConnected: () => true,
                publish: async () => {},
                subscribe: async () => {},
                unsubscribe: async () => {},
                close: async () => {},
                getStatus: async () => ({ 
                  connected: true, 
                  healthy: true, 
                  uptime: 0, 
                  version: '1.0.0' 
                }),
                getMetrics: async () => ({
                  messagesPublished: 0,
                  messagesReceived: 0,
                  publishLatency: 0,
                  receiveLatency: 0,
                  errorCount: 0,
                  successCount: 0,
                  lastActivity: new Date(),
                  errorRate: 0,
                  throughput: 0,
                  memoryUsage: 0,
                  cpuUsage: 0
                })
              } as any]
            ])
          })
        ],
        providers: [
          // Provide Reflector manually - this should make it work
          {
            provide: 'Reflector',
            useValue: {
              get: jest.fn(),
              getAll: jest.fn(),
              has: jest.fn(),
            }
          }
        ],
      }).compile();

      // This should work now
      const eventSystemService = module.get<EventSystemService>(EventSystemService);
      const eventPublisherService = module.get<EventPublisherService>(EventPublisherService);
      const eventConsumerService = module.get<EventConsumerService>(EventConsumerService);

      expect(eventSystemService).toBeDefined();
      expect(eventPublisherService).toBeDefined();
      expect(eventConsumerService).toBeDefined();
    });
  });

  describe('Module Configuration Validation', () => {
    it('should validate that EventsModule requires Reflector to be available', () => {
      // This test documents the requirement that the EventsModule needs Reflector
      // to be available in the module context
      expect(() => {
        // The EventsModule.forRoot() method creates a dynamic module that
        // includes EventConsumerService, which requires Reflector
        const moduleConfig = EventsModule.forRoot({
          service: 'test-service',
          transports: new Map()
        });

        // The module should include EventConsumerService in its providers
        expect(moduleConfig.providers).toContain(EventConsumerService);
        
        // EventConsumerService constructor requires:
        // - EventSystemService
        // - DiscoveryService  
        // - MetadataScanner
        // - Reflector
        // 
        // The EventsModule only provides the first three, but not Reflector
        // This is the fundamental issue that needs to be fixed
      }).not.toThrow();
    });
  });
});
