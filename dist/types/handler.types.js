"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.wrapNestJSEventHandler = wrapNestJSEventHandler;
exports.wrapNestJSPatternHandler = wrapNestJSPatternHandler;
// These interfaces are now defined in event.types.ts to avoid conflicts
/**
 * Wrapper for converting NestJS event handlers to core library handlers
 */
function wrapNestJSEventHandler(handler) {
    return async (message, metadata) => {
        const event = {
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
function wrapNestJSPatternHandler(handler) {
    return async (message, metadata, pattern) => {
        const event = {
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
