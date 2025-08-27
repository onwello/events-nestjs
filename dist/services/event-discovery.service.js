"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var EventDiscoveryService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.EventDiscoveryService = void 0;
const common_1 = require("@nestjs/common");
const core_1 = require("@nestjs/core");
const auto_event_handler_decorator_1 = require("../decorators/auto-event-handler.decorator");
const event_system_service_1 = require("./event-system.service");
let EventDiscoveryService = EventDiscoveryService_1 = class EventDiscoveryService {
    constructor(reflector, eventSystemService) {
        this.reflector = reflector;
        this.eventSystemService = eventSystemService;
        this.logger = new common_1.Logger(EventDiscoveryService_1.name);
        this.consumer = null;
    }
    async onModuleInit() {
        this.logger.log('EventDiscoveryService onModuleInit called');
        await this.initializeConsumer();
        // Note: We'll rely on manual registration for now since automatic discovery
        // requires access to internal NestJS services that aren't available in this context
        this.logger.log('EventDiscoveryService initialized - manual registration required');
    }
    async initializeConsumer() {
        try {
            // Wait for the event system to be ready
            let attempts = 0;
            const maxAttempts = 20;
            while (attempts < maxAttempts) {
                try {
                    const eventSystem = this.eventSystemService.getEventSystem();
                    this.consumer = eventSystem.consumer;
                    this.logger.log('Event discovery service initialized successfully');
                    return;
                }
                catch (error) {
                    attempts++;
                    if (attempts >= maxAttempts) {
                        throw error;
                    }
                    // Wait 50ms before retrying
                    await new Promise(resolve => setTimeout(resolve, 50));
                }
            }
        }
        catch (error) {
            this.logger.error('Failed to initialize event discovery service', error);
        }
    }
    /**
     * Manually register event handlers from a service instance
     * This method can be called by services that want to register their handlers
     */
    async registerEventHandlers(instance) {
        if (!this.consumer) {
            this.logger.warn('Consumer not initialized, skipping handler registration');
            return 0;
        }
        const prototype = Object.getPrototypeOf(instance);
        const methodNames = Object.getOwnPropertyNames(prototype).filter(name => name !== 'constructor' && typeof prototype[name] === 'function');
        let registeredCount = 0;
        for (const methodName of methodNames) {
            const metadata = this.reflector.get(auto_event_handler_decorator_1.AUTO_EVENT_HANDLER_METADATA, instance[methodName]);
            if (metadata) {
                this.registerHandler(instance, methodName, metadata);
                registeredCount++;
            }
        }
        if (registeredCount > 0) {
            this.logger.log(`Registered ${registeredCount} event handlers from ${instance.constructor.name}`);
        }
        return registeredCount;
    }
    registerHandler(instance, methodKey, metadata) {
        const eventType = metadata.eventType;
        const handler = instance[methodKey].bind(instance);
        try {
            this.consumer.subscribe(eventType, async (event) => {
                try {
                    await handler(event);
                }
                catch (error) {
                    this.logger.error(`Error handling event ${eventType} in ${instance.constructor.name}.${methodKey}:`, error);
                }
            });
            this.logger.log(`Registered auto event handler: ${instance.constructor.name}.${methodKey} for ${eventType}`);
        }
        catch (error) {
            this.logger.error(`Failed to register auto handler for ${eventType}:`, error);
        }
    }
};
exports.EventDiscoveryService = EventDiscoveryService;
exports.EventDiscoveryService = EventDiscoveryService = EventDiscoveryService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [core_1.Reflector,
        event_system_service_1.EventSystemService])
], EventDiscoveryService);
