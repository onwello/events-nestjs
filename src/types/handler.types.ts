import { NestJSEvent } from './event.types';
import { MessageHandler, PatternHandler } from '@logistically/events';

export type NestJSEventHandler<T = any> = (event: NestJSEvent<T>) => Promise<void> | void;

export type NestJSEventPublisher<T = any> = (event: NestJSEvent<T>) => Promise<void> | void;

export type NestJSEventSubscriber<T = any> = (event: NestJSEvent<T>) => Promise<void> | void;

// These interfaces are now defined in event.types.ts to avoid conflicts

/**
 * Wrapper for converting NestJS event handlers to core library handlers
 */
export function wrapNestJSEventHandler<T = any>(
  handler: NestJSEventHandler<T>
): MessageHandler<T> {
  return async (message, metadata) => {
    const event: NestJSEvent<T> = {
      header: message.header,
      body: message.body,
      nestjsMetadata: {
        correlationId: metadata?.correlationId,
        // causationId is not available in MessageMetadata, we'll use correlationId
        causationId: metadata?.correlationId,
      },
    };
    
    await handler(event);
  };
}

/**
 * Wrapper for converting NestJS pattern handlers to core library pattern handlers
 */
export function wrapNestJSPatternHandler<T = any>(
  handler: NestJSEventHandler<T>
): PatternHandler<T> {
  return async (message, metadata, pattern) => {
    const event: NestJSEvent<T> = {
      header: message.header,
      body: message.body,
      nestjsMetadata: {
        correlationId: metadata?.correlationId,
        // causationId is not available in MessageMetadata, we'll use correlationId
        causationId: metadata?.correlationId,
        pattern,
      },
    };
    
    await handler(event);
  };
}
