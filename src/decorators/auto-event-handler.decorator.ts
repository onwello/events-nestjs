import { SetMetadata } from '@nestjs/common';

export const AUTO_EVENT_HANDLER_METADATA = 'auto:event:handler';

export interface AutoEventHandlerOptions {
  eventType: string;
  priority?: number;
  async?: boolean;
  retry?: {
    maxAttempts?: number;
    backoffMs?: number;
  };
}

export function AutoEventHandler(options: AutoEventHandlerOptions): MethodDecorator {
  return (target: any, propertyKey: string | symbol, descriptor: PropertyDescriptor) => {
    const metadata = {
      eventType: options.eventType,
      priority: options.priority ?? 0,
      async: options.async ?? true,
      retry: options.retry,
      handler: target.constructor.name,
      method: propertyKey.toString(),
      target: target.constructor,
    };

    SetMetadata(AUTO_EVENT_HANDLER_METADATA, metadata)(target, propertyKey, descriptor);
    return descriptor;
  };
}

export function getAutoEventHandlerMetadata(target: any, propertyKey: string | symbol): AutoEventHandlerOptions | undefined {
  if (!target || !propertyKey) {
    return undefined;
  }
  return Reflect.getMetadata(AUTO_EVENT_HANDLER_METADATA, target, propertyKey);
}
