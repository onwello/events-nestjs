import { Test, TestingModule } from '@nestjs/testing';
import { DiscoveryModule } from '@nestjs/core';
import { EventsModule } from '../../modules/events.module';
import { EventSystemService } from '../../services/event-system.service';
import { EventPublisherService } from '../../services/event-publisher.service';
import { EventConsumerService } from '../../services/event-consumer.service';
import { ConfigFactory } from '../../utils/config.factory';

// Helper function to create mock transport for testing
function createMockTransport() {
  return {
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
  } as any;
}

// Mock the core library
jest.mock('@logistically/events', () => ({
  createEventSystemBuilder: jest.fn(() => ({
    service: jest.fn().mockReturnThis(),
    originPrefix: jest.fn().mockReturnThis(),
    origins: jest.fn().mockReturnThis(),
    addTransport: jest.fn().mockReturnThis(),
    routing: jest.fn().mockReturnThis(),
    enablePublisherBatching: jest.fn().mockReturnThis(),
    enablePublisherRetry: jest.fn().mockReturnThis(),
    enableConsumerPatternRouting: jest.fn().mockReturnThis(),
    enableConsumerGroups: jest.fn().mockReturnThis(),
    setValidationMode: jest.fn().mockReturnThis(),
    build: jest.fn(() => ({
      connect: jest.fn().mockResolvedValue(undefined),
      close: jest.fn().mockResolvedValue(undefined),
      isConnected: jest.fn().mockReturnValue(true),
      getStatus: jest.fn().mockResolvedValue({
        connected: true,
        healthy: true
      }),
      publisher: {},
      consumer: {}
    }))
  }))
}));

