import { EventEnvelope } from '@logistically/events';
export interface NestJSEventMetadata {
    /**
     * Correlation ID for tracking related events
     */
    correlationId?: string;
    /**
     * Causation ID for tracking event causality
     */
    causationId?: string;
    /**
     * Custom metadata
     */
    [key: string]: any;
}
export interface NestJSEvent<T = any> extends EventEnvelope<T> {
    /**
     * Custom NestJS metadata
     */
    nestjsMetadata?: NestJSEventMetadata;
}
export interface EventHandlerMetadata {
    eventType: string;
    handler: string;
    method: string;
    target: any;
    priority: number;
    async: boolean;
    retry?: {
        maxAttempts: number;
        backoffMs: number;
    };
    metadata?: Record<string, any>;
}
export interface EventPublisherMetadata {
    eventType: string;
    publisher: string;
    method: string;
    target: any;
    waitForPublish: boolean;
    publishOptions?: {
        origin?: string;
        timestamp?: Date;
        correlationId?: string;
        causationId?: string;
    };
}
export interface EventSubscriberMetadata {
    eventType: string;
    subscriber: string;
    method: string;
    target: any;
    subscriptionOptions?: {
        groupId?: string;
        consumerId?: string;
        pattern?: boolean;
    };
}
export interface EventHandlerContext {
    event: NestJSEvent<any>;
    handler: string;
    method: string;
    target: any;
    timestamp: Date;
    attempts: number;
    correlationId?: string;
    causationId?: string;
}
export interface EventHandlerResult {
    success: boolean;
    error?: Error;
    retryable: boolean;
    nextRetryDelay?: number;
}
export interface EventHandlerRegistry {
    [eventType: string]: EventHandlerMetadata[];
}
export interface EventPublisherRegistry {
    [eventType: string]: EventPublisherMetadata[];
}
export interface EventSubscriberRegistry {
    [eventType: string]: EventSubscriberMetadata[];
}
