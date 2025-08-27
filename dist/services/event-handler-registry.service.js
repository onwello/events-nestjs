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
var EventHandlerRegistryService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.EventHandlerRegistryService = void 0;
const common_1 = require("@nestjs/common");
const event_system_service_1 = require("./event-system.service");
let EventHandlerRegistryService = EventHandlerRegistryService_1 = class EventHandlerRegistryService {
    constructor(eventSystemService) {
        this.eventSystemService = eventSystemService;
        this.logger = new common_1.Logger(EventHandlerRegistryService_1.name);
        this.consumer = null;
        this.handlers = new Map();
    }
    async onModuleInit() {
        await this.initializeConsumer();
    }
    async initializeConsumer() {
        try {
            const eventSystem = this.eventSystemService.getEventSystem();
            this.consumer = eventSystem.consumer;
            this.logger.log('Event handler registry initialized successfully');
            // Register all handlers that were added before initialization
            for (const [eventType, handlers] of this.handlers.entries()) {
                for (const handler of handlers) {
                    await this.registerHandler(eventType, handler);
                }
            }
        }
        catch (error) {
            this.logger.error('Failed to initialize event handler registry', error);
        }
    }
    /**
     * Register an event handler manually
     */
    async registerEventHandler(registration) {
        const { eventType, handler, options } = registration;
        // Store the handler for later registration if consumer isn't ready
        if (!this.handlers.has(eventType)) {
            this.handlers.set(eventType, []);
        }
        this.handlers.get(eventType).push(registration);
        // If consumer is ready, register immediately
        if (this.consumer) {
            await this.registerHandler(eventType, registration);
        }
    }
    async registerHandler(eventType, registration) {
        if (!this.consumer) {
            throw new Error('Event consumer not initialized');
        }
        try {
            await this.consumer.subscribe(eventType, async (event) => {
                try {
                    await registration.handler(event.body);
                }
                catch (error) {
                    this.logger.error(`Error handling event ${eventType}:`, error);
                    // Handle retry logic if configured
                    if (registration.options?.retry) {
                        // Implement retry logic here
                        this.logger.warn(`Retry logic not implemented yet for event ${eventType}`);
                    }
                }
            });
            this.logger.log(`Registered event handler for ${eventType}`);
        }
        catch (error) {
            this.logger.error(`Failed to register event handler for ${eventType}:`, error);
        }
    }
    /**
     * Get all registered handlers for an event type
     */
    getHandlers(eventType) {
        return this.handlers.get(eventType) || [];
    }
    /**
     * Remove all handlers for an event type
     */
    async removeHandlers(eventType) {
        this.handlers.delete(eventType);
        // Note: Unsubscribing from the consumer would require tracking subscription IDs
        this.logger.log(`Removed all handlers for event type: ${eventType}`);
    }
};
exports.EventHandlerRegistryService = EventHandlerRegistryService;
exports.EventHandlerRegistryService = EventHandlerRegistryService = EventHandlerRegistryService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [event_system_service_1.EventSystemService])
], EventHandlerRegistryService);
