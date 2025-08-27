import { OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { EventSystem } from '@logistically/events/dist/event-system-builder';
import { NestJSEventsModuleOptions, RedisClusterConfig, RedisSentinelConfig, PartitioningConfig, OrderingConfig, SchemaConfig, ReplayConfig, DLQConfig, AdvancedRoutingConfig } from '../types/config.types';
export declare class EventSystemService implements OnModuleInit, OnModuleDestroy {
    private readonly logger;
    private eventSystem;
    private readonly config;
    constructor(config: NestJSEventsModuleOptions);
    onModuleInit(): Promise<void>;
    /**
     * Validate the configuration before initializing the event system
     */
    private validateConfiguration;
    /**
     * Validate advanced configuration options
     */
    private validateAdvancedConfigurations;
    onModuleDestroy(): Promise<void>;
    private initializeEventSystem;
    /**
     * Check if a transport is a Redis transport
     */
    private isRedisTransport;
    /**
     * Apply advanced Redis configurations to the transport
     */
    private applyAdvancedRedisConfig;
    /**
     * Apply partitioning configuration to Redis transport
     */
    private applyPartitioningConfig;
    /**
     * Apply ordering configuration to Redis transport
     */
    private applyOrderingConfig;
    /**
     * Apply schema configuration to Redis transport
     */
    private applySchemaConfig;
    /**
     * Apply replay configuration to Redis transport
     */
    private applyReplayConfig;
    /**
     * Apply advanced DLQ configuration to Redis transport
     */
    private applyDLQConfig;
    getEventSystem(): EventSystem;
    getStatus(): Promise<import("@logistically/events/dist/event-system-builder").EventSystemStatus | {
        connected: boolean;
        healthy: boolean;
        error: string;
    }>;
    isConnected(): boolean;
    /**
     * Get the service name from configuration
     */
    getServiceName(): string;
    /**
     * Get the origin prefix from configuration
     */
    getOriginPrefix(): string | undefined;
    /**
     * Get advanced configuration options
     */
    getAdvancedConfig(): {
        redisCluster: RedisClusterConfig | undefined;
        redisSentinel: RedisSentinelConfig | undefined;
        partitioning: PartitioningConfig | undefined;
        ordering: OrderingConfig | undefined;
        schema: SchemaConfig | undefined;
        replay: ReplayConfig | undefined;
        dlq: DLQConfig | undefined;
        advancedRouting: AdvancedRoutingConfig | undefined;
    };
    /**
     * Check if advanced features are enabled
     */
    hasAdvancedFeatures(): boolean;
}
