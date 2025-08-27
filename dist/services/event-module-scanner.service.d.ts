import { OnModuleInit } from '@nestjs/common';
import { DiscoveryService, MetadataScanner, Reflector } from '@nestjs/core';
import { EventDiscoveryService } from './event-discovery.service';
export interface EventHandlerMetadata {
    instance: any;
    methodName: string;
    eventType: string;
    options?: any;
}
export declare class EventModuleScanner implements OnModuleInit {
    private readonly discoveryService;
    private readonly metadataScanner;
    private readonly reflector;
    private readonly eventDiscoveryService;
    private readonly logger;
    private discoveredHandlers;
    constructor(discoveryService: DiscoveryService, metadataScanner: MetadataScanner, reflector: Reflector, eventDiscoveryService: EventDiscoveryService);
    onModuleInit(): Promise<void>;
    /**
     * Scan all modules for event handlers decorated with @AutoEventHandler
     */
    private scanModules;
    /**
     * Scan a single instance for event handler methods
     */
    private scanInstance;
    /**
     * Register all discovered event handlers
     */
    private registerDiscoveredHandlers;
    /**
     * Get all discovered event handlers (for debugging/testing)
     */
    getDiscoveredHandlers(): EventHandlerMetadata[];
    /**
     * Get handlers by event type
     */
    getHandlersByEventType(eventType: string): EventHandlerMetadata[];
    /**
     * Get handlers by instance
     */
    getHandlersByInstance(instance: any): EventHandlerMetadata[];
    /**
     * Clear discovered handlers (for testing)
     */
    clearDiscoveredHandlers(): void;
}
