export declare const AUTO_REGISTER_EVENTS_METADATA = "auto-register-events";
/**
 * Decorator that marks a class for automatic event handler registration
 * This will automatically register all @AutoEventHandler methods when the class is instantiated
 */
export declare function AutoRegisterEvents(): import("@nestjs/common").CustomDecorator<string>;
