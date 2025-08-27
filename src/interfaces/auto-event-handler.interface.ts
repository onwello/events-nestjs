import { NestJSEvent } from '../types/event.types';

export interface EventHandlerMetadata {
  eventType: string;
  methodName: string;
  priority?: number;
  async?: boolean;
  retry?: {
    maxAttempts?: number;
    backoffMs?: number;
  };
  options?: Record<string, any>;
}

export interface EventHandlerMethod {
  (event: NestJSEvent<any>): Promise<void> | void;
}

/**
 * Interface for services that want to provide their own event handler metadata
 * This allows maximum flexibility and control over registration
 */
export interface AutoEventHandlerProvider {
  /**
   * Return metadata for all event handlers in this service
   */
  getEventHandlers(): EventHandlerMetadata[];
  
  /**
   * Get the service instance for method binding
   */
  getServiceInstance(): any;
  
  /**
   * Optional: Custom validation for event handlers
   */
  validateEventHandlers?(): boolean;
  
  /**
   * Optional: Custom registration logic
   */
  onEventHandlersRegistered?(handlers: EventHandlerMetadata[]): void;
}

/**
 * Interface for services that want to implement custom registration strategies
 */
export interface EventHandlerRegistrar {
  /**
   * Register event handlers for a service
   */
  registerEventHandlers(service: AutoEventHandlerProvider): Promise<number>;
  
  /**
   * Unregister event handlers for a service
   */
  unregisterEventHandlers(service: AutoEventHandlerProvider): Promise<number>;
  
  /**
   * Get registered handlers for a service
   */
  getRegisteredHandlers(service: AutoEventHandlerProvider): EventHandlerMetadata[];
}
