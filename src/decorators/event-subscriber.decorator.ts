import { SetMetadata } from '@nestjs/common';
import { NestJSEventSubscriberOptions } from '../types/config.types';

export const EVENT_SUBSCRIBER_METADATA = 'event:subscriber';

export function EventSubscriber(options: NestJSEventSubscriberOptions): MethodDecorator {
  return (target: any, propertyKey: string | symbol, descriptor: PropertyDescriptor) => {
    const metadata = {
      eventType: options.eventType,
      subscriber: target.constructor.name,
      method: propertyKey.toString(),
      target: target.constructor,
      subscriptionOptions: options.subscriptionOptions,
    };

    SetMetadata(EVENT_SUBSCRIBER_METADATA, metadata)(target, propertyKey, descriptor);
    return descriptor;
  };
}

export function getEventSubscriberMetadata(target: any, propertyKey: string | symbol): NestJSEventSubscriberOptions | undefined {
  return Reflect.getMetadata(EVENT_SUBSCRIBER_METADATA, target, propertyKey);
}
