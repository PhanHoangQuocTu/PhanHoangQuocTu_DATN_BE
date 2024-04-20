import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateReviewDto } from './dto/create-review.dto';
import { UpdateReviewDto } from './dto/update-review.dto';
import { UserEntity } from 'src/entities/user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { ReviewEntity } from 'src/entities/review.entity';
import { Repository } from 'typeorm';
import { ProductsService } from '../products/products.service';
import { IStatusResponse } from 'src/utils/common';

@Injectable()
export class ReviewsService {
  constructor(
    @InjectRepository(ReviewEntity)
    private readonly reviewsRepository: Repository<ReviewEntity>,
    private readonly productsService: ProductsService
  ) { }

  async create(createReviewDto: CreateReviewDto, currentUser: UserEntity): Promise<ReviewEntity> {
    const product = await this.productsService.findOne(createReviewDto.productId);

    let review = await this.findOneByUserAndProduct(currentUser.id, createReviewDto.productId);

    if (!review) {
      review = this.reviewsRepository.create(createReviewDto);

      review.user = currentUser;

      review.product = product;
    } else {
      review.comment = createReviewDto.comment;

      review.ratings = createReviewDto.ratings;
    }

    return await this.reviewsRepository.save(review);
  }

  async findAll(): Promise<ReviewEntity[]> {
    return await this.reviewsRepository.find()
  }

  async findAllByProduct(productId: number): Promise<ReviewEntity[]> {
    return await this.reviewsRepository.find({ where: { product: { id: productId } }, relations: { user: true, product: { category: true } } })
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
