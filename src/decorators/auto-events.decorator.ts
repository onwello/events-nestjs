import { SetMetadata } from '@nestjs/common';

export const AUTO_REGISTER_EVENTS_METADATA = 'auto_register_events';

export interface AutoRegisterEventsOptions {
  enabled: boolean;
  priority?: number;
}

/**
 * Decorator to mark a service for automatic event handler registration
 * This will automatically discover and register all @AutoEventHandler methods
 * 
 * USAGE:
 * @Injectable()
 * @AutoEvents()
 * export class MyService {
 *   // No need to implement OnModuleInit!
 *   // The decorator handles everything automatically
 * }
 */
export function AutoEvents(options: AutoRegisterEventsOptions = { enabled: true }) {
  return function (target: any) {
    // Set the metadata
    SetMetadata(AUTO_REGISTER_EVENTS_METADATA, options)(target);
    
    // Store the original onModuleInit method if it exists
    const originalOnModuleInit = target.prototype.onModuleInit;
    
    // Override onModuleInit to auto-register the service
    target.prototype.onModuleInit = async function(...args: any[]) {
      // Call the original onModuleInit if it exists
      if (originalOnModuleInit) {
        await originalOnModuleInit.apply(this, args);
      }
      
      // Auto-register this service with EventDiscoveryService
      // Use setImmediate to ensure all dependencies are resolved
      setImmediate(async () => {
        try {
          const eventDiscoveryService = this.eventDiscoveryService;
          if (eventDiscoveryService && typeof eventDiscoveryService.addServiceForAutoRegistration === 'function') {
            await eventDiscoveryService.addServiceForAutoRegistration(this);
          }
        } catch (error) {
          console.debug(`Auto-registration failed for ${target.name}:`, (error as Error).message);
        }
      });
    };
  };
}
