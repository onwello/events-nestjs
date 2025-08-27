import { OnModuleInit } from '@nestjs/common';
import { SubscribeOptions } from '@logistically/events/dist/event-transport/transport.interface';
import { EventSystemService } from './event-system.service';
import { NestJSEventHandler } from '../types/handler.types';
export declare class EventConsumerService implements OnModuleInit {
    private readonly eventSystemService;
    private readonly logger;
    private consumer;
    private readonly subscriptions;
    constructor(eventSystemService: EventSystemService);
    onModuleInit(): Promise<void>;
    private getConsumer;
    /**
     * Subscribe to an event type
     */
    subscribe<T = any>(eventType: string, handler: NestJSEventHandler<T>, options?: SubscribeOptions): Promise<void>;
    /**
     * Subscribe to events matching a pattern
     */
    subscribePattern<T = any>(pattern: string, handler: NestJSEventHandler<T>, options?: SubscribeOptions): Promise<void>;
    /**
     * Unsubscribe from an event type
     */
    unsubscribe(eventType: string): Promise<void>;
    /**
     * Unsubscribe from a pattern
     */
    unsubscribePattern(pattern: string): Promise<void>;
    /**
     * Get subscription information
     */
    getSubscriptions(): import("@logistically/events/dist/event-consumer/consumer").SubscriptionInfo[];
    /**
     * Get consumer statistics
     */
    getStats(): import("@logistically/events/dist/event-consumer").ConsumerStats | null;
    /**
     * Discover and register event handlers automatically
     */
    private discoverEventHandlers;
    /**
     * Scan an instance for event handlers
     */
    private scanInstanceForEventHandlers;
    /**
     * Scan an instance for event subscribers
     */
    private scanInstanceForEventSubscribers;
    /**
     * Register an event handler
     */
    private registerEventHandler;
    /**
     * Register an event subscriber
     */
    private registerEventSubscriber;
    /**
     * Check if the consumer is connected
     */
    isConnected(): boolean;
}
