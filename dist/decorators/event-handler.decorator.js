"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EVENT_HANDLER_METADATA = void 0;
exports.EventHandler = EventHandler;
exports.getEventHandlerMetadata = getEventHandlerMetadata;
const common_1 = require("@nestjs/common");
exports.EVENT_HANDLER_METADATA = 'event:handler';
function EventHandler(options) {
    return (target, propertyKey, descriptor) => {
        const metadata = {
            eventType: options.eventType,
            handler: target.constructor.name,
            method: propertyKey.toString(),
            target: target.constructor,
            priority: options.priority ?? 0,
            async: options.async,
            retry: options.retry,
            metadata: options.metadata,
        };
        (0, common_1.SetMetadata)(exports.EVENT_HANDLER_METADATA, metadata)(target, propertyKey, descriptor);
        return descriptor;
    };
}
function getEventHandlerMetadata(target, propertyKey) {
    // Try to get metadata from the instance first
    let metadata = Reflect.getMetadata(exports.EVENT_HANDLER_METADATA, target, propertyKey);
    // If not found on instance, try the prototype
    if (!metadata) {
        metadata = Reflect.getMetadata(exports.EVENT_HANDLER_METADATA, target.constructor.prototype, propertyKey);
    }
    // If still not found, try the class itself
    if (!metadata) {
        metadata = Reflect.getMetadata(exports.EVENT_HANDLER_METADATA, target.constructor, propertyKey);
    }
    return metadata;
}
