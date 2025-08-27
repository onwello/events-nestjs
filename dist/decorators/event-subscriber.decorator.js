"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EVENT_SUBSCRIBER_METADATA = void 0;
exports.EventSubscriber = EventSubscriber;
exports.getEventSubscriberMetadata = getEventSubscriberMetadata;
const common_1 = require("@nestjs/common");
exports.EVENT_SUBSCRIBER_METADATA = 'event:subscriber';
function EventSubscriber(options) {
    return (target, propertyKey, descriptor) => {
        const metadata = {
            eventType: options.eventType,
            subscriber: target.constructor.name,
            method: propertyKey.toString(),
            target: target.constructor,
            subscriptionOptions: options.subscriptionOptions,
        };
        (0, common_1.SetMetadata)(exports.EVENT_SUBSCRIBER_METADATA, metadata)(target, propertyKey, descriptor);
        return descriptor;
    };
}
function getEventSubscriberMetadata(target, propertyKey) {
    return Reflect.getMetadata(exports.EVENT_SUBSCRIBER_METADATA, target, propertyKey);
}
