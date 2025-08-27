import { OnModuleInit } from '@nestjs/common';
import { EventPublisherService, EventDiscoveryService, NestJSEvent } from '@logistically/events-nestjs';
export interface Order {
    id: number;
    userId: number;
    items: string[];
    total: number;
    status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
    createdAt: Date;
}
export declare class OrdersService implements OnModuleInit {
    private readonly eventPublisher;
    private readonly eventDiscoveryService;
    private readonly logger;
    private orders;
    constructor(eventPublisher: EventPublisherService, eventDiscoveryService: EventDiscoveryService);
    onModuleInit(): Promise<void>;
    findAll(): Promise<Order[]>;
    findOne(id: number): Promise<Order | null>;
    create(userId: number, items: string[], total: number, status?: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled'): Promise<Order>;
    updateStatus(id: number, status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled'): Promise<Order | null>;
    handleUserCreated(event: NestJSEvent<any>): Promise<void>;
    handleUserUpdated(event: NestJSEvent<any>): Promise<void>;
    handleOrderCreated(event: NestJSEvent<any>): Promise<void>;
}
