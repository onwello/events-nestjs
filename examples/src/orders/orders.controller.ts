import { Controller, Get, Post, Put, Param, Body } from '@nestjs/common';
import { OrdersService, Order } from './orders.service';

export interface CreateOrderDto {
  userId: number;
  items: string[];
  total: number;
}

export interface UpdateOrderStatusDto {
  status: Order['status'];
}

@Controller('orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Get()
  async findAll(): Promise<Order[]> {
    return this.ordersService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id') id: string): Promise<Order | undefined> {
    return this.ordersService.findOne(parseInt(id, 10));
  }

  @Post()
  async create(@Body() createOrderDto: CreateOrderDto): Promise<Order> {
    return this.ordersService.create(
      createOrderDto.userId,
      createOrderDto.items,
      createOrderDto.total
    );
  }

  @Put(':id/status')
  async updateStatus(
    @Param('id') id: string, 
    @Body() updateOrderStatusDto: UpdateOrderStatusDto
  ): Promise<Order | undefined> {
    return this.ordersService.updateStatus(parseInt(id, 10), updateOrderStatusDto.status);
  }
}
