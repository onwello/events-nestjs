"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EventUtils = void 0;
const events_1 = require("@logistically/events");
const event_types_1 = require("@logistically/events/dist/event-types");
class EventUtils {
    /**
     * Creates a new NestJS event with the given type and data
     */
    static createEvent(eventType, data, origin, metadata = {}, originPrefix) {
        const envelope = (0, events_1.createEventEnvelope)(eventType, origin, data, originPrefix);
        return {
            ...envelope,
            nestjsMetadata: {
                correlationId: metadata.correlationId,
                causationId: metadata.causationId,
                ...metadata,
            },
        };
    }
    /**
     * Generates a unique event ID
     */
    static generateEventId() {
        return (0, event_types_1.generateEventId)();
    }
    /**
     * Generates a hash for event data
     */
    static generateEventHash(data) {
        return (0, event_types_1.generateEventHash)(data);
    }
    /**
     * Generates a correlation ID for tracking related events
     */
    static generateCorrelationId() {
        return `corr-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    }
    /**
     * Creates a causation ID from a correlation ID
     */
    static createCausationId(correlationId) {
        return `caus-${correlationId}`;
    }
    /**
     * Validates if an event object is properly formatted
     */
    static validateEvent(event) {
        const isValid = (event &&
            typeof event === 'object' &&
            event.header &&
            typeof event.header === 'object' &&
            typeof event.header.id === 'string' &&
            typeof event.header.type === 'string' &&
            typeof event.header.origin === 'string' &&
            typeof event.header.timestamp === 'string' &&
            event.body !== undefined);
        return Boolean(isValid);
    }
    /**
     * Clones an event with new metadata
     */
    static cloneEvent(event, newMetadata = {}) {
        const newEnvelope = (0, events_1.createEventEnvelope)(event.header.type, event.header.origin, event.body, event.header.originPrefix);
        return {
            ...newEnvelope,
            nestjsMetadata: {
                ...event.nestjsMetadata,
                ...newMetadata,
            },
        };
    }
    /**
     * Creates a batch of events with shared correlation ID
     */
    static createEventBatch(events, origin, correlationId, originPrefix) {
        const sharedCorrelationId = correlationId || this.generateCorrelationId();
        return events.map((eventData, index) => {
            const causationId = index === 0
                ? sharedCorrelationId
                : this.createCausationId(sharedCorrelationId);
            return this.createEvent(eventData.type, eventData.data, origin, {
                ...eventData.metadata,
                correlationId: sharedCorrelationId,
                causationId,
            }, originPrefix);
        });
    }
    /**
     * Extracts correlation ID from event metadata
     */
    static getCorrelationId(event) {
        return event.nestjsMetadata?.correlationId;
    }
    /**
     * Extracts causation ID from event metadata
     */
    static getCausationId(event) {
        return event.nestjsMetadata?.causationId;
    }
    /**
     * Checks if two events are related (same correlation ID)
     */
    static areEventsRelated(event1, event2) {
        const corrId1 = this.getCorrelationId(event1);
        const corrId2 = this.getCorrelationId(event2);
        return corrId1 !== undefined && corrId1 === corrId2;
    }
    /**
     * Creates a domain event with aggregate information
     */
    static createDomainEvent(eventType, data, origin, aggregateId, version, metadata = {}, originPrefix) {
        return this.createEvent(eventType, data, origin, {
            ...metadata,
            aggregateId,
            version,
        }, originPrefix);
    }
    /**
     * Serializes an event for storage or transmission
     */
    static serializeEvent(event) {
        return JSON.stringify(event, (key, value) => {
            if (value instanceof Date) {
                return value.toISOString();
            }
            return value;
        });
    }
    /**
     * Deserializes an event from storage or transmission
     */
    static deserializeEvent(serialized) {
        const parsed = JSON.parse(serialized);
        // Convert timestamp back to string if it was converted to Date
        if (parsed.header?.timestamp instanceof Date) {
            parsed.header.timestamp = parsed.header.timestamp.toISOString();
        }
        return parsed;
    }
    /**
     * Creates a request event for HTTP requests
     */
    static createRequestEvent(method, path, correlationId, causationId, origin = 'nestjs', metadata = {}) {
        return this.createEvent('http.request', {
            method,
            path,
            timestamp: new Date().toISOString(),
        }, origin, {
            correlationId,
            causationId,
            ...metadata,
        });
    }
    /**
     * Creates a response event for HTTP responses
     */
    static createResponseEvent(method, path, statusCode, duration, correlationId, causationId, origin = 'nestjs', metadata = {}) {
        return this.createEvent('http.response', {
            method,
            path,
            statusCode,
            duration,
            timestamp: new Date().toISOString(),
        }, origin, {
            correlationId,
            causationId,
            ...metadata,
        });
    }
}
exports.EventUtils = EventUtils;
