import { z } from 'zod';
import { NestJSEventsModuleOptions } from '../types/config.types';

/**
 * Zod schemas for configuration validation
 */
export const ConfigSchemas = {
  /**
   * Publisher batching configuration schema
   */
  PublisherBatching: z.object({
    enabled: z.boolean().default(true),
    maxSize: z.number().int().positive().default(1000),
    maxWaitMs: z.number().int().positive().default(100),
    maxConcurrentBatches: z.number().int().positive().default(5),
    strategy: z.enum(['time', 'size', 'partition']).default('size'),
    compression: z.boolean().optional(),
  }),

  /**
   * Publisher retry configuration schema
   */
  PublisherRetry: z.object({
    maxRetries: z.number().int().min(0).default(3),
    backoffStrategy: z.enum(['fixed', 'exponential', 'fibonacci']).default('exponential'),
    baseDelay: z.number().int().positive().default(1000),
    maxDelay: z.number().int().positive().default(10000),
  }),

  /**
   * Publisher rate limiting configuration schema
   */
  PublisherRateLimiting: z.object({
    maxRequests: z.number().int().positive().default(1000),
    timeWindow: z.number().int().positive().default(60000),
    strategy: z.enum(['sliding-window', 'token-bucket']).default('sliding-window'),
  }),

  /**
   * Publisher configuration schema
   */
  Publisher: z.object({
    batching: z.object({
      enabled: z.boolean().default(true),
      maxSize: z.number().int().positive().default(1000),
      maxWaitMs: z.number().int().positive().default(100),
      maxConcurrentBatches: z.number().int().positive().default(5),
      strategy: z.enum(['time', 'size', 'partition']).default('size'),
      compression: z.boolean().optional(),
    }).optional(),
    retry: z.object({
      maxRetries: z.number().int().min(0).default(3),
      backoffStrategy: z.enum(['fixed', 'exponential', 'fibonacci']).default('exponential'),
      baseDelay: z.number().int().positive().default(1000),
      maxDelay: z.number().int().positive().default(10000),
    }).optional(),
    rateLimiting: z.object({
      maxRequests: z.number().int().positive().default(1000),
      timeWindow: z.number().int().positive().default(60000),
      strategy: z.enum(['sliding-window', 'token-bucket']).default('sliding-window'),
    }).optional(),
    validationMode: z.enum(['strict', 'warn', 'ignore']).optional(),
  }),

  /**
   * Consumer configuration schema
   */
  Consumer: z.object({
    enablePatternRouting: z.boolean().default(false),
    enableConsumerGroups: z.boolean().default(false),
    validationMode: z.enum(['strict', 'warn', 'ignore']).default('warn'),
  }),

  /**
   * Discovery configuration schema
   */
  Discovery: z.object({
    scanControllers: z.boolean().default(true),
    scanProviders: z.boolean().default(true),
    metadataKeys: z.array(z.string()).optional(),
  }),

  /**
   * Interceptor configuration schema
   */
  Interceptor: z.object({
    enableRequestEvents: z.boolean().default(true),
    enableResponseEvents: z.boolean().default(true),
    correlationIdHeader: z.string().default('x-correlation-id'),
    causationIdHeader: z.string().default('x-causation-id'),
  }),

  /**
   * Main configuration schema
   */
  Main: z.object({
    service: z.string().min(1, 'Service name is required'),
    originPrefix: z.string().optional(),
    origins: z.array(z.string()).optional(),
    validationMode: z.enum(['strict', 'warn', 'ignore']).default('warn'),
    global: z.boolean().default(true),
    autoDiscovery: z.boolean().default(true),
    discovery: z.object({
      scanControllers: z.boolean().default(true),
      scanProviders: z.boolean().default(true),
      metadataKeys: z.array(z.string()).optional(),
    }).optional(),
    interceptor: z.object({
      enableRequestEvents: z.boolean().default(true),
      enableResponseEvents: z.boolean().default(true),
      correlationIdHeader: z.string().default('x-correlation-id'),
      causationIdHeader: z.string().default('x-causation-id'),
    }).optional(),
    publisher: z.object({
      batching: z.object({
        enabled: z.boolean().default(true),
        maxSize: z.number().int().positive().default(1000),
        maxWaitMs: z.number().int().positive().default(100),
        maxConcurrentBatches: z.number().int().positive().default(5),
        strategy: z.enum(['time', 'size', 'partition']).default('size'),
        compression: z.boolean().optional(),
      }).optional(),
      retry: z.object({
        maxRetries: z.number().int().min(0).default(3),
        backoffStrategy: z.enum(['fixed', 'exponential', 'fibonacci']).default('exponential'),
        baseDelay: z.number().int().positive().default(1000),
        maxDelay: z.number().int().positive().default(10000),
      }).optional(),
      rateLimiting: z.object({
        maxRequests: z.number().int().positive().default(1000),
        timeWindow: z.number().int().positive().default(60000),
        strategy: z.enum(['sliding-window', 'token-bucket']).default('sliding-window'),
      }).optional(),
      validationMode: z.enum(['strict', 'warn', 'ignore']).optional(),
    }).optional(),
    consumer: z.object({
      enablePatternRouting: z.boolean().default(false),
      enableConsumerGroups: z.boolean().default(false),
      validationMode: z.enum(['strict', 'warn', 'ignore']).default('warn'),
    }).optional(),
    // Note: transports and routing are validated separately as they require
    // complex object validation that's handled by the core library
  }),
};

