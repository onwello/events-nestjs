"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var EventsModule_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.EventsModule = void 0;
const common_1 = require("@nestjs/common");
const core_1 = require("@nestjs/core");
const event_system_service_1 = require("../services/event-system.service");
const event_publisher_service_1 = require("../services/event-publisher.service");
const event_consumer_service_1 = require("../services/event-consumer.service");
const event_handler_registry_service_1 = require("../services/event-handler-registry.service");
const auto_event_handler_service_1 = require("../services/auto-event-handler.service");
const event_discovery_service_1 = require("../services/event-discovery.service");
const global_event_handler_service_1 = require("../services/global-event-handler.service");
const simple_event_handler_service_1 = require("../services/simple-event-handler.service");
const config_factory_1 = require("../utils/config.factory");
const config_validator_1 = require("../utils/config.validator");
let EventsModule = EventsModule_1 = class EventsModule {
    static forRoot(options) {
        const config = config_factory_1.ConfigFactory.mergeWithDefaults(options);
        config_validator_1.ConfigValidator.validateAll(config);
        const providers = [
            {
                provide: 'EVENTS_CONFIG',
                useValue: config,
            },
            core_1.Reflector, // Add Reflector for EventDiscoveryService
            event_system_service_1.EventSystemService,
            event_publisher_service_1.EventPublisherService,
            event_consumer_service_1.EventConsumerService,
            event_handler_registry_service_1.EventHandlerRegistryService,
            auto_event_handler_service_1.AutoEventHandlerService,
            event_discovery_service_1.EventDiscoveryService,
            global_event_handler_service_1.GlobalEventHandlerService,
            simple_event_handler_service_1.SimpleEventHandlerService,
        ];
        return {
            module: EventsModule_1,
            providers,
            exports: [
                event_system_service_1.EventSystemService,
                event_publisher_service_1.EventPublisherService,
                event_consumer_service_1.EventConsumerService,
                event_handler_registry_service_1.EventHandlerRegistryService,
                auto_event_handler_service_1.AutoEventHandlerService,
                event_discovery_service_1.EventDiscoveryService,
                global_event_handler_service_1.GlobalEventHandlerService,
                simple_event_handler_service_1.SimpleEventHandlerService,
            ],
            global: config.global || false,
        };
    }
    static forFeature() {
        return {
            module: EventsModule_1,
            providers: [
                core_1.Reflector, // Add Reflector for EventDiscoveryService
                event_discovery_service_1.EventDiscoveryService,
                auto_event_handler_service_1.AutoEventHandlerService,
                global_event_handler_service_1.GlobalEventHandlerService,
                simple_event_handler_service_1.SimpleEventHandlerService,
            ],
            exports: [
                event_discovery_service_1.EventDiscoveryService,
                auto_event_handler_service_1.AutoEventHandlerService,
                global_event_handler_service_1.GlobalEventHandlerService,
                simple_event_handler_service_1.SimpleEventHandlerService,
            ],
        };
    }
};
exports.EventsModule = EventsModule;
exports.EventsModule = EventsModule = EventsModule_1 = __decorate([
    (0, common_1.Module)({})
], EventsModule);
