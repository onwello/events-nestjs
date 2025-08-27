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
var EventConsumerService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.EventConsumerService = void 0;
const common_1 = require("@nestjs/common");
const event_system_service_1 = require("./event-system.service");
const handler_types_1 = require("../types/handler.types");
let EventConsumerService = EventConsumerService_1 = class EventConsumerService {
    constructor(eventSystemService) {
        this.eventSystemService = eventSystemService;
        this.logger = new common_1.Logger(EventConsumerService_1.name);
        this.consumer = null;
        this.subscriptions = new Map();
    }
    async onModuleInit() {
        // Initialize consumer when module is ready
        this.logger.log('EventConsumerService initialized');
    }
    getConsumer() {
        if (!this.consumer) {
            this.consumer = this.eventSystemService.getEventSystem().consumer;
        }
        if (!this.consumer) {
            throw new Error('Event consumer not initialized');
        }
        return this.consumer;
    }
    /**
     * Subscribe to an event type
     */
    async subscribe(eventType, handler, options) {
        try {
            const consumer = this.getConsumer();
            const wrappedHandler = (0, handler_types_1.wrapNestJSEventHandler)(handler);
            await consumer.subscribe(eventType, wrappedHandler, options);
            this.subscriptions.set(eventType, handler);
            this.logger.debug(`Subscribed to event: ${eventType}`);
        }
        catch (error) {
            this.logger.error(`Failed to subscribe to event ${eventType}:`, error);
            throw error;
        }
    }
    /**
     * Subscribe to events matching a pattern
     */
    async subscribePattern(pattern, handler, options) {
        try {
            const consumer = this.getConsumer();
            const wrappedHandler = (0, handler_types_1.wrapNestJSPatternHandler)(handler);
            await consumer.subscribePattern(pattern, wrappedHandler, options);
            this.subscriptions.set(`pattern:${pattern}`, handler);
            this.logger.debug(`Subscribed to pattern: ${pattern}`);
        }
        catch (error) {
            this.logger.error(`Failed to subscribe to pattern ${pattern}:`, error);
            throw error;
        }
    }
    /**
     * Unsubscribe from an event type
     */
    async unsubscribe(eventType) {
        try {
            const consumer = this.getConsumer();
            await consumer.unsubscribe(eventType);
            this.subscriptions.delete(eventType);
            this.logger.debug(`Unsubscribed from event: ${eventType}`);
        }
        catch (error) {
            this.logger.error(`Failed to unsubscribe from event ${eventType}:`, error);
            throw error;
        }
    }
    /**
     * Unsubscribe from a pattern
     */
    async unsubscribePattern(pattern) {
        try {
            const consumer = this.getConsumer();
            await consumer.unsubscribePattern(pattern);
            this.subscriptions.delete(`pattern:${pattern}`);
            this.logger.debug(`Unsubscribed from pattern: ${pattern}`);
        }
        catch (error) {
            this.logger.error(`Failed to unsubscribe from pattern ${pattern}:`, error);
            throw error;
        }
    }
    /**
     * Get subscription information
     */
    getSubscriptions() {
        try {
            const consumer = this.getConsumer();
            return consumer.getSubscriptions();
        }
        catch (error) {
            this.logger.error('Failed to get subscriptions:', error);
            return [];
        }
    }
    /**
     * Get consumer statistics
     */
    getStats() {
        try {
            const consumer = this.getConsumer();
            return consumer.getStats();
        }
        catch (error) {
            this.logger.error('Failed to get consumer stats:', error);
            return null;
        }
    }
    /**
     * Discover and register event handlers automatically
     */
    async discoverEventHandlers() {
        // This method is no longer needed as automatic discovery is removed
    }
    /**
     * Scan an instance for event handlers
     */
    scanInstanceForEventHandlers(instance) {
        // This method is no longer needed as automatic discovery is removed
    }
    /**
     * Scan an instance for event subscribers
     */
    scanInstanceForEventSubscribers(instance) {
        // This method is no longer needed as automatic discovery is removed
    }
    /**
     * Register an event handler
     */
    async registerEventHandler(metadata, instance, methodKey) {
        const handler = instance[methodKey].bind(instance);
        try {
            await this.subscribe(metadata.eventType, handler, {
                groupId: metadata.subscriptionOptions?.groupId,
                consumerId: metadata.subscriptionOptions?.consumerId,
            });
        }
        catch (error) {
            this.logger.error(`Failed to register event handler ${metadata.eventType}:`, error);
        }
    }
    /**
     * Register an event subscriber
     */
    async registerEventSubscriber(metadata, instance, methodKey) {
        const handler = instance[methodKey].bind(instance);
        try {
            if (metadata.subscriptionOptions?.pattern) {
                await this.subscribePattern(metadata.eventType, handler, {
                    groupId: metadata.subscriptionOptions?.groupId,
                    consumerId: metadata.subscriptionOptions?.consumerId,
                });
            }
            else {
                await this.subscribe(metadata.eventType, handler, {
                    groupId: metadata.subscriptionOptions?.groupId,
                    consumerId: metadata.subscriptionOptions?.consumerId,
                });
            }
        }
        catch (error) {
            this.logger.error(`Failed to register event subscriber ${metadata.eventType}:`, error);
        }
    }
    /**
     * Check if the consumer is connected
     */
    isConnected() {
        return this.eventSystemService.isConnected();
    }
};
exports.EventConsumerService = EventConsumerService;
exports.EventConsumerService = EventConsumerService = EventConsumerService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [event_system_service_1.EventSystemService])
], EventConsumerService);
