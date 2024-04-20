import { Controller, Get, Post, Body, Param, Delete, UseGuards, Put } from '@nestjs/common';
import { OrdersService } from './orders.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { AuthenticationGuard } from 'src/utils/guards/authentication.guard';
import { AuthorizeGuard } from 'src/utils/guards/authorization.guard';
import { Roles } from 'src/utils/common/user-roles.enum';
import { CurrentUser } from 'src/utils/decorators/current-user.decorator';
import { UserEntity } from 'src/entities/user.entity';
import { OrderEntity } from 'src/entities/order.entity';
import { UpdateOrderStatusDto } from './dto/update-order-status.dto';

@ApiTags('Order')
@Controller('orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) { }

  @ApiBearerAuth('JWT-auth')
  @UseGuards(AuthenticationGuard)
  @Post()
  async create(@Body() createOrderDto: CreateOrderDto, @CurrentUser() currentUser: UserEntity): Promise<OrderEntity> {
    return await this.ordersService.create(createOrderDto, currentUser);
  }

  @ApiBearerAuth('JWT-auth')
  @UseGuards(AuthenticationGuard, AuthorizeGuard([Roles.ADMIN]))
  @Get()
  async findAll(): Promise<OrderEntity[]> {
    return await this.ordersService.findAll();
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
  @UseGuards(AuthenticationGuard, AuthorizeGuard([Roles.ADMIN]))
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
}
