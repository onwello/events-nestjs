import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { EventConsumer as CoreEventConsumer } from '@logistically/events';
import { EventSystemService } from './event-system.service';
import { AUTO_EVENT_HANDLER_METADATA, getAutoEventHandlerMetadata } from '../decorators/auto-event-handler.decorator';

@Injectable()
export class AutoEventHandlerService implements OnModuleInit {
  private readonly logger = new Logger(AutoEventHandlerService.name);
  private consumer: CoreEventConsumer | null = null;
  private static instance: AutoEventHandlerService | null = null;

  constructor(private readonly eventSystemService: EventSystemService) {
    AutoEventHandlerService.instance = this;
  }

  static getInstance(): AutoEventHandlerService | null {
    return AutoEventHandlerService.instance;
  }

  async onModuleInit() {
    await this.initializeConsumer();
  }

  private async initializeConsumer() {
    try {
      // Wait for the event system to be ready
      let attempts = 0;
      const maxAttempts = 10;
      
      while (attempts < maxAttempts) {
        try {
          const eventSystem = this.eventSystemService.getEventSystem();
          this.consumer = eventSystem.consumer;
          this.logger.log('Auto event handler service initialized successfully');
          return;
        } catch (error) {
          attempts++;
          if (attempts >= maxAttempts) {
            throw error;
          }
          // Wait 100ms before retrying
          await new Promise(resolve => setTimeout(resolve, 100));
        }
      }
    } catch (error) {
      this.logger.error('Failed to initialize auto event handler service', error);
    }
  }

  /**
   * Register event handlers from a service instance using AutoEventHandler decorators
   */
  async registerEventHandlers(instance: any): Promise<void> {
    if (!this.consumer) {
      this.logger.warn('Consumer not initialized, skipping handler registration');
      return;
    }

    const prototype = Object.getPrototypeOf(instance);
    const methodNames = Object.getOwnPropertyNames(prototype).filter(
      name => name !== 'constructor' && typeof prototype[name] === 'function'
    );

    let registeredCount = 0;

    for (const methodName of methodNames) {
      const metadata = getAutoEventHandlerMetadata(instance, methodName);
      
      if (metadata) {
        await this.registerHandler(instance, methodName, metadata);
        registeredCount++;
      }
    }

    if (registeredCount > 0) {
      this.logger.log(`Registered ${registeredCount} auto event handlers from ${instance.constructor.name}`);
    }
  }

  private async registerHandler(instance: any, methodName: string, metadata: any): Promise<void> {
    const eventType = metadata.eventType;
    const handler = instance[methodName].bind(instance);

    try {
      await this.consumer!.subscribe(eventType, async (event) => {
        try {
          await handler(event.body);
        } catch (error) {
          this.logger.error(`Error handling event ${eventType} in ${instance.constructor.name}.${methodName}:`, error);
        }
      });

      this.logger.log(`Registered auto event handler: ${instance.constructor.name}.${methodName} for ${eventType}`);
    } catch (error) {
      this.logger.error(`Failed to register auto handler for ${eventType}:`, error);
    }
  }
}
