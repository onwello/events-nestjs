import { EventPublisherService, NestJSEvent } from '@logistically/events-nestjs';
export interface Order {
    id: number;
    userId: number;
    items: string[];
    total: number;
    status: 'pending' | 'processing' | 'completed' | 'cancelled';
    createdAt: string;
}
export declare class OrdersService {
    private readonly eventPublisher;
    private readonly logger;
    private orders;
    constructor(eventPublisher: EventPublisherService);
    findAll(): Order[];
    findOne(id: number): Order | undefined;
    create(userId: number, items: string[], total: number): Promise<Order>;
    updateStatus(id: number, status: Order['status']): Promise<Order | undefined>;
    handleAllUserEvents(event: NestJSEvent<any>): Promise<void>;
    handleUserUpdated(event: NestJSEvent<any>): Promise<void>;
    handleOrderCreated(event: NestJSEvent<any>): Promise<void>;
}
