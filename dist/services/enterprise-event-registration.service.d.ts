import { OnModuleInit } from '@nestjs/common';
import { DiscoveryService, MetadataScanner, Reflector } from '@nestjs/core';
import { EventDiscoveryService } from './event-discovery.service';
import { AutoEventHandlerProvider, EventHandlerMetadata, EventHandlerRegistrar } from '../interfaces/auto-event-handler.interface';
export interface RegistrationStrategy {
    name: string;
    priority: number;
    canHandle(instance: any): boolean;
    register(instance: any): Promise<number>;
}
export declare class EnterpriseEventRegistrationService implements OnModuleInit, EventHandlerRegistrar {
    private readonly discoveryService;
    private readonly metadataScanner;
    private readonly reflector;
    private readonly eventDiscoveryService;
    private readonly logger;
    private readonly strategies;
    private readonly registeredServices;
    constructor(discoveryService: DiscoveryService, metadataScanner: MetadataScanner, reflector: Reflector, eventDiscoveryService: EventDiscoveryService);
    onModuleInit(): Promise<void>;
    private initializeStrategies;
    private discoverAndRegisterAllServices;
    private registerService;
    private registerDecoratorBased;
    private registerInterfaceBased;
    private registerBaseClassBased;
    private implementsInterface;
    registerEventHandlers(service: AutoEventHandlerProvider): Promise<number>;
    unregisterEventHandlers(service: AutoEventHandlerProvider): Promise<number>;
    getRegisteredHandlers(service: AutoEventHandlerProvider): EventHandlerMetadata[];
    getRegistrationStats(): {
        totalServices: number;
        totalHandlers: number;
        servicesByStrategy: Record<string, number>;
    };
    private getServicesByStrategy;
}
