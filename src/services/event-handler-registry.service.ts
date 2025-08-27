import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { EventConsumer as CoreEventConsumer } from '@logistically/events';
import { EventSystemService } from './event-system.service';

export interface EventHandlerRegistration {
  eventType: string;
  handler: (payload: any) => Promise<void> | void;
  options?: {
    priority?: number;
    async?: boolean;
    retry?: {
      maxAttempts?: number;
      backoffMs?: number;
    };
  };
}

@Injectable()
export class EventHandlerRegistryService implements OnModuleInit {
  private readonly logger = new Logger(EventHandlerRegistryService.name);
  private consumer: CoreEventConsumer | null = null;
  private readonly handlers = new Map<string, EventHandlerRegistration[]>();

  constructor(private readonly eventSystemService: EventSystemService) {}

  async onModuleInit() {
    await this.initializeConsumer();
  }

  private async initializeConsumer() {
    try {
      const eventSystem = this.eventSystemService.getEventSystem();
      this.consumer = eventSystem.consumer;
      this.logger.log('Event handler registry initialized successfully');
      
      // Register all handlers that were added before initialization
      for (const [eventType, handlers] of this.handlers.entries()) {
        for (const handler of handlers) {
          await this.registerHandler(eventType, handler);
        }
      }
    } catch (error) {
      this.logger.error('Failed to initialize event handler registry', error);
    }
  }

  /**
   * Register an event handler manually
   */
  async registerEventHandler(registration: EventHandlerRegistration): Promise<void> {
    const { eventType, handler, options } = registration;
    
    // Store the handler for later registration if consumer isn't ready
    if (!this.handlers.has(eventType)) {
      this.handlers.set(eventType, []);
    }
    this.handlers.get(eventType)!.push(registration);

    // If consumer is ready, register immediately
    if (this.consumer) {
      await this.registerHandler(eventType, registration);
    }
  }

  private async registerHandler(eventType: string, registration: EventHandlerRegistration): Promise<void> {
    if (!this.consumer) {
      throw new Error('Event consumer not initialized');
    }

    try {
      await this.consumer.subscribe(eventType, async (event) => {
        try {
          await registration.handler(event.body);
        } catch (error) {
          this.logger.error(`Error handling event ${eventType}:`, error);
          
          // Handle retry logic if configured
          if (registration.options?.retry) {
            // Implement retry logic here
            this.logger.warn(`Retry logic not implemented yet for event ${eventType}`);
          }
        }
      });

      this.logger.log(`Registered event handler for ${eventType}`);
    } catch (error) {
      this.logger.error(`Failed to register event handler for ${eventType}:`, error);
    }
  }

  /**
   * Get all registered handlers for an event type
   */
  getHandlers(eventType: string): EventHandlerRegistration[] {
    return this.handlers.get(eventType) || [];
  }

  /**
   * Remove all handlers for an event type
   */
  async removeHandlers(eventType: string): Promise<void> {
    this.handlers.delete(eventType);
    // Note: Unsubscribing from the consumer would require tracking subscription IDs
    this.logger.log(`Removed all handlers for event type: ${eventType}`);
  }
}
