import { ConfigValidator } from '../../utils/config.validator';

describe('ConfigValidator', () => {
  describe('validateAll', () => {
    it('should validate basic configuration', () => {
      const config = {
        service: 'test-service',
        transports: new Map([['memory', {} as any]])
      };

      const result = ConfigValidator.validateAll(config);

      expect(result.service).toBe('test-service');
    });

    it('should reject configuration without service name', () => {
      const config = {
        transports: new Map([['memory', {} as any]])
      };

      expect(() => ConfigValidator.validateAll(config))
        .toThrow('Configuration validation failed');
    });

    it('should validate publisher configuration', () => {
      const config = {
        service: 'test-service',
        transports: new Map([['memory', {} as any]]),
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
          },
          rateLimiting: {
            maxRequests: 1000,
            timeWindow: 60000,
            strategy: 'sliding-window'
          }
        }
      };

      const result = ConfigValidator.validateAll(config);

      expect(result.publisher?.batching?.enabled).toBe(true);
      expect(result.publisher?.retry?.maxRetries).toBe(3);
      expect(result.publisher?.rateLimiting?.maxRequests).toBe(1000);
    });

    it('should validate consumer configuration', () => {
      const config = {
        service: 'test-service',
        transports: new Map([['memory', {} as any]]),
        consumer: {
          enablePatternRouting: true,
          enableConsumerGroups: true,
          validationMode: 'warn'
        }
      };

      const result = ConfigValidator.validateAll(config);

      expect(result.consumer?.enablePatternRouting).toBe(true);
      expect(result.consumer?.enableConsumerGroups).toBe(true);
      expect(result.consumer?.validationMode).toBe('warn');
    });
  });

  describe('validateRedisCluster', () => {
    it('should validate valid Redis cluster configuration', () => {
      const config = {
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
      };

      const result = ConfigValidator.validateRedisCluster(config);

      expect(result.clusterNodes).toHaveLength(2);
      expect(result.enableFailover).toBe(true);
      expect(result.failoverRecovery?.enabled).toBe(true);
    });

    it('should reject configuration without cluster nodes', () => {
      const config = {
        enableFailover: true
      };

      expect(() => ConfigValidator.validateRedisCluster(config))
        .toThrow('Redis cluster configuration validation failed');
    });

    it('should reject configuration with empty cluster nodes', () => {
      const config = {
        clusterNodes: [],
        enableFailover: true
      };

      expect(() => ConfigValidator.validateRedisCluster(config))
        .toThrow('Redis cluster configuration validation failed');
    });

    it('should reject configuration with invalid port', () => {
      const config = {
        clusterNodes: [
          { host: 'cluster-1', port: 70000 } // Invalid port
        ],
        enableFailover: true
      };

      expect(() => ConfigValidator.validateRedisCluster(config))
        .toThrow('Redis cluster configuration validation failed');
    });
  });

  describe('validateRedisSentinel', () => {
    it('should validate valid Redis sentinel configuration', () => {
      const config = {
        sentinels: [
          { host: 'sentinel-1', port: 26379 },
          { host: 'sentinel-2', port: 26379 }
        ],
        sentinelName: 'mymaster',
        connectionTimeout: 5000,
        commandTimeout: 3000
      };

      const result = ConfigValidator.validateRedisSentinel(config);

      expect(result.sentinels).toHaveLength(2);
      expect(result.sentinelName).toBe('mymaster');
      expect(result.connectionTimeout).toBe(5000);
    });

    it('should reject configuration without sentinels', () => {
      const config = {
        sentinelName: 'mymaster'
      };

      expect(() => ConfigValidator.validateRedisSentinel(config))
        .toThrow('Redis sentinel configuration validation failed');
    });

    it('should reject configuration with empty sentinels', () => {
      const config = {
        sentinels: [],
        sentinelName: 'mymaster'
      };

      expect(() => ConfigValidator.validateRedisSentinel(config))
        .toThrow('Redis sentinel configuration validation failed');
    });
  });

  describe('validatePartitioning', () => {
    it('should validate valid partitioning configuration', () => {
      const config = {
        enabled: true,
        strategy: 'hash',
        autoScaling: true,
        partitionCount: 8
      };

      const result = ConfigValidator.validatePartitioning(config);

      expect(result.enabled).toBe(true);
      expect(result.strategy).toBe('hash');
      expect(result.autoScaling).toBe(true);
      expect(result.partitionCount).toBe(8);
    });

    it('should validate all partitioning strategies', () => {
      const strategies = ['hash', 'roundRobin', 'keyBased', 'dynamic'];

      strategies.forEach(strategy => {
        const config = {
          enabled: true,
          strategy,
          autoScaling: true,
          partitionCount: 8
        };

        const result = ConfigValidator.validatePartitioning(config);
        expect(result.strategy).toBe(strategy);
      });
    });

    it('should reject invalid partitioning strategy', () => {
      const config = {
        enabled: true,
        strategy: 'invalid-strategy' as any,
        autoScaling: true,
        partitionCount: 8
      };

      expect(() => ConfigValidator.validatePartitioning(config))
        .toThrow('Partitioning configuration validation failed');
    });

    it('should reject invalid partition count', () => {
      const config = {
        enabled: true,
        strategy: 'hash',
        autoScaling: true,
        partitionCount: 0
      };

      expect(() => ConfigValidator.validatePartitioning(config))
        .toThrow('Partitioning configuration validation failed');
    });

    it('should reject partition count above maximum', () => {
      const config = {
        enabled: true,
        strategy: 'hash',
        autoScaling: true,
        partitionCount: 1001
      };

      expect(() => ConfigValidator.validatePartitioning(config))
        .toThrow('Partitioning configuration validation failed');
    });
  });

  describe('validateOrdering', () => {
    it('should validate valid ordering configuration', () => {
      const config = {
        enabled: true,
        strategy: 'partition',
        enableCausalDependencies: true
      };

      const result = ConfigValidator.validateOrdering(config);

      expect(result.enabled).toBe(true);
      expect(result.strategy).toBe('partition');
      expect(result.enableCausalDependencies).toBe(true);
    });

    it('should validate both ordering strategies', () => {
      const strategies = ['partition', 'global'];

      strategies.forEach(strategy => {
        const config = {
          enabled: true,
          strategy,
          enableCausalDependencies: true
        };

        const result = ConfigValidator.validateOrdering(config);
        expect(result.strategy).toBe(strategy);
      });
    });

    it('should reject invalid ordering strategy', () => {
      const config = {
        enabled: true,
        strategy: 'invalid-strategy' as any,
        enableCausalDependencies: true
      };

      expect(() => ConfigValidator.validateOrdering(config))
        .toThrow('Ordering configuration validation failed');
    });
  });

  describe('validateSchema', () => {
    it('should validate valid schema configuration', () => {
      const config = {
        enabled: true,
        validationMode: 'strict',
        enableSchemaEvolution: true,
        versioning: 'semantic'
      };

      const result = ConfigValidator.validateSchema(config);

      expect(result.enabled).toBe(true);
      expect(result.validationMode).toBe('strict');
      expect(result.enableSchemaEvolution).toBe(true);
      expect(result.versioning).toBe('semantic');
    });

    it('should validate all validation modes', () => {
      const modes = ['strict', 'warn', 'none'];

      modes.forEach(mode => {
        const config = {
          enabled: true,
          validationMode: mode,
          enableSchemaEvolution: true
        };

        const result = ConfigValidator.validateSchema(config);
        expect(result.validationMode).toBe(mode);
      });
    });

    it('should validate all versioning types', () => {
      const versionings = ['semantic', 'numeric'];

      versionings.forEach(versioning => {
        const config = {
          enabled: true,
          validationMode: 'strict',
          enableSchemaEvolution: true,
          versioning
        };

        const result = ConfigValidator.validateSchema(config);
        expect(result.versioning).toBe(versioning);
      });
    });

    it('should reject invalid validation mode', () => {
      const config = {
        enabled: true,
        validationMode: 'invalid-mode' as any,
        enableSchemaEvolution: true
      };

      expect(() => ConfigValidator.validateSchema(config))
        .toThrow('Schema configuration validation failed');
    });

    it('should reject invalid versioning', () => {
      const config = {
        enabled: true,
        validationMode: 'strict',
        enableSchemaEvolution: true,
        versioning: 'invalid-versioning' as any
      };

      expect(() => ConfigValidator.validateSchema(config))
        .toThrow('Schema configuration validation failed');
    });
  });

  describe('validateReplay', () => {
    it('should validate valid replay configuration', () => {
      const config = {
        enabled: true,
        maxReplaySize: 10000,
        enableSelectiveReplay: true,
        replayStrategies: ['from-timestamp', 'from-sequence']
      };

      const result = ConfigValidator.validateReplay(config);

      expect(result.enabled).toBe(true);
      expect(result.maxReplaySize).toBe(10000);
      expect(result.enableSelectiveReplay).toBe(true);
      expect(result.replayStrategies).toEqual(['from-timestamp', 'from-sequence']);
    });

    it('should validate all replay strategies', () => {
      const strategies = ['from-timestamp', 'from-sequence', 'from-checkpoint'];

      strategies.forEach(strategy => {
        const config = {
          enabled: true,
          maxReplaySize: 10000,
          enableSelectiveReplay: true,
          replayStrategies: [strategy]
        };

        const result = ConfigValidator.validateReplay(config);
        expect(result.replayStrategies).toContain(strategy);
      });
    });

    it('should reject invalid replay size', () => {
      const config = {
        enabled: true,
        maxReplaySize: 0,
        enableSelectiveReplay: true
      };

      expect(() => ConfigValidator.validateReplay(config))
        .toThrow('Replay configuration validation failed');
    });

    it('should reject replay size above maximum', () => {
      const config = {
        enabled: true,
        maxReplaySize: 1000001,
        enableSelectiveReplay: true
      };

      expect(() => ConfigValidator.validateReplay(config))
        .toThrow('Replay configuration validation failed');
    });
  });

  describe('validateDLQ', () => {
    it('should validate valid DLQ configuration', () => {
      const config = {
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
      };

      const result = ConfigValidator.validateDLQ(config);

      expect(result.enabled).toBe(true);
      expect(result.streamPrefix).toBe('dlq:');
      expect(result.maxRetries).toBe(3);
      expect(result.retention).toBe(86400000);
      expect(result.classification?.enabled).toBe(true);
      expect(result.classification?.errorTypes).toEqual(['validation', 'processing', 'timeout']);
    });

    it('should reject invalid retention time', () => {
      const config = {
        enabled: true,
        streamPrefix: 'dlq:',
        maxRetries: 3,
        retryDelay: 1000,
        maxRetriesBeforeDLQ: 3,
        retention: 30000 // Below minimum
      };

      expect(() => ConfigValidator.validateDLQ(config))
        .toThrow('DLQ configuration validation failed');
    });

    it('should reject retention time above maximum', () => {
      const config = {
        enabled: true,
        streamPrefix: 'dlq:',
        maxRetries: 3,
        retryDelay: 1000,
        maxRetriesBeforeDLQ: 3,
        retention: 31536000001 // Above maximum
      };

      expect(() => ConfigValidator.validateDLQ(config))
        .toThrow('DLQ configuration validation failed');
    });

    it('should reject empty error types in classification', () => {
      const config = {
        enabled: true,
        streamPrefix: 'dlq:',
        maxRetries: 3,
        retryDelay: 1000,
        maxRetriesBeforeDLQ: 3,
        retention: 86400000,
        classification: {
          enabled: true,
          errorTypes: []
        }
      };

      expect(() => ConfigValidator.validateDLQ(config))
        .toThrow('DLQ configuration validation failed');
    });
  });

  describe('validateAdvancedRouting', () => {
    it('should validate valid advanced routing configuration', () => {
      const config = {
        enablePatternRouting: true,
        enableContentBasedRouting: true,
        enableConditionalRouting: false,
        routingRules: [
          {
            condition: (event: any) => event.body.region === 'EU',
            target: 'eu-processor',
            priority: 1
          }
        ]
      };

      const result = ConfigValidator.validateAdvancedRouting(config);

      expect(result.enablePatternRouting).toBe(true);
      expect(result.enableContentBasedRouting).toBe(true);
      expect(result.enableConditionalRouting).toBe(false);
      expect(result.routingRules).toHaveLength(1);
    });

    it('should validate routing rules with different priorities', () => {
      const config = {
        enablePatternRouting: true,
        enableContentBasedRouting: true,
        enableConditionalRouting: true,
        routingRules: [
          {
            condition: (event: any) => event.body.region === 'EU',
            target: 'eu-processor',
            priority: 1
          },
          {
            condition: (event: any) => event.body.region === 'US',
            target: 'us-processor',
            priority: 2
          }
        ]
      };

      const result = ConfigValidator.validateAdvancedRouting(config);

      expect(result.routingRules).toHaveLength(2);
      expect(result.routingRules?.[0]?.priority).toBe(1);
      expect(result.routingRules?.[1]?.priority).toBe(2);
    });

    it('should reject routing rules with invalid priority', () => {
      const config = {
        enablePatternRouting: true,
        enableContentBasedRouting: true,
        enableConditionalRouting: true,
        routingRules: [
          {
            condition: (event: any) => event.body.region === 'EU',
            target: 'eu-processor',
            priority: 0 // Below minimum
          }
        ]
      };

      expect(() => ConfigValidator.validateAdvancedRouting(config))
        .toThrow('Advanced routing configuration validation failed');
    });

    it('should reject routing rules with priority above maximum', () => {
      const config = {
        enablePatternRouting: true,
        enableContentBasedRouting: true,
        enableConditionalRouting: true,
        routingRules: [
          {
            condition: (event: any) => event.body.region === 'EU',
            target: 'eu-processor',
            priority: 101 // Above maximum
          }
        ]
      };

      expect(() => ConfigValidator.validateAdvancedRouting(config))
        .toThrow('Advanced routing configuration validation failed');
    });
  });

  describe('Error Messages', () => {
    it('should provide clear error messages for validation failures', () => {
      const config = {
        service: '',
        transports: new Map()
      };

      expect(() => ConfigValidator.validateAll(config))
        .toThrow('Configuration validation failed');
    });

    it('should provide clear error messages for Redis cluster validation', () => {
      const config = {
        clusterNodes: []
      };

      expect(() => ConfigValidator.validateRedisCluster(config))
        .toThrow('Redis cluster configuration validation failed');
    });

    it('should provide clear error messages for partitioning validation', () => {
      const config = {
        enabled: true,
        strategy: 'invalid-strategy' as any,
        autoScaling: true,
        partitionCount: 8
      };

      expect(() => ConfigValidator.validatePartitioning(config))
        .toThrow('Partitioning configuration validation failed');
    });
  });
});
