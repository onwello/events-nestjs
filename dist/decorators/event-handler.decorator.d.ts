import { NestJSEventHandlerOptions } from '../types/config.types';
export declare const EVENT_HANDLER_METADATA = "event:handler";
export declare function EventHandler(options: NestJSEventHandlerOptions): MethodDecorator;
export declare function getEventHandlerMetadata(target: any, propertyKey: string | symbol): NestJSEventHandlerOptions | undefined;
