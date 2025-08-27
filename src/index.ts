// Core exports
export { EventsModule } from './modules/events.module';
export { EventSystemService } from './services/event-system.service';
export { EventPublisherService } from './services/event-publisher.service';
export { EventConsumerService } from './services/event-consumer.service';
export { EventHandlerRegistryService } from './services/event-handler-registry.service';
export { AutoEventHandlerService } from './services/auto-event-handler.service';
export { EventDiscoveryService } from './services/event-discovery.service';
export { GlobalEventHandlerService } from './services/global-event-handler.service';
export { SimpleEventHandlerService } from './services/simple-event-handler.service';

// Decorators
export { AutoEventHandler, AutoEventHandlerOptions } from './decorators/auto-event-handler.decorator';
export { AutoEvents, AutoRegisterEventsOptions } from './decorators/auto-events.decorator';
export { EventPublisher } from './decorators/event-publisher.decorator';
export { EventSubscriber } from './decorators/event-subscriber.decorator';

// Types
export { NestJSEvent } from './types/event.types';
export { NestJSEventsModuleOptions } from './types/config.types';
export { NestJSEventHandler, NestJSEventPublisher, NestJSEventSubscriber } from './types/handler.types';
