import { EventPublisherService, AutoEventHandlerProvider, EventHandlerMetadata, NestJSEvent } from '@logistically/events-nestjs';
export interface User {
    id: number;
    name: string;
    email: string;
    createdAt: string;
}
export declare class UsersService implements AutoEventHandlerProvider {
    private readonly eventPublisher;
    private readonly logger;
    private users;
    constructor(eventPublisher: EventPublisherService);
    findAll(): User[];
    findOne(id: number): User | undefined;
    create(name: string, email: string): Promise<User>;
    update(id: number, name: string, email: string): Promise<User | undefined>;
    delete(id: number): Promise<boolean>;
    getEventHandlers(): EventHandlerMetadata[];
    getServiceInstance(): any;
    validateEventHandlers(): boolean;
    onEventHandlersRegistered(handlers: EventHandlerMetadata[]): void;
    handleAllOrderEvents(event: NestJSEvent<any>): Promise<void>;
    handleOrderCreated(event: NestJSEvent<any>): Promise<void>;
    handleOrderUpdated(event: NestJSEvent<any>): Promise<void>;
}