/**
 * Configuration validator using Zod schemas
 */
export class ConfigValidator {
  /**
   * Validate the main configuration
   */
  static validateMainConfig(config: any): Partial<NestJSEventsModuleOptions> {
    try {
      return ConfigSchemas.Main.parse(config);
    } catch (error) {
      if (error instanceof z.ZodError) {
        const issues = error.issues.map(issue => 
          `${issue.path.join('.')}: ${issue.message}`
        ).join(', ');
        throw new Error(`Configuration validation failed: ${issues}`);
      }
      throw error;
    }
  }

  /**
   * Validate publisher configuration
   */
  static validatePublisherConfig(config: any) {
    try {
      return ConfigSchemas.Publisher.parse(config);
    } catch (error) {
      if (error instanceof z.ZodError) {
        const issues = error.issues.map(issue => 
          `publisher.${issue.path.join('.')}: ${issue.message}`
        ).join(', ');
        throw new Error(`Publisher configuration validation failed: ${issues}`);
      }
      throw error;
    }
  }

  /**
   * Validate consumer configuration
   */
  static validateConsumerConfig(config: any) {
    try {
      return ConfigSchemas.Consumer.parse(config);
    } catch (error) {
      if (error instanceof z.ZodError) {
        const issues = error.issues.map(issue => 
          `consumer.${issue.path.join('.')}: ${issue.message}`
        ).join(', ');
        throw new Error(`Consumer configuration validation failed: ${issues}`);
      }
      throw error;
    }
  }

  /**
   * Validate discovery configuration
   */
  static validateDiscoveryConfig(config: any) {
    try {
      return ConfigSchemas.Discovery.parse(config);
    } catch (error) {
      if (error instanceof z.ZodError) {
        const issues = error.issues.map(issue => 
          `discovery.${issue.path.join('.')}: ${issue.message}`
        ).join(', ');
        throw new Error(`Discovery configuration validation failed: ${issues}`);
      }
      throw error;
    }
  }

  /**
   * Validate interceptor configuration
   */
  static validateInterceptorConfig(config: any) {
    try {
      return ConfigSchemas.Interceptor.parse(config);
    } catch (error) {
      if (error instanceof z.ZodError) {
        const issues = error.issues.map(issue => 
          `interceptor.${issue.path.join('.')}: ${issue.message}`
        ).join(', ');
        throw new Error(`Interceptor configuration validation failed: ${issues}`);
      }
      throw error;
    }
  }

  /**
   * Validate the entire configuration
   */
  static validateAll(config: any): Partial<NestJSEventsModuleOptions> {
    const mainConfig = this.validateMainConfig(config);
    
    if (config.publisher) {
      this.validatePublisherConfig(config.publisher);
    }
    
    if (config.consumer) {
      this.validateConsumerConfig(config.consumer);
    }
    
    if (config.discovery) {
      this.validateDiscoveryConfig(config.discovery);
    }
    
    if (config.interceptor) {
      this.validateInterceptorConfig(config.interceptor);
    }
    
    return mainConfig;
  }
}
