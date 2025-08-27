import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { EventConsumer as CoreEventConsumer } from '@logistically/events';
import { EventSystemService } from './event-system.service';
import { EVENT_HANDLER_METADATA } from '../decorators/event-handler.decorator';

@Injectable()
export class GlobalEventHandlerService implements OnModuleInit {
  private readonly logger = new Logger(GlobalEventHandlerService.name);
  private consumer: CoreEventConsumer | null = null;
  private static instance: GlobalEventHandlerService | null = null;

  constructor(private readonly eventSystemService: EventSystemService) {
    GlobalEventHandlerService.instance = this;
  }

  static getInstance(): GlobalEventHandlerService | null {
    return GlobalEventHandlerService.instance;
  }

  async onModuleInit() {
    await this.initializeConsumer();
  }

  private async initializeConsumer() {
    try {
      const eventSystem = this.eventSystemService.getEventSystem();
      this.consumer = eventSystem.consumer;
      this.logger.log('Global event handler service initialized successfully');
    } catch (error) {
      this.logger.error('Failed to initialize global event handler service', error);
    }
  }

  /**
   * Register event handlers from a service instance using decorators
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
      const metadata = Reflect.getMetadata(EVENT_HANDLER_METADATA, instance, methodName);
      
      if (metadata) {
        await this.registerHandler(instance, methodName, metadata);
        registeredCount++;
      }
    }

    if (registeredCount > 0) {
      this.logger.log(`Registered ${registeredCount} event handlers from ${instance.constructor.name}`);
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

      this.logger.log(`Registered event handler: ${instance.constructor.name}.${methodName} for ${eventType}`);
    } catch (error) {
      this.logger.error(`Failed to register handler for ${eventType}:`, error);
    }
  }
}
