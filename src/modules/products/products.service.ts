import { CategoriesService } from './../categories/categories.service';
import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { ProductEntity } from 'src/entities/product.entity';
import { Repository } from 'typeorm';
import { UserEntity } from 'src/entities/user.entity';
import { IStatusResponse } from 'src/utils/common';
import { OrderStatus } from 'src/utils/common/order-status.enum';
import dataSource from 'db/data-source';
import { FindAllProductsParamsDto } from './dto/find-all-products-params.dto';
import { AuthorsService } from '../authors/authors.service';
import { PublisherService } from '../publisher/publisher.service';

@Injectable()
export class ProductsService {
  constructor(
    @InjectRepository(ProductEntity)
    private readonly productsRepository: Repository<ProductEntity>,

    private readonly categoriesService: CategoriesService,

    private readonly authorsService: AuthorsService,

    private readonly publisherService: PublisherService
  ) { }

  async create(createProductDto: CreateProductDto, currentUser: UserEntity): Promise<ProductEntity> {
    const category = await this.categoriesService.findOne(+createProductDto.categoryId);

    const author = await this.authorsService.findOne(+createProductDto.authorId);

    const publisher = await this.publisherService.findOne(+createProductDto.publisherId);

    const product = this.productsRepository.create(createProductDto);

    product.category = category;

    product.author = author;

    product.publisher = publisher;

    product.addedBy = currentUser;

    return await this.productsRepository.save(product);
  }

  async findAll(query: FindAllProductsParamsDto): Promise<{ products: any[], meta: { limit: number, totalProducts: number, totalPage: number, currentPage: number } }> {
    const limit: number = Number(query.limit) || 999999999;
    const currentPage: number = Number(query.page) || 1;


    const queryBuilder = dataSource
      .getRepository(ProductEntity)
      .createQueryBuilder('product')
      .leftJoinAndSelect('product.category', 'category')
      .leftJoin('product.reviews', 'review')
      .addSelect('COUNT(review.id)', 'reviewCount')
      .addSelect('AVG(review.ratings)::numeric(10,2)', 'avgRating')
      .groupBy('product.id, category.id');

    const totalProducts = await queryBuilder.getCount();
    const totalPage = Math.ceil(totalProducts / limit);

    if (query.search) {
      const search = query.search;
      queryBuilder.andWhere('product.title like :title', { title: `%${search}%` });
    }

    if (query.categoryId) {
      queryBuilder.andWhere('category.id = :id', { id: query.categoryId });
    }

    if (query.minPrice) {
      queryBuilder.andWhere('product.price >= :minPrice', { minPrice: query.minPrice });
    }

    if (query.maxPrice) {
      queryBuilder.andWhere('product.price <= :maxPrice', { maxPrice: query.maxPrice });
    }

    if (query.minRating) {
      queryBuilder.andHaving('AVG(review.ratings) >= :minRating', { minRating: query.minRating });
    }

    if (query.maxRating) {
      queryBuilder.andHaving('AVG(review.ratings) <= :maxRating', { maxRating: query.maxRating });
    }

    queryBuilder.limit(limit);

    if (query.page) {
      queryBuilder.offset((query.page - 1) * query.limit);
    }

    const products = await queryBuilder.getRawMany();

    return { products, meta: { limit, totalProducts, totalPage, currentPage } };
  }


  async findOne(id: number): Promise<ProductEntity> {
    const product = await this.productsRepository.findOne({
      where: { id },
      relations: { addedBy: true, category: true },
      select: {
        addedBy: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
          phoneNumber: true,
          address: true
        },
        category: {
          id: true,
          title: true
        }
      }
    });

    if (!product) throw new NotFoundException('Product not found');

    return product
  }

  async update(
    id: number,
    updateProductDto: Partial<UpdateProductDto>,
    currentUser: UserEntity
  ): Promise<ProductEntity> {
    const product = await this.findOne(id);

    Object.assign(product, updateProductDto);

    product.addedBy = currentUser;

    if (updateProductDto.categoryId) {
      const category = await this.categoriesService.findOne(+updateProductDto.categoryId);

      product.category = category;
    }

    return await this.productsRepository.save(product);
  }

  async remove(id: number): Promise<IStatusResponse> {
    const product = await this.findOne(id);

    await this.productsRepository.remove(product);

    return {
      status: 200,
      message: 'Product deleted successfully',
    };
  }

  async updateStock(id: number, stock: number, status: string): Promise<ProductEntity> {
    let product = await this.findOne(id);

    if (status === OrderStatus.DELIVERED) {
      product.stock -= stock;
    } else {
      product.stock += stock;
    }

    product = await this.productsRepository.save(product);

    return product
  }
}
