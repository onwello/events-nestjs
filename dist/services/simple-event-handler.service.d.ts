import { OnModuleInit } from '@nestjs/common';
import { EventSystemService } from './event-system.service';
export declare class SimpleEventHandlerService implements OnModuleInit {
    private readonly eventSystemService;
    private readonly logger;
    private consumer;
    constructor(eventSystemService: EventSystemService);
    onModuleInit(): Promise<void>;
    private initializeConsumer;
    /**
     * Register event handlers from a service instance using decorators
     */
    registerEventHandlers(instance: any): Promise<void>;
    private registerHandler;
}
