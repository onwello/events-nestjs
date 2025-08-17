import { NestJSEventsModuleOptions } from '../types/config.types';
import { ConfigValidator } from './config.validator';

/**
 * Configuration factory for creating NestJS events module options
 * with support for environment variables and sensible defaults
 */
export class ConfigFactory {
  /**
   * Create configuration from environment variables with defaults
   * Note: This returns a partial config as transports must be provided by the user
   */
  static fromEnvironment(): Partial<NestJSEventsModuleOptions> {
    return {
      service: process.env.SERVICE_NAME || process.env.NODE_ENV === 'production' 
        ? 'nestjs-service' 
        : 'nestjs-service-dev',
      
      originPrefix: process.env.EVENTS_ORIGIN_PREFIX,
      
      origins: process.env.EVENTS_ORIGINS 
        ? process.env.EVENTS_ORIGINS.split(',').map(s => s.trim())
        : undefined,
      
      validationMode: (process.env.EVENTS_VALIDATION_MODE as any) || 'warn',
      
      global: process.env.EVENTS_GLOBAL !== 'false', // Default to true
      
      autoDiscovery: process.env.EVENTS_AUTO_DISCOVERY !== 'false', // Default to true
      
      discovery: {
        scanControllers: process.env.EVENTS_SCAN_CONTROLLERS !== 'false',
        scanProviders: process.env.EVENTS_SCAN_PROVIDERS !== 'false',
        metadataKeys: process.env.EVENTS_METADATA_KEYS 
          ? process.env.EVENTS_METADATA_KEYS.split(',').map(s => s.trim())
          : undefined,
      },
      
      interceptor: {
        enableRequestEvents: process.env.EVENTS_REQUEST_EVENTS !== 'false',
        enableResponseEvents: process.env.EVENTS_RESPONSE_EVENTS !== 'false',
        correlationIdHeader: process.env.EVENTS_CORRELATION_ID_HEADER || 'x-correlation-id',
        causationIdHeader: process.env.EVENTS_CAUSATION_ID_HEADER || 'x-causation-id',
      },
      
      publisher: {
        batching: {
          enabled: process.env.EVENTS_BATCHING_ENABLED !== 'false',
          maxSize: parseInt(process.env.EVENTS_BATCHING_MAX_SIZE || '1000'),
          maxWaitMs: parseInt(process.env.EVENTS_BATCHING_MAX_WAIT_MS || '100'),
          maxConcurrentBatches: parseInt(process.env.EVENTS_BATCHING_MAX_CONCURRENT || '5'),
          strategy: (process.env.EVENTS_BATCHING_STRATEGY as any) || 'size',
          compression: process.env.EVENTS_BATCHING_COMPRESSION === 'true',
        },
        retry: {
          maxRetries: parseInt(process.env.EVENTS_RETRY_MAX_ATTEMPTS || '3'),
          backoffStrategy: (process.env.EVENTS_RETRY_BACKOFF_STRATEGY as any) || 'exponential',
          baseDelay: parseInt(process.env.EVENTS_RETRY_BASE_DELAY || '1000'),
          maxDelay: parseInt(process.env.EVENTS_RETRY_MAX_DELAY || '10000'),
        },
        rateLimiting: {
          maxRequests: parseInt(process.env.EVENTS_RATE_LIMIT_MAX_REQUESTS || '1000'),
          timeWindow: parseInt(process.env.EVENTS_RATE_LIMIT_TIME_WINDOW || '60000'),
          strategy: (process.env.EVENTS_RATE_LIMIT_STRATEGY as any) || 'sliding-window',
        },
        validationMode: (process.env.EVENTS_PUBLISHER_VALIDATION_MODE as any) || 'warn',
      },
      
      consumer: {
        enablePatternRouting: process.env.EVENTS_PATTERN_ROUTING !== 'false',
        enableConsumerGroups: process.env.EVENTS_CONSUMER_GROUPS !== 'false',
        poisonMessageHandler: undefined, // Custom handler would need to be configured
        validationMode: (process.env.EVENTS_CONSUMER_VALIDATION_MODE as any) || 'warn',
      },
    };
  }

  /**
   * Create Redis transport configuration from environment variables
   */
  static createRedisConfig() {
    return {
      url: process.env.REDIS_URL || 'redis://localhost:6379',
      groupId: process.env.REDIS_GROUP_ID || 'nestjs-group',
      batchSize: parseInt(process.env.REDIS_BATCH_SIZE || '100'),
      enableDLQ: process.env.REDIS_ENABLE_DLQ !== 'false',
      dlqStreamPrefix: process.env.REDIS_DLQ_STREAM_PREFIX || 'dlq:',
      maxRetries: parseInt(process.env.REDIS_MAX_RETRIES || '3'),
      enableCompression: process.env.REDIS_ENABLE_COMPRESSION === 'true',
      enablePartitioning: process.env.REDIS_ENABLE_PARTITIONING === 'true',
      partitionCount: parseInt(process.env.REDIS_PARTITION_COUNT || '1'),
    };
  }

  /**
   * Create memory transport configuration from environment variables
   */
  static createMemoryConfig() {
    return {
      originPrefix: process.env.MEMORY_ORIGIN_PREFIX,
      enablePatternMatching: process.env.MEMORY_PATTERN_MATCHING !== 'false',
      maxMessageSize: parseInt(process.env.MEMORY_MAX_MESSAGE_SIZE || '1048576'), // 1MB
    };
  }

  /**
   * Merge user configuration with environment defaults
   */
  static mergeWithDefaults(
    userConfig: Partial<NestJSEventsModuleOptions>
  ): NestJSEventsModuleOptions {
    const envConfig = this.fromEnvironment();
    
    // Ensure required fields are present
    if (!userConfig.service && !envConfig.service) {
      throw new Error('Service name is required in configuration');
    }
    
    if (!userConfig.transports) {
      throw new Error('Transports configuration is required');
    }
    
    const mergedConfig = {
      ...envConfig,
      ...userConfig,
      // Deep merge for nested objects
      publisher: {
        ...envConfig.publisher,
        ...userConfig.publisher,
        batching: {
          ...envConfig.publisher?.batching,
          ...userConfig.publisher?.batching,
        },
        retry: {
          ...envConfig.publisher?.retry,
          ...userConfig.publisher?.retry,
        },
        rateLimiting: {
          ...envConfig.publisher?.rateLimiting,
          ...userConfig.publisher?.rateLimiting,
        },
      },
      consumer: {
        ...envConfig.consumer,
        ...userConfig.consumer,
      },
      discovery: {
        ...envConfig.discovery,
        ...userConfig.discovery,
      },
      interceptor: {
        ...envConfig.interceptor,
        ...userConfig.interceptor,
      },
    };
    
    // Validate the merged configuration
    const validatedConfig = ConfigValidator.validateAll(mergedConfig);
    
    // Ensure required fields are present after validation
    if (!validatedConfig.service) {
      throw new Error('Service name is required after validation');
    }
    
    if (!mergedConfig.transports) {
      throw new Error('Transports configuration is required');
    }
    
    // Return the complete configuration
    return {
      ...validatedConfig,
      transports: mergedConfig.transports,
      routing: mergedConfig.routing,
    } as NestJSEventsModuleOptions;
  }
}
