import { OnModuleInit } from '@nestjs/common';
import { EventSystemService } from './event-system.service';
export interface EventHandlerRegistration {
    eventType: string;
    handler: (payload: any) => Promise<void> | void;
    options?: {
        priority?: number;
        async?: boolean;
        retry?: {
            maxAttempts?: number;
            backoffMs?: number;
        };
    };
}
export declare class EventHandlerRegistryService implements OnModuleInit {
    private readonly eventSystemService;
    private readonly logger;
    private consumer;
    private readonly handlers;
    constructor(eventSystemService: EventSystemService);
    onModuleInit(): Promise<void>;
    private initializeConsumer;
    /**
     * Register an event handler manually
     */
    registerEventHandler(registration: EventHandlerRegistration): Promise<void>;
    private registerHandler;
    /**
     * Get all registered handlers for an event type
     */
    getHandlers(eventType: string): EventHandlerRegistration[];
    /**
     * Remove all handlers for an event type
     */
    removeHandlers(eventType: string): Promise<void>;
}
