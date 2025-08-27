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
var EventPublisherService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.EventPublisherService = void 0;
const common_1 = require("@nestjs/common");
const event_system_service_1 = require("./event-system.service");
const events_1 = require("@logistically/events");
let EventPublisherService = EventPublisherService_1 = class EventPublisherService {
    constructor(eventSystemService) {
        this.eventSystemService = eventSystemService;
        this.logger = new common_1.Logger(EventPublisherService_1.name);
        this.publisher = null;
    }
    getPublisher() {
        if (!this.publisher) {
            this.publisher = this.eventSystemService.getEventSystem().publisher;
        }
        if (!this.publisher) {
            throw new Error('Event publisher not initialized');
        }
        return this.publisher;
    }
    /**
     * Publish a single event
     */
    async publish(eventType, data, options) {
        try {
            const publisher = this.getPublisher();
            // Create the event envelope using service name from config
            const serviceName = this.eventSystemService.getServiceName();
            const envelope = (0, events_1.createEventEnvelope)(eventType, serviceName, data);
            // Add NestJS metadata if provided
            if (options?.nestjsMetadata) {
                envelope.nestjsMetadata = options.nestjsMetadata;
            }
            await publisher.publish(eventType, data, options);
            this.logger.debug(`Event published: ${eventType}`);
        }
        catch (error) {
            this.logger.error(`Failed to publish event ${eventType}:`, error);
            throw error;
        }
    }
    /**
     * Publish a batch of events
     */
    async publishBatch(eventType, data, options) {
        try {
            const publisher = this.getPublisher();
            // Extract PublishOptions and BatchOptions from the combined options
            const publishOptions = {
                partitionKey: options?.partitionKey,
                partition: options?.partition,
                headers: options?.headers,
                correlationId: options?.correlationId,
                traceId: options?.traceId,
                priority: options?.priority,
                ttl: options?.ttl,
                ordering: options?.ordering,
                batchKey: options?.batchKey,
                // BatchOptions required fields
                maxSize: 100,
                maxWaitMs: 1000,
                maxConcurrentBatches: 1,
            };
            await publisher.publishBatch(eventType, data, publishOptions);
            this.logger.debug(`Batch published: ${eventType} with ${data.length} events`);
        }
        catch (error) {
            this.logger.error(`Failed to publish batch for ${eventType}:`, error);
            throw error;
        }
    }
    /**
     * Publish a NestJS event
     */
    async publishEvent(event) {
        try {
            const publisher = this.getPublisher();
            await publisher.publish(event.header.type, event.body);
            this.logger.debug(`NestJS event published: ${event.header.type}`);
        }
        catch (error) {
            this.logger.error(`Failed to publish NestJS event ${event.header.type}:`, error);
            throw error;
        }
    }
    /**
     * Force flush any pending batched events
     */
    async forceFlush() {
        try {
            const publisher = this.getPublisher();
            await publisher.forceFlush();
            this.logger.debug('Forced flush of pending events');
        }
        catch (error) {
            this.logger.error('Failed to force flush events:', error);
            throw error;
        }
    }
    /**
     * Get publisher statistics
     */
    getStats() {
        try {
            const publisher = this.getPublisher();
            return publisher.getStats();
        }
        catch (error) {
            this.logger.error('Failed to get publisher stats:', error);
            return null;
        }
    }
    /**
     * Check if the publisher is connected
     */
    isConnected() {
        return this.eventSystemService.isConnected();
    }
};
exports.EventPublisherService = EventPublisherService;
exports.EventPublisherService = EventPublisherService = EventPublisherService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [event_system_service_1.EventSystemService])
], EventPublisherService);
