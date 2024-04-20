import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { ReviewsService } from './reviews.service';
import { CreateReviewDto } from './dto/create-review.dto';
import { UpdateReviewDto } from './dto/update-review.dto';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { AuthenticationGuard } from 'src/utils/guards/authentication.guard';
import { CurrentUser } from 'src/utils/decorators/current-user.decorator';
import { UserEntity } from 'src/entities/user.entity';
import { ReviewEntity } from 'src/entities/review.entity';
import { AuthorizeGuard } from 'src/utils/guards/authorization.guard';
import { Roles } from 'src/utils/common/user-roles.enum';
import { IStatusResponse } from 'src/utils/common';

@ApiTags('Review')
@Controller('reviews')
export class ReviewsController {
  constructor(
    private readonly reviewsService: ReviewsService,
  ) { }


  @ApiBearerAuth('JWT-auth')
  @UseGuards(AuthenticationGuard)
  @Post()
  async create(
    @Body() createReviewDto: CreateReviewDto,
    @CurrentUser() currentUser: UserEntity
  ): Promise<ReviewEntity> {
    return await this.reviewsService.create(createReviewDto, currentUser);
  }

  @ApiBearerAuth('JWT-auth')
  @UseGuards(AuthenticationGuard, AuthorizeGuard([Roles.ADMIN]))
  @Get()
  async findAll(): Promise<ReviewEntity[]> {
    return await this.reviewsService.findAll();
  }

  @Get(':productId')
  async findAllByProduct(@Param('productId') productId: number): Promise<ReviewEntity[]> {
    return await this.reviewsService.findAllByProduct(productId);
  }

  @ApiBearerAuth('JWT-auth')
  @UseGuards(AuthenticationGuard, AuthorizeGuard([Roles.ADMIN]))
  @Get(':id')
  async findOne(@Param('id') id: string): Promise<ReviewEntity> {
    return await this.reviewsService.findOne(+id);
  }

  @ApiBearerAuth('JWT-auth')
  @UseGuards(AuthenticationGuard)
  @Patch(':id')
  async update(@Param('id') id: string, @Body() updateReviewDto: UpdateReviewDto) {
    return this.reviewsService.update(+id, updateReviewDto);
  }

  @ApiBearerAuth('JWT-auth')
  @UseGuards(AuthenticationGuard)
  @Delete(':id')
  async remove(@Param('id') id: string): Promise<IStatusResponse> {
    return await this.reviewsService.remove(+id);
  }
}
