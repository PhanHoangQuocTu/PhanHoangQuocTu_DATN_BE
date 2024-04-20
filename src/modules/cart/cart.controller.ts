// cart.controller.ts
import { Controller, Post, Param, Body, Delete, Get, UseGuards, Patch } from '@nestjs/common';
import { CartService } from './cart.service';
import { CreateCartDto } from './dto/create-cart.dto';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { AuthenticationGuard } from 'src/utils/guards/authentication.guard';
import { AuthorizeGuard } from 'src/utils/guards/authorization.guard';
import { Roles } from 'src/utils/common/user-roles.enum';
import { CurrentUser } from 'src/utils/decorators/current-user.decorator';
import { UserEntity } from 'src/entities/user.entity';
import { UpdateCartDto } from './dto/update-cart.dto';

@ApiTags('Cart')
@Controller('cart')
export class CartController {
  constructor(private readonly cartService: CartService) { }

  @ApiBearerAuth('JWT-auth')
  @UseGuards(AuthenticationGuard, AuthorizeGuard([Roles.ADMIN, Roles.USER]))
  @Post('add/:productId')
  async addToCart(
    @CurrentUser() currentUser: UserEntity,
    @Param('productId') productId: number,
    @Body() createCartDto: CreateCartDto,
  ): Promise<any> {
    const { quantity } = createCartDto;
    return this.cartService.addToCart(currentUser.id, productId, quantity);
  }

  @ApiBearerAuth('JWT-auth')
  @UseGuards(AuthenticationGuard, AuthorizeGuard([Roles.ADMIN, Roles.USER]))
  @Delete('items/:cartItemId')
  async removeCartItem(@Param('cartItemId') cartItemId: number): Promise<{ message: string }> {
    return this.cartService.removeCartItem(cartItemId);
  }

  @ApiBearerAuth('JWT-auth')
  @UseGuards(AuthenticationGuard, AuthorizeGuard([Roles.ADMIN, Roles.USER]))
  @Get('user')
  async getCartByUserId(@CurrentUser() currentUser: UserEntity): Promise<any> {
    return await this.cartService.getCartByUserId(currentUser.id);
  }

  @ApiBearerAuth('JWT-auth')
  @UseGuards(AuthenticationGuard, AuthorizeGuard([Roles.ADMIN, Roles.USER]))
  @Patch('items/:cartItemId/update')
  async updateCartItemQuantity(
    @Param('cartItemId') cartItemId: number,
    @Body() updateCartItemDto: UpdateCartDto,
  ): Promise<{ message: string }> {
    const { quantity } = updateCartItemDto;
    return this.cartService.updateCartItemQuantity(cartItemId, quantity);
  }
}
