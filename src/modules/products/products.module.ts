import { Module } from '@nestjs/common';
import { ProductsService } from './products.service';
import { ProductsController } from './products.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProductEntity } from 'src/entities/product.entity';
import { CategoriesModule } from '../categories/categories.module';
import { AuthorsModule } from '../authors/authors.module';
import { PublisherModule } from '../publisher/publisher.module';

@Module({
  imports: [TypeOrmModule.forFeature([ProductEntity]), CategoriesModule, AuthorsModule, PublisherModule],
  controllers: [ProductsController],
  providers: [ProductsService],
  exports: [ProductsService]
})
export class ProductsModule { }
