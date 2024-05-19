import { Controller, Get, Post, Body, Param, Delete, UseGuards, Put, Query } from '@nestjs/common';
import { OrdersService } from './orders.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { ApiBearerAuth, ApiQuery, ApiTags } from '@nestjs/swagger';
import { AuthenticationGuard } from 'src/utils/guards/authentication.guard';
import { AuthorizeGuard } from 'src/utils/guards/authorization.guard';
import { Roles } from 'src/utils/common/user-roles.enum';
import { CurrentUser } from 'src/utils/decorators/current-user.decorator';
import { UserEntity } from 'src/entities/user.entity';
import { OrderEntity } from 'src/entities/order.entity';
import { UpdateOrderStatusDto } from './dto/update-order-status.dto';
import { FindAllOrdersParamsDto } from './dto/find-all-orders-params.dto';
import { OrderMeParamsDto } from './dto/order-me-params.dto';
import { MonthlyRevenueParamsDto } from './dto/monthly-revenue-params.dto';

@ApiTags('Order')
@Controller('orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) { }

  @ApiBearerAuth('JWT-auth')
  @UseGuards(AuthenticationGuard, AuthorizeGuard([Roles.ADMIN]))
  @Get('/monthly-revenue')
  async getMonthlyRevenueAPI(@Query() query: MonthlyRevenueParamsDto) {
    return await this.ordersService.getMonthlyRevenue(query);
  }

  @ApiBearerAuth('JWT-auth')
  @UseGuards(AuthenticationGuard)
  @Post()
  async create(@Body() createOrderDto: CreateOrderDto, @CurrentUser() currentUser: UserEntity): Promise<OrderEntity> {
    return await this.ordersService.create(createOrderDto, currentUser);
  }

  @ApiBearerAuth('JWT-auth')
  @UseGuards(AuthenticationGuard, AuthorizeGuard([Roles.ADMIN]))
  @Get()
  @ApiQuery({ name: 'search', type: String, required: false },)
  @ApiQuery({ name: 'limit', type: Number, required: false },)
  @ApiQuery({ name: 'page', type: Number, required: false })
  @ApiQuery({ name: 'status', type: String, required: false })
  async findAll(@Query() query: FindAllOrdersParamsDto): Promise<{ orders: OrderEntity[]; meta: { limit: number; totalItems: number; totalPages: number; currentPage: number; } }> {
    return await this.ordersService.findAll(query);
  }

  @ApiBearerAuth('JWT-auth')
  @UseGuards(AuthenticationGuard, AuthorizeGuard([Roles.ADMIN, Roles.USER]))
  @Get(':id')
  async findOne(@Param('id') id: string): Promise<OrderEntity> {
    return await this.ordersService.findOne(+id);
  }

  @ApiBearerAuth('JWT-auth')
  @UseGuards(AuthenticationGuard, AuthorizeGuard([Roles.ADMIN]))
  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() updateOrderStatusDto: UpdateOrderStatusDto,
    @CurrentUser() currentUser: UserEntity
  ) {
    return await this.ordersService.update(+id, updateOrderStatusDto, currentUser);
  }

  @ApiBearerAuth('JWT-auth')
  @UseGuards(AuthenticationGuard, AuthorizeGuard([Roles.ADMIN, Roles.USER]))
  @Put('cancel/:id')
  async cancel(@Param('id') id: string, @CurrentUser() currentUser: UserEntity) {
    return await this.ordersService.cancel(+id, currentUser);
  }

  @ApiBearerAuth('JWT-auth')
  @UseGuards(AuthenticationGuard, AuthorizeGuard([Roles.ADMIN, Roles.USER]))
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.ordersService.remove(+id);
  }

  @ApiBearerAuth('JWT-auth')
  @UseGuards(AuthenticationGuard, AuthorizeGuard([Roles.ADMIN, Roles.USER]))
  @Post("vnpay_create_payment_url")
  async createVNPAYPaymentUrl(): Promise<{ url: string }> {
    return await this.ordersService.createPaymentUrl();
  }

  @Get('return_url')
  returnUrl(@Param() vnp_Params: any) {
    return this.ordersService.verifyReturn(vnp_Params);
  }

  @ApiQuery({ name: 'limit', type: Number, required: false },)
  @ApiQuery({ name: 'page', type: Number, required: false })
  @ApiBearerAuth('JWT-auth')
  @UseGuards(AuthenticationGuard, AuthorizeGuard([Roles.ADMIN, Roles.USER]))
  @Get('/user/me')
  async findOrdersByUser(@CurrentUser() currentUser: UserEntity, @Query() query: OrderMeParamsDto) {
    return await this.ordersService.findOrdersByUser(currentUser.id, query);
  }


}
