import { Injectable, OnModuleInit } from '@nestjs/common';
import { EventDiscoveryService } from '../services/event-discovery.service';
import { AutoEventHandlerProvider, EventHandlerMetadata } from '../interfaces/auto-event-handler.interface';

/**
 * Mixin that provides automatic event handler registration
 * This allows services to extend multiple classes while getting auto-registration
 */
export function AutoEventHandlerMixin<T extends new (...args: any[]) => any>(Base: T) {
  @Injectable()
  class AutoEventHandlerMixinClass extends Base implements OnModuleInit {
    public eventDiscoveryService?: EventDiscoveryService;
    public registeredHandlers: EventHandlerMetadata[] = [];

    constructor(...args: any[]) {
      super(...args);
      
      // Try to get EventDiscoveryService from the arguments
      for (const arg of args) {
        if (arg && typeof arg.registerEventHandlers === 'function') {
          this.eventDiscoveryService = arg;
          break;
        }
      }
    }

    async onModuleInit() {
      // Call the parent's onModuleInit if it exists
      if (super.onModuleInit && typeof super.onModuleInit === 'function') {
        await super.onModuleInit();
      }

      // Auto-register event handlers
      await this.registerEventHandlers();
    }

    public async registerEventHandlers(): Promise<void> {
      if (!this.eventDiscoveryService) {
        console.warn(`EventDiscoveryService not found for ${this.constructor.name}`);
        return;
      }

      try {
        const registeredCount = await this.eventDiscoveryService.registerEventHandlers(this);
        if (registeredCount > 0) {
          console.log(`Auto-registered ${registeredCount} event handlers for ${this.constructor.name}`);
        }
      } catch (error) {
        console.error(`Failed to auto-register event handlers for ${this.constructor.name}:`, error);
      }
    }

    /**
     * Get registered handlers (for testing/debugging)
     */
    getRegisteredHandlers(): EventHandlerMetadata[] {
      return this.registeredHandlers;
    }

    /**
     * Clear registered handlers (for testing)
     */
    clearRegisteredHandlers(): void {
      this.registeredHandlers = [];
    }
  }

  return AutoEventHandlerMixinClass as T & (new (...args: any[]) => AutoEventHandlerMixinClass);
}

/**
 * Advanced mixin with configuration options
 */
export function AutoEventHandlerMixinWithConfig<T extends new (...args: any[]) => any>(
  Base: T,
  config: {
    enabled?: boolean;
    priority?: number;
    errorHandling?: 'throw' | 'warn' | 'ignore';
  } = {}
) {
  @Injectable()
  class AutoEventHandlerMixinWithConfigClass extends Base implements OnModuleInit {
    public eventDiscoveryService?: EventDiscoveryService;
    public readonly config = {
      enabled: true,
      priority: 0,
      errorHandling: 'warn' as const,
      ...config
    };

    constructor(...args: any[]) {
      super(...args);
      
      // Try to get EventDiscoveryService from the arguments
      for (const arg of args) {
        if (arg && typeof arg.registerEventHandlers === 'function') {
          this.eventDiscoveryService = arg;
          break;
        }
      }
    }

    async onModuleInit() {
      // Call the parent's onModuleInit if it exists
      if (super.onModuleInit && typeof super.onModuleInit === 'function') {
        await super.onModuleInit();
      }

      // Auto-register event handlers if enabled
      if (this.config.enabled) {
        await this.registerEventHandlers();
      }
    }

    public async registerEventHandlers(): Promise<void> {
      if (!this.eventDiscoveryService) {
        const message = `EventDiscoveryService not found for ${this.constructor.name}`;
        if (this.config.errorHandling === 'throw') {
          throw new Error(message);
        } else if (this.config.errorHandling === 'warn') {
          console.warn(message);
        }
        return;
      }

      try {
        const registeredCount = await this.eventDiscoveryService.registerEventHandlers(this);
        if (registeredCount > 0) {
          console.log(`Auto-registered ${registeredCount} event handlers for ${this.constructor.name}`);
        }
      } catch (error) {
        const message = `Failed to auto-register event handlers for ${this.constructor.name}: ${error}`;
        if (this.config.errorHandling === 'throw') {
          throw new Error(message);
        } else if (this.config.errorHandling === 'warn') {
          console.error(message);
        }
      }
    }
  }

  return AutoEventHandlerMixinWithConfigClass as T & (new (...args: any[]) => AutoEventHandlerMixinWithConfigClass);
}
