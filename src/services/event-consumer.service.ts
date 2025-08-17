import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { EventConsumer as CoreEventConsumer } from '@logistically/events';
import { SubscribeOptions } from '@logistically/events/dist/event-transport/transport.interface';
import { EventSystemService } from './event-system.service';
import { NestJSEventHandler, wrapNestJSEventHandler, wrapNestJSPatternHandler } from '../types/handler.types';
import { DiscoveryService, MetadataScanner, Reflector } from '@nestjs/core';
import { EVENT_HANDLER_METADATA } from '../decorators/event-handler.decorator';
import { EVENT_SUBSCRIBER_METADATA } from '../decorators/event-subscriber.decorator';

@Injectable()
export class EventConsumerService implements OnModuleInit {
  private readonly logger = new Logger(EventConsumerService.name);
  private consumer: CoreEventConsumer | null = null;
  private readonly subscriptions = new Map<string, any>();

  constructor(
    private readonly eventSystemService: EventSystemService,
    private readonly discoveryService: DiscoveryService,
    private readonly metadataScanner: MetadataScanner,
    private readonly reflector: Reflector,
  ) {}

  async onModuleInit() {
    await this.discoverEventHandlers();
  }

  private getConsumer(): CoreEventConsumer {
    if (!this.consumer) {
      this.consumer = this.eventSystemService.getEventSystem().consumer;
    }
    if (!this.consumer) {
      throw new Error('Event consumer not initialized');
    }
    return this.consumer;
  }

  /**
   * Subscribe to an event type
   */
  async subscribe<T = any>(
    eventType: string,
    handler: NestJSEventHandler<T>,
    options?: SubscribeOptions
  ): Promise<void> {
    try {
      const consumer = this.getConsumer();
      const wrappedHandler = wrapNestJSEventHandler(handler);
      
      await consumer.subscribe(eventType, wrappedHandler, options);
      
      this.subscriptions.set(eventType, handler);
      this.logger.debug(`Subscribed to event: ${eventType}`);
    } catch (error) {
      this.logger.error(`Failed to subscribe to event ${eventType}:`, error);
      throw error;
    }
  }

  /**
   * Subscribe to events matching a pattern
   */
  async subscribePattern<T = any>(
    pattern: string,
    handler: NestJSEventHandler<T>,
    options?: SubscribeOptions
  ): Promise<void> {
    try {
      const consumer = this.getConsumer();
      const wrappedHandler = wrapNestJSPatternHandler(handler);
      
      await consumer.subscribePattern(pattern, wrappedHandler, options);
      
      this.subscriptions.set(`pattern:${pattern}`, handler);
      this.logger.debug(`Subscribed to pattern: ${pattern}`);
    } catch (error) {
      this.logger.error(`Failed to subscribe to pattern ${pattern}:`, error);
      throw error;
    }
  }

  /**
   * Unsubscribe from an event type
   */
  async unsubscribe(eventType: string): Promise<void> {
    try {
      const consumer = this.getConsumer();
      await consumer.unsubscribe(eventType);
      
      this.subscriptions.delete(eventType);
      this.logger.debug(`Unsubscribed from event: ${eventType}`);
    } catch (error) {
      this.logger.error(`Failed to unsubscribe from event ${eventType}:`, error);
      throw error;
    }
  }

  /**
   * Unsubscribe from a pattern
   */
  async unsubscribePattern(pattern: string): Promise<void> {
    try {
      const consumer = this.getConsumer();
      await consumer.unsubscribePattern(pattern);
      
      this.subscriptions.delete(`pattern:${pattern}`);
      this.logger.debug(`Unsubscribed from pattern: ${pattern}`);
    } catch (error) {
      this.logger.error(`Failed to unsubscribe from pattern ${pattern}:`, error);
      throw error;
    }
  }

  /**
   * Get subscription information
   */
  getSubscriptions() {
    try {
      const consumer = this.getConsumer();
      return consumer.getSubscriptions();
    } catch (error) {
      this.logger.error('Failed to get subscriptions:', error);
      return [];
    }
  }

  /**
   * Get consumer statistics
   */
  getStats() {
    try {
      const consumer = this.getConsumer();
      return consumer.getStats();
    } catch (error) {
      this.logger.error('Failed to get consumer stats:', error);
      return null;
    }
  }

  /**
   * Discover and register event handlers automatically
   */
  private async discoverEventHandlers() {
    const providers = this.discoveryService.getProviders();
    const controllers = this.discoveryService.getControllers();

    const instances = [...providers, ...controllers];

    for (const instance of instances) {
      if (instance.instance) {
        this.scanInstanceForEventHandlers(instance.instance);
        this.scanInstanceForEventSubscribers(instance.instance);
      }
    }

    this.logger.log(`Discovered ${this.subscriptions.size} event handlers and subscribers`);
  }

  /**
   * Scan an instance for event handlers
   */
  private scanInstanceForEventHandlers(instance: any) {
    const prototype = Object.getPrototypeOf(instance);
    
    this.metadataScanner.scanFromPrototype(
      instance,
      prototype,
      (methodKey: string) => {
        const metadata = this.reflector.get(EVENT_HANDLER_METADATA, instance[methodKey]);
        
        if (metadata) {
          this.registerEventHandler(metadata, instance, methodKey);
        }
      },
    );
  }

  /**
   * Scan an instance for event subscribers
   */
  private scanInstanceForEventSubscribers(instance: any) {
    const prototype = Object.getPrototypeOf(instance);
    
    this.metadataScanner.scanFromPrototype(
      instance,
      prototype,
      (methodKey: string) => {
        const metadata = this.reflector.get(EVENT_SUBSCRIBER_METADATA, instance[methodKey]);
        
        if (metadata) {
          this.registerEventSubscriber(metadata, instance, methodKey);
        }
      },
    );
  }

  /**
   * Register an event handler
   */
  private async registerEventHandler(metadata: any, instance: any, methodKey: string) {
    const handler = instance[methodKey].bind(instance);
    
    try {
      await this.subscribe(metadata.eventType, handler, {
        groupId: metadata.subscriptionOptions?.groupId,
        consumerId: metadata.subscriptionOptions?.consumerId,
      });
    } catch (error) {
      this.logger.error(`Failed to register event handler ${metadata.eventType}:`, error);
    }
  }

  /**
   * Register an event subscriber
   */
  private async registerEventSubscriber(metadata: any, instance: any, methodKey: string) {
    const handler = instance[methodKey].bind(instance);
    
    try {
      if (metadata.subscriptionOptions?.pattern) {
        await this.subscribePattern(metadata.eventType, handler, {
          groupId: metadata.subscriptionOptions?.groupId,
          consumerId: metadata.subscriptionOptions?.consumerId,
        });
      } else {
        await this.subscribe(metadata.eventType, handler, {
          groupId: metadata.subscriptionOptions?.groupId,
          consumerId: metadata.subscriptionOptions?.consumerId,
        });
      }
    } catch (error) {
      this.logger.error(`Failed to register event subscriber ${metadata.eventType}:`, error);
    }
  }

  /**
   * Check if the consumer is connected
   */
  isConnected(): boolean {
    return this.eventSystemService.isConnected();
  }
}
