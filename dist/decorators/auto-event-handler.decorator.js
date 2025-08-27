"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AUTO_EVENT_HANDLER_METADATA = void 0;
exports.AutoEventHandler = AutoEventHandler;
exports.getAutoEventHandlerMetadata = getAutoEventHandlerMetadata;
const common_1 = require("@nestjs/common");
exports.AUTO_EVENT_HANDLER_METADATA = 'auto:event:handler';
function AutoEventHandler(options) {
    return (target, propertyKey, descriptor) => {
        const metadata = {
            eventType: options.eventType,
            priority: options.priority ?? 0,
            async: options.async ?? true,
            retry: options.retry,
            handler: target.constructor.name,
            method: propertyKey.toString(),
            target: target.constructor,
        };
        (0, common_1.SetMetadata)(exports.AUTO_EVENT_HANDLER_METADATA, metadata)(target, propertyKey, descriptor);
        return descriptor;
    };
}
function getAutoEventHandlerMetadata(target, propertyKey) {
    return Reflect.getMetadata(exports.AUTO_EVENT_HANDLER_METADATA, target, propertyKey);
}
