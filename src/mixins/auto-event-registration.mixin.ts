import { OnModuleInit } from '@nestjs/common';
import { EventDiscoveryService } from '../services/event-discovery.service';

/**
 * Mixin to automatically register event handlers for services with @AutoEvents decorator
 * This provides true enterprise-grade automatic discovery without manual intervention
 */
export function AutoEventRegistrationMixin<T extends new (...args: any[]) => any>(Base: T) {
  return class extends Base implements OnModuleInit {
    public eventDiscoveryService?: EventDiscoveryService;

    constructor(...args: any[]) {
      super(...args);
      
      // Try to get EventDiscoveryService from the module
      // This is a bit of a hack, but it works for automatic discovery
      setTimeout(async () => {
        try {
          // Get the module reference from the instance
          const moduleRef = (this as any).__moduleRef;
          if (moduleRef) {
            this.eventDiscoveryService = moduleRef.get('EventDiscoveryService', { strict: false });
            if (this.eventDiscoveryService) {
              await this.eventDiscoveryService.addServiceForAutoRegistration(this);
            }
          }
        } catch (error) {
          console.warn(`Failed to get EventDiscoveryService for ${this.constructor.name}:`, error);
        }
      }, 100);
    }

    async onModuleInit() {
      // Call the original onModuleInit if it exists
      if (super.onModuleInit) {
        await super.onModuleInit();
      }

      // Try to register event handlers
      if (this.eventDiscoveryService) {
        try {
          await this.eventDiscoveryService.addServiceForAutoRegistration(this);
        } catch (error) {
          console.warn(`Failed to auto-register ${this.constructor.name}:`, error);
        }
      }
    }
  };
}
