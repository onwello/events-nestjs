import { Injectable, Logger, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { 
  createEventSystemBuilder,
  EventSystemConfig 
} from '@logistically/events';
import { EventSystem } from '@logistically/events/dist/event-system-builder';
import { NestJSEventsModuleOptions } from '../types/config.types';

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

    this.logger.debug('Configuration validation passed');
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

    // Add transports
    if (this.config.transports) {
      for (const [name, transport] of this.config.transports) {
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
}
