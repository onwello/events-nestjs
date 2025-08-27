import { DynamicModule, Module, Provider } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { EventSystemService } from '../services/event-system.service';
import { EventPublisherService } from '../services/event-publisher.service';
import { EventConsumerService } from '../services/event-consumer.service';
import { EventHandlerRegistryService } from '../services/event-handler-registry.service';
import { AutoEventHandlerService } from '../services/auto-event-handler.service';
import { EventDiscoveryService } from '../services/event-discovery.service';
import { EventMetadataExplorer } from '../services/event-metadata-explorer.service';
import { EventListenersController } from '../services/event-listeners-controller.service';
import { EventModuleScanner } from '../services/event-module-scanner.service';
import { AutoRegistrationTriggerService } from '../services/auto-registration-trigger.service';
import { GlobalEventHandlerService } from '../services/global-event-handler.service';
import { SimpleEventHandlerService } from '../services/simple-event-handler.service';
import { PerformanceMonitorService } from '../services/performance-monitor.service';
import { ConfigFactory } from '../utils/config.factory';
import { ConfigValidator } from '../utils/config.validator';
import { NestJSEventsModuleOptions } from '../types/config.types';

@Module({})
export class EventsModule {
  static forRoot(options: NestJSEventsModuleOptions): DynamicModule {
    const config = ConfigFactory.mergeWithDefaults(options);
    ConfigValidator.validateAll(config);

    const baseProviders: Provider[] = [
      {
        provide: 'EVENTS_CONFIG',
        useValue: config,
      },
      Reflector, // Add Reflector for EventDiscoveryService
      EventSystemService,
      EventPublisherService,
      EventConsumerService,
      EventHandlerRegistryService,
      AutoEventHandlerService,
      EventDiscoveryService,
      GlobalEventHandlerService,
      SimpleEventHandlerService,
    ];

    // Only add automatic discovery services if autoDiscovery is enabled
    const autoDiscoveryProviders: Provider[] = config.autoDiscovery ? [
      EventMetadataExplorer,
      EventListenersController,
      EventModuleScanner,
      AutoRegistrationTriggerService,
      PerformanceMonitorService, // Performance monitoring requires autoDiscovery
    ] : [];

    const providers = [...baseProviders, ...autoDiscoveryProviders];

    const baseExports = [
      EventSystemService,
      EventPublisherService,
      EventConsumerService,
      EventHandlerRegistryService,
      AutoEventHandlerService,
      EventDiscoveryService,
      GlobalEventHandlerService,
      SimpleEventHandlerService,
    ];

    // Only export automatic discovery services if autoDiscovery is enabled
    const autoDiscoveryExports = config.autoDiscovery ? [
      EventMetadataExplorer,
      EventListenersController,
      EventModuleScanner,
      AutoRegistrationTriggerService,
      PerformanceMonitorService, // Export performance monitoring with autoDiscovery
    ] : [];

    const exports = [...baseExports, ...autoDiscoveryExports];

    return {
      module: EventsModule,
      providers,
      exports,
      global: config.global || false,
    };
  }

  static forFeature(): DynamicModule {
    return {
      module: EventsModule,
      providers: [
        Reflector, // Add Reflector for EventDiscoveryService
        EventDiscoveryService,
        AutoEventHandlerService,
        GlobalEventHandlerService,
        SimpleEventHandlerService,
      ],
      exports: [
        EventDiscoveryService,
        AutoEventHandlerService,
        GlobalEventHandlerService,
        SimpleEventHandlerService,
      ],
    };
  }
}
