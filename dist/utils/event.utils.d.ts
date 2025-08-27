import { NestJSEvent, NestJSEventMetadata } from '../types/event.types';
export declare class EventUtils {
    /**
     * Creates a new NestJS event with the given type and data
     */
    static createEvent<T = any>(eventType: string, data: T, origin: string, metadata?: Partial<NestJSEventMetadata>, originPrefix?: string): NestJSEvent<T>;
    /**
     * Generates a unique event ID
     */
    static generateEventId(): string;
    /**
     * Generates a hash for event data
     */
    static generateEventHash(data: any): string;
    /**
     * Generates a correlation ID for tracking related events
     */
    static generateCorrelationId(): string;
    /**
     * Creates a causation ID from a correlation ID
     */
    static createCausationId(correlationId: string): string;
    /**
     * Validates if an event object is properly formatted
     */
    static validateEvent(event: any): event is NestJSEvent;
    /**
     * Clones an event with new metadata
     */
    static cloneEvent<T = any>(event: NestJSEvent<T>, newMetadata?: Partial<NestJSEventMetadata>): NestJSEvent<T>;
    /**
     * Creates a batch of events with shared correlation ID
     */
    static createEventBatch<T = any>(events: Array<{
        type: string;
        data: T;
        metadata?: Partial<NestJSEventMetadata>;
    }>, origin: string, correlationId?: string, originPrefix?: string): NestJSEvent<T>[];
    /**
     * Extracts correlation ID from event metadata
     */
    static getCorrelationId(event: NestJSEvent): string | undefined;
    /**
     * Extracts causation ID from event metadata
     */
    static getCausationId(event: NestJSEvent): string | undefined;
    /**
     * Checks if two events are related (same correlation ID)
     */
    static areEventsRelated(event1: NestJSEvent, event2: NestJSEvent): boolean;
    /**
     * Creates a domain event with aggregate information
     */
    static createDomainEvent<T = any>(eventType: string, data: T, origin: string, aggregateId: string, version: number, metadata?: Partial<NestJSEventMetadata>, originPrefix?: string): NestJSEvent<T>;
    /**
     * Serializes an event for storage or transmission
     */
    static serializeEvent(event: NestJSEvent): string;
    /**
     * Deserializes an event from storage or transmission
     */
    static deserializeEvent<T = any>(serialized: string): NestJSEvent<T>;
    /**
     * Creates a request event for HTTP requests
     */
    static createRequestEvent(method: string, path: string, correlationId: string, causationId?: string, origin?: string, metadata?: Partial<NestJSEventMetadata>): NestJSEvent;
    /**
     * Creates a response event for HTTP responses
     */
    static createResponseEvent(method: string, path: string, statusCode: number, duration: number, correlationId: string, causationId?: string, origin?: string, metadata?: Partial<NestJSEventMetadata>): NestJSEvent;
}
