import { Injectable, Logger, OnModuleInit, Type } from '@nestjs/common';
import { DiscoveryService, MetadataScanner, Reflector } from '@nestjs/core';
import { EventDiscoveryService } from './event-discovery.service';
import { AutoEventHandlerProvider, EventHandlerMetadata, EventHandlerRegistrar } from '../interfaces/auto-event-handler.interface';
import { AUTO_REGISTER_EVENTS_METADATA, AutoRegisterEventsOptions } from '../decorators/auto-register-events.decorator';
import { AUTO_EVENT_HANDLER_METADATA } from '../decorators/auto-event-handler.decorator';

export interface RegistrationStrategy {
  name: string;
  priority: number;
  canHandle(instance: any): boolean;
  register(instance: any): Promise<number>;
}

@Injectable()
export class EnterpriseEventRegistrationService implements OnModuleInit, EventHandlerRegistrar {
  private readonly logger = new Logger(EnterpriseEventRegistrationService.name);
  private readonly strategies: RegistrationStrategy[] = [];
  private readonly registeredServices = new Map<string, EventHandlerMetadata[]>();

  constructor(
    private readonly discoveryService: DiscoveryService,
    private readonly metadataScanner: MetadataScanner,
    private readonly reflector: Reflector,
    private readonly eventDiscoveryService: EventDiscoveryService,
  ) {
    this.initializeStrategies();
  }

  async onModuleInit() {
    this.logger.log('Enterprise Event Registration Service initialized');
    await this.discoverAndRegisterAllServices();
  }

  private initializeStrategies() {
    // Strategy 1: Decorator-based registration (highest priority)
    this.strategies.push({
      name: 'decorator',
      priority: 100,
      canHandle: (instance) => {
        const metadata = this.reflector.get<AutoRegisterEventsOptions>(
          AUTO_REGISTER_EVENTS_METADATA,
          instance.constructor
        );
        return metadata?.enabled === true && metadata?.strategy === 'decorator';
      },
      register: async (instance) => {
        return this.registerDecoratorBased(instance);
      }
    });

    // Strategy 2: Interface-based registration
    this.strategies.push({
      name: 'interface',
      priority: 80,
      canHandle: (instance) => {
        return this.implementsInterface(instance, 'AutoEventHandlerProvider');
      },
      register: async (instance) => {
        return this.registerInterfaceBased(instance as AutoEventHandlerProvider);
      }
    });

    // Strategy 3: Base class registration (lowest priority)
    this.strategies.push({
      name: 'base-class',
      priority: 60,
      canHandle: (instance) => {
        return instance.constructor.name.includes('AutoEventHandlerBase') ||
               instance.constructor.prototype.hasOwnProperty('registerEventHandlersWithRetry');
      },
      register: async (instance) => {
        return this.registerBaseClassBased(instance);
      }
    });
  }

  private async discoverAndRegisterAllServices(): Promise<void> {
    try {
      const providers = this.discoveryService.getProviders();
      const controllers = this.discoveryService.getControllers();

      const allInstances = [...providers, ...controllers]
        .map(wrapper => wrapper.instance)
        .filter(instance => instance && typeof instance === 'object');

      this.logger.log(`Discovered ${allInstances.length} potential services for event registration`);

      let totalRegistered = 0;
      for (const instance of allInstances) {
        const registered = await this.registerService(instance);
        totalRegistered += registered;
      }

      this.logger.log(`Enterprise registration completed. Registered ${totalRegistered} total handlers across ${this.registeredServices.size} services`);
    } catch (error) {
      this.logger.error('Failed to discover and register services:', error);
    }
  }

