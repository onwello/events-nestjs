import { Injectable, Logger, OnModuleInit, Type } from '@nestjs/common';
import { ModuleRef } from '@nestjs/core';
import { EventDiscoveryService } from './event-discovery.service';
import { AUTO_REGISTER_EVENTS_METADATA } from '../decorators/auto-register-events.decorator';

@Injectable()
export class AutoRegistrationService implements OnModuleInit {
  private readonly logger = new Logger(AutoRegistrationService.name);

  constructor(
    private readonly moduleRef: ModuleRef,
    private readonly eventDiscoveryService: EventDiscoveryService,
  ) {}

  async onModuleInit() {
    this.logger.log('AutoRegistrationService initialized - will register event handlers automatically');
  }

  /**
   * Register event handlers for a specific instance
   * This method is called automatically for classes decorated with @AutoRegisterEvents
   */
  async registerEventHandlers(instance: any): Promise<number> {
    const instanceName = instance.constructor?.name || 'Unknown';
    
    try {
      const registeredCount = await this.eventDiscoveryService.registerEventHandlers(instance);
      
      if (registeredCount > 0) {
        this.logger.log(`Auto-registered ${registeredCount} event handlers for ${instanceName}`);
      }
      
      return registeredCount;
    } catch (error) {
      this.logger.error(`Failed to auto-register event handlers for ${instanceName}:`, error);
      return 0;
    }
  }

  /**
   * Check if a class should have automatic event registration
   */
  shouldAutoRegister(target: Type<any>): boolean {
    return Reflect.hasMetadata(AUTO_REGISTER_EVENTS_METADATA, target);
  }

  /**
   * Get all providers that should have automatic event registration
   */
  async getAutoRegisterProviders(): Promise<any[]> {
    // This is a simplified approach - in a real implementation,
    // we would scan the module container for providers with the metadata
    return [];
  }
}
