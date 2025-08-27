import { EventDiscoveryService } from '../services/event-discovery.service';
import { EventHandlerMetadata } from '../interfaces/auto-event-handler.interface';
/**
 * Mixin that provides automatic event handler registration
 * This allows services to extend multiple classes while getting auto-registration
 */
export declare function AutoEventHandlerMixin<T extends new (...args: any[]) => any>(Base: T): T & (new (...args: any[]) => {
    [x: string]: any;
    eventDiscoveryService?: EventDiscoveryService;
    registeredHandlers: EventHandlerMetadata[];
    onModuleInit(): Promise<void>;
    registerEventHandlers(): Promise<void>;
    /**
     * Get registered handlers (for testing/debugging)
     */
    getRegisteredHandlers(): EventHandlerMetadata[];
    /**
     * Clear registered handlers (for testing)
     */
    clearRegisteredHandlers(): void;
});
/**
 * Advanced mixin with configuration options
 */
export declare function AutoEventHandlerMixinWithConfig<T extends new (...args: any[]) => any>(Base: T, config?: {
    enabled?: boolean;
    priority?: number;
    errorHandling?: 'throw' | 'warn' | 'ignore';
}): T & (new (...args: any[]) => {
    [x: string]: any;
    eventDiscoveryService?: EventDiscoveryService;
    readonly config: {
        enabled: boolean;
        priority: number;
        errorHandling: "throw" | "warn" | "ignore";
    };
    onModuleInit(): Promise<void>;
    registerEventHandlers(): Promise<void>;
});
