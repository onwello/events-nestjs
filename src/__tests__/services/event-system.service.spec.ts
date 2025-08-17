import { Test, TestingModule } from '@nestjs/testing';
import { EventSystemService } from '../../services/event-system.service';
import { NestJSEventsModuleOptions } from '../../types/config.types';
import { createEventSystemBuilder } from '@logistically/events';

// Mock the core library
jest.mock('@logistically/events', () => {
  const mockBuiltEventSystem = {
    connect: jest.fn().mockResolvedValue(undefined),
    close: jest.fn().mockResolvedValue(undefined),
    isConnected: jest.fn().mockReturnValue(true),
    getStatus: jest.fn().mockResolvedValue({
      connected: true,
      healthy: true
    }),
    publisher: {},
    consumer: {}
  };

  return {
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
      build: jest.fn(() => mockBuiltEventSystem)
    }))
  };
});

describe('EventSystemService', () => {
  let service: EventSystemService;
  let mockEventSystem: any;

  const createMockTransport = (name: string) => ({
    name,
    config: {},
    constructor: { name: 'MockTransport' },
    capabilities: {
      supportsPublishing: true,
      supportsSubscription: true,
      supportsBatching: true,
      supportsPartitioning: false,
      supportsOrdering: true,
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
      supportsMetrics: true,
      supportsTracing: false,
      supportsHealthChecks: true
    },
    connect: jest.fn().mockResolvedValue(undefined),
    disconnect: jest.fn().mockResolvedValue(undefined),
    isConnected: jest.fn().mockReturnValue(true),
    publish: jest.fn().mockResolvedValue(undefined),
    subscribe: jest.fn().mockResolvedValue(undefined),
    unsubscribe: jest.fn().mockResolvedValue(undefined),
    close: jest.fn().mockResolvedValue(undefined),
    getStatus: jest.fn().mockResolvedValue({ connected: true, healthy: true }),
    getMetrics: jest.fn().mockResolvedValue({})
  });

  const baseConfig: NestJSEventsModuleOptions = {
    service: 'test-service',
    transports: new Map([
      ['redis', createMockTransport('redis-streams')],
      ['memory', createMockTransport('memory')]
    ])
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        {
          provide: EventSystemService,
          useFactory: (config: NestJSEventsModuleOptions) => new EventSystemService(config),
          inject: ['CONFIG']
        },
        {
          provide: 'CONFIG',
          useValue: baseConfig
        }
      ],
    }).compile();

    service = module.get<EventSystemService>(EventSystemService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  // Helper function to get the mock after service initialization
  const getMockEventSystem = () => {
    const mockBuilder = (createEventSystemBuilder as jest.Mock);
    return mockBuilder.mock.results[mockBuilder.mock.results.length - 1]?.value;
  };

  describe('Basic Configuration', () => {
    it('should initialize with basic configuration', async () => {
      await service.onModuleInit();
      
      // Get the mock after the service is initialized and the mock is called
      mockEventSystem = getMockEventSystem();
      
      expect(mockEventSystem.service).toHaveBeenCalledWith('test-service');
      expect(mockEventSystem.addTransport).toHaveBeenCalledTimes(2);
    });

    it('should set origin prefix when provided', async () => {
      const configWithOrigin: NestJSEventsModuleOptions = {
        ...baseConfig,
        originPrefix: 'eu.de'
      };

      const serviceWithOrigin = new EventSystemService(configWithOrigin);
      await serviceWithOrigin.onModuleInit();

      const mockEventSystem = getMockEventSystem();
      expect(mockEventSystem.originPrefix).toHaveBeenCalledWith('eu.de');
    });

    it('should set origins when provided', async () => {
      const configWithOrigins: NestJSEventsModuleOptions = {
        ...baseConfig,
        origins: ['service1', 'service2']
      };

      const serviceWithOrigins = new EventSystemService(configWithOrigins);
      await serviceWithOrigins.onModuleInit();

      const mockEventSystem = getMockEventSystem();
      expect(mockEventSystem.origins).toHaveBeenCalledWith(['service1', 'service2']);
    });
  });

  describe('Advanced Redis Cluster Configuration', () => {
    it('should validate Redis cluster configuration', async () => {
      const clusterConfig: NestJSEventsModuleOptions = {
        ...baseConfig,
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
      };

      const clusterService = new EventSystemService(clusterConfig);
      await expect(clusterService.onModuleInit()).resolves.not.toThrow();
    });

    it('should reject invalid Redis cluster configuration', () => {
      const invalidConfig: NestJSEventsModuleOptions = {
        ...baseConfig,
        redisCluster: {
          clusterNodes: [], // Empty array should fail validation
          enableFailover: true
        }
      };

      const invalidService = new EventSystemService(invalidConfig);
      expect(() => invalidService.onModuleInit()).rejects.toThrow('Redis cluster must have at least one node');
    });
  });

  describe('Advanced Redis Sentinel Configuration', () => {
    it('should validate Redis sentinel configuration', async () => {
      const sentinelConfig: NestJSEventsModuleOptions = {
        ...baseConfig,
        redisSentinel: {
          sentinels: [
            { host: 'sentinel-1', port: 26379 },
            { host: 'sentinel-2', port: 26379 }
          ],
          sentinelName: 'mymaster',
          connectionTimeout: 5000,
          commandTimeout: 3000
        }
      };

      const sentinelService = new EventSystemService(sentinelConfig);
      await expect(sentinelService.onModuleInit()).resolves.not.toThrow();
    });

    it('should reject invalid Redis sentinel configuration', () => {
      const invalidConfig: NestJSEventsModuleOptions = {
        ...baseConfig,
        redisSentinel: {
          sentinels: [], // Empty array should fail validation
          sentinelName: 'mymaster'
        }
      };

      const invalidService = new EventSystemService(invalidConfig);
      expect(() => invalidService.onModuleInit()).rejects.toThrow('Redis sentinel must have at least one sentinel node');
    });
  });

  describe('Advanced Partitioning Configuration', () => {
    it('should validate partitioning configuration', async () => {
      const partitioningConfig: NestJSEventsModuleOptions = {
        ...baseConfig,
        partitioning: {
          enabled: true,
          strategy: 'hash',
          autoScaling: true,
          partitionCount: 8
        }
      };

      const partitioningService = new EventSystemService(partitioningConfig);
      await expect(partitioningService.onModuleInit()).resolves.not.toThrow();
    });

    it('should reject invalid partitioning strategy', () => {
      const invalidConfig: NestJSEventsModuleOptions = {
        ...baseConfig,
        partitioning: {
          enabled: true,
          strategy: 'invalid-strategy' as any,
          autoScaling: true,
          partitionCount: 8
        }
      };

      const invalidService = new EventSystemService(invalidConfig);
      expect(() => invalidService.onModuleInit()).rejects.toThrow('Invalid partitioning strategy');
    });

    it('should reject invalid partition count', () => {
      const invalidConfig: NestJSEventsModuleOptions = {
        ...baseConfig,
        partitioning: {
          enabled: true,
          strategy: 'hash',
          autoScaling: true,
          partitionCount: 0 // Should be at least 1
        }
      };

      const invalidService = new EventSystemService(invalidConfig);
      expect(() => invalidService.onModuleInit()).rejects.toThrow('Partition count must be at least 1');
    });
  });

  describe('Message Ordering Configuration', () => {
    it('should validate ordering configuration', async () => {
      const orderingConfig: NestJSEventsModuleOptions = {
        ...baseConfig,
        ordering: {
          enabled: true,
          strategy: 'partition',
          enableCausalDependencies: true
        }
      };

      const orderingService = new EventSystemService(orderingConfig);
      await expect(orderingService.onModuleInit()).resolves.not.toThrow();
    });

    it('should reject invalid ordering strategy', () => {
      const invalidConfig: NestJSEventsModuleOptions = {
        ...baseConfig,
        ordering: {
          enabled: true,
          strategy: 'invalid-strategy' as any,
          enableCausalDependencies: true
        }
      };

      const invalidService = new EventSystemService(invalidConfig);
      expect(() => invalidService.onModuleInit()).rejects.toThrow('Invalid ordering strategy');
    });
  });

  describe('Schema Management Configuration', () => {
    it('should validate schema configuration', async () => {
      const schemaConfig: NestJSEventsModuleOptions = {
        ...baseConfig,
        schema: {
          enabled: true,
          validationMode: 'strict',
          enableSchemaEvolution: true,
          versioning: 'semantic'
        }
      };

      const schemaService = new EventSystemService(schemaConfig);
      await expect(schemaService.onModuleInit()).resolves.not.toThrow();
    });

    it('should reject invalid schema validation mode', () => {
      const invalidConfig: NestJSEventsModuleOptions = {
        ...baseConfig,
        schema: {
          enabled: true,
          validationMode: 'invalid-mode' as any,
          enableSchemaEvolution: true
        }
      };

      const invalidService = new EventSystemService(invalidConfig);
      expect(() => invalidService.onModuleInit()).rejects.toThrow('Invalid schema validation mode');
    });
  });

  describe('Message Replay Configuration', () => {
    it('should validate replay configuration', async () => {
      const replayConfig: NestJSEventsModuleOptions = {
        ...baseConfig,
        replay: {
          enabled: true,
          maxReplaySize: 10000,
          enableSelectiveReplay: true,
          replayStrategies: ['from-timestamp', 'from-sequence']
        }
      };

      const replayService = new EventSystemService(replayConfig);
      await expect(replayService.onModuleInit()).resolves.not.toThrow();
    });

    it('should reject invalid replay size', () => {
      const invalidConfig: NestJSEventsModuleOptions = {
        ...baseConfig,
        replay: {
          enabled: true,
          maxReplaySize: 0, // Should be at least 1
          enableSelectiveReplay: true
        }
      };

      const invalidService = new EventSystemService(invalidConfig);
      expect(() => invalidService.onModuleInit()).rejects.toThrow('Replay max size must be at least 1');
    });
  });

  describe('Advanced DLQ Configuration', () => {
    it('should validate DLQ configuration', async () => {
      const dlqConfig: NestJSEventsModuleOptions = {
        ...baseConfig,
        dlq: {
          enabled: true,
          streamPrefix: 'dlq:',
          maxRetries: 3,
          retryDelay: 1000,
          maxRetriesBeforeDLQ: 3,
          retention: 86400000,
          classification: {
            enabled: true,
            errorTypes: ['validation', 'processing', 'timeout']
          }
        }
      };

      const dlqService = new EventSystemService(dlqConfig);
      await expect(dlqService.onModuleInit()).resolves.not.toThrow();
    });
  });

  describe('Advanced Routing Configuration', () => {
    it('should validate advanced routing configuration', async () => {
      const routingConfig: NestJSEventsModuleOptions = {
        ...baseConfig,
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
      };

      const routingService = new EventSystemService(routingConfig);
      await expect(routingService.onModuleInit()).resolves.not.toThrow();
    });
  });

  describe('Utility Methods', () => {
    beforeEach(async () => {
      await service.onModuleInit();
    });

    it('should get service name', () => {
      expect(service.getServiceName()).toBe('test-service');
    });

    it('should get origin prefix', () => {
      expect(service.getOriginPrefix()).toBeUndefined();
    });

    it('should get advanced configuration', () => {
      const advancedConfig = service.getAdvancedConfig();
      expect(advancedConfig).toBeDefined();
      expect(advancedConfig.redisCluster).toBeUndefined();
      expect(advancedConfig.partitioning).toBeUndefined();
    });

    it('should check if advanced features are enabled', () => {
      expect(service.hasAdvancedFeatures()).toBe(false);
    });

    it('should detect advanced features when enabled', () => {
      const advancedService = new EventSystemService({
        ...baseConfig,
        partitioning: {
          enabled: true,
          strategy: 'hash',
          autoScaling: true,
          partitionCount: 8
        }
      });

      expect(advancedService.hasAdvancedFeatures()).toBe(true);
    });
  });

  describe('Lifecycle Management', () => {
    it('should initialize and connect event system', async () => {
      await service.onModuleInit();
      
      const mockBuilder = getMockEventSystem();
      expect(mockBuilder.build).toHaveBeenCalled();
      
      // The mock build function returns the same instance
      const mockBuiltEventSystem = mockBuilder.build();
      expect(mockBuiltEventSystem.connect).toHaveBeenCalled();
    });

    it('should close event system on destroy', async () => {
      await service.onModuleInit();
      await service.onModuleDestroy();
      
      const mockBuilder = getMockEventSystem();
      const mockBuiltEventSystem = mockBuilder.build();
      expect(mockBuiltEventSystem.close).toHaveBeenCalled();
    });

    it('should handle connection status', async () => {
      await service.onModuleInit();
      
      expect(service.isConnected()).toBe(true);
    });

    it('should get system status', async () => {
      await service.onModuleInit();
      
      const status = await service.getStatus();
      expect(status.connected).toBe(true);
      expect(status.healthy).toBe(true);
    });
  });

  describe('Error Handling', () => {
    it('should handle missing service name', () => {
      const invalidConfig: NestJSEventsModuleOptions = {
        ...baseConfig,
        service: ''
      };

      const invalidService = new EventSystemService(invalidConfig);
      expect(() => invalidService.onModuleInit()).rejects.toThrow('Service name is required in configuration');
    });

    it('should handle missing transports', () => {
      const invalidConfig: NestJSEventsModuleOptions = {
        ...baseConfig,
        transports: new Map()
      };

      const invalidService = new EventSystemService(invalidConfig);
      expect(() => invalidService.onModuleInit()).rejects.toThrow('At least one transport must be configured');
    });

    it('should handle null transport', () => {
      const invalidConfig: NestJSEventsModuleOptions = {
        ...baseConfig,
        transports: new Map([['redis', null as any]])
      };

      const invalidService = new EventSystemService(invalidConfig);
      expect(() => invalidService.onModuleInit()).rejects.toThrow("Transport 'redis' is null or undefined");
    });
  });
});
