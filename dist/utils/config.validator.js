"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ConfigValidator = exports.ConfigSchemas = void 0;
const zod_1 = require("zod");
/**
 * Zod schemas for configuration validation
 */
exports.ConfigSchemas = {
    // Redis Cluster configuration
    RedisCluster: zod_1.z.object({
        clusterNodes: zod_1.z.array(zod_1.z.object({
            host: zod_1.z.string().min(1),
            port: zod_1.z.number().int().min(1).max(65535)
        })).min(1),
        enableFailover: zod_1.z.boolean(),
        failoverRecovery: zod_1.z.object({
            enabled: zod_1.z.boolean(),
            maxRetries: zod_1.z.number().int().min(1).max(10),
            retryDelay: zod_1.z.number().int().min(100).max(30000)
        }).optional()
    }),
    // Redis Sentinel configuration
    RedisSentinel: zod_1.z.object({
        sentinels: zod_1.z.array(zod_1.z.object({
            host: zod_1.z.string().min(1),
            port: zod_1.z.number().int().min(1).max(65535)
        })).min(1),
        sentinelName: zod_1.z.string().min(1),
        connectionTimeout: zod_1.z.number().int().min(1000).max(30000).optional(),
        commandTimeout: zod_1.z.number().int().min(1000).max(30000).optional()
    }),
    // Partitioning configuration
    Partitioning: zod_1.z.object({
        enabled: zod_1.z.boolean(),
        strategy: zod_1.z.enum(['hash', 'roundRobin', 'keyBased', 'dynamic']),
        autoScaling: zod_1.z.boolean(),
        partitionKeyExtractor: zod_1.z.any().optional(), // Function type
        partitionCount: zod_1.z.number().int().min(1).max(1000)
    }),
    // Ordering configuration
    Ordering: zod_1.z.object({
        enabled: zod_1.z.boolean(),
        strategy: zod_1.z.enum(['partition', 'global']),
        enableCausalDependencies: zod_1.z.boolean()
    }),
    // Schema configuration
    Schema: zod_1.z.object({
        enabled: zod_1.z.boolean(),
        validationMode: zod_1.z.enum(['strict', 'warn', 'none']),
        schemaRegistry: zod_1.z.string().url().optional(),
        enableSchemaEvolution: zod_1.z.boolean(),
        versioning: zod_1.z.enum(['semantic', 'numeric']).optional()
    }),
    // Replay configuration
    Replay: zod_1.z.object({
        enabled: zod_1.z.boolean(),
        maxReplaySize: zod_1.z.number().int().min(1).max(1000000),
        enableSelectiveReplay: zod_1.z.boolean(),
        replayStrategies: zod_1.z.array(zod_1.z.enum(['from-timestamp', 'from-sequence', 'from-checkpoint'])).optional()
    }),
    // DLQ configuration
    DLQ: zod_1.z.object({
        enabled: zod_1.z.boolean(),
        streamPrefix: zod_1.z.string().min(1),
        maxRetries: zod_1.z.number().int().min(0).max(10),
        retryDelay: zod_1.z.number().int().min(100).max(30000),
        maxRetriesBeforeDLQ: zod_1.z.number().int().min(0).max(10),
        retention: zod_1.z.number().int().min(60000).max(31536000000), // 1 minute to 1 year
        classification: zod_1.z.object({
            enabled: zod_1.z.boolean(),
            errorTypes: zod_1.z.array(zod_1.z.string()).min(1)
        }).optional(),
        poisonMessageHandler: zod_1.z.any().optional() // Function type
    }),
    // Advanced routing configuration
    AdvancedRouting: zod_1.z.object({
        enablePatternRouting: zod_1.z.boolean(),
        enableContentBasedRouting: zod_1.z.boolean(),
        enableConditionalRouting: zod_1.z.boolean(),
        routingRules: zod_1.z.array(zod_1.z.object({
            condition: zod_1.z.any().optional(), // Function type
            target: zod_1.z.string().min(1),
            priority: zod_1.z.number().int().min(1).max(100)
        })).optional()
    }),
    // Main configuration schema
    Main: zod_1.z.object({
        service: zod_1.z.string().min(1),
        originPrefix: zod_1.z.string().optional(),
        origins: zod_1.z.array(zod_1.z.string()).optional(),
        validationMode: zod_1.z.enum(['strict', 'warn', 'ignore']).optional(),
        global: zod_1.z.boolean().optional(),
        autoDiscovery: zod_1.z.boolean().optional(),
        // Publisher configuration
        publisher: zod_1.z.object({
            batching: zod_1.z.object({
                enabled: zod_1.z.boolean(),
                maxSize: zod_1.z.number().int().min(1).max(100000),
                maxWaitMs: zod_1.z.number().int().min(1).max(60000),
                maxConcurrentBatches: zod_1.z.number().int().min(1).max(100),
                strategy: zod_1.z.enum(['size', 'time', 'partition']),
                compression: zod_1.z.boolean().optional()
            }).optional(),
            retry: zod_1.z.object({
                maxRetries: zod_1.z.number().int().min(0).max(10),
                backoffStrategy: zod_1.z.enum(['exponential', 'fixed', 'fibonacci']),
                baseDelay: zod_1.z.number().int().min(100).max(30000),
                maxDelay: zod_1.z.number().int().min(1000).max(60000)
            }).optional(),
            rateLimiting: zod_1.z.object({
                maxRequests: zod_1.z.number().int().min(1).max(100000),
                timeWindow: zod_1.z.number().int().min(1000).max(3600000),
                strategy: zod_1.z.enum(['sliding-window', 'token-bucket'])
            }).optional()
        }).optional(),
        // Consumer configuration
        consumer: zod_1.z.object({
            enablePatternRouting: zod_1.z.boolean().optional(),
            enableConsumerGroups: zod_1.z.boolean().optional(),
            validationMode: zod_1.z.enum(['strict', 'warn', 'ignore']).optional()
        }).optional(),
        // Discovery configuration
        discovery: zod_1.z.object({
            scanControllers: zod_1.z.boolean().optional(),
            scanProviders: zod_1.z.boolean().optional(),
            metadataKeys: zod_1.z.array(zod_1.z.string()).optional()
        }).optional(),
        // Interceptor configuration
        interceptor: zod_1.z.object({
            enableRequestEvents: zod_1.z.boolean().optional(),
            enableResponseEvents: zod_1.z.boolean().optional(),
            correlationIdHeader: zod_1.z.string().optional(),
            causationIdHeader: zod_1.z.string().optional()
        }).optional(),
        // Advanced features
        redisCluster: zod_1.z.any().optional(),
        redisSentinel: zod_1.z.any().optional(),
        partitioning: zod_1.z.any().optional(),
        ordering: zod_1.z.any().optional(),
        schema: zod_1.z.any().optional(),
        replay: zod_1.z.any().optional(),
        dlq: zod_1.z.any().optional(),
        advancedRouting: zod_1.z.any().optional(),
        // Core library configurations
        routing: zod_1.z.any().optional(),
        transports: zod_1.z.any().optional()
    })
};
/**
 * Configuration validator using Zod schemas
 */
