import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { Reflector, MetadataScanner } from '@nestjs/core';
import { EventSystemService } from './event-system.service';
import { AUTO_EVENT_HANDLER_METADATA, getAutoEventHandlerMetadata } from '../decorators/auto-event-handler.decorator';
import { AUTO_REGISTER_EVENTS_METADATA, AutoRegisterEventsOptions } from '../decorators/auto-events.decorator';

@Injectable()
export class EventDiscoveryService implements OnModuleInit {
  private readonly logger = new Logger(EventDiscoveryService.name);
  private readonly metadataScanner = new MetadataScanner();
  private consumer: any = null;
  private autoRegisteredServices: Set<any> = new Set();
  private discoveryQueue: Array<{ instance: any; timestamp: number }> = [];
  private isInitialized = false;

  constructor(
    private readonly eventSystemService: EventSystemService,
    private readonly reflector: Reflector,
  ) {}

  async onModuleInit() {
    this.logger.log('EventDiscoveryService onModuleInit called');
    
    // Start the discovery loop
    this.startDiscoveryLoop();
  }

  /**
   * Start a continuous discovery loop that processes pending services
   */
  private startDiscoveryLoop(): void {
    setInterval(async () => {
      if (this.discoveryQueue.length > 0) {
        await this.processDiscoveryQueue();
      }
    }, 1000); // Check every second
  }

  /**
   * Process the discovery queue and register services
   */
  private async processDiscoveryQueue(): Promise<void> {
    if (this.discoveryQueue.length === 0) {
      return;
    }

    try {
      const consumer = await this.getConsumer();
      if (!consumer) {
        return; // Consumer not ready yet
      }

      this.logger.log(`Processing discovery queue with ${this.discoveryQueue.length} services...`);
      
      const services = Array.from(this.discoveryQueue);
      this.discoveryQueue = [];
      
      let totalRegistered = 0;
      for (const { instance } of services) {
        try {
          const registeredCount = await this.registerEventHandlers(instance);
          totalRegistered += registeredCount;
        } catch (error) {
          this.logger.error(`Failed to auto-register ${instance.constructor.name}:`, error);
        }
      }
      
      if (totalRegistered > 0) {
        this.logger.log(`Successfully registered ${totalRegistered} event handlers from ${services.length} services`);
      }
      
    } catch (error) {
      this.logger.debug('Consumer not ready yet, services will be processed later');
    }
  }

  /**
   * Add a service to be auto-registered when the event system is ready
   * This is the main entry point for automatic discovery
   */
  addServiceForAutoRegistration(instance: any): void {
    if (this.autoRegisteredServices.has(instance)) {
      return; // Already registered
    }
    
    // Check if this service has @AutoEvents decorator
    const autoRegisterMetadata = this.reflector.get<AutoRegisterEventsOptions>(
      AUTO_REGISTER_EVENTS_METADATA,
      instance.constructor
    );

    if (!autoRegisterMetadata?.enabled) {
      this.logger.debug(`Auto-registration not enabled for ${instance.constructor.name}`);
      return;
    }
    
    // Add to discovery queue
    this.discoveryQueue.push({ instance, timestamp: Date.now() });
    
    this.logger.debug(`Added ${instance.constructor.name} to discovery queue (${this.discoveryQueue.length} pending)`);
    
    // Try to process immediately if consumer is ready
    this.processDiscoveryQueue();
  }

  /**
   * Manually trigger registration of all pending services
   * This can be called by the EventModuleScanner
   */
  async triggerRegistration(): Promise<void> {
    this.logger.log('EventDiscoveryService: Manually triggering registration of pending services...');
    await this.processDiscoveryQueue();
  }

  /**
   * Get discovery statistics
   */
  getDiscoveryStats(): { pending: number; registered: number; queueLength: number } {
    return {
      pending: this.discoveryQueue.length,
      registered: this.autoRegisteredServices.size,
      queueLength: this.discoveryQueue.length
    };
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
        this.isInitialized = true;
        this.logger.log('Event discovery service initialized successfully');
        
        // Now try to process any pending services
        await this.processDiscoveryQueue();
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

    // Check if this service has @AutoEvents decorator
    const autoRegisterMetadata = this.reflector.get<AutoRegisterEventsOptions>(
      AUTO_REGISTER_EVENTS_METADATA,
      instance.constructor
    );

    if (!autoRegisterMetadata?.enabled) {
      this.logger.debug(`Auto-registration not enabled for ${instance.constructor.name}`);
      return 0;
    }

    // Prevent double registration
    if (this.autoRegisteredServices.has(instance)) {
      this.logger.debug(`Service ${instance.constructor.name} already registered, skipping`);
      return 0;
    }

    // Use MetadataScanner like @nestjs/microservices does
    const instancePrototype = Object.getPrototypeOf(instance);
    const allMethodNames = this.metadataScanner.getAllMethodNames(instancePrototype);

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
      this.autoRegisteredServices.add(instance);
    }

    return registeredCount;
  }

  /**
   * Auto-register a service if it has @AutoEvents decorator
   * This method is called automatically by the service lifecycle
   */
  async autoRegisterService(instance: any): Promise<number> {
    return this.registerEventHandlers(instance);
  }
}
