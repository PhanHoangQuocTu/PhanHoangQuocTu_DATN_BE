import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Query } from '@nestjs/common';
import { ProductsService } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { ApiBearerAuth, ApiQuery, ApiTags } from '@nestjs/swagger';
import { AuthenticationGuard } from 'src/utils/guards/authentication.guard';
import { AuthorizeGuard } from 'src/utils/guards/authorization.guard';
import { Roles } from 'src/utils/common/user-roles.enum';
import { CurrentUser } from 'src/utils/decorators/current-user.decorator';
import { UserEntity } from 'src/entities/user.entity';
import { ProductEntity } from 'src/entities/product.entity';
import { IStatusResponse } from 'src/utils/common';
import { SerializeIncludes } from 'src/utils/interceptors/serialize.interceptor';
import { ProductsDto } from './dto/products.dto';
import { FindAllProductsParamsDto } from './dto/find-all-products-params.dto';

@ApiTags('Product')
@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) { }

  @ApiBearerAuth('JWT-auth')
  @UseGuards(AuthenticationGuard, AuthorizeGuard([Roles.ADMIN]))
  @Post()
  async create(@Body() createProductDto: CreateProductDto, @CurrentUser() currentUser: UserEntity): Promise<ProductEntity> {
    return await this.productsService.create(createProductDto, currentUser);
  }

  @SerializeIncludes(ProductsDto)
  @Get()
  @ApiQuery({ name: 'limit', type: Number, required: false },)
  @ApiQuery({ name: 'page', type: Number, required: false })
  @ApiQuery({ name: 'search', type: String, required: false })
  @ApiQuery({ name: 'categoryId', type: Number, required: false })
  @ApiQuery({ name: 'minPrice', type: Number, required: false })
  @ApiQuery({ name: 'maxPrice', type: Number, required: false })
  @ApiQuery({ name: 'minRating', type: Number, required: false })
  @ApiQuery({ name: 'maxRating', type: Number, required: false })
  async findAll(
    @Query() query: FindAllProductsParamsDto,
  ): Promise<{ products: any[], meta: { limit: number, totalProducts: number, totalPage: number, currentPage: number } }> {
    return await this.productsService.findAll(query);
  }

  @Get(':id')
  async findOne(@Param('id') id: string): Promise<ProductEntity> {
    return await this.productsService.findOne(+id);
  }

  @ApiBearerAuth('JWT-auth')
  @UseGuards(AuthenticationGuard, AuthorizeGuard([Roles.ADMIN]))
  @Patch(':id')
  async update(@Param('id') id: string, @Body() updateProductDto: UpdateProductDto, @CurrentUser() currentUser: UserEntity): Promise<ProductEntity> {
    return await this.productsService.update(+id, updateProductDto, currentUser);
  }

  @ApiBearerAuth('JWT-auth')
  @UseGuards(AuthenticationGuard, AuthorizeGuard([Roles.ADMIN]))
  @Delete(':id')
  async remove(@Param('id') id: string): Promise<IStatusResponse> {
    return await this.productsService.remove(+id);
  }
}
