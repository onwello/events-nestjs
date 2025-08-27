"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EVENT_PUBLISHER_METADATA = void 0;
exports.EventPublisher = EventPublisher;
exports.getEventPublisherMetadata = getEventPublisherMetadata;
const common_1 = require("@nestjs/common");
exports.EVENT_PUBLISHER_METADATA = 'event:publisher';
function EventPublisher(options) {
    return (target, propertyKey, descriptor) => {
        const metadata = {
            eventType: options.eventType,
            publisher: target.constructor.name,
            method: propertyKey.toString(),
            target: target.constructor,
            waitForPublish: options.waitForPublish || false,
            publishOptions: options.publishOptions,
        };
        (0, common_1.SetMetadata)(exports.EVENT_PUBLISHER_METADATA, metadata)(target, propertyKey, descriptor);
        return descriptor;
    };
}
function getEventPublisherMetadata(target, propertyKey) {
    return Reflect.getMetadata(exports.EVENT_PUBLISHER_METADATA, target, propertyKey);
}
