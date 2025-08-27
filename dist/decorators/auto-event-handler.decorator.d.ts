export declare const AUTO_EVENT_HANDLER_METADATA = "auto:event:handler";
export interface AutoEventHandlerOptions {
    eventType: string;
    priority?: number;
    async?: boolean;
    retry?: {
        maxAttempts?: number;
        backoffMs?: number;
    };
}
export declare function AutoEventHandler(options: AutoEventHandlerOptions): MethodDecorator;
export declare function getAutoEventHandlerMetadata(target: any, propertyKey: string | symbol): AutoEventHandlerOptions | undefined;