  private async registerService(instance: any): Promise<number> {
    const serviceName = instance.constructor.name;
    
    // Find the best strategy for this service
    const strategy = this.strategies
      .filter(s => s.canHandle(instance))
      .sort((a, b) => b.priority - a.priority)[0];

    if (!strategy) {
      return 0; // No suitable strategy found
    }

    try {
      this.logger.debug(`Using ${strategy.name} strategy for ${serviceName}`);
      const registeredCount = await strategy.register(instance);
      
      if (registeredCount > 0) {
        this.logger.log(`Registered ${registeredCount} handlers for ${serviceName} using ${strategy.name} strategy`);
      }
      
      return registeredCount;
    } catch (error) {
      this.logger.error(`Failed to register ${serviceName} using ${strategy.name} strategy:`, error);
      return 0;
    }
  }

  private async registerDecoratorBased(instance: any): Promise<number> {
    const metadata = this.reflector.get<AutoRegisterEventsOptions>(
      AUTO_REGISTER_EVENTS_METADATA,
      instance.constructor
    );

    if (!metadata?.enabled) {
      return 0;
    }

    // Use the existing EventDiscoveryService for decorator-based registration
    return this.eventDiscoveryService.registerEventHandlers(instance);
  }

  private async registerInterfaceBased(provider: AutoEventHandlerProvider): Promise<number> {
    try {
      // Validate handlers if validation method exists
      if (provider.validateEventHandlers && !provider.validateEventHandlers()) {
        this.logger.warn(`Event handler validation failed for ${provider.constructor.name}`);
        return 0;
      }

      const handlers = provider.getEventHandlers();
      const serviceInstance = provider.getServiceInstance();

      let registeredCount = 0;
      for (const handler of handlers) {
        try {
          const method = serviceInstance[handler.methodName];
          if (typeof method === 'function') {
            await this.eventDiscoveryService.registerHandler(serviceInstance, handler.methodName, {
              eventType: handler.eventType,
              priority: handler.priority,
              async: handler.async,
              retry: handler.retry,
              ...handler.options
            });
            registeredCount++;
          }
        } catch (error) {
          this.logger.error(`Failed to register handler ${handler.methodName} for ${handler.eventType}:`, error);
        }
      }

      // Call optional callback
      if (provider.onEventHandlersRegistered) {
        provider.onEventHandlersRegistered(handlers);
      }

      return registeredCount;
    } catch (error) {
      this.logger.error(`Failed to register interface-based handlers for ${provider.constructor.name}:`, error);
      return 0;
    }
  }

  private async registerBaseClassBased(instance: any): Promise<number> {
    // For base class approach, let the base class handle registration
    // We just need to ensure the EventDiscoveryService is available
    return this.eventDiscoveryService.registerEventHandlers(instance);
  }

  private implementsInterface(instance: any, interfaceName: string): boolean {
    return instance && typeof instance.getEventHandlers === 'function' && 
           typeof instance.getServiceInstance === 'function';
  }

  // EventHandlerRegistrar implementation
  async registerEventHandlers(service: AutoEventHandlerProvider): Promise<number> {
    return this.registerInterfaceBased(service);
  }

  async unregisterEventHandlers(service: AutoEventHandlerProvider): Promise<number> {
    // Implementation for unregistering handlers
    const serviceName = service.constructor.name;
    const handlers = this.registeredServices.get(serviceName) || [];
    this.registeredServices.delete(serviceName);
    return handlers.length;
  }

  getRegisteredHandlers(service: AutoEventHandlerProvider): EventHandlerMetadata[] {
    const serviceName = service.constructor.name;
    return this.registeredServices.get(serviceName) || [];
  }

  // Additional enterprise features
  getRegistrationStats() {
    return {
      totalServices: this.registeredServices.size,
      totalHandlers: Array.from(this.registeredServices.values()).reduce((sum, handlers) => sum + handlers.length, 0),
      servicesByStrategy: this.getServicesByStrategy()
    };
  }

  private getServicesByStrategy() {
    const stats: Record<string, number> = {};
    for (const [serviceName, handlers] of this.registeredServices) {
      // Determine strategy used for this service
      // This is a simplified implementation
      stats[serviceName] = handlers.length;
    }
    return stats;
  }
}
