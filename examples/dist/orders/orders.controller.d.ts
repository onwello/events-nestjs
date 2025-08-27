import { OrdersService, Order } from './orders.service';
export interface CreateOrderDto {
    userId: number;
    items: string[];
    total: number;
}
export interface UpdateOrderStatusDto {
    status: Order['status'];
}
export declare class OrdersController {
    private readonly ordersService;
    constructor(ordersService: OrdersService);
    findAll(): Promise<Order[]>;
    findOne(id: string): Promise<Order | undefined>;
    create(createOrderDto: CreateOrderDto): Promise<Order>;
    updateStatus(id: string, updateOrderStatusDto: UpdateOrderStatusDto): Promise<Order | undefined>;
}
