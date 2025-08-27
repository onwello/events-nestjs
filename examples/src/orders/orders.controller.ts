import { Controller, Get, Post, Body, Param, ParseIntPipe } from '@nestjs/common';
import { OrdersService } from './orders.service';

@Controller('orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Get()
  async findAll() {
    return this.ordersService.getOrders();
  }

  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number) {
    return this.ordersService.getOrder(id);
  }

  @Post()
  async create(@Body() createOrderDto: { userId: number; items: string[]; total: number }) {
    return this.ordersService.createOrder(
      createOrderDto.userId,
      createOrderDto.items,
      createOrderDto.total
    );
  }
}
