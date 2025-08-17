import { Injectable, Logger, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { 
  createEventSystemBuilder,
  EventSystemConfig 
} from '@logistically/events';
import { EventSystem } from '@logistically/events/dist/event-system-builder';
import { 
  NestJSEventsModuleOptions,
  RedisClusterConfig,
  RedisSentinelConfig,
  PartitioningConfig,
  OrderingConfig,
  SchemaConfig,
  ReplayConfig,
  DLQConfig,
  AdvancedRoutingConfig
} from '../types/config.types';

@Injectable()
export class EventSystemService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(EventSystemService.name);
  private eventSystem: EventSystem | null = null;
  private readonly config: NestJSEventsModuleOptions;

  constructor(config: NestJSEventsModuleOptions) {
    this.config = config;
  }

  async onModuleInit() {
    try {
      this.validateConfiguration();
      await this.initializeEventSystem();
      this.logger.log('Event system initialized successfully');
    } catch (error) {
      this.logger.error('Failed to initialize event system:', error);
      throw error;
    }
  }

  /**
   * Validate the configuration before initializing the event system
   */
  private validateConfiguration(): void {
    if (!this.config.service || this.config.service.trim() === '') {
      throw new Error('Service name is required in configuration');
    }

    if (!this.config.transports || this.config.transports.size === 0) {
      throw new Error('At least one transport must be configured');
    }

    // Validate transport configurations
    for (const [name, transport] of this.config.transports) {
      if (!transport) {
        throw new Error(`Transport '${name}' is null or undefined`);
      }
    }

    // Validate advanced configurations
    this.validateAdvancedConfigurations();

    this.logger.debug('Configuration validation passed');
  }

  /**
   * Validate advanced configuration options
   */
  private validateAdvancedConfigurations(): void {
    // Validate Redis Cluster configuration
    if (this.config.redisCluster) {
      if (!this.config.redisCluster.clusterNodes || this.config.redisCluster.clusterNodes.length === 0) {
        throw new Error('Redis cluster must have at least one node');
      }
    }

    // Validate Redis Sentinel configuration
    if (this.config.redisSentinel) {
      if (!this.config.redisSentinel.sentinels || this.config.redisSentinel.sentinels.length === 0) {
        throw new Error('Redis sentinel must have at least one sentinel node');
      }
    }

    // Validate partitioning configuration
    if (this.config.partitioning) {
      if (this.config.partitioning.partitionCount < 1) {
        throw new Error('Partition count must be at least 1');
      }
      if (!['hash', 'roundRobin', 'keyBased', 'dynamic'].includes(this.config.partitioning.strategy)) {
        throw new Error('Invalid partitioning strategy');
      }
    }

    // Validate ordering configuration
    if (this.config.ordering?.enabled) {
      if (!['partition', 'global'].includes(this.config.ordering.strategy)) {
        throw new Error('Invalid ordering strategy');
      }
    }

    // Validate schema configuration
    if (this.config.schema?.enabled) {
      if (!['strict', 'warn', 'none'].includes(this.config.schema.validationMode)) {
        throw new Error('Invalid schema validation mode');
      }
    }

    // Validate replay configuration
    if (this.config.replay?.enabled) {
      if (this.config.replay.maxReplaySize < 1) {
        throw new Error('Replay max size must be at least 1');
      }
    }
  }

  async onModuleDestroy() {
    try {
      if (this.eventSystem) {
        await this.eventSystem.close();
        this.logger.log('Event system closed successfully');
      }
    } catch (error) {
      this.logger.error('Failed to close event system:', error);
    }
  }

  private async initializeEventSystem() {
    const builder = createEventSystemBuilder()
      .service(this.config.service);

    // Set origin prefix if provided
    if (this.config.originPrefix) {
      builder.originPrefix(this.config.originPrefix);
    }

    // Set origins if provided
    if (this.config.origins && this.config.origins.length > 0) {
      builder.origins(this.config.origins);
    }

    // Add transports with advanced configurations
    if (this.config.transports) {
      for (const [name, transport] of this.config.transports) {
        // Apply advanced configurations to Redis transports
        if (name === 'redis' && this.isRedisTransport(transport)) {
          this.applyAdvancedRedisConfig(transport);
        }
        builder.addTransport(name, transport);
      }
    }

    // Set routing if provided
    if (this.config.routing) {
      builder.routing(this.config.routing);
    }

    // Enable publisher batching if configured
    if (this.config.publisher?.batching) {
      builder.enablePublisherBatching(this.config.publisher.batching);
    }

    // Enable publisher retry if configured
    if (this.config.publisher?.retry) {
      builder.enablePublisherRetry(this.config.publisher.retry);
    }

    // Enable consumer pattern routing if configured
    if (this.config.consumer?.enablePatternRouting) {
      builder.enableConsumerPatternRouting();
    }

    // Enable consumer groups if configured
    if (this.config.consumer?.enableConsumerGroups) {
      builder.enableConsumerGroups();
    }

    // Set validation mode
    if (this.config.validationMode) {
      builder.setValidationMode(this.config.validationMode);
    }

    this.eventSystem = builder.build();
    await this.eventSystem.connect();
  }

  /**
   * Check if a transport is a Redis transport
   */
  private isRedisTransport(transport: any): boolean {
    return transport && (
      transport.name === 'redis-streams' ||
      transport.constructor.name === 'RedisStreamsTransport' ||
      transport.constructor.name === 'EnhancedRedisStreamsTransport'
    );
  }

  /**
   * Apply advanced Redis configurations to the transport
   */
  private applyAdvancedRedisConfig(transport: any): void {
    try {
      // Apply partitioning configuration
      if (this.config.partitioning?.enabled) {
        this.applyPartitioningConfig(transport);
      }

      // Apply ordering configuration
      if (this.config.ordering?.enabled) {
        this.applyOrderingConfig(transport);
      }

      // Apply schema configuration
      if (this.config.schema?.enabled) {
        this.applySchemaConfig(transport);
      }

      // Apply replay configuration
      if (this.config.replay?.enabled) {
        this.applyReplayConfig(transport);
      }

      // Apply advanced DLQ configuration
      if (this.config.dlq?.enabled) {
        this.applyDLQConfig(transport);
      }

      this.logger.debug('Applied advanced Redis configurations');
    } catch (error) {
      this.logger.warn('Failed to apply advanced Redis configurations:', error);
    }
  }

  /**
   * Apply partitioning configuration to Redis transport
   */
  private applyPartitioningConfig(transport: any): void {
    if (this.config.partitioning && transport.config) {
      transport.config.partitioning = {
        enabled: true,
        strategy: this.config.partitioning.strategy,
        autoScaling: this.config.partitioning.autoScaling,
        partitionCount: this.config.partitioning.partitionCount,
        partitionKeyExtractor: this.config.partitioning.partitionKeyExtractor
      };
    }
  }

  /**
   * Apply ordering configuration to Redis transport
   */
  private applyOrderingConfig(transport: any): void {
    if (this.config.ordering && transport.config) {
      transport.config.ordering = {
        enabled: true,
        strategy: this.config.ordering.strategy,
        enableCausalDependencies: this.config.ordering.enableCausalDependencies
      };
    }
  }

  /**
   * Apply schema configuration to Redis transport
   */
  private applySchemaConfig(transport: any): void {
    if (this.config.schema && transport.config) {
      transport.config.schema = {
        enabled: true,
        validationMode: this.config.schema.validationMode,
        schemaRegistry: this.config.schema.schemaRegistry,
        enableSchemaEvolution: this.config.schema.enableSchemaEvolution,
        versioning: this.config.schema.versioning
      };
    }
  }

  /**
   * Apply replay configuration to Redis transport
   */
  private applyReplayConfig(transport: any): void {
    if (this.config.replay && transport.config) {
      transport.config.replay = {
        enabled: true,
        maxReplaySize: this.config.replay.maxReplaySize,
        enableSelectiveReplay: this.config.replay.enableSelectiveReplay,
        replayStrategies: this.config.replay.replayStrategies
      };
    }
  }

  /**
   * Apply advanced DLQ configuration to Redis transport
   */
  private applyDLQConfig(transport: any): void {
    if (this.config.dlq && transport.config) {
      transport.config.enableDLQ = true;
      transport.config.dlqStreamPrefix = this.config.dlq.streamPrefix;
      transport.config.maxRetries = this.config.dlq.maxRetries;
      transport.config.retryDelay = this.config.dlq.retryDelay;
      transport.config.maxRetriesBeforeDLQ = this.config.dlq.maxRetriesBeforeDLQ;
      
      // Apply additional DLQ configurations if available
      if (transport.config.dlqRetention !== undefined) {
        transport.config.dlqRetention = this.config.dlq.retention;
      }
    }
  }

  getEventSystem(): EventSystem {
    if (!this.eventSystem) {
      throw new Error('Event system not initialized');
    }
    return this.eventSystem;
  }

  async getStatus() {
    if (!this.eventSystem) {
      return {
        connected: false,
        healthy: false,
        error: 'Event system not initialized',
      };
    }

    try {
      return await this.eventSystem.getStatus();
    } catch (error) {
      this.logger.error('Failed to get event system status:', error);
      return {
        connected: false,
        healthy: false,
        error: error instanceof Error ? error.message : String(error),
      };
    }
  }

  isConnected(): boolean {
    return this.eventSystem?.isConnected() || false;
  }

  /**
   * Get the service name from configuration
   */
  getServiceName(): string {
    return this.config.service;
  }

  /**
   * Get the origin prefix from configuration
   */
  getOriginPrefix(): string | undefined {
    return this.config.originPrefix;
  }

  /**
   * Get advanced configuration options
   */
  getAdvancedConfig() {
    return {
      redisCluster: this.config.redisCluster,
      redisSentinel: this.config.redisSentinel,
      partitioning: this.config.partitioning,
      ordering: this.config.ordering,
      schema: this.config.schema,
      replay: this.config.replay,
      dlq: this.config.dlq,
      advancedRouting: this.config.advancedRouting
    };
  }

  /**
   * Check if advanced features are enabled
   */
  hasAdvancedFeatures(): boolean {
    return !!(
      this.config.redisCluster ||
      this.config.redisSentinel ||
      this.config.partitioning?.enabled ||
      this.config.ordering?.enabled ||
      this.config.schema?.enabled ||
      this.config.replay?.enabled ||
      this.config.dlq?.enabled ||
      this.config.advancedRouting
    );
  }
}
