import { NestJSEventSubscriberOptions } from '../types/config.types';
export declare const EVENT_SUBSCRIBER_METADATA = "event:subscriber";
export declare function EventSubscriber(options: NestJSEventSubscriberOptions): MethodDecorator;
export declare function getEventSubscriberMetadata(target: any, propertyKey: string | symbol): NestJSEventSubscriberOptions | undefined;
