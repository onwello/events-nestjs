import { PublishOptions } from '@logistically/events/dist/event-transport/transport.interface';
import { EventSystemService } from './event-system.service';
import { NestJSEvent, NestJSEventMetadata } from '../types/event.types';
export declare class EventPublisherService {
    private readonly eventSystemService;
    private readonly logger;
    private publisher;
    constructor(eventSystemService: EventSystemService);
    private getPublisher;
    /**
     * Publish a single event
     */
    publish<T = any>(eventType: string, data: T, options?: PublishOptions & {
        nestjsMetadata?: NestJSEventMetadata;
    }): Promise<void>;
    /**
     * Publish a batch of events
     */
    publishBatch<T = any>(eventType: string, data: T[], options?: PublishOptions & {
        nestjsMetadata?: NestJSEventMetadata;
    }): Promise<void>;
    /**
     * Publish a NestJS event
     */
    publishEvent<T = any>(event: NestJSEvent<T>): Promise<void>;
    /**
     * Force flush any pending batched events
     */
    forceFlush(): Promise<void>;
    /**
     * Get publisher statistics
     */
    getStats(): import("@logistically/events/dist/event-publisher").PublisherStats | null;
    /**
     * Check if the publisher is connected
     */
    isConnected(): boolean;
}
