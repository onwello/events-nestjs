import { OnModuleInit, Type } from '@nestjs/common';
import { ModuleRef } from '@nestjs/core';
import { EventDiscoveryService } from './event-discovery.service';
export declare class AutoRegistrationService implements OnModuleInit {
    private readonly moduleRef;
    private readonly eventDiscoveryService;
    private readonly logger;
    constructor(moduleRef: ModuleRef, eventDiscoveryService: EventDiscoveryService);
    onModuleInit(): Promise<void>;
    /**
     * Register event handlers for a specific instance
     * This method is called automatically for classes decorated with @AutoRegisterEvents
     */
    registerEventHandlers(instance: any): Promise<number>;
    /**
     * Check if a class should have automatic event registration
     */
    shouldAutoRegister(target: Type<any>): boolean;
    /**
     * Get all providers that should have automatic event registration
     */
    getAutoRegisterProviders(): Promise<any[]>;
}
