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
const event_handler_registry_service_1 = require("../services/event-handler-registry.service");
const auto_event_handler_service_1 = require("../services/auto-event-handler.service");
const event_discovery_service_1 = require("../services/event-discovery.service");
const config_factory_1 = require("../utils/config.factory");
let EventsModule = EventsModule_1 = class EventsModule {
    static forRoot(options = {}) {
        console.log('EventsModule.forRoot called with options:', JSON.stringify(options, null, 2));
        // Merge user options with environment defaults
        const mergedOptions = config_factory_1.ConfigFactory.mergeWithDefaults(options);
        // Determine if autoDiscovery should be enabled
        const autoDiscovery = mergedOptions.autoDiscovery ?? false;
        console.log('EventsModule.forRoot - autoDiscovery:', autoDiscovery);
        console.log('EventsModule.forRoot - mergedOptions:', JSON.stringify(mergedOptions, null, 2));
        const providers = [
            {
                provide: event_system_service_1.EventSystemService,
                useFactory: () => new event_system_service_1.EventSystemService(mergedOptions),
            },
            event_publisher_service_1.EventPublisherService,
            event_handler_registry_service_1.EventHandlerRegistryService,
            auto_event_handler_service_1.AutoEventHandlerService,
            core_1.Reflector,
        ];
        // Only add EventDiscoveryService if autoDiscovery is enabled
        if (autoDiscovery) {
            providers.push(event_discovery_service_1.EventDiscoveryService);
            console.log('EventDiscoveryService added to providers');
        }
        else {
            console.log('EventDiscoveryService NOT added - autoDiscovery is false');
        }
        const exports = [
            event_system_service_1.EventSystemService,
            event_publisher_service_1.EventPublisherService,
            event_handler_registry_service_1.EventHandlerRegistryService,
            auto_event_handler_service_1.AutoEventHandlerService,
        ];
        // Only export EventDiscoveryService if autoDiscovery is enabled
        if (autoDiscovery) {
            exports.push(event_discovery_service_1.EventDiscoveryService);
        }
        return {
            module: EventsModule_1,
            imports: [],
            providers,
            exports,
            global: mergedOptions.global ?? true,
        };
    }
    static forFeature() {
        return {
            module: EventsModule_1,
            imports: [],
            providers: [
                event_publisher_service_1.EventPublisherService,
                event_handler_registry_service_1.EventHandlerRegistryService,
                auto_event_handler_service_1.AutoEventHandlerService,
                core_1.Reflector,
            ],
            exports: [
                event_publisher_service_1.EventPublisherService,
                event_handler_registry_service_1.EventHandlerRegistryService,
                auto_event_handler_service_1.AutoEventHandlerService
            ],
        };
    }
};
exports.EventsModule = EventsModule;
exports.EventsModule = EventsModule = EventsModule_1 = __decorate([
    (0, common_1.Global)(),
    (0, common_1.Module)({
        // Base module is empty - all functionality comes from dynamic modules
        providers: [],
        exports: [],
    })
], EventsModule);
