import { SetMetadata } from '@nestjs/common';
import { NestJSEventPublisherOptions } from '../types/config.types';

export const EVENT_PUBLISHER_METADATA = 'event:publisher';

export function EventPublisher(options: NestJSEventPublisherOptions): MethodDecorator {
  return (target: any, propertyKey: string | symbol, descriptor: PropertyDescriptor) => {
    const metadata = {
      eventType: options.eventType,
      publisher: target.constructor.name,
      method: propertyKey.toString(),
      target: target.constructor,
      waitForPublish: options.waitForPublish || false,
      publishOptions: options.publishOptions,
    };

    SetMetadata(EVENT_PUBLISHER_METADATA, metadata)(target, propertyKey, descriptor);
    return descriptor;
  };
}

export function getEventPublisherMetadata(target: any, propertyKey: string | symbol): NestJSEventPublisherOptions | undefined {
  return Reflect.getMetadata(EVENT_PUBLISHER_METADATA, target, propertyKey);
}
