// Core decorators
export * from './decorators/event-handler.decorator';
export * from './decorators/event-publisher.decorator';
export * from './decorators/event-subscriber.decorator';

// Services
export * from './services/event-system.service';
export * from './services/event-publisher.service';
export * from './services/event-consumer.service';

// Modules
export * from './modules/events.module';

// Types and interfaces
export * from './types/event.types';
export * from './types/handler.types';
export * from './types/config.types';

// Utilities
export * from './utils/event.utils';
export * from './utils/config.factory';
export * from './utils/config.validator';

// Re-export core types from @logistically/events
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

// Re-export functions and classes
export {
  createEventSystem,
  createEventSystemBuilder,
  createEventEnvelope,
} from '@logistically/events';

// Re-export from event-types submodule
export type { EventHeader } from '@logistically/events/dist/event-types';
export { generateEventId, generateEventHash } from '@logistically/events/dist/event-types';
