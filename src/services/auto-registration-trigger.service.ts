import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { EventDiscoveryService } from './event-discovery.service';

/**
 * Service that automatically discovers and registers all services with @AutoEvents decorator
 * This is the core of the automatic discovery system
 */
@Injectable()
export class AutoRegistrationTriggerService implements OnModuleInit {
  private readonly logger = new Logger(AutoRegistrationTriggerService.name);

  constructor(
    private readonly eventDiscoveryService: EventDiscoveryService,
  ) {}

  async onModuleInit() {
    this.logger.log('AutoRegistrationTriggerService: Starting automatic registration trigger...');
    
    // Trigger discovery immediately - the EventDiscoveryService will handle timing
    await this.discoverAndRegisterAllServices();
  }

  /**
   * Discover and register all services with @AutoEvents decorator
   * This is the core of the automatic discovery system
   */
  private async discoverAndRegisterAllServices(): Promise<void> {
    try {
      this.logger.log('AutoRegistrationTriggerService: Starting service discovery...');
      
      // Trigger registration of any pending services
      await this.eventDiscoveryService.triggerRegistration();
      
      // Get discovery statistics
      const stats = this.eventDiscoveryService.getDiscoveryStats();
      this.logger.log(`AutoRegistrationTriggerService: Discovery complete. Stats: ${JSON.stringify(stats)}`);
      
    } catch (error) {
      this.logger.error('AutoRegistrationTriggerService: Failed to discover and register services:', error);
    }
  }

  /**
   * Manually trigger discovery and registration (can be called by other services)
   */
  async triggerDiscovery(): Promise<void> {
    await this.discoverAndRegisterAllServices();
  }
}
