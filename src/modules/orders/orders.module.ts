import { Module } from '@nestjs/common';
import { OrdersService } from './orders.service';
import { OrdersController } from './orders.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OrderEntity } from 'src/entities/order.entity';
import { OrdersProductsEntity } from 'src/entities/orders-products.entity';
import { ShippingEntity } from 'src/entities/shipping.entity';
import { ProductsModule } from '../products/products.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([OrderEntity, OrdersProductsEntity, ShippingEntity]),
    ProductsModule
  ],
  controllers: [OrdersController],
  providers: [OrdersService],
})
export class OrdersModule { }
