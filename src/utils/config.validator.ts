import { z } from 'zod';
import { NestJSEventsModuleOptions } from '../types/config.types';

/**
 * Zod schemas for configuration validation
 */
export const ConfigSchemas = {
  // Redis Cluster configuration
  RedisCluster: z.object({
    clusterNodes: z.array(z.object({
      host: z.string().min(1),
      port: z.number().int().min(1).max(65535)
    })).min(1),
    enableFailover: z.boolean(),
    failoverRecovery: z.object({
      enabled: z.boolean(),
      maxRetries: z.number().int().min(1).max(10),
      retryDelay: z.number().int().min(100).max(30000)
    }).optional()
  }),

  // Redis Sentinel configuration
  RedisSentinel: z.object({
    sentinels: z.array(z.object({
      host: z.string().min(1),
      port: z.number().int().min(1).max(65535)
    })).min(1),
    sentinelName: z.string().min(1),
    connectionTimeout: z.number().int().min(1000).max(30000).optional(),
    commandTimeout: z.number().int().min(1000).max(30000).optional()
  }),

  // Partitioning configuration
  Partitioning: z.object({
    enabled: z.boolean(),
    strategy: z.enum(['hash', 'roundRobin', 'keyBased', 'dynamic']),
    autoScaling: z.boolean(),
    partitionKeyExtractor: z.any().optional(), // Function type
    partitionCount: z.number().int().min(1).max(1000)
  }),

  // Ordering configuration
  Ordering: z.object({
    enabled: z.boolean(),
    strategy: z.enum(['partition', 'global']),
    enableCausalDependencies: z.boolean()
  }),

  // Schema configuration
  Schema: z.object({
    enabled: z.boolean(),
    validationMode: z.enum(['strict', 'warn', 'none']),
    schemaRegistry: z.string().url().optional(),
    enableSchemaEvolution: z.boolean(),
    versioning: z.enum(['semantic', 'numeric']).optional()
  }),

  // Replay configuration
  Replay: z.object({
    enabled: z.boolean(),
    maxReplaySize: z.number().int().min(1).max(1000000),
    enableSelectiveReplay: z.boolean(),
    replayStrategies: z.array(z.enum(['from-timestamp', 'from-sequence', 'from-checkpoint'])).optional()
  }),

  // DLQ configuration
  DLQ: z.object({
    enabled: z.boolean(),
    streamPrefix: z.string().min(1),
    maxRetries: z.number().int().min(0).max(10),
    retryDelay: z.number().int().min(100).max(30000),
    maxRetriesBeforeDLQ: z.number().int().min(0).max(10),
    retention: z.number().int().min(60000).max(31536000000), // 1 minute to 1 year
    classification: z.object({
      enabled: z.boolean(),
      errorTypes: z.array(z.string()).min(1)
    }).optional(),
    poisonMessageHandler: z.any().optional() // Function type
  }),

  // Advanced routing configuration
  AdvancedRouting: z.object({
    enablePatternRouting: z.boolean(),
    enableContentBasedRouting: z.boolean(),
    enableConditionalRouting: z.boolean(),
    routingRules: z.array(z.object({
      condition: z.any().optional(), // Function type
      target: z.string().min(1),
      priority: z.number().int().min(1).max(100)
    })).optional()
  }),

  // Main configuration schema
  Main: z.object({
    service: z.string().min(1),
    originPrefix: z.string().optional(),
    origins: z.array(z.string()).optional(),
    validationMode: z.enum(['strict', 'warn', 'ignore']).optional(),
    global: z.boolean().optional(),
    autoDiscovery: z.boolean().optional(),
    
    // Publisher configuration
    publisher: z.object({
      batching: z.object({
        enabled: z.boolean(),
        maxSize: z.number().int().min(1).max(100000),
        maxWaitMs: z.number().int().min(1).max(60000),
        maxConcurrentBatches: z.number().int().min(1).max(100),
        strategy: z.enum(['size', 'time', 'partition']),
        compression: z.boolean().optional()
      }).optional(),
      retry: z.object({
        maxRetries: z.number().int().min(0).max(10),
        backoffStrategy: z.enum(['exponential', 'fixed', 'fibonacci']),
        baseDelay: z.number().int().min(100).max(30000),
        maxDelay: z.number().int().min(1000).max(60000)
      }).optional(),
      rateLimiting: z.object({
        maxRequests: z.number().int().min(1).max(100000),
        timeWindow: z.number().int().min(1000).max(3600000),
        strategy: z.enum(['sliding-window', 'token-bucket'])
      }).optional()
    }).optional(),
    
    // Consumer configuration
    consumer: z.object({
      enablePatternRouting: z.boolean().optional(),
      enableConsumerGroups: z.boolean().optional(),
      validationMode: z.enum(['strict', 'warn', 'ignore']).optional()
    }).optional(),
    
    // Discovery configuration
    discovery: z.object({
      scanControllers: z.boolean().optional(),
      scanProviders: z.boolean().optional(),
      metadataKeys: z.array(z.string()).optional()
    }).optional(),
    
    // Interceptor configuration
    interceptor: z.object({
      enableRequestEvents: z.boolean().optional(),
      enableResponseEvents: z.boolean().optional(),
      correlationIdHeader: z.string().optional(),
      causationIdHeader: z.string().optional()
    }).optional(),
    
         // Advanced features
     redisCluster: z.any().optional(),
     redisSentinel: z.any().optional(),
     partitioning: z.any().optional(),
     ordering: z.any().optional(),
     schema: z.any().optional(),
     replay: z.any().optional(),
     dlq: z.any().optional(),
     advancedRouting: z.any().optional(),
    
    // Core library configurations
    routing: z.any().optional(),
    transports: z.any().optional()
  })
};

