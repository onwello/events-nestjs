// Core decorators - Tree-shakable individual exports
export { EventHandler, EventPublisher, EventSubscriber, getEventPublisherMetadata, getEventSubscriberMetadata } from './decorators';
export { AutoEventHandler, getAutoEventHandlerMetadata } from './decorators/auto-event-handler.decorator';

// Services - Tree-shakable individual exports
export { EventSystemService, EventPublisherService, EventConsumerService, EventHandlerRegistryService, AutoEventHandlerService, EventDiscoveryService } from './services';

// Modules - Tree-shakable individual exports
export { EventsModule } from './modules';

// Types and interfaces - Tree-shakable individual exports
export type {
  NestJSEvent,
  NestJSEventMetadata,
  EventHandlerMetadata,
  EventPublisherMetadata,
  EventSubscriberMetadata,
  EventHandlerContext,
  EventHandlerResult,
  EventHandlerRegistry,
  EventPublisherRegistry,
  EventSubscriberRegistry,
  NestJSEventHandlerOptions,
  NestJSEventPublisherOptions,
  NestJSEventSubscriberOptions,
  NestJSEventsModuleOptions,
  RedisClusterConfig,
  RedisSentinelConfig,
  PartitioningConfig,
  OrderingConfig,
  SchemaConfig,
  ReplayConfig,
  DLQConfig,
  AdvancedRoutingConfig,
  wrapNestJSEventHandler,
  wrapNestJSPatternHandler,
} from './types';

// Utilities - Tree-shakable individual exports
export { EventUtils, ConfigFactory, ConfigValidator } from './utils';

// Re-export core types from @logistically/events - Tree-shakable
export type {
  EventPublisher as CoreEventPublisher,
  EventConsumer as CoreEventConsumer,
  EventSystemConfig,
  PublisherConfig,
  ConsumerConfig,
  EventEnvelope,
  Transport,
  TransportCapabilities,
  MessageHandler,
  PatternHandler,
  EventRouter,
  RoutingConfig,
  EventRoute,
  EventValidator,
  ValidationResult,
} from '@logistically/events';

// Re-export functions and classes - Tree-shakable
export {
  createEventSystem,
  createEventSystemBuilder,
  createEventEnvelope,
} from '@logistically/events';

// Re-export from event-types submodule - Tree-shakable
export type { EventHeader } from '@logistically/events/dist/event-types';
export { generateEventId, generateEventHash } from '@logistically/events/dist/event-types';

// Note: Individual named exports above provide better tree-shaking
// than barrel exports. Import only what you need:
// 
// import { EventHandler } from '@logistically/events-nestjs';
// import { EventPublisherService } from '@logistically/events-nestjs';
// import { EventsModule } from '@logistically/events-nestjs';
