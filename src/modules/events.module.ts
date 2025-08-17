import { Module, Global, DynamicModule } from '@nestjs/common';
import { DiscoveryModule } from '@nestjs/core';
import { EventSystemService } from '../services/event-system.service';
import { EventPublisherService } from '../services/event-publisher.service';
import { EventConsumerService } from '../services/event-consumer.service';
import { NestJSEventsModuleOptions } from '../types/config.types';
import { ConfigFactory } from '../utils/config.factory';

@Global()
@Module({
  imports: [DiscoveryModule],
  // Remove base providers to avoid conflicts with dynamic modules
  providers: [],
  exports: [],
})
export class EventsModule {
  static forRoot(options: Partial<NestJSEventsModuleOptions> = {}): DynamicModule {
    // Merge user options with environment defaults
    const mergedOptions = ConfigFactory.mergeWithDefaults(options);
    
    return {
      module: EventsModule,
      imports: [DiscoveryModule],
      providers: [
        {
          provide: EventSystemService,
          useFactory: () => new EventSystemService(mergedOptions),
        },
        EventPublisherService,
        EventConsumerService,
      ],
      exports: [
        EventSystemService,
        EventPublisherService,
        EventConsumerService,
      ],
      global: mergedOptions.global ?? true,
    };
  }

  static forFeature(): DynamicModule {
    return {
      module: EventsModule,
      imports: [DiscoveryModule],
      providers: [EventPublisherService, EventConsumerService],
      exports: [EventPublisherService, EventConsumerService],
    };
  }
}