/**
 * Configuration validator using Zod schemas
 */
export class ConfigValidator {
  /**
   * Validate all configuration options
   */
  static validateAll(config: any): Partial<NestJSEventsModuleOptions> {
    try {
      const validated = ConfigSchemas.Main.parse(config);
      return validated;
    } catch (error) {
      if (error instanceof z.ZodError) {
        const errors = error.issues.map(issue => 
          `${issue.path.join('.')}: ${issue.message}`
        );
        throw new Error(`Configuration validation failed:\n${errors.join('\n')}`);
      }
      throw error;
    }
  }

  /**
   * Validate main configuration
   */
  static validateMainConfig(config: any): Partial<NestJSEventsModuleOptions> {
    return this.validateAll(config);
  }

  /**
   * Validate Redis cluster configuration
   */
  static validateRedisCluster(config: any): any {
    try {
      return ConfigSchemas.RedisCluster.parse(config);
    } catch (error) {
      if (error instanceof z.ZodError) {
        const errors = error.issues.map(issue => 
          `${issue.path.join('.')}: ${issue.message}`
        );
        throw new Error(`Redis cluster configuration validation failed:\n${errors.join('\n')}`);
      }
      throw error;
    }
  }

  /**
   * Validate Redis sentinel configuration
   */
  static validateRedisSentinel(config: any): any {
    try {
      return ConfigSchemas.RedisSentinel.parse(config);
    } catch (error) {
      if (error instanceof z.ZodError) {
        const errors = error.issues.map(issue => 
          `${issue.path.join('.')}: ${issue.message}`
        );
        throw new Error(`Redis sentinel configuration validation failed:\n${errors.join('\n')}`);
      }
      throw error;
    }
  }

  /**
   * Validate partitioning configuration
   */
  static validatePartitioning(config: any): any {
    try {
      return ConfigSchemas.Partitioning.parse(config);
    } catch (error) {
      if (error instanceof z.ZodError) {
        const errors = error.issues.map(issue => 
          `${issue.path.join('.')}: ${issue.message}`
        );
        throw new Error(`Partitioning configuration validation failed:\n${errors.join('\n')}`);
      }
      throw error;
    }
  }

  /**
   * Validate ordering configuration
   */
  static validateOrdering(config: any): any {
    try {
      return ConfigSchemas.Ordering.parse(config);
    } catch (error) {
      if (error instanceof z.ZodError) {
        const errors = error.issues.map(issue => 
          `${issue.path.join('.')}: ${issue.message}`
        );
        throw new Error(`Ordering configuration validation failed:\n${errors.join('\n')}`);
      }
      throw error;
    }
  }

  /**
   * Validate schema configuration
   */
  static validateSchema(config: any): any {
    try {
      return ConfigSchemas.Schema.parse(config);
    } catch (error) {
      if (error instanceof z.ZodError) {
        const errors = error.issues.map(issue => 
          `${issue.path.join('.')}: ${issue.message}`
        );
        throw new Error(`Schema configuration validation failed:\n${errors.join('\n')}`);
      }
      throw error;
    }
  }

  /**
   * Validate replay configuration
   */
  static validateReplay(config: any): any {
    try {
      return ConfigSchemas.Replay.parse(config);
    } catch (error) {
      if (error instanceof z.ZodError) {
        const errors = error.issues.map(issue => 
          `${issue.path.join('.')}: ${issue.message}`
        );
        throw new Error(`Replay configuration validation failed:\n${errors.join('\n')}`);
      }
      throw error;
    }
  }

  /**
   * Validate DLQ configuration
   */
  static validateDLQ(config: any): any {
    try {
      return ConfigSchemas.DLQ.parse(config);
    } catch (error) {
      if (error instanceof z.ZodError) {
        const errors = error.issues.map(issue => 
          `${issue.path.join('.')}: ${issue.message}`
        );
        throw new Error(`DLQ configuration validation failed:\n${errors.join('\n')}`);
      }
      throw error;
    }
  }

  /**
   * Validate advanced routing configuration
   */
  static validateAdvancedRouting(config: any): any {
    try {
      return ConfigSchemas.AdvancedRouting.parse(config);
    } catch (error) {
      if (error instanceof z.ZodError) {
        const errors = error.issues.map(issue => 
          `${issue.path.join('.')}: ${issue.message}`
        );
        throw new Error(`Advanced routing configuration validation failed:\n${errors.join('\n')}`);
      }
      throw error;
    }
  }
}
