import { OnModuleInit } from '@nestjs/common';
import { EventDiscoveryService } from '../services/event-discovery.service';
/**
 * Base class that automatically registers event handlers when extended
 * This provides a clean, automatic way to register event handlers without manual calls
 */
export declare abstract class AutoEventHandlerBase implements OnModuleInit {
    protected readonly eventDiscoveryService: EventDiscoveryService;
    constructor(eventDiscoveryService: EventDiscoveryService);
    onModuleInit(): Promise<void>;
    private registerEventHandlersWithRetry;
}
