import { NestJSEvent } from './event.types';
import { MessageHandler, PatternHandler } from '@logistically/events';
export type NestJSEventHandler<T = any> = (event: NestJSEvent<T>) => Promise<void> | void;
export type NestJSEventPublisher<T = any> = (event: NestJSEvent<T>) => Promise<void> | void;
export type NestJSEventSubscriber<T = any> = (event: NestJSEvent<T>) => Promise<void> | void;
/**
 * Wrapper for converting NestJS event handlers to core library handlers
 */
export declare function wrapNestJSEventHandler<T = any>(handler: NestJSEventHandler<T>): MessageHandler<T>;
/**
 * Wrapper for converting NestJS pattern handlers to core library pattern handlers
 */
export declare function wrapNestJSPatternHandler<T = any>(handler: NestJSEventHandler<T>): PatternHandler<T>;
