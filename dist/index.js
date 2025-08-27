"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.wrapNestJSPatternHandler = exports.wrapNestJSEventHandler = exports.EventsModule = exports.AutoEventHandlerMixinWithConfig = exports.AutoEventHandlerMixin = exports.AutoEventHandlerBase = exports.AutoEvents = exports.AutoRegisterEvents = exports.getAutoEventHandlerMetadata = exports.AutoEventHandler = exports.getEventSubscriberMetadata = exports.getEventPublisherMetadata = exports.EventSubscriber = exports.EventPublisher = exports.EventHandler = exports.EnterpriseEventRegistrationService = exports.EventDiscoveryService = exports.AutoEventHandlerService = exports.EventHandlerRegistryService = exports.EventConsumerService = exports.EventPublisherService = exports.EventSystemService = void 0;
// Services - Tree-shakable individual exports
var services_1 = require("./services");
Object.defineProperty(exports, "EventSystemService", { enumerable: true, get: function () { return services_1.EventSystemService; } });
Object.defineProperty(exports, "EventPublisherService", { enumerable: true, get: function () { return services_1.EventPublisherService; } });
Object.defineProperty(exports, "EventConsumerService", { enumerable: true, get: function () { return services_1.EventConsumerService; } });
Object.defineProperty(exports, "EventHandlerRegistryService", { enumerable: true, get: function () { return services_1.EventHandlerRegistryService; } });
Object.defineProperty(exports, "AutoEventHandlerService", { enumerable: true, get: function () { return services_1.AutoEventHandlerService; } });
Object.defineProperty(exports, "EventDiscoveryService", { enumerable: true, get: function () { return services_1.EventDiscoveryService; } });
var enterprise_event_registration_service_1 = require("./services/enterprise-event-registration.service");
Object.defineProperty(exports, "EnterpriseEventRegistrationService", { enumerable: true, get: function () { return enterprise_event_registration_service_1.EnterpriseEventRegistrationService; } });
// Decorators - Tree-shakable individual exports
var decorators_1 = require("./decorators");
Object.defineProperty(exports, "EventHandler", { enumerable: true, get: function () { return decorators_1.EventHandler; } });
Object.defineProperty(exports, "EventPublisher", { enumerable: true, get: function () { return decorators_1.EventPublisher; } });
Object.defineProperty(exports, "EventSubscriber", { enumerable: true, get: function () { return decorators_1.EventSubscriber; } });
Object.defineProperty(exports, "getEventPublisherMetadata", { enumerable: true, get: function () { return decorators_1.getEventPublisherMetadata; } });
Object.defineProperty(exports, "getEventSubscriberMetadata", { enumerable: true, get: function () { return decorators_1.getEventSubscriberMetadata; } });
var auto_event_handler_decorator_1 = require("./decorators/auto-event-handler.decorator");
Object.defineProperty(exports, "AutoEventHandler", { enumerable: true, get: function () { return auto_event_handler_decorator_1.AutoEventHandler; } });
Object.defineProperty(exports, "getAutoEventHandlerMetadata", { enumerable: true, get: function () { return auto_event_handler_decorator_1.getAutoEventHandlerMetadata; } });
var auto_register_events_decorator_1 = require("./decorators/auto-register-events.decorator");
Object.defineProperty(exports, "AutoRegisterEvents", { enumerable: true, get: function () { return auto_register_events_decorator_1.AutoRegisterEvents; } });
Object.defineProperty(exports, "AutoEvents", { enumerable: true, get: function () { return auto_register_events_decorator_1.AutoEvents; } });
// Base classes - Tree-shakable individual exports
var auto_event_handler_base_1 = require("./base/auto-event-handler.base");
Object.defineProperty(exports, "AutoEventHandlerBase", { enumerable: true, get: function () { return auto_event_handler_base_1.AutoEventHandlerBase; } });
// Mixins - Tree-shakable individual exports
var auto_event_handler_mixin_1 = require("./mixins/auto-event-handler.mixin");
Object.defineProperty(exports, "AutoEventHandlerMixin", { enumerable: true, get: function () { return auto_event_handler_mixin_1.AutoEventHandlerMixin; } });
Object.defineProperty(exports, "AutoEventHandlerMixinWithConfig", { enumerable: true, get: function () { return auto_event_handler_mixin_1.AutoEventHandlerMixinWithConfig; } });
// Modules - Tree-shakable individual exports
var events_module_1 = require("./modules/events.module");
Object.defineProperty(exports, "EventsModule", { enumerable: true, get: function () { return events_module_1.EventsModule; } });
// Utilities - Tree-shakable individual exports
var handler_types_1 = require("./types/handler.types");
Object.defineProperty(exports, "wrapNestJSEventHandler", { enumerable: true, get: function () { return handler_types_1.wrapNestJSEventHandler; } });
Object.defineProperty(exports, "wrapNestJSPatternHandler", { enumerable: true, get: function () { return handler_types_1.wrapNestJSPatternHandler; } });
