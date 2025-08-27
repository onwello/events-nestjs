import { EventPublisherService } from '@logistically/events-nestjs';
export interface User {
    id: number;
    name: string;
    email: string;
}
export declare class UsersService {
    private readonly eventPublisher;
    private users;
    constructor(eventPublisher: EventPublisherService);
    findAll(): Promise<User[]>;
    findOne(id: number): Promise<User | null>;
    create(userData: Omit<User, 'id'>): Promise<User>;
    update(id: number, userData: Partial<User>): Promise<User | null>;
    delete(id: number): Promise<boolean>;
}
