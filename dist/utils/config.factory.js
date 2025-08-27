"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ConfigFactory = void 0;
const config_validator_1 = require("./config.validator");
/**
 * Factory class for creating NestJS events module options
 * with support for environment variables and sensible defaults
 */
class ConfigFactory {
    /**
     * Create configuration from environment variables with defaults
     */
    static fromEnvironment() {
        return {
            service: process.env.SERVICE_NAME,
            originPrefix: process.env.EVENTS_ORIGIN_PREFIX,
            validationMode: process.env.EVENTS_VALIDATION_MODE || 'warn',
            global: process.env.EVENTS_GLOBAL !== 'false',
            autoDiscovery: process.env.EVENTS_AUTO_DISCOVERY !== 'false',
            // Publisher configuration
            publisher: {
                batching: {
                    enabled: process.env.EVENTS_BATCHING_ENABLED !== 'false',
                    maxSize: parseInt(process.env.EVENTS_BATCHING_MAX_SIZE || '1000'),
                    maxWaitMs: parseInt(process.env.EVENTS_BATCHING_MAX_WAIT_MS || '100'),
                    maxConcurrentBatches: parseInt(process.env.EVENTS_BATCHING_MAX_CONCURRENT || '5'),
                    strategy: process.env.EVENTS_BATCHING_STRATEGY || 'size',
                },
                retry: {
                    maxRetries: parseInt(process.env.EVENTS_RETRY_MAX_ATTEMPTS || '3'),
                    backoffStrategy: process.env.EVENTS_RETRY_BACKOFF_STRATEGY || 'exponential',
                    baseDelay: parseInt(process.env.EVENTS_RETRY_BASE_DELAY || '1000'),
                    maxDelay: parseInt(process.env.EVENTS_RETRY_MAX_DELAY || '10000'),
                },
                rateLimiting: {
                    maxRequests: parseInt(process.env.EVENTS_RATE_LIMITING_MAX_RPS || '1000'),
                    timeWindow: parseInt(process.env.EVENTS_RATE_LIMITING_TIME_WINDOW || '60000'),
                    strategy: process.env.EVENTS_RATE_LIMITING_STRATEGY || 'sliding-window',
                },
            },
            // Consumer configuration
            consumer: {
                enablePatternRouting: process.env.EVENTS_PATTERN_ROUTING === 'true',
                enableConsumerGroups: process.env.EVENTS_CONSUMER_GROUPS !== 'false',
                validationMode: process.env.EVENTS_CONSUMER_VALIDATION_MODE || 'warn',
            },
            // Discovery configuration
            discovery: {
                scanControllers: process.env.EVENTS_SCAN_CONTROLLERS !== 'false',
                scanProviders: process.env.EVENTS_SCAN_PROVIDERS !== 'false',
                metadataKeys: process.env.EVENTS_METADATA_KEYS?.split(','),
            },
            // Interceptor configuration
            interceptor: {
                enableRequestEvents: process.env.EVENTS_REQUEST_EVENTS === 'true',
                enableResponseEvents: process.env.EVENTS_RESPONSE_EVENTS === 'true',
                correlationIdHeader: process.env.EVENTS_CORRELATION_ID_HEADER || 'X-Correlation-ID',
                causationIdHeader: process.env.EVENTS_CAUSATION_ID_HEADER || 'X-Causation-ID',
            },
            // Advanced Redis Cluster configuration
            redisCluster: process.env.REDIS_ENABLE_CLUSTER_MODE === 'true' ? {
                clusterNodes: this.parseClusterNodes(process.env.REDIS_CLUSTER_NODES),
                enableFailover: process.env.REDIS_ENABLE_FAILOVER !== 'false',
                failoverRecovery: {
                    enabled: process.env.REDIS_FAILOVER_RECOVERY_ENABLED !== 'false',
                    maxRetries: parseInt(process.env.REDIS_FAILOVER_MAX_RETRIES || '3'),
                    retryDelay: parseInt(process.env.REDIS_FAILOVER_RETRY_DELAY || '1000'),
                }
            } : undefined,
            // Advanced Redis Sentinel configuration
            redisSentinel: process.env.REDIS_ENABLE_SENTINEL_MODE === 'true' ? {
                sentinels: this.parseSentinelNodes(process.env.REDIS_SENTINEL_NODES),
                sentinelName: process.env.REDIS_SENTINEL_NAME || 'mymaster',
                connectionTimeout: parseInt(process.env.REDIS_SENTINEL_CONNECTION_TIMEOUT || '5000'),
                commandTimeout: parseInt(process.env.REDIS_SENTINEL_COMMAND_TIMEOUT || '3000'),
            } : undefined,
            // Advanced partitioning configuration
            partitioning: process.env.REDIS_ENABLE_PARTITIONING === 'true' ? {
                enabled: true,
                strategy: process.env.REDIS_PARTITIONING_STRATEGY || 'hash',
                autoScaling: process.env.REDIS_PARTITIONING_AUTO_SCALING !== 'false',
                partitionCount: parseInt(process.env.REDIS_PARTITION_COUNT || '8'),
            } : undefined,
            // Message ordering configuration
            ordering: process.env.REDIS_ENABLE_ORDERING === 'true' ? {
                enabled: true,
                strategy: process.env.REDIS_ORDERING_STRATEGY || 'partition',
                enableCausalDependencies: process.env.REDIS_ENABLE_CAUSAL_DEPENDENCIES !== 'false',
            } : undefined,
            // Schema management configuration
            schema: process.env.REDIS_ENABLE_SCHEMA_MANAGEMENT === 'true' ? {
                enabled: true,
                validationMode: process.env.REDIS_SCHEMA_VALIDATION_MODE || 'strict',
                schemaRegistry: process.env.REDIS_SCHEMA_REGISTRY,
                enableSchemaEvolution: process.env.REDIS_SCHEMA_EVOLUTION !== 'false',
                versioning: process.env.REDIS_SCHEMA_VERSIONING || 'semantic',
            } : undefined,
            // Message replay configuration
            replay: process.env.REDIS_ENABLE_MESSAGE_REPLAY === 'true' ? {
                enabled: true,
                maxReplaySize: parseInt(process.env.REDIS_REPLAY_MAX_SIZE || '10000'),
                enableSelectiveReplay: process.env.REDIS_REPLAY_SELECTIVE !== 'false',
                replayStrategies: process.env.REDIS_REPLAY_STRATEGIES?.split(','),
            } : undefined,
            // Advanced DLQ configuration
            dlq: process.env.REDIS_ENABLE_DLQ === 'true' ? {
                enabled: true,
                streamPrefix: process.env.REDIS_DLQ_STREAM_PREFIX || 'dlq:',
                maxRetries: parseInt(process.env.REDIS_MAX_RETRIES || '3'),
                retryDelay: parseInt(process.env.REDIS_RETRY_DELAY || '1000'),
                maxRetriesBeforeDLQ: parseInt(process.env.REDIS_MAX_RETRIES_BEFORE_DLQ || '3'),
                retention: parseInt(process.env.REDIS_DLQ_RETENTION || '86400000'), // 24 hours
                classification: {
                    enabled: process.env.REDIS_DLQ_CLASSIFICATION === 'true',
                    errorTypes: process.env.REDIS_DLQ_ERROR_TYPES?.split(',') || ['validation', 'processing', 'timeout'],
                },
            } : undefined,
            // Advanced routing configuration
            advancedRouting: {
                enablePatternRouting: process.env.EVENTS_PATTERN_ROUTING === 'true',
                enableContentBasedRouting: process.env.EVENTS_CONTENT_BASED_ROUTING === 'true',
                enableConditionalRouting: process.env.EVENTS_CONDITIONAL_ROUTING === 'true',
            },
        };
    }
    /**
     * Parse cluster nodes from environment variable
     */
    static parseClusterNodes(nodesStr) {
        if (!nodesStr)
            return [];
        return nodesStr.split(',').map(node => {
            const [host, port] = node.trim().split(':');
            return {
                host: host.trim(),
                port: parseInt(port.trim()) || 7000
            };
        });
    }
    /**
     * Parse sentinel nodes from environment variable
     */
    static parseSentinelNodes(nodesStr) {
        if (!nodesStr)
            return [];
        return nodesStr.split(',').map(node => {
            const [host, port] = node.trim().split(':');
            return {
                host: host.trim(),
                port: parseInt(port.trim()) || 26379
            };
        });
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
            partitionCount: parseInt(process.env.REDIS_PARTITION_COUNT || '8'),
            // Advanced features
            enableOrdering: process.env.REDIS_ENABLE_ORDERING === 'true',
            enableSchemaManagement: process.env.REDIS_ENABLE_SCHEMA_MANAGEMENT === 'true',
            enableMessageReplay: process.env.REDIS_ENABLE_MESSAGE_REPLAY === 'true',
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
    static mergeWithDefaults(userConfig) {
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
            // Advanced features
            redisCluster: userConfig.redisCluster || envConfig.redisCluster,
            redisSentinel: userConfig.redisSentinel || envConfig.redisSentinel,
            partitioning: userConfig.partitioning || envConfig.partitioning,
            ordering: userConfig.ordering || envConfig.ordering,
            schema: userConfig.schema || envConfig.schema,
            replay: userConfig.replay || envConfig.replay,
            dlq: userConfig.dlq || envConfig.dlq,
            advancedRouting: userConfig.advancedRouting || envConfig.advancedRouting,
        };
        // Validate the merged configuration
        const validatedConfig = config_validator_1.ConfigValidator.validateAll(mergedConfig);
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
        };
    }
}
exports.ConfigFactory = ConfigFactory;