class ConfigValidator {
    /**
     * Validate all configuration options
     */
    static validateAll(config) {
        try {
            const validated = exports.ConfigSchemas.Main.parse(config);
            return validated;
        }
        catch (error) {
            if (error instanceof zod_1.z.ZodError) {
                const errors = error.issues.map(issue => `${issue.path.join('.')}: ${issue.message}`);
                throw new Error(`Configuration validation failed:\n${errors.join('\n')}`);
            }
            throw error;
        }
    }
    /**
     * Validate main configuration
     */
    static validateMainConfig(config) {
        return this.validateAll(config);
    }
    /**
     * Validate Redis cluster configuration
     */
    static validateRedisCluster(config) {
        try {
            return exports.ConfigSchemas.RedisCluster.parse(config);
        }
        catch (error) {
            if (error instanceof zod_1.z.ZodError) {
                const errors = error.issues.map(issue => `${issue.path.join('.')}: ${issue.message}`);
                throw new Error(`Redis cluster configuration validation failed:\n${errors.join('\n')}`);
            }
            throw error;
        }
    }
    /**
     * Validate Redis sentinel configuration
     */
    static validateRedisSentinel(config) {
        try {
            return exports.ConfigSchemas.RedisSentinel.parse(config);
        }
        catch (error) {
            if (error instanceof zod_1.z.ZodError) {
                const errors = error.issues.map(issue => `${issue.path.join('.')}: ${issue.message}`);
                throw new Error(`Redis sentinel configuration validation failed:\n${errors.join('\n')}`);
            }
            throw error;
        }
    }
    /**
     * Validate partitioning configuration
     */
    static validatePartitioning(config) {
        try {
            return exports.ConfigSchemas.Partitioning.parse(config);
        }
        catch (error) {
            if (error instanceof zod_1.z.ZodError) {
                const errors = error.issues.map(issue => `${issue.path.join('.')}: ${issue.message}`);
                throw new Error(`Partitioning configuration validation failed:\n${errors.join('\n')}`);
            }
            throw error;
        }
    }
    /**
     * Validate ordering configuration
     */
    static validateOrdering(config) {
        try {
            return exports.ConfigSchemas.Ordering.parse(config);
        }
        catch (error) {
            if (error instanceof zod_1.z.ZodError) {
                const errors = error.issues.map(issue => `${issue.path.join('.')}: ${issue.message}`);
                throw new Error(`Ordering configuration validation failed:\n${errors.join('\n')}`);
            }
            throw error;
        }
    }
    /**
     * Validate schema configuration
     */
    static validateSchema(config) {
        try {
            return exports.ConfigSchemas.Schema.parse(config);
        }
        catch (error) {
            if (error instanceof zod_1.z.ZodError) {
                const errors = error.issues.map(issue => `${issue.path.join('.')}: ${issue.message}`);
                throw new Error(`Schema configuration validation failed:\n${errors.join('\n')}`);
            }
            throw error;
        }
    }
    /**
     * Validate replay configuration
     */
    static validateReplay(config) {
        try {
            return exports.ConfigSchemas.Replay.parse(config);
        }
        catch (error) {
            if (error instanceof zod_1.z.ZodError) {
                const errors = error.issues.map(issue => `${issue.path.join('.')}: ${issue.message}`);
                throw new Error(`Replay configuration validation failed:\n${errors.join('\n')}`);
            }
            throw error;
        }
    }
    /**
     * Validate DLQ configuration
     */
    static validateDLQ(config) {
        try {
            return exports.ConfigSchemas.DLQ.parse(config);
        }
        catch (error) {
            if (error instanceof zod_1.z.ZodError) {
                const errors = error.issues.map(issue => `${issue.path.join('.')}: ${issue.message}`);
                throw new Error(`DLQ configuration validation failed:\n${errors.join('\n')}`);
            }
            throw error;
        }
    }
    /**
     * Validate advanced routing configuration
     */
    static validateAdvancedRouting(config) {
        try {
            return exports.ConfigSchemas.AdvancedRouting.parse(config);
        }
        catch (error) {
            if (error instanceof zod_1.z.ZodError) {
                const errors = error.issues.map(issue => `${issue.path.join('.')}: ${issue.message}`);
                throw new Error(`Advanced routing configuration validation failed:\n${errors.join('\n')}`);
            }
            throw error;
        }
    }
}
exports.ConfigValidator = ConfigValidator;
