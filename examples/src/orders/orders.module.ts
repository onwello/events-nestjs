import { Module } from '@nestjs/common';
import { EventsModule } from '@logistically/events-nestjs';
import { OrdersController } from './orders.controller';
import { OrdersService } from './orders.service';

@Module({
  imports: [EventsModule.forFeature()],
  controllers: [OrdersController],
  providers: [OrdersService],
  exports: [OrdersService],
})
export class OrdersModule {}
