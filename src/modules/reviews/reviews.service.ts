import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateReviewDto } from './dto/create-review.dto';
import { UpdateReviewDto } from './dto/update-review.dto';
import { UserEntity } from 'src/entities/user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { ReviewEntity } from 'src/entities/review.entity';
import { Repository } from 'typeorm';
import { ProductsService } from '../products/products.service';
import { IStatusResponse } from 'src/utils/common';
import { FindAllReviewsParamsDto } from './dto/find-all-categories-params.dto';

@Injectable()
export class ReviewsService {
  constructor(
    @InjectRepository(ReviewEntity)
    private readonly reviewsRepository: Repository<ReviewEntity>,
    private readonly productsService: ProductsService
  ) { }

  async create(createReviewDto: CreateReviewDto, currentUser: UserEntity): Promise<ReviewEntity> {
    const product = await this.productsService.findOne(createReviewDto.productId);


    const review = this.reviewsRepository.create(createReviewDto);

    review.user = currentUser;

    review.product = product;

    return await this.reviewsRepository.save(review);
  }

  async findAll(): Promise<ReviewEntity[]> {
    return await this.reviewsRepository.find()
  }

  async findAllByProduct(productId: number, query: FindAllReviewsParamsDto): Promise<{ reviews: ReviewEntity[]; meta: { limit: number; totalItems: number; totalPages: number; currentPage: number; } }> {
    const page = query?.page > 0 ? query.page : 1; // Đảm bảo rằng số trang ít nhất là 1
    const limit = query?.limit > 0 ? query.limit : 10; // Đặt một giới hạn mặc định nếu không có hoặc không hợp lệ
    const offset = (page - 1) * limit; // Tính toán offset
    
    // Tạo một QueryBuilder cho ReviewEntity
    const queryBuilder = this.reviewsRepository.createQueryBuilder('review')
      .where('review.product.id = :productId', { productId }) // Chỉ lấy reviews của sản phẩm cụ thể
      .leftJoinAndSelect('review.user', 'user')
      .leftJoinAndSelect('review.product', 'product')
      .leftJoinAndSelect('product.category', 'category')
      .skip(offset)
      .take(limit);
  
    // Thực hiện truy vấn để lấy kết quả và tổng số lượng bản ghi
    const [reviews, totalItems] = await queryBuilder.getManyAndCount();
    
    const totalPages = Math.ceil(totalItems / limit);
    const currentPage = page;
  
    return {
      reviews,
      meta: {
        limit,
        totalItems,
        totalPages,
        currentPage,
      },
    };
  }

  async findOne(id: number): Promise<ReviewEntity> {
    const review = await this.reviewsRepository.findOne({ where: { id }, relations: { user: true, product: { category: true } } });

    if (!review) throw new NotFoundException('Review not found');

    return review;
  }

  async update(id: number, updateReviewDto: UpdateReviewDto): Promise<ReviewEntity> {
    const review = await this.findOne(id);
    if (!review) {
      throw new NotFoundException('Review not found');
    } else {
      review.comment = updateReviewDto.comment;

      review.ratings = updateReviewDto.ratings;
    }

    return await this.reviewsRepository.save(review);
  }

  async remove(id: number): Promise<IStatusResponse> {
    const review = await this.findOne(id);

    await this.reviewsRepository.remove(review);

    return {
      status: 200,
      message: 'Review deleted successfully',
    }
  }

  async findOneByUserAndProduct(userId: number, productId: number) {
    return await this.reviewsRepository.findOne({
      where: {
        user: { id: userId },
        product: { id: productId }
      },
      relations: {
        user: true, product: {
          category: true
        }
      }
    })

  }
}
