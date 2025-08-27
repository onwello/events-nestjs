import { OnModuleInit } from '@nestjs/common';
import { ModuleRef } from '@nestjs/core';
import { EventDiscoveryService } from './event-discovery.service';
export declare class EventModuleInitializerService implements OnModuleInit {
    private readonly moduleRef;
    private readonly eventDiscoveryService;
    private readonly logger;
    constructor(moduleRef: ModuleRef, eventDiscoveryService: EventDiscoveryService);
    onModuleInit(): Promise<void>;
    private discoverAndRegisterAllHandlers;
    private getModuleInstances;
    /**
     * Manually register event handlers from a specific service
     * This is called by services that want to register their handlers
     */
    registerServiceHandlers(serviceInstance: any): Promise<void>;
}
