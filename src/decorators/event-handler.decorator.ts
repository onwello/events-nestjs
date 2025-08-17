import { SetMetadata } from '@nestjs/common';
import { NestJSEventHandlerOptions } from '../types/config.types';

export const EVENT_HANDLER_METADATA = 'event:handler';

export function EventHandler(options: NestJSEventHandlerOptions): MethodDecorator {
  return (target: any, propertyKey: string | symbol, descriptor: PropertyDescriptor) => {
    const metadata = {
      eventType: options.eventType,
      handler: target.constructor.name,
      method: propertyKey.toString(),
      target: target.constructor,
      priority: options.priority || 0,
      async: options.async || false,
      retry: options.retry,
      metadata: options.metadata,
    };

    SetMetadata(EVENT_HANDLER_METADATA, metadata)(target, propertyKey, descriptor);
    return descriptor;
  };
}

export function getEventHandlerMetadata(target: any, propertyKey: string | symbol): NestJSEventHandlerOptions | undefined {
  return Reflect.getMetadata(EVENT_HANDLER_METADATA, target, propertyKey);
}
