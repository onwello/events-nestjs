import { OnModuleInit } from '@nestjs/common';
import { EventSystemService } from './event-system.service';
export declare class GlobalEventHandlerService implements OnModuleInit {
    private readonly eventSystemService;
    private readonly logger;
    private consumer;
    private static instance;
    constructor(eventSystemService: EventSystemService);
    static getInstance(): GlobalEventHandlerService | null;
    onModuleInit(): Promise<void>;
    private initializeConsumer;
    /**
     * Register event handlers from a service instance using decorators
     */
    registerEventHandlers(instance: any): Promise<void>;
    private registerHandler;
}
