import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { EventSystemService } from './event-system.service';
import { AUTO_EVENT_HANDLER_METADATA, getAutoEventHandlerMetadata } from '../decorators/auto-event-handler.decorator';

@Injectable()
export class EventDiscoveryService implements OnModuleInit {
  private readonly logger = new Logger(EventDiscoveryService.name);
  private consumer: any = null;

  constructor(
    private readonly eventSystemService: EventSystemService,
    private readonly reflector: Reflector,
  ) {}

  async onModuleInit() {
    this.logger.log('EventDiscoveryService onModuleInit called');
    // Don't initialize consumer here - wait until it's actually needed
  }

  private async getConsumer(): Promise<any> {
    if (!this.consumer) {
      await this.initializeConsumer();
    }
    return this.consumer;
  }

  private async initializeConsumer(maxAttempts = 10): Promise<void> {
    let attempts = 0;
    
    while (attempts < maxAttempts) {
      try {
        const eventSystem = this.eventSystemService.getEventSystem();
        this.consumer = eventSystem.consumer;
        this.logger.log('Event discovery service initialized successfully');
        return;
      } catch (error) {
        attempts++;
        if (attempts >= maxAttempts) {
          throw error;
        }
        // Wait 50ms before retrying
        await new Promise(resolve => setTimeout(resolve, 50));
      }
    }
  }

  /**
   * Register a single event handler with explicit metadata
   * This method is used by the EventModuleScanner for automatic discovery
   */
  async registerHandler(instance: any, methodKey: string, metadata: {
    eventType: string;
    priority?: number;
    async?: boolean;
    retry?: any;
    [key: string]: any;
  }): Promise<void> {
    const consumer = await this.getConsumer();
    if (!consumer) {
      this.logger.warn('Consumer not initialized, skipping handler registration');
      return;
    }

    const eventType = metadata.eventType;
    const handler = instance[methodKey].bind(instance);

    try {
      consumer.subscribe(eventType, async (event: any) => {
        try {
          await handler(event);
        } catch (error) {
          this.logger.error(
            `Error handling event ${eventType} in ${instance.constructor.name}.${methodKey}:`,
            error,
          );
        }
      });

      this.logger.log(
        `Registered auto event handler: ${instance.constructor.name}.${methodKey} for ${eventType}`,
      );
    } catch (error) {
      this.logger.error(`Failed to register auto handler for ${eventType}:`, error);
    }
  }

  /**
   * Manually register event handlers from a service instance
   * This method can be called by services that want to register their handlers
   */
  async registerEventHandlers(instance: any): Promise<number> {
    const consumer = await this.getConsumer();
    if (!consumer) {
      this.logger.warn('Consumer not initialized, skipping handler registration');
      return 0;
    }

    // Get all method names from both prototype and instance
    const prototype = Object.getPrototypeOf(instance);
    const prototypeMethods = Object.getOwnPropertyNames(prototype).filter(
      name => name !== 'constructor' && typeof prototype[name] === 'function'
    );
    
    const instanceMethods = Object.getOwnPropertyNames(instance).filter(
      name => typeof instance[name] === 'function'
    );
    
    const allMethodNames = [...new Set([...prototypeMethods, ...instanceMethods])];

    this.logger.debug(`Scanning methods for ${instance.constructor.name}: ${allMethodNames.join(', ')}`);

    let registeredCount = 0;

    for (const methodName of allMethodNames) {
      const method = instance[methodName];
      if (typeof method === 'function') {
        this.logger.debug(`Checking method: ${methodName}`);
        
        // Try to get metadata using the helper function
        let metadata = getAutoEventHandlerMetadata(instance, methodName);
        
        // If not found, try using reflector directly
        if (!metadata) {
          metadata = this.reflector.get<{
            eventType: string;
            priority?: number;
            async?: boolean;
            retry?: any;
          }>(
            AUTO_EVENT_HANDLER_METADATA,
            method,
          );
        }

        this.logger.debug(`Metadata for ${methodName}:`, metadata);

        if (metadata && metadata.eventType) {
          await this.registerHandler(instance, methodName, metadata);
          registeredCount++;
        }
      }
    }

    if (registeredCount > 0) {
      this.logger.log(`Registered ${registeredCount} event handlers from ${instance.constructor.name}`);
    }

    return registeredCount;
  }
}
