// Services - Tree-shakable individual exports
export { EventSystemService, EventPublisherService, EventConsumerService, EventHandlerRegistryService, AutoEventHandlerService, EventDiscoveryService } from './services';
export { EnterpriseEventRegistrationService } from './services/enterprise-event-registration.service';

// Decorators - Tree-shakable individual exports
export { EventHandler, EventPublisher, EventSubscriber, getEventPublisherMetadata, getEventSubscriberMetadata } from './decorators';
export { AutoEventHandler, getAutoEventHandlerMetadata } from './decorators/auto-event-handler.decorator';
export { AutoRegisterEvents, AutoEvents, AutoRegisterEventsOptions } from './decorators/auto-register-events.decorator';

// Base classes - Tree-shakable individual exports
export { AutoEventHandlerBase } from './base/auto-event-handler.base';

// Interfaces - Tree-shakable individual exports
export { AutoEventHandlerProvider, EventHandlerRegistrar, EventHandlerMetadata, EventHandlerMethod } from './interfaces/auto-event-handler.interface';

// Mixins - Tree-shakable individual exports
export { AutoEventHandlerMixin, AutoEventHandlerMixinWithConfig } from './mixins/auto-event-handler.mixin';

// Modules - Tree-shakable individual exports
export { EventsModule } from './modules/events.module';

// Types - Tree-shakable individual exports
export { NestJSEvent, NestJSEventMetadata } from './types/event.types';
export { NestJSEventHandler, NestJSEventPublisher, NestJSEventSubscriber } from './types/handler.types';
export { NestJSEventsModuleOptions } from './types/config.types';

// Utilities - Tree-shakable individual exports
export { wrapNestJSEventHandler, wrapNestJSPatternHandler } from './types/handler.types';
