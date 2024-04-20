import { Module } from '@nestjs/common';
import { CartService } from './cart.service';
import { CartController } from './cart.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CartEntity } from 'src/entities/cart.entity';
import { CartItemEntity } from 'src/entities/cart-item.entity';
import { UsersModule } from '../users/users.module';
import { ProductsModule } from '../products/products.module';

@Module({
  imports: [TypeOrmModule.forFeature([CartEntity, CartItemEntity]), UsersModule, ProductsModule],
  controllers: [CartController],
  providers: [CartService],
})
export class CartModule { }
