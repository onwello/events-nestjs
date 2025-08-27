import { OnModuleInit } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { EventSystemService } from './event-system.service';
export declare class EventDiscoveryService implements OnModuleInit {
    private readonly reflector;
    private readonly eventSystemService;
    private readonly logger;
    private consumer;
    constructor(reflector: Reflector, eventSystemService: EventSystemService);
    onModuleInit(): Promise<void>;
    private initializeConsumer;
    /**
     * Manually register event handlers from a service instance
     * This method can be called by services that want to register their handlers
     */
    registerEventHandlers(instance: any): Promise<number>;
    private registerHandler;
}
