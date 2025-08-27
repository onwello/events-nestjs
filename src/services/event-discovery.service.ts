import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AUTO_EVENT_HANDLER_METADATA } from '../decorators/auto-event-handler.decorator';
import { EventConsumer } from '@logistically/events';
import { EventSystemService } from './event-system.service';

@Injectable()
export class EventDiscoveryService implements OnModuleInit {
  private readonly logger = new Logger(EventDiscoveryService.name);
  private consumer: EventConsumer | null = null;

  constructor(
    private readonly reflector: Reflector,
    private readonly eventSystemService: EventSystemService,
  ) {}

  async onModuleInit() {
    this.logger.log('EventDiscoveryService onModuleInit called');
    await this.initializeConsumer();
    // Note: We'll rely on manual registration for now since automatic discovery
    // requires access to internal NestJS services that aren't available in this context
    this.logger.log('EventDiscoveryService initialized - manual registration required');
  }

  private async initializeConsumer() {
    try {
      // Wait for the event system to be ready
      let attempts = 0;
      const maxAttempts = 20;
      
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
    } catch (error) {
      this.logger.error('Failed to initialize event discovery service', error);
    }
  }

  /**
   * Manually register event handlers from a service instance
   * This method can be called by services that want to register their handlers
   */
  async registerEventHandlers(instance: any): Promise<number> {
    if (!this.consumer) {
      this.logger.warn('Consumer not initialized, skipping handler registration');
      return 0;
    }

    const prototype = Object.getPrototypeOf(instance);
    const methodNames = Object.getOwnPropertyNames(prototype).filter(
      name => name !== 'constructor' && typeof prototype[name] === 'function'
    );

    let registeredCount = 0;

    for (const methodName of methodNames) {
      const metadata = this.reflector.get<{
        eventType: string;
        priority?: number;
        async?: boolean;
        retry?: any;
      }>(
        AUTO_EVENT_HANDLER_METADATA,
        instance[methodName],
      );

      if (metadata) {
        this.registerHandler(instance, methodName, metadata);
        registeredCount++;
      }
    }

    if (registeredCount > 0) {
      this.logger.log(`Registered ${registeredCount} event handlers from ${instance.constructor.name}`);
    }

    return registeredCount;
  }

  private registerHandler(instance: any, methodKey: string, metadata: any) {
    const eventType = metadata.eventType;
    const handler = instance[methodKey].bind(instance);

    try {
      this.consumer!.subscribe(eventType, async (event) => {
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
}
