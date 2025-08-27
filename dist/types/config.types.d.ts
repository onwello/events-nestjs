import { EventSystemConfig } from '@logistically/events';
export interface RedisClusterConfig {
    clusterNodes: Array<{
        host: string;
        port: number;
    }>;
    enableFailover: boolean;
    failoverRecovery?: {
        enabled: boolean;
        maxRetries: number;
        retryDelay: number;
    };
}
export interface RedisSentinelConfig {
    sentinels: Array<{
        host: string;
        port: number;
    }>;
    sentinelName: string;
    connectionTimeout?: number;
    commandTimeout?: number;
}
export interface PartitioningConfig {
    enabled: boolean;
    strategy: 'hash' | 'roundRobin' | 'keyBased' | 'dynamic';
    autoScaling: boolean;
    partitionKeyExtractor?: (message: any) => string;
    partitionCount: number;
}
export interface OrderingConfig {
    enabled: boolean;
    strategy: 'partition' | 'global';
    enableCausalDependencies: boolean;
}
export interface SchemaConfig {
    enabled: boolean;
    validationMode: 'strict' | 'warn' | 'none';
    schemaRegistry?: string;
    enableSchemaEvolution: boolean;
    versioning?: 'semantic' | 'numeric';
}
export interface ReplayConfig {
    enabled: boolean;
    maxReplaySize: number;
    enableSelectiveReplay: boolean;
    replayStrategies?: Array<'from-timestamp' | 'from-sequence' | 'from-checkpoint'>;
}
export interface DLQConfig {
    enabled: boolean;
    streamPrefix: string;
    maxRetries: number;
    retryDelay: number;
    maxRetriesBeforeDLQ: number;
    retention: number;
    classification?: {
        enabled: boolean;
        errorTypes: string[];
    };
    poisonMessageHandler?: (message: any, error: any) => Promise<void>;
}
export interface AdvancedRoutingConfig {
    enablePatternRouting: boolean;
    enableContentBasedRouting: boolean;
    enableConditionalRouting: boolean;
    routingRules?: Array<{
        condition: (event: any) => boolean;
        target: string;
        priority: number;
    }>;
}
export interface NestJSEventsModuleOptions extends EventSystemConfig {
    /**
     * Whether to make the module global
     */
    global?: boolean;
    /**
     * Whether to automatically discover and register event handlers
     */
    autoDiscovery?: boolean;
    /**
     * Redis Cluster configuration for high availability
     */
    redisCluster?: RedisClusterConfig;
    /**
     * Redis Sentinel configuration for high availability
     */
    redisSentinel?: RedisSentinelConfig;
    /**
     * Advanced partitioning configuration
     */
    partitioning?: PartitioningConfig;
    /**
     * Message ordering configuration
     */
    ordering?: OrderingConfig;
    /**
     * Schema management configuration
     */
    schema?: SchemaConfig;
    /**
     * Message replay configuration
     */
    replay?: ReplayConfig;
    /**
     * Advanced DLQ configuration
     */
    dlq?: DLQConfig;
    /**
     * Advanced routing configuration (separate from core routing)
     */
    advancedRouting?: AdvancedRoutingConfig;
    /**
     * Custom event handler discovery options
     */
    discovery?: {
        /**
         * Whether to scan controllers for event handlers
         */
        scanControllers?: boolean;
        /**
         * Whether to scan providers for event handlers
         */
        scanProviders?: boolean;
        /**
         * Custom metadata keys to scan for
         */
        metadataKeys?: string[];
    };
    /**
     * Event interceptor options
     */
    interceptor?: {
        /**
         * Whether to enable automatic event publishing for HTTP requests
         */
        enableRequestEvents?: boolean;
        /**
         * Whether to enable automatic event publishing for HTTP responses
         */
        enableResponseEvents?: boolean;
        /**
         * Custom correlation ID header name
         */
        correlationIdHeader?: string;
        /**
         * Custom causation ID header name
         */
        causationIdHeader?: string;
    };
}
export interface NestJSEventHandlerOptions {
    /**
     * The event type to handle
     */
    eventType: string;
    /**
     * Priority for this handler (lower numbers = higher priority)
     */
    priority?: number;
    /**
     * Whether to handle events asynchronously
     */
    async?: boolean;
    /**
     * Retry configuration for failed event handling
     */
    retry?: {
        maxAttempts: number;
        backoffMs: number;
    };
    /**
     * Custom metadata for the handler
     */
    metadata?: Record<string, any>;
}
export interface NestJSEventPublisherOptions {
    /**
     * The event type to publish
     */
    eventType: string;
    /**
     * Whether to wait for the event to be published
     */
    waitForPublish?: boolean;
    /**
     * Custom publish options
     */
    publishOptions?: {
        /**
         * Custom origin for the event
         */
        origin?: string;
        /**
         * Custom timestamp for the event
         */
        timestamp?: Date;
        /**
         * Custom correlation ID
         */
        correlationId?: string;
        /**
         * Custom causation ID
         */
        causationId?: string;
    };
}
export interface NestJSEventSubscriberOptions {
    /**
     * The event type to subscribe to
     */
    eventType: string;
    /**
     * Custom subscription options
     */
    subscriptionOptions?: {
        /**
         * Custom consumer group ID
         */
        groupId?: string;
        /**
         * Custom consumer ID
         */
        consumerId?: string;
        /**
         * Whether to enable pattern matching
         */
        pattern?: boolean;
    };
}
