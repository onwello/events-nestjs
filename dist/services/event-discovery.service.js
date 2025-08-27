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
const event_system_service_1 = require("./event-system.service");
const auto_event_handler_decorator_1 = require("../decorators/auto-event-handler.decorator");
let EventDiscoveryService = EventDiscoveryService_1 = class EventDiscoveryService {
    constructor(eventSystemService, reflector) {
        this.eventSystemService = eventSystemService;
        this.reflector = reflector;
        this.logger = new common_1.Logger(EventDiscoveryService_1.name);
        this.consumer = null;
    }
    async onModuleInit() {
        this.logger.log('EventDiscoveryService onModuleInit called');
        // Don't initialize consumer here - wait until it's actually needed
    }
    async getConsumer() {
        if (!this.consumer) {
            await this.initializeConsumer();
        }
        return this.consumer;
    }
    async initializeConsumer(maxAttempts = 10) {
        let attempts = 0;
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
    /**
     * Register a single event handler with explicit metadata
     * This method is used by the EventModuleScanner for automatic discovery
     */
    async registerHandler(instance, methodKey, metadata) {
        const consumer = await this.getConsumer();
        if (!consumer) {
            this.logger.warn('Consumer not initialized, skipping handler registration');
            return;
        }
        const eventType = metadata.eventType;
        const handler = instance[methodKey].bind(instance);
        try {
            consumer.subscribe(eventType, async (event) => {
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
    /**
     * Manually register event handlers from a service instance
     * This method can be called by services that want to register their handlers
     */
    async registerEventHandlers(instance) {
        const consumer = await this.getConsumer();
        if (!consumer) {
            this.logger.warn('Consumer not initialized, skipping handler registration');
            return 0;
        }
        // Get all method names from both prototype and instance
        const prototype = Object.getPrototypeOf(instance);
        const prototypeMethods = Object.getOwnPropertyNames(prototype).filter(name => name !== 'constructor' && typeof prototype[name] === 'function');
        const instanceMethods = Object.getOwnPropertyNames(instance).filter(name => typeof instance[name] === 'function');
        const allMethodNames = [...new Set([...prototypeMethods, ...instanceMethods])];
        this.logger.debug(`Scanning methods for ${instance.constructor.name}: ${allMethodNames.join(', ')}`);
        let registeredCount = 0;
        for (const methodName of allMethodNames) {
            const method = instance[methodName];
            if (typeof method === 'function') {
                this.logger.debug(`Checking method: ${methodName}`);
                // Try to get metadata using the helper function
                let metadata = (0, auto_event_handler_decorator_1.getAutoEventHandlerMetadata)(instance, methodName);
                // If not found, try using reflector directly
                if (!metadata) {
                    metadata = this.reflector.get(auto_event_handler_decorator_1.AUTO_EVENT_HANDLER_METADATA, method);
                }
                this.logger.debug(`Metadata for ${methodName}:`, metadata);
                if (metadata && metadata.eventType) {
                    await this.registerHandler(instance, methodName, metadata);
                    registeredCount++;
                }
            }
        }
        if (registeredCount > 0) {
            this.logger.log(`Registered ${registeredCount} event handlers from ${instance.constructor.name}`);
        }
        return registeredCount;
    }
};
exports.EventDiscoveryService = EventDiscoveryService;
exports.EventDiscoveryService = EventDiscoveryService = EventDiscoveryService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [event_system_service_1.EventSystemService,
        core_1.Reflector])
], EventDiscoveryService);
