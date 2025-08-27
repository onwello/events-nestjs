import { DynamicModule, Module, Provider } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { EventSystemService } from '../services/event-system.service';
import { EventPublisherService } from '../services/event-publisher.service';
import { EventConsumerService } from '../services/event-consumer.service';
import { EventHandlerRegistryService } from '../services/event-handler-registry.service';
import { AutoEventHandlerService } from '../services/auto-event-handler.service';
import { EventDiscoveryService } from '../services/event-discovery.service';
import { GlobalEventHandlerService } from '../services/global-event-handler.service';
import { SimpleEventHandlerService } from '../services/simple-event-handler.service';
import { ConfigFactory } from '../utils/config.factory';
import { ConfigValidator } from '../utils/config.validator';
import { NestJSEventsModuleOptions } from '../types/config.types';

@Module({})
export class EventsModule {
  static forRoot(options: NestJSEventsModuleOptions): DynamicModule {
    const config = ConfigFactory.mergeWithDefaults(options);
    ConfigValidator.validateAll(config);

    const providers: Provider[] = [
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

    // Note: EnterpriseEventRegistrationService requires DiscoveryService and MetadataScanner
    // which are NestJS internal services. It's available but requires manual setup
    // in the root module where these services are available.

    return {
      module: EventsModule,
      providers,
      exports: [
        EventSystemService,
        EventPublisherService,
        EventConsumerService,
        EventHandlerRegistryService,
        AutoEventHandlerService,
        EventDiscoveryService,
        GlobalEventHandlerService,
        SimpleEventHandlerService,
      ],
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
