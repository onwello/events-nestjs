import { OnModuleInit } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { EventSystemService } from './event-system.service';
export declare class EventDiscoveryService implements OnModuleInit {
    private readonly eventSystemService;
    private readonly reflector;
    private readonly logger;
    private consumer;
    constructor(eventSystemService: EventSystemService, reflector: Reflector);
    onModuleInit(): Promise<void>;
    private getConsumer;
    private initializeConsumer;
    /**
     * Register a single event handler with explicit metadata
     * This method is used by the EventModuleScanner for automatic discovery
     */
    registerHandler(instance: any, methodKey: string, metadata: {
        eventType: string;
        priority?: number;
        async?: boolean;
        retry?: any;
        [key: string]: any;
    }): Promise<void>;
    /**
     * Manually register event handlers from a service instance
     * This method can be called by services that want to register their handlers
     */
    registerEventHandlers(instance: any): Promise<number>;
}