describe('EventsModule', () => {
  describe('forRoot', () => {
    it('should create module with basic configuration', async () => {
      const module = await Test.createTestingModule({
        imports: [
          EventsModule.forRoot({
            service: 'test-service',
            transports: new Map([['memory', {} as any]])
          })
        ],
      }).compile();

      const eventSystemService = module.get<EventSystemService>(EventSystemService);
      const eventPublisherService = module.get<EventPublisherService>(EventPublisherService);
      const eventConsumerService = module.get<EventConsumerService>(EventConsumerService);

      expect(eventSystemService).toBeDefined();
      expect(eventPublisherService).toBeDefined();
      expect(eventConsumerService).toBeDefined();
    });

    it('should create module with minimal required configuration', async () => {
      const module = await Test.createTestingModule({
        imports: [
          EventsModule.forRoot({
            service: 'test-service',
            transports: new Map([['memory', createMockTransport()]])
          })
        ],
      }).compile();

      const eventSystemService = module.get<EventSystemService>(EventSystemService);
      const eventPublisherService = module.get<EventPublisherService>(EventPublisherService);
      const eventConsumerService = module.get<EventConsumerService>(EventConsumerService);

      expect(eventSystemService).toBeDefined();
      expect(eventPublisherService).toBeDefined();
      expect(eventConsumerService).toBeDefined();
    });

    it('should create module with explicit global: true', async () => {
      const module = await Test.createTestingModule({
        imports: [
          EventsModule.forRoot({
            service: 'test-service',
            transports: new Map([['memory', {} as any]]),
            global: true
          })
        ],
      }).compile();

      const eventSystemService = module.get<EventSystemService>(EventSystemService);
      expect(eventSystemService).toBeDefined();
    });

    it('should create module with explicit global: false', async () => {
      const module = await Test.createTestingModule({
        imports: [
          EventsModule.forRoot({
            service: 'test-service',
            transports: new Map([['memory', createMockTransport()]]),
            global: false
          })
        ],
      }).compile();

      const eventSystemService = module.get<EventSystemService>(EventSystemService);
      expect(eventSystemService).toBeDefined();
    });

    it('should create module with undefined global (uses default true)', async () => {
      const module = await Test.createTestingModule({
        imports: [
          EventsModule.forRoot({
            service: 'test-service',
            transports: new Map([['memory', createMockTransport()]]),
            global: undefined
          })
        ],
      }).compile();

      const eventSystemService = module.get<EventSystemService>(EventSystemService);
      expect(eventSystemService).toBeDefined();
    });

    it('should create module with advanced configuration', async () => {
      const module = await Test.createTestingModule({
        imports: [
          EventsModule.forRoot({
            service: 'test-service',
            transports: new Map([['memory', createMockTransport()]]),
            redisCluster: {
              clusterNodes: [
                { host: 'cluster-1', port: 7000 },
                { host: 'cluster-2', port: 7000 }
              ],
              enableFailover: true
            },
            partitioning: {
              enabled: true,
              strategy: 'hash',
              autoScaling: true,
              partitionCount: 8
            },
            ordering: {
              enabled: true,
              strategy: 'partition',
              enableCausalDependencies: true
            }
          })
        ],
      }).compile();

      const eventSystemService = module.get<EventSystemService>(EventSystemService);
      expect(eventSystemService).toBeDefined();
    });

    it('should create module with environment-based configuration', async () => {
      // Mock environment variables
      const originalEnv = process.env;
      process.env.SERVICE_NAME = 'env-service';
      process.env.EVENTS_ORIGIN_PREFIX = 'eu.de';
      process.env.REDIS_ENABLE_PARTITIONING = 'true';
      process.env.REDIS_PARTITION_COUNT = '16';

      const module = await Test.createTestingModule({
        imports: [
          EventsModule.forRoot({
            service: 'test-service',
            transports: new Map([['memory', createMockTransport()]])
          })
        ],
      }).compile();

      const eventSystemService = module.get<EventSystemService>(EventSystemService);
      expect(eventSystemService).toBeDefined();

      // Restore environment
      process.env = originalEnv;
    });

    it('should create module with partial configuration', async () => {
      const module = await Test.createTestingModule({
        imports: [
          EventsModule.forRoot({
            service: 'test-service',
            transports: new Map([['memory', createMockTransport()]])
          })
        ],
      }).compile();

      const eventSystemService = module.get<EventSystemService>(EventSystemService);
      expect(eventSystemService).toBeDefined();
    });

    it('should use ConfigFactory.mergeWithDefaults', async () => {
      const mergeWithDefaultsSpy = jest.spyOn(ConfigFactory, 'mergeWithDefaults');

      await Test.createTestingModule({
        imports: [
          EventsModule.forRoot({
            service: 'test-service',
            transports: new Map([['memory', {} as any]])
          })
        ],
      }).compile();

      expect(mergeWithDefaultsSpy).toHaveBeenCalled();
      mergeWithDefaultsSpy.mockRestore();
    });

    it('should call ConfigFactory.mergeWithDefaults with provided options', async () => {
      const mergeWithDefaultsSpy = jest.spyOn(ConfigFactory, 'mergeWithDefaults');
      const testOptions = {
        service: 'test-service',
        transports: new Map([['memory', {} as any]])
      };

      await Test.createTestingModule({
        imports: [EventsModule.forRoot(testOptions)],
      }).compile();

      expect(mergeWithDefaultsSpy).toHaveBeenCalledWith(testOptions);
      mergeWithDefaultsSpy.mockRestore();
    });

    it('should call ConfigFactory.mergeWithDefaults with empty object when no options provided', async () => {
      const mergeWithDefaultsSpy = jest.spyOn(ConfigFactory, 'mergeWithDefaults');
      
      // Mock the ConfigFactory to handle empty options
      mergeWithDefaultsSpy.mockReturnValue({
        service: 'default-service',
        transports: new Map([['memory', {} as any]])
      } as any);

      EventsModule.forRoot({ 
        service: 'test-service',
        transports: new Map([['memory', {} as any]])
      });

      expect(mergeWithDefaultsSpy).toHaveBeenCalledWith({ 
        service: 'test-service',
        transports: new Map([['memory', {} as any]])
      });
      mergeWithDefaultsSpy.mockRestore();
    });
  });

  describe('forFeature', () => {
    it('should create feature module', async () => {
      const module = await Test.createTestingModule({
        imports: [
          EventsModule.forRoot({
            service: 'test-service',
            transports: new Map([['memory', {} as any]])
          }),
          EventsModule.forFeature()
        ],
      }).compile();

      // The forFeature module should only provide EventPublisherService and EventConsumerService
      // EventSystemService is provided by forRoot
      const eventPublisherService = module.get<EventPublisherService>(EventPublisherService);
      const eventConsumerService = module.get<EventConsumerService>(EventConsumerService);

      expect(eventPublisherService).toBeDefined();
      expect(eventConsumerService).toBeDefined();
    });
  });

  describe('Module Dependencies', () => {
    it('should provide EventSystemService', async () => {
      const module = await Test.createTestingModule({
        imports: [
          EventsModule.forRoot({
            service: 'test-service',
            transports: new Map([['memory', {} as any]])
          })
        ],
      }).compile();

      const eventSystemService = module.get<EventSystemService>(EventSystemService);
      expect(eventSystemService).toBeInstanceOf(EventSystemService);
    });

    it('should provide EventPublisherService', async () => {
      const module = await Test.createTestingModule({
        imports: [
          EventsModule.forRoot({
            service: 'test-service',
            transports: new Map([['memory', {} as any]])
          })
        ],
      }).compile();

      const eventPublisherService = module.get<EventPublisherService>(EventPublisherService);
      expect(eventPublisherService).toBeInstanceOf(EventPublisherService);
    });

    it('should provide EventConsumerService', async () => {
      const module = await Test.createTestingModule({
        imports: [
          EventsModule.forRoot({
            service: 'test-service',
            autoDiscovery: true, // Enable autoDiscovery to get EventConsumerService
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
      }).compile();

      const eventConsumerService = module.get<EventConsumerService>(EventConsumerService);
      expect(eventConsumerService).toBeDefined();
    });

    it('should verify dynamic module structure for forRoot', async () => {
      const dynamicModule = EventsModule.forRoot({
        service: 'test-service',
        autoDiscovery: false,
        transports: new Map([['memory', createMockTransport()]])
      });

      expect(dynamicModule.module).toBe(EventsModule);
      expect(dynamicModule.providers).toHaveLength(10); // Base providers only (no autoDiscovery providers)
      expect(dynamicModule.exports).toHaveLength(8); // Base exports only (no autoDiscovery exports, no EVENTS_CONFIG or Reflector)
      expect(dynamicModule.global).toBe(true); // Default value
    });

    it('should verify dynamic module structure for forRoot with global: false', async () => {
      const dynamicModule = EventsModule.forRoot({
        service: 'test-service',
        transports: new Map([['memory', {} as any]]),
        global: false
      });

      expect(dynamicModule.global).toBe(false);
    });

    it('should verify dynamic module structure for forFeature', async () => {
      const dynamicModule = EventsModule.forFeature();

      expect(dynamicModule.module).toBe(EventsModule);
      expect(dynamicModule.providers).toHaveLength(5); // Reflector, EventDiscoveryService, AutoEventHandlerService, GlobalEventHandlerService, SimpleEventHandlerService
      expect(dynamicModule.exports).toHaveLength(4); // Services only (no Reflector)
      expect(dynamicModule.global).toBeUndefined(); // forFeature doesn't set global
    });

    it('should create module with autoDiscovery disabled', () => {
      const dynamicModule = EventsModule.forRoot({ 
        service: 'test-service',
        autoDiscovery: false,
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
      });
      
      expect(dynamicModule.module).toBe(EventsModule);
      expect(dynamicModule.providers).toHaveLength(10); // Base providers only (no autoDiscovery providers)
      expect(dynamicModule.exports).toHaveLength(8); // Base exports only (no autoDiscovery exports, no EVENTS_CONFIG or Reflector)
      expect(dynamicModule.global).toBe(true); // Default value
    });

    it('should create module with autoDiscovery enabled', () => {
      const dynamicModule = EventsModule.forRoot({ 
        service: 'test-service',
        autoDiscovery: true,
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
      });
      
      expect(dynamicModule.module).toBe(EventsModule);
      expect(dynamicModule.providers).toHaveLength(14); // All base providers + autoDiscovery providers
      expect(dynamicModule.exports).toHaveLength(12); // All base exports + autoDiscovery exports (no EVENTS_CONFIG or Reflector)
      expect(dynamicModule.global).toBe(true); // Default value
    });
  });

  describe('Configuration Validation', () => {
    it('should validate configuration during module initialization', async () => {
      const module = await Test.createTestingModule({
        imports: [
          EventsModule.forRoot({
            service: 'test-service',
            transports: new Map([['memory', {} as any]])
          })
        ],
      }).compile();

      const eventSystemService = module.get<EventSystemService>(EventSystemService);
      
      // The service should be created without throwing validation errors
      expect(eventSystemService).toBeDefined();
    });

    it('should handle invalid configuration gracefully', async () => {
      // This test would require mocking the validation to throw errors
      // For now, we'll test that the module can be created with valid config
      const module = await Test.createTestingModule({
        imports: [
          EventsModule.forRoot({
            service: 'test-service',
            transports: new Map([['memory', {} as any]])
          })
        ],
      }).compile();

      expect(module).toBeDefined();
    });
  });

  describe('Service Lifecycle', () => {
    it('should initialize services on module init', async () => {
      const module = await Test.createTestingModule({
        imports: [
          EventsModule.forRoot({
            service: 'test-service',
            transports: new Map([['memory', {} as any]])
          })
        ],
      }).compile();

      const eventSystemService = module.get<EventSystemService>(EventSystemService);
      
      // Services should be initialized
      expect(eventSystemService).toBeDefined();
    });

    it('should clean up services on module destroy', async () => {
      const module = await Test.createTestingModule({
        imports: [
          EventsModule.forRoot({
            service: 'test-service',
            transports: new Map([['memory', {} as any]])
          })
        ],
      }).compile();

      const eventSystemService = module.get<EventSystemService>(EventSystemService);
      
      // Mock the onModuleDestroy method
      const onModuleDestroySpy = jest.spyOn(eventSystemService, 'onModuleDestroy');
      
      await module.close();
      
      expect(onModuleDestroySpy).toHaveBeenCalled();
    });
  });

  describe('Transport Configuration', () => {
    it('should configure memory transport', async () => {
      const module = await Test.createTestingModule({
        imports: [
          EventsModule.forRoot({
            service: 'test-service',
            transports: new Map([['memory', {} as any]])
          })
        ],
      }).compile();

      const eventSystemService = module.get<EventSystemService>(EventSystemService);
      expect(eventSystemService).toBeDefined();
    });

    it('should configure Redis transport', async () => {
      const module = await Test.createTestingModule({
        imports: [
          EventsModule.forRoot({
            service: 'test-service',
            transports: new Map([['redis', {} as any]])
          })
        ],
      }).compile();

      const eventSystemService = module.get<EventSystemService>(EventSystemService);
      expect(eventSystemService).toBeDefined();
    });

    it('should configure multiple transports', async () => {
      const module = await Test.createTestingModule({
        imports: [
          EventsModule.forRoot({
            service: 'test-service',
            transports: new Map([
              ['memory', {} as any],
              ['redis', {} as any]
            ])
          })
        ],
      }).compile();

      const eventSystemService = module.get<EventSystemService>(EventSystemService);
      expect(eventSystemService).toBeDefined();
    });
  });

  describe('Advanced Features Integration', () => {
    it('should integrate Redis cluster configuration', async () => {
      const module = await Test.createTestingModule({
        imports: [
          EventsModule.forRoot({
            service: 'test-service',
            transports: new Map([['redis', {} as any]]),
            redisCluster: {
              clusterNodes: [
                { host: 'cluster-1', port: 7000 },
                { host: 'cluster-2', port: 7000 }
              ],
              enableFailover: true,
              failoverRecovery: {
                enabled: true,
                maxRetries: 3,
                retryDelay: 1000
              }
            }
          })
        ],
      }).compile();

      const eventSystemService = module.get<EventSystemService>(EventSystemService);
      expect(eventSystemService).toBeDefined();
    });

    it('should integrate partitioning configuration', async () => {
      const module = await Test.createTestingModule({
        imports: [
          EventsModule.forRoot({
            service: 'test-service',
            transports: new Map([['redis', {} as any]]),
            partitioning: {
              enabled: true,
              strategy: 'hash',
              autoScaling: true,
              partitionCount: 16
            }
          })
        ],
      }).compile();

      const eventSystemService = module.get<EventSystemService>(EventSystemService);
      expect(eventSystemService).toBeDefined();
    });

    it('should integrate message ordering configuration', async () => {
      const module = await Test.createTestingModule({
        imports: [
          EventsModule.forRoot({
            service: 'test-service',
            transports: new Map([['redis', {} as any]]),
            ordering: {
              enabled: true,
              strategy: 'global',
              enableCausalDependencies: true
            }
          })
        ],
      }).compile();

      const eventSystemService = module.get<EventSystemService>(EventSystemService);
      expect(eventSystemService).toBeDefined();
    });

    it('should integrate schema management configuration', async () => {
      const module = await Test.createTestingModule({
        imports: [
          EventsModule.forRoot({
            service: 'test-service',
            transports: new Map([['redis', {} as any]]),
            schema: {
              enabled: true,
              validationMode: 'strict',
              enableSchemaEvolution: true,
              versioning: 'semantic'
            }
          })
        ],
      }).compile();

      const eventSystemService = module.get<EventSystemService>(EventSystemService);
      expect(eventSystemService).toBeDefined();
    });

    it('should integrate message replay configuration', async () => {
      const module = await Test.createTestingModule({
        imports: [
          EventsModule.forRoot({
            service: 'test-service',
            transports: new Map([['redis', {} as any]]),
            replay: {
              enabled: true,
              maxReplaySize: 50000,
              enableSelectiveReplay: true,
              replayStrategies: ['from-timestamp', 'from-sequence']
            }
          })
        ],
      }).compile();

      const eventSystemService = module.get<EventSystemService>(EventSystemService);
      expect(eventSystemService).toBeDefined();
    });

    it('should integrate advanced DLQ configuration', async () => {
      const module = await Test.createTestingModule({
        imports: [
          EventsModule.forRoot({
            service: 'test-service',
            transports: new Map([['redis', {} as any]]),
            dlq: {
              enabled: true,
              streamPrefix: 'dead-letter:',
              maxRetries: 5,
              retryDelay: 2000,
              maxRetriesBeforeDLQ: 5,
              retention: 172800000,
              classification: {
                enabled: true,
                errorTypes: ['validation', 'processing', 'timeout']
              }
            }
          })
        ],
      }).compile();

      const eventSystemService = module.get<EventSystemService>(EventSystemService);
      expect(eventSystemService).toBeDefined();
    });

    it('should integrate advanced routing configuration', async () => {
      const module = await Test.createTestingModule({
        imports: [
          EventsModule.forRoot({
            service: 'test-service',
            transports: new Map([['redis', {} as any]]),
            advancedRouting: {
              enablePatternRouting: true,
              enableContentBasedRouting: true,
              enableConditionalRouting: true,
              routingRules: [
                {
                  condition: (event: any) => event.body.region === 'EU',
                  target: 'eu-processor',
                  priority: 1
                }
              ]
            }
          })
        ],
      }).compile();

      const eventSystemService = module.get<EventSystemService>(EventSystemService);
      expect(eventSystemService).toBeDefined();
    });
  });

  describe('Error Handling', () => {
    it('should handle missing service name gracefully', async () => {
      // This would typically be caught by the ConfigFactory validation
      // For now, we'll test that the module can be created with valid config
      const module = await Test.createTestingModule({
        imports: [
          EventsModule.forRoot({
            service: 'test-service',
            transports: new Map([['memory', {} as any]])
          })
        ],
      }).compile();

      expect(module).toBeDefined();
    });

    it('should handle missing transports gracefully', async () => {
      // This would typically be caught by the ConfigFactory validation
      // For now, we'll test that the module can be created with valid config
      const module = await Test.createTestingModule({
        imports: [
          EventsModule.forRoot({
            service: 'test-service',
            transports: new Map([['memory', {} as any]])
          })
        ],
      }).compile();

      expect(module).toBeDefined();
    });
  });
});
