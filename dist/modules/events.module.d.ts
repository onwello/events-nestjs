import { DynamicModule } from '@nestjs/common';
import { NestJSEventsModuleOptions } from '../types/config.types';
export declare class EventsModule {
    static forRoot(options: NestJSEventsModuleOptions): DynamicModule;
    static forFeature(): DynamicModule;
}
