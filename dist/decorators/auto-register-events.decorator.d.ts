export declare const AUTO_REGISTER_EVENTS_METADATA = "auto-register-events";
export interface AutoRegisterEventsOptions {
    /**
     * Whether to automatically register event handlers
     * @default true
     */
    enabled?: boolean;
    /**
     * Custom registration strategy
     * @default 'decorator'
     */
    strategy?: 'decorator' | 'interface' | 'manual';
    /**
     * Priority for registration order
     * @default 0
     */
    priority?: number;
    /**
     * Custom service name for registration
     */
    serviceName?: string;
    /**
     * Whether to register handlers immediately or lazily
     * @default 'lazy'
     */
    timing?: 'immediate' | 'lazy';
    /**
     * Error handling strategy
     * @default 'warn'
     */
    errorHandling?: 'throw' | 'warn' | 'ignore';
}
/**
 * Decorator that marks a class for automatic event handler registration
 * This provides enterprise-grade automatic discovery without inheritance constraints
 */
export declare function AutoRegisterEvents(options?: AutoRegisterEventsOptions): import("@nestjs/common").CustomDecorator<string>;
/**
 * Shorthand decorator for simple cases
 */
export declare function AutoEvents(): import("@nestjs/common").CustomDecorator<string>;
