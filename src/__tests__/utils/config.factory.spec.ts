import { ConfigFactory } from '../../utils/config.factory';

describe('ConfigFactory', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    jest.resetModules();
    process.env = { ...originalEnv };
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  describe('fromEnvironment', () => {
    it('should create basic configuration from environment variables', () => {
      process.env.SERVICE_NAME = 'test-service';
      process.env.EVENTS_ORIGIN_PREFIX = 'eu.de';
      process.env.EVENTS_VALIDATION_MODE = 'strict';
      process.env.EVENTS_GLOBAL = 'true';
      process.env.EVENTS_AUTO_DISCOVERY = 'true';

      const config = ConfigFactory.fromEnvironment();

      expect(config.service).toBe('test-service');
      expect(config.originPrefix).toBe('eu.de');
      expect(config.validationMode).toBe('strict');
      expect(config.global).toBe(true);
      expect(config.autoDiscovery).toBe(true);
    });

    it('should use default values when environment variables are not set', () => {
      const config = ConfigFactory.fromEnvironment();

      expect(config.validationMode).toBe('warn');
      expect(config.global).toBe(true);
      expect(config.autoDiscovery).toBe(true);
    });

    it('should parse publisher configuration from environment', () => {
      process.env.EVENTS_BATCHING_ENABLED = 'true';
      process.env.EVENTS_BATCHING_MAX_SIZE = '2000';
      process.env.EVENTS_BATCHING_MAX_WAIT_MS = '200';
      process.env.EVENTS_BATCHING_STRATEGY = 'time';
      process.env.EVENTS_RETRY_MAX_ATTEMPTS = '5';
      process.env.EVENTS_RETRY_BACKOFF_STRATEGY = 'exponential';

      const config = ConfigFactory.fromEnvironment();

      expect(config.publisher?.batching?.enabled).toBe(true);
      expect(config.publisher?.batching?.maxSize).toBe(2000);
      expect(config.publisher?.batching?.maxWaitMs).toBe(200);
      expect(config.publisher?.batching?.strategy).toBe('time');
      expect(config.publisher?.retry?.maxRetries).toBe(5);
      expect(config.publisher?.retry?.backoffStrategy).toBe('exponential');
    });

    it('should parse consumer configuration from environment', () => {
      process.env.EVENTS_PATTERN_ROUTING = 'true';
      process.env.EVENTS_CONSUMER_GROUPS = 'false';

      const config = ConfigFactory.fromEnvironment();

      expect(config.consumer?.enablePatternRouting).toBe(true);
      expect(config.consumer?.enableConsumerGroups).toBe(false);
    });

    it('should parse discovery configuration from environment', () => {
      process.env.EVENTS_SCAN_CONTROLLERS = 'false';
      process.env.EVENTS_SCAN_PROVIDERS = 'false';
      process.env.EVENTS_METADATA_KEYS = 'key1,key2,key3';

      const config = ConfigFactory.fromEnvironment();

      expect(config.discovery?.scanControllers).toBe(false);
      expect(config.discovery?.scanProviders).toBe(false);
      expect(config.discovery?.metadataKeys).toEqual(['key1', 'key2', 'key3']);
    });

    it('should parse interceptor configuration from environment', () => {
      process.env.EVENTS_REQUEST_EVENTS = 'true';
      process.env.EVENTS_RESPONSE_EVENTS = 'false';
      process.env.EVENTS_CORRELATION_ID_HEADER = 'X-Correlation-ID';
      process.env.EVENTS_CAUSATION_ID_HEADER = 'X-Causation-ID';

      const config = ConfigFactory.fromEnvironment();

      expect(config.interceptor?.enableRequestEvents).toBe(true);
      expect(config.interceptor?.enableResponseEvents).toBe(false);
      expect(config.interceptor?.correlationIdHeader).toBe('X-Correlation-ID');
      expect(config.interceptor?.causationIdHeader).toBe('X-Causation-ID');
    });
  });

  describe('Redis Cluster Configuration', () => {
    it('should parse Redis cluster configuration from environment', () => {
      process.env.REDIS_ENABLE_CLUSTER_MODE = 'true';
      process.env.REDIS_CLUSTER_NODES = 'cluster-1:7000,cluster-2:7000,cluster-3:7000';
      process.env.REDIS_ENABLE_FAILOVER = 'true';
      process.env.REDIS_FAILOVER_RECOVERY_ENABLED = 'true';
      process.env.REDIS_FAILOVER_MAX_RETRIES = '5';
      process.env.REDIS_FAILOVER_RETRY_DELAY = '2000';

      const config = ConfigFactory.fromEnvironment();

      expect(config.redisCluster).toBeDefined();
      expect(config.redisCluster?.clusterNodes).toEqual([
        { host: 'cluster-1', port: 7000 },
        { host: 'cluster-2', port: 7000 },
        { host: 'cluster-3', port: 7000 }
      ]);
      expect(config.redisCluster?.enableFailover).toBe(true);
      expect(config.redisCluster?.failoverRecovery?.enabled).toBe(true);
      expect(config.redisCluster?.failoverRecovery?.maxRetries).toBe(5);
      expect(config.redisCluster?.failoverRecovery?.retryDelay).toBe(2000);
    });

    it('should not create Redis cluster config when disabled', () => {
      process.env.REDIS_ENABLE_CLUSTER_MODE = 'false';

      const config = ConfigFactory.fromEnvironment();

      expect(config.redisCluster).toBeUndefined();
    });

    it('should handle empty cluster nodes gracefully', () => {
      process.env.REDIS_ENABLE_CLUSTER_MODE = 'true';
      process.env.REDIS_CLUSTER_NODES = '';

      const config = ConfigFactory.fromEnvironment();

      expect(config.redisCluster?.clusterNodes).toEqual([]);
    });
  });

  describe('Redis Sentinel Configuration', () => {
    it('should parse Redis sentinel configuration from environment', () => {
      process.env.REDIS_ENABLE_SENTINEL_MODE = 'true';
      process.env.REDIS_SENTINEL_NODES = 'sentinel-1:26379,sentinel-2:26379';
      process.env.REDIS_SENTINEL_NAME = 'mymaster';
      process.env.REDIS_SENTINEL_CONNECTION_TIMEOUT = '10000';
      process.env.REDIS_SENTINEL_COMMAND_TIMEOUT = '5000';

      const config = ConfigFactory.fromEnvironment();

      expect(config.redisSentinel).toBeDefined();
      expect(config.redisSentinel?.sentinels).toEqual([
        { host: 'sentinel-1', port: 26379 },
        { host: 'sentinel-2', port: 26379 }
      ]);
      expect(config.redisSentinel?.sentinelName).toBe('mymaster');
      expect(config.redisSentinel?.connectionTimeout).toBe(10000);
      expect(config.redisSentinel?.commandTimeout).toBe(5000);
    });

    it('should use default sentinel name when not provided', () => {
      process.env.REDIS_ENABLE_SENTINEL_MODE = 'true';
      process.env.REDIS_SENTINEL_NODES = 'sentinel-1:26379';

      const config = ConfigFactory.fromEnvironment();

      expect(config.redisSentinel?.sentinelName).toBe('mymaster');
    });
  });

  describe('Advanced Partitioning Configuration', () => {
    it('should parse partitioning configuration from environment', () => {
      process.env.REDIS_ENABLE_PARTITIONING = 'true';
      process.env.REDIS_PARTITIONING_STRATEGY = 'roundRobin';
      process.env.REDIS_PARTITIONING_AUTO_SCALING = 'false';
      process.env.REDIS_PARTITION_COUNT = '16';

      const config = ConfigFactory.fromEnvironment();

      expect(config.partitioning).toBeDefined();
      expect(config.partitioning?.enabled).toBe(true);
      expect(config.partitioning?.strategy).toBe('roundRobin');
      expect(config.partitioning?.autoScaling).toBe(false);
      expect(config.partitioning?.partitionCount).toBe(16);
    });

    it('should use default partitioning strategy when not provided', () => {
      process.env.REDIS_ENABLE_PARTITIONING = 'true';

      const config = ConfigFactory.fromEnvironment();

      expect(config.partitioning?.strategy).toBe('hash');
    });
  });

  describe('Message Ordering Configuration', () => {
    it('should parse ordering configuration from environment', () => {
      process.env.REDIS_ENABLE_ORDERING = 'true';
      process.env.REDIS_ORDERING_STRATEGY = 'global';
      process.env.REDIS_ENABLE_CAUSAL_DEPENDENCIES = 'false';

      const config = ConfigFactory.fromEnvironment();

      expect(config.ordering).toBeDefined();
      expect(config.ordering?.enabled).toBe(true);
      expect(config.ordering?.strategy).toBe('global');
      expect(config.ordering?.enableCausalDependencies).toBe(false);
    });

    it('should use default ordering strategy when not provided', () => {
      process.env.REDIS_ENABLE_ORDERING = 'true';

      const config = ConfigFactory.fromEnvironment();

      expect(config.ordering?.strategy).toBe('partition');
    });
  });

  describe('Schema Management Configuration', () => {
    it('should parse schema configuration from environment', () => {
      process.env.REDIS_ENABLE_SCHEMA_MANAGEMENT = 'true';
      process.env.REDIS_SCHEMA_VALIDATION_MODE = 'warn';
      process.env.REDIS_SCHEMA_REGISTRY = 'redis://localhost:6379';
      process.env.REDIS_SCHEMA_EVOLUTION = 'false';
      process.env.REDIS_SCHEMA_VERSIONING = 'numeric';

      const config = ConfigFactory.fromEnvironment();

      expect(config.schema).toBeDefined();
      expect(config.schema?.enabled).toBe(true);
      expect(config.schema?.validationMode).toBe('warn');
      expect(config.schema?.schemaRegistry).toBe('redis://localhost:6379');
      expect(config.schema?.enableSchemaEvolution).toBe(false);
      expect(config.schema?.versioning).toBe('numeric');
    });
  });

  describe('Message Replay Configuration', () => {
    it('should parse replay configuration from environment', () => {
      process.env.REDIS_ENABLE_MESSAGE_REPLAY = 'true';
      process.env.REDIS_REPLAY_MAX_SIZE = '50000';
      process.env.REDIS_REPLAY_SELECTIVE = 'true';
      process.env.REDIS_REPLAY_STRATEGIES = 'from-timestamp,from-sequence,from-checkpoint';

      const config = ConfigFactory.fromEnvironment();

      expect(config.replay).toBeDefined();
      expect(config.replay?.enabled).toBe(true);
      expect(config.replay?.maxReplaySize).toBe(50000);
      expect(config.replay?.enableSelectiveReplay).toBe(true);
      expect(config.replay?.replayStrategies).toEqual(['from-timestamp', 'from-sequence', 'from-checkpoint']);
    });
  });

  describe('Advanced DLQ Configuration', () => {
    it('should parse DLQ configuration from environment', () => {
      process.env.REDIS_ENABLE_DLQ = 'true';
      process.env.REDIS_DLQ_STREAM_PREFIX = 'dead-letter:';
      process.env.REDIS_MAX_RETRIES = '5';
      process.env.REDIS_RETRY_DELAY = '2000';
      process.env.REDIS_MAX_RETRIES_BEFORE_DLQ = '5';
      process.env.REDIS_DLQ_RETENTION = '172800000'; // 48 hours
      process.env.REDIS_DLQ_CLASSIFICATION = 'true';
      process.env.REDIS_DLQ_ERROR_TYPES = 'validation,processing,timeout,network';

      const config = ConfigFactory.fromEnvironment();

      expect(config.dlq).toBeDefined();
      expect(config.dlq?.enabled).toBe(true);
      expect(config.dlq?.streamPrefix).toBe('dead-letter:');
      expect(config.dlq?.maxRetries).toBe(5);
      expect(config.dlq?.retryDelay).toBe(2000);
      expect(config.dlq?.maxRetriesBeforeDLQ).toBe(5);
      expect(config.dlq?.retention).toBe(172800000);
      expect(config.dlq?.classification?.enabled).toBe(true);
      expect(config.dlq?.classification?.errorTypes).toEqual(['validation', 'processing', 'timeout', 'network']);
    });
  });

  describe('Advanced Routing Configuration', () => {
    it('should parse advanced routing configuration from environment', () => {
      process.env.EVENTS_PATTERN_ROUTING = 'true';
      process.env.EVENTS_CONTENT_BASED_ROUTING = 'true';
      process.env.EVENTS_CONDITIONAL_ROUTING = 'false';

      const config = ConfigFactory.fromEnvironment();

      expect(config.advancedRouting).toBeDefined();
      expect(config.advancedRouting?.enablePatternRouting).toBe(true);
      expect(config.advancedRouting?.enableContentBasedRouting).toBe(true);
      expect(config.advancedRouting?.enableConditionalRouting).toBe(false);
    });
  });

  describe('createRedisConfig', () => {
    it('should create Redis configuration with defaults', () => {
      const config = ConfigFactory.createRedisConfig();

      expect(config.url).toBe('redis://localhost:6379');
      expect(config.groupId).toBe('nestjs-group');
      expect(config.batchSize).toBe(100);
      expect(config.enableDLQ).toBe(true);
      expect(config.dlqStreamPrefix).toBe('dlq:');
      expect(config.maxRetries).toBe(3);
      expect(config.enableCompression).toBe(false);
      expect(config.enablePartitioning).toBe(false);
      expect(config.partitionCount).toBe(8);
    });

    it('should create Redis configuration from environment variables', () => {
      process.env.REDIS_URL = 'redis://cluster:6379';
      process.env.REDIS_GROUP_ID = 'my-group';
      process.env.REDIS_BATCH_SIZE = '500';
      process.env.REDIS_ENABLE_DLQ = 'false';
      process.env.REDIS_ENABLE_COMPRESSION = 'true';
      process.env.REDIS_ENABLE_PARTITIONING = 'true';
      process.env.REDIS_PARTITION_COUNT = '16';

      const config = ConfigFactory.createRedisConfig();

      expect(config.url).toBe('redis://cluster:6379');
      expect(config.groupId).toBe('my-group');
      expect(config.batchSize).toBe(500);
      expect(config.enableDLQ).toBe(false);
      expect(config.enableCompression).toBe(true);
      expect(config.enablePartitioning).toBe(true);
      expect(config.partitionCount).toBe(16);
    });
  });

  describe('createMemoryConfig', () => {
    it('should create memory configuration with defaults', () => {
      const config = ConfigFactory.createMemoryConfig();

      expect(config.maxMessageSize).toBe(1048576); // 1MB
    });

    it('should create memory configuration from environment variables', () => {
      process.env.MEMORY_ORIGIN_PREFIX = 'test';
      process.env.MEMORY_PATTERN_MATCHING = 'false';
      process.env.MEMORY_MAX_MESSAGE_SIZE = '2097152'; // 2MB

      const config = ConfigFactory.createMemoryConfig();

      expect(config.originPrefix).toBe('test');
      expect(config.enablePatternMatching).toBe(false);
      expect(config.maxMessageSize).toBe(2097152);
    });
  });

  describe('mergeWithDefaults', () => {
    it('should merge user configuration with environment defaults', () => {
      process.env.SERVICE_NAME = 'env-service';
      process.env.EVENTS_ORIGIN_PREFIX = 'env.prefix';

      const userConfig = {
        service: 'user-service',
        transports: new Map([['memory', {} as any]])
      };

      const mergedConfig = ConfigFactory.mergeWithDefaults(userConfig);

      expect(mergedConfig.service).toBe('user-service'); // User config takes precedence
      expect(mergedConfig.originPrefix).toBe('env.prefix'); // From environment
      expect(mergedConfig.transports).toBe(userConfig.transports);
    });

    it('should require service name', () => {
      const userConfig = {
        transports: new Map([['memory', {} as any]])
      };

      expect(() => ConfigFactory.mergeWithDefaults(userConfig))
        .toThrow('Service name is required in configuration');
    });

    it('should require transports', () => {
      const userConfig = {
        service: 'test-service'
      };

      expect(() => ConfigFactory.mergeWithDefaults(userConfig))
        .toThrow('Transports configuration is required');
    });
  });
});
