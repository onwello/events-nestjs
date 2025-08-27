import { z } from 'zod';
import { NestJSEventsModuleOptions } from '../types/config.types';
/**
 * Zod schemas for configuration validation
 */
export declare const ConfigSchemas: {
    RedisCluster: z.ZodObject<{
        clusterNodes: z.ZodArray<z.ZodObject<{
            host: z.ZodString;
            port: z.ZodNumber;
        }, z.core.$strip>>;
        enableFailover: z.ZodBoolean;
        failoverRecovery: z.ZodOptional<z.ZodObject<{
            enabled: z.ZodBoolean;
            maxRetries: z.ZodNumber;
            retryDelay: z.ZodNumber;
        }, z.core.$strip>>;
    }, z.core.$strip>;
    RedisSentinel: z.ZodObject<{
        sentinels: z.ZodArray<z.ZodObject<{
            host: z.ZodString;
            port: z.ZodNumber;
        }, z.core.$strip>>;
        sentinelName: z.ZodString;
        connectionTimeout: z.ZodOptional<z.ZodNumber>;
        commandTimeout: z.ZodOptional<z.ZodNumber>;
    }, z.core.$strip>;
    Partitioning: z.ZodObject<{
        enabled: z.ZodBoolean;
        strategy: z.ZodEnum<{
            hash: "hash";
            roundRobin: "roundRobin";
            keyBased: "keyBased";
            dynamic: "dynamic";
        }>;
        autoScaling: z.ZodBoolean;
        partitionKeyExtractor: z.ZodOptional<z.ZodAny>;
        partitionCount: z.ZodNumber;
    }, z.core.$strip>;
    Ordering: z.ZodObject<{
        enabled: z.ZodBoolean;
        strategy: z.ZodEnum<{
            partition: "partition";
            global: "global";
        }>;
        enableCausalDependencies: z.ZodBoolean;
    }, z.core.$strip>;
    Schema: z.ZodObject<{
        enabled: z.ZodBoolean;
        validationMode: z.ZodEnum<{
            strict: "strict";
            warn: "warn";
            none: "none";
        }>;
        schemaRegistry: z.ZodOptional<z.ZodString>;
        enableSchemaEvolution: z.ZodBoolean;
        versioning: z.ZodOptional<z.ZodEnum<{
            semantic: "semantic";
            numeric: "numeric";
        }>>;
    }, z.core.$strip>;
    Replay: z.ZodObject<{
        enabled: z.ZodBoolean;
        maxReplaySize: z.ZodNumber;
        enableSelectiveReplay: z.ZodBoolean;
        replayStrategies: z.ZodOptional<z.ZodArray<z.ZodEnum<{
            "from-timestamp": "from-timestamp";
            "from-sequence": "from-sequence";
            "from-checkpoint": "from-checkpoint";
        }>>>;
    }, z.core.$strip>;
    DLQ: z.ZodObject<{
        enabled: z.ZodBoolean;
        streamPrefix: z.ZodString;
        maxRetries: z.ZodNumber;
        retryDelay: z.ZodNumber;
        maxRetriesBeforeDLQ: z.ZodNumber;
        retention: z.ZodNumber;
        classification: z.ZodOptional<z.ZodObject<{
            enabled: z.ZodBoolean;
            errorTypes: z.ZodArray<z.ZodString>;
        }, z.core.$strip>>;
        poisonMessageHandler: z.ZodOptional<z.ZodAny>;
    }, z.core.$strip>;
    AdvancedRouting: z.ZodObject<{
        enablePatternRouting: z.ZodBoolean;
        enableContentBasedRouting: z.ZodBoolean;
        enableConditionalRouting: z.ZodBoolean;
        routingRules: z.ZodOptional<z.ZodArray<z.ZodObject<{
            condition: z.ZodOptional<z.ZodAny>;
            target: z.ZodString;
            priority: z.ZodNumber;
        }, z.core.$strip>>>;
    }, z.core.$strip>;
    Main: z.ZodObject<{
        service: z.ZodString;
        originPrefix: z.ZodOptional<z.ZodString>;
        origins: z.ZodOptional<z.ZodArray<z.ZodString>>;
        validationMode: z.ZodOptional<z.ZodEnum<{
            strict: "strict";
            warn: "warn";
            ignore: "ignore";
        }>>;
        global: z.ZodOptional<z.ZodBoolean>;
        autoDiscovery: z.ZodOptional<z.ZodBoolean>;
        publisher: z.ZodOptional<z.ZodObject<{
            batching: z.ZodOptional<z.ZodObject<{
                enabled: z.ZodBoolean;
                maxSize: z.ZodNumber;
                maxWaitMs: z.ZodNumber;
                maxConcurrentBatches: z.ZodNumber;
                strategy: z.ZodEnum<{
                    partition: "partition";
                    size: "size";
                    time: "time";
                }>;
                compression: z.ZodOptional<z.ZodBoolean>;
            }, z.core.$strip>>;
            retry: z.ZodOptional<z.ZodObject<{
                maxRetries: z.ZodNumber;
                backoffStrategy: z.ZodEnum<{
                    exponential: "exponential";
                    fixed: "fixed";
                    fibonacci: "fibonacci";
                }>;
                baseDelay: z.ZodNumber;
                maxDelay: z.ZodNumber;
            }, z.core.$strip>>;
            rateLimiting: z.ZodOptional<z.ZodObject<{
                maxRequests: z.ZodNumber;
                timeWindow: z.ZodNumber;
                strategy: z.ZodEnum<{
                    "sliding-window": "sliding-window";
                    "token-bucket": "token-bucket";
                }>;
            }, z.core.$strip>>;
        }, z.core.$strip>>;
        consumer: z.ZodOptional<z.ZodObject<{
            enablePatternRouting: z.ZodOptional<z.ZodBoolean>;
            enableConsumerGroups: z.ZodOptional<z.ZodBoolean>;
            validationMode: z.ZodOptional<z.ZodEnum<{
                strict: "strict";
                warn: "warn";
                ignore: "ignore";
            }>>;
        }, z.core.$strip>>;
        discovery: z.ZodOptional<z.ZodObject<{
            scanControllers: z.ZodOptional<z.ZodBoolean>;
            scanProviders: z.ZodOptional<z.ZodBoolean>;
            metadataKeys: z.ZodOptional<z.ZodArray<z.ZodString>>;
        }, z.core.$strip>>;
        interceptor: z.ZodOptional<z.ZodObject<{
            enableRequestEvents: z.ZodOptional<z.ZodBoolean>;
            enableResponseEvents: z.ZodOptional<z.ZodBoolean>;
            correlationIdHeader: z.ZodOptional<z.ZodString>;
            causationIdHeader: z.ZodOptional<z.ZodString>;
        }, z.core.$strip>>;
        redisCluster: z.ZodOptional<z.ZodAny>;
        redisSentinel: z.ZodOptional<z.ZodAny>;
        partitioning: z.ZodOptional<z.ZodAny>;
        ordering: z.ZodOptional<z.ZodAny>;
        schema: z.ZodOptional<z.ZodAny>;
        replay: z.ZodOptional<z.ZodAny>;
        dlq: z.ZodOptional<z.ZodAny>;
        advancedRouting: z.ZodOptional<z.ZodAny>;
        routing: z.ZodOptional<z.ZodAny>;
        transports: z.ZodOptional<z.ZodAny>;
    }, z.core.$strip>;
};
/**
 * Configuration validator using Zod schemas
 */
export declare class ConfigValidator {
    /**
     * Validate all configuration options
     */
    static validateAll(config: any): Partial<NestJSEventsModuleOptions>;
    /**
     * Validate main configuration
     */
    static validateMainConfig(config: any): Partial<NestJSEventsModuleOptions>;
    /**
     * Validate Redis cluster configuration
     */
    static validateRedisCluster(config: any): any;
    /**
     * Validate Redis sentinel configuration
     */
    static validateRedisSentinel(config: any): any;
    /**
     * Validate partitioning configuration
     */
    static validatePartitioning(config: any): any;
    /**
     * Validate ordering configuration
     */
    static validateOrdering(config: any): any;
    /**
     * Validate schema configuration
     */
    static validateSchema(config: any): any;
    /**
     * Validate replay configuration
     */
    static validateReplay(config: any): any;
    /**
     * Validate DLQ configuration
     */
    static validateDLQ(config: any): any;
    /**
     * Validate advanced routing configuration
     */
    static validateAdvancedRouting(config: any): any;
}
