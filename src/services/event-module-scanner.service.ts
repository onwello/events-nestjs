import { Injectable, Logger, OnModuleInit, Type } from '@nestjs/common';
import { DiscoveryService, MetadataScanner, Reflector } from '@nestjs/core';
import { EventDiscoveryService } from './event-discovery.service';
import { AUTO_EVENT_HANDLER_METADATA } from '../decorators/auto-event-handler.decorator';

export interface EventHandlerMetadata {
  instance: any;
  methodName: string;
  eventType: string;
  options?: any;
}

@Injectable()
export class EventModuleScanner implements OnModuleInit {
  private readonly logger = new Logger(EventModuleScanner.name);
  private discoveredHandlers: EventHandlerMetadata[] = [];

  constructor(
    private readonly discoveryService: DiscoveryService,
    private readonly metadataScanner: MetadataScanner,
    private readonly reflector: Reflector,
    private readonly eventDiscoveryService: EventDiscoveryService,
  ) {}

  async onModuleInit() {
    this.logger.log('Starting automatic event handler discovery...');
    await this.scanModules();
    await this.registerDiscoveredHandlers();
    this.logger.log(`Automatic discovery completed. Found ${this.discoveredHandlers.length} event handlers.`);
  }

  /**
   * Scan all modules for event handlers decorated with @AutoEventHandler
   */
  private async scanModules(): Promise<void> {
    try {
      // Get all providers from the application
      const providers = this.discoveryService.getProviders();
      const controllers = this.discoveryService.getControllers();

      // Scan providers for event handlers
      for (const provider of providers) {
        if (provider.instance) {
          await this.scanInstance(provider.instance, 'provider');
        }
      }

      // Scan controllers for event handlers
      for (const controller of controllers) {
        if (controller.instance) {
          await this.scanInstance(controller.instance, 'controller');
        }
      }

      this.logger.debug(`Scanned ${providers.length} providers and ${controllers.length} controllers`);
    } catch (error) {
      this.logger.error('Error during module scanning:', error);
      throw error;
    }
  }

  /**
   * Scan a single instance for event handler methods
   */
  private async scanInstance(instance: any, type: 'provider' | 'controller'): Promise<void> {
    const instanceName = instance.constructor?.name || 'Unknown';
    
    try {
      // Get all method names from the instance
      const methodNames = this.metadataScanner.getAllMethodNames(instance);

      for (const methodName of methodNames) {
        const method = instance[methodName];
        
        if (typeof method === 'function') {
          // Check if the method has @AutoEventHandler metadata
          const metadata = this.reflector.get<{
            eventType: string;
            options?: any;
          }>(
            AUTO_EVENT_HANDLER_METADATA,
            method
          );

          if (metadata && metadata.eventType) {
            this.discoveredHandlers.push({
              instance,
              methodName,
              eventType: metadata.eventType,
              options: metadata.options || {}
            });

            this.logger.debug(
              `Found event handler: ${instanceName}.${methodName} -> ${metadata.eventType}`
            );
          }
        }
      }
    } catch (error) {
      this.logger.warn(`Error scanning instance ${instanceName}:`, error);
    }
  }

  /**
   * Register all discovered event handlers
   */
  private async registerDiscoveredHandlers(): Promise<void> {
    try {
      for (const handler of this.discoveredHandlers) {
        await this.eventDiscoveryService.registerHandler(
          handler.instance,
          handler.methodName,
          {
            eventType: handler.eventType,
            ...handler.options
          }
        );
      }

      this.logger.log(`Successfully registered ${this.discoveredHandlers.length} event handlers`);
    } catch (error) {
      this.logger.error('Error registering discovered handlers:', error);
      throw error;
    }
  }

  /**
   * Get all discovered event handlers (for debugging/testing)
   */
  getDiscoveredHandlers(): EventHandlerMetadata[] {
    return [...this.discoveredHandlers];
  }

  /**
   * Get handlers by event type
   */
  getHandlersByEventType(eventType: string): EventHandlerMetadata[] {
    return this.discoveredHandlers.filter(handler => {
      // Support pattern matching (e.g., 'user.*' matches 'user.created')
      if (handler.eventType.includes('*')) {
        const pattern = handler.eventType.replace(/\*/g, '.*');
        const regex = new RegExp(`^${pattern}$`);
        return regex.test(eventType);
      }
      return handler.eventType === eventType;
    });
  }

  /**
   * Get handlers by instance
   */
  getHandlersByInstance(instance: any): EventHandlerMetadata[] {
    return this.discoveredHandlers.filter(handler => handler.instance === instance);
  }

  /**
   * Clear discovered handlers (for testing)
   */
  clearDiscoveredHandlers(): void {
    this.discoveredHandlers = [];
  }
}
