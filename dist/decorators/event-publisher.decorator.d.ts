import { NestJSEventPublisherOptions } from '../types/config.types';
export declare const EVENT_PUBLISHER_METADATA = "event:publisher";
export declare function EventPublisher(options: NestJSEventPublisherOptions): MethodDecorator;
export declare function getEventPublisherMetadata(target: any, propertyKey: string | symbol): NestJSEventPublisherOptions | undefined;
