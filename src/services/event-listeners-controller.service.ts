import { Injectable, Logger, Optional } from '@nestjs/common';
import { EventMetadataExplorer } from './event-metadata-explorer.service';
import { EventDiscoveryService } from './event-discovery.service';

@Injectable()
export class EventListenersController {
  private readonly logger = new Logger(EventListenersController.name);

  constructor(
    @Optional() private readonly metadataExplorer?: EventMetadataExplorer,
    @Optional() private readonly eventDiscoveryService?: EventDiscoveryService,
  ) {}

  /**
   * Register event handlers for an instance
   * Based on NestJS microservices ListenersController pattern
   */
  async registerEventHandlers(instance: any): Promise<number> {
    if (!this.metadataExplorer || !this.eventDiscoveryService) {
      this.logger.warn('EventListenersController: Dependencies not available, skipping registration');
      return 0;
    }

    const { instance: serviceInstance } = instance;
    const patternHandlers = this.metadataExplorer.explore(serviceInstance);

    if (patternHandlers.length === 0) {
      return 0;
    }

    this.logger.debug(`Found ${patternHandlers.length} event handlers for ${serviceInstance.constructor.name}`);

    let registeredCount = 0;
    for (const handler of patternHandlers) {
      try {
        await this.registerHandler(serviceInstance, handler);
        registeredCount++;
      } catch (error) {
        this.logger.error(`Failed to register handler ${handler.methodKey} for ${serviceInstance.constructor.name}:`, error);
      }
    }

    if (registeredCount > 0) {
      this.logger.log(`Registered ${registeredCount} event handlers for ${serviceInstance.constructor.name}`);
    }

    return registeredCount;
  }

  /**
   * Register a single event handler
   */
  private async registerHandler(instance: any, handler: any): Promise<void> {
    const { methodKey, eventType, options } = handler;
    
    await this.eventDiscoveryService!.registerHandler(instance, methodKey, {
      eventType,
      priority: options?.priority || 0,
      async: options?.async !== false,
      retry: options?.retry,
      ...options
    });
  }

  /**
   * Check if an instance has event handlers
   */
  hasEventHandlers(instance: any): boolean {
    return this.metadataExplorer?.hasEventHandlers(instance) || false;
  }

  /**
   * Get all event types that an instance handles
   */
  getEventTypes(instance: any): string[] {
    return this.metadataExplorer?.getEventTypes(instance) || [];
  }
}
