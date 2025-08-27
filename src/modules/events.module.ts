import { Module, Global, DynamicModule } from '@nestjs/common';
import { Reflector, DiscoveryService, MetadataScanner } from '@nestjs/core';
import { EventSystemService } from '../services/event-system.service';
import { EventPublisherService } from '../services/event-publisher.service';
import { EventHandlerRegistryService } from '../services/event-handler-registry.service';
import { AutoEventHandlerService } from '../services/auto-event-handler.service';
import { EventDiscoveryService } from '../services/event-discovery.service';
import { NestJSEventsModuleOptions } from '../types/config.types';
import { ConfigFactory } from '../utils/config.factory';

@Global()
@Module({
  // Base module is empty - all functionality comes from dynamic modules
  providers: [],
  exports: [],
})
export class EventsModule {
  static forRoot(options: Partial<NestJSEventsModuleOptions> = {}): DynamicModule {
    console.log('EventsModule.forRoot called with options:', JSON.stringify(options, null, 2));
    
    // Merge user options with environment defaults
    const mergedOptions = ConfigFactory.mergeWithDefaults(options);
    
    // Determine if autoDiscovery should be enabled
    const autoDiscovery = mergedOptions.autoDiscovery ?? false;
    
    console.log('EventsModule.forRoot - autoDiscovery:', autoDiscovery);
    console.log('EventsModule.forRoot - mergedOptions:', JSON.stringify(mergedOptions, null, 2));
    
    const providers: any[] = [
      {
        provide: EventSystemService,
        useFactory: () => new EventSystemService(mergedOptions),
      },
      EventPublisherService,
      EventHandlerRegistryService,
      AutoEventHandlerService,
      Reflector,
    ];

    // Only add EventDiscoveryService if autoDiscovery is enabled
    if (autoDiscovery) {
      providers.push(EventDiscoveryService);
      console.log('EventDiscoveryService added to providers');
    } else {
      console.log('EventDiscoveryService NOT added - autoDiscovery is false');
    }

    const exports: any[] = [
      EventSystemService,
      EventPublisherService,
      EventHandlerRegistryService,
      AutoEventHandlerService,
    ];

    // Only export EventDiscoveryService if autoDiscovery is enabled
    if (autoDiscovery) {
      exports.push(EventDiscoveryService);
    }
    
    return {
      module: EventsModule,
      imports: [],
      providers,
      exports,
      global: mergedOptions.global ?? true,
    };
  }

  static forFeature(): DynamicModule {
    return {
      module: EventsModule,
      imports: [],
      providers: [
        EventPublisherService, 
        EventHandlerRegistryService, 
        AutoEventHandlerService,
        Reflector,
      ],
      exports: [
        EventPublisherService, 
        EventHandlerRegistryService,
        AutoEventHandlerService
      ],
    };
  }
}
