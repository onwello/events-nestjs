import { Injectable, Logger, OnModuleInit, Optional } from '@nestjs/common';
import { EventListenersController } from './event-listeners-controller.service';
import { EventDiscoveryService } from './event-discovery.service';

@Injectable()
export class EventModuleScanner implements OnModuleInit {
  private readonly logger = new Logger(EventModuleScanner.name);

  constructor(
    @Optional() private readonly listenersController?: EventListenersController,
    @Optional() private readonly eventDiscoveryService?: EventDiscoveryService,
  ) {}

  async onModuleInit() {
    this.logger.log('EventModuleScanner: Starting automatic event handler discovery...');
    
    if (!this.listenersController || !this.eventDiscoveryService) {
      this.logger.warn('EventModuleScanner: Dependencies not available, using fallback discovery');
      this.logger.log('EventModuleScanner: Handlers will be registered via @AutoEvents decorator and EventDiscoveryService');
      return;
    }

    this.logger.log('EventModuleScanner: Automatic discovery enabled - scanning for event handlers');
    
    // Trigger discovery immediately - the EventDiscoveryService will handle timing
    await this.scanAndRegisterAllHandlers();
  }

  /**
   * Scan all services and register their event handlers automatically
   * This is the core of the automatic discovery system
   */
  private async scanAndRegisterAllHandlers(): Promise<void> {
    try {
      this.logger.log('EventModuleScanner: Starting global scan for event handlers...');
      
      // Trigger registration of any pending services in the EventDiscoveryService
      if (this.eventDiscoveryService) {
        await this.eventDiscoveryService.triggerRegistration();
      }
      
      this.logger.log('EventModuleScanner: Global scan completed - triggered registration of pending services');
      
    } catch (error) {
      this.logger.error('EventModuleScanner: Failed to scan and register handlers:', error);
    }
  }

  /**
   * Register event handlers for an instance if it has any
   * This method can be called by other services
   */
  async registerHandlersIfFound(instance: any): Promise<number> {
    if (!this.listenersController) {
      return 0;
    }

    if (!instance || typeof instance !== 'object') {
      return 0;
    }

    // Check if this instance has any event handlers
    if (!this.listenersController.hasEventHandlers(instance)) {
      return 0;
    }

    try {
      this.logger.debug(`EventModuleScanner: Found event handlers in ${instance.constructor.name}`);
      const registeredCount = await this.listenersController.registerEventHandlers({ instance });
      
      if (registeredCount > 0) {
        this.logger.log(`EventModuleScanner: Auto-registered ${registeredCount} event handlers for ${instance.constructor.name}`);
      }
      
      return registeredCount;
    } catch (error) {
      this.logger.error(`EventModuleScanner: Failed to register handlers for ${instance.constructor.name}:`, error);
      return 0;
    }
  }
}
