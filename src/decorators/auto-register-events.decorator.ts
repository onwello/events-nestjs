import { SetMetadata } from '@nestjs/common';

export const AUTO_REGISTER_EVENTS_METADATA = 'auto-register-events';

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
export function AutoRegisterEvents(options: AutoRegisterEventsOptions = {}) {
  const defaultOptions: Required<AutoRegisterEventsOptions> = {
    enabled: true,
    strategy: 'decorator',
    priority: 0,
    serviceName: '',
    timing: 'lazy',
    errorHandling: 'warn'
  };

  const finalOptions = { ...defaultOptions, ...options };
  
  return SetMetadata(AUTO_REGISTER_EVENTS_METADATA, finalOptions);
}

/**
 * Shorthand decorator for simple cases
 */
export function AutoEvents() {
  return AutoRegisterEvents();
}
