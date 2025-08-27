import { Injectable, Logger, OnModuleInit, Type } from '@nestjs/common';
import { DiscoveryService, MetadataScanner, Reflector } from '@nestjs/core';
import { EventDiscoveryService } from './event-discovery.service';
import { AUTO_REGISTER_EVENTS_METADATA } from '../decorators/auto-register-events.decorator';

@Injectable()
export class AutoRegistrationService implements OnModuleInit {
  private readonly logger = new Logger(AutoRegistrationService.name);

  constructor(
    private readonly discoveryService: DiscoveryService,
    private readonly metadataScanner: MetadataScanner,
    private readonly reflector: Reflector,
    private readonly eventDiscoveryService: EventDiscoveryService,
  ) {}

  async onModuleInit() {
    this.logger.log('AutoRegistrationService: Starting automatic discovery...');
    await this.scanAndRegisterAllServices();
  }

  private async scanAndRegisterAllServices(): Promise<void> {
    try {
      // Get all providers and controllers from the entire application
      const providers = this.discoveryService.getProviders();
      const controllers = this.discoveryService.getControllers();

      const allInstances = [...providers, ...controllers]
        .map(wrapper => wrapper.instance)
        .filter(instance => instance && typeof instance === 'object');

      this.logger.log(`AutoRegistrationService: Found ${allInstances.length} services to scan`);

      let totalRegistered = 0;
      for (const instance of allInstances) {
        const registered = await this.registerServiceIfDecorated(instance);
        totalRegistered += registered;
      }

      this.logger.log(`AutoRegistrationService: Auto-registered handlers for ${totalRegistered} services`);
    } catch (error) {
      this.logger.error('AutoRegistrationService: Failed to scan and register services:', error);
    }
  }

  private async registerServiceIfDecorated(instance: any): Promise<number> {
    const serviceName = instance.constructor.name;
    
    // Check if service has @AutoEvents decorator
    const metadata = this.reflector.get<{ enabled?: boolean }>(
      AUTO_REGISTER_EVENTS_METADATA,
      instance.constructor
    );

    if (!metadata?.enabled) {
      return 0; // Not decorated with @AutoEvents
    }

    try {
      this.logger.debug(`AutoRegistrationService: Found @AutoEvents service: ${serviceName}`);
      const registeredCount = await this.eventDiscoveryService.registerEventHandlers(instance);
      
      if (registeredCount > 0) {
        this.logger.log(`AutoRegistrationService: Auto-registered ${registeredCount} event handlers for ${serviceName}`);
      }
      
      return registeredCount;
    } catch (error) {
      this.logger.error(`AutoRegistrationService: Failed to auto-register event handlers for ${serviceName}:`, error);
      return 0;
    }
  }
}
