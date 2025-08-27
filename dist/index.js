"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateEventHash = exports.generateEventId = exports.createEventEnvelope = exports.createEventSystemBuilder = exports.createEventSystem = exports.ConfigValidator = exports.ConfigFactory = exports.EventUtils = exports.EventsModule = exports.EventDiscoveryService = exports.AutoEventHandlerService = exports.EventHandlerRegistryService = exports.EventConsumerService = exports.EventPublisherService = exports.EventSystemService = exports.getAutoEventHandlerMetadata = exports.AutoEventHandler = exports.getEventSubscriberMetadata = exports.getEventPublisherMetadata = exports.EventSubscriber = exports.EventPublisher = exports.EventHandler = void 0;
// Core decorators - Tree-shakable individual exports
var decorators_1 = require("./decorators");
Object.defineProperty(exports, "EventHandler", { enumerable: true, get: function () { return decorators_1.EventHandler; } });
Object.defineProperty(exports, "EventPublisher", { enumerable: true, get: function () { return decorators_1.EventPublisher; } });
Object.defineProperty(exports, "EventSubscriber", { enumerable: true, get: function () { return decorators_1.EventSubscriber; } });
Object.defineProperty(exports, "getEventPublisherMetadata", { enumerable: true, get: function () { return decorators_1.getEventPublisherMetadata; } });
Object.defineProperty(exports, "getEventSubscriberMetadata", { enumerable: true, get: function () { return decorators_1.getEventSubscriberMetadata; } });
var auto_event_handler_decorator_1 = require("./decorators/auto-event-handler.decorator");
Object.defineProperty(exports, "AutoEventHandler", { enumerable: true, get: function () { return auto_event_handler_decorator_1.AutoEventHandler; } });
Object.defineProperty(exports, "getAutoEventHandlerMetadata", { enumerable: true, get: function () { return auto_event_handler_decorator_1.getAutoEventHandlerMetadata; } });
// Services - Tree-shakable individual exports
var services_1 = require("./services");
Object.defineProperty(exports, "EventSystemService", { enumerable: true, get: function () { return services_1.EventSystemService; } });
Object.defineProperty(exports, "EventPublisherService", { enumerable: true, get: function () { return services_1.EventPublisherService; } });
Object.defineProperty(exports, "EventConsumerService", { enumerable: true, get: function () { return services_1.EventConsumerService; } });
Object.defineProperty(exports, "EventHandlerRegistryService", { enumerable: true, get: function () { return services_1.EventHandlerRegistryService; } });
Object.defineProperty(exports, "AutoEventHandlerService", { enumerable: true, get: function () { return services_1.AutoEventHandlerService; } });
Object.defineProperty(exports, "EventDiscoveryService", { enumerable: true, get: function () { return services_1.EventDiscoveryService; } });
// Modules - Tree-shakable individual exports
var modules_1 = require("./modules");
Object.defineProperty(exports, "EventsModule", { enumerable: true, get: function () { return modules_1.EventsModule; } });
// Utilities - Tree-shakable individual exports
var utils_1 = require("./utils");
Object.defineProperty(exports, "EventUtils", { enumerable: true, get: function () { return utils_1.EventUtils; } });
Object.defineProperty(exports, "ConfigFactory", { enumerable: true, get: function () { return utils_1.ConfigFactory; } });
Object.defineProperty(exports, "ConfigValidator", { enumerable: true, get: function () { return utils_1.ConfigValidator; } });
// Re-export functions and classes - Tree-shakable
var events_1 = require("@logistically/events");
Object.defineProperty(exports, "createEventSystem", { enumerable: true, get: function () { return events_1.createEventSystem; } });
Object.defineProperty(exports, "createEventSystemBuilder", { enumerable: true, get: function () { return events_1.createEventSystemBuilder; } });
Object.defineProperty(exports, "createEventEnvelope", { enumerable: true, get: function () { return events_1.createEventEnvelope; } });
var event_types_1 = require("@logistically/events/dist/event-types");
Object.defineProperty(exports, "generateEventId", { enumerable: true, get: function () { return event_types_1.generateEventId; } });
Object.defineProperty(exports, "generateEventHash", { enumerable: true, get: function () { return event_types_1.generateEventHash; } });
// Note: Individual named exports above provide better tree-shaking
// than barrel exports. Import only what you need:
// 
// import { EventHandler } from '@logistically/events-nestjs';
// import { EventPublisherService } from '@logistically/events-nestjs';
// import { EventsModule } from '@logistically/events-nestjs';
