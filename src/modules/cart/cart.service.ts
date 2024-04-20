import { ProductsService } from './../products/products.service';
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { CartEntity } from 'src/entities/cart.entity';
import { CartItemEntity } from 'src/entities/cart-item.entity';
import { UserEntity } from 'src/entities/user.entity';
import { UsersService } from '../users/users.service';

@Injectable()
export class CartService {
  constructor(
    @InjectRepository(CartEntity)
    private readonly cartRepository: Repository<CartEntity>,
    @InjectRepository(CartItemEntity)
    private readonly cartItemRepository: Repository<CartItemEntity>,

    private readonly productsService: ProductsService,
    private readonly usersService: UsersService
  ) { }

  async addToCart(userId: number, productId: number, quantity: number): Promise<{ message: string, cart: Partial<CartEntity> }> {
    const user = await this.usersService.findOne(userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    let cart = await this.cartRepository.findOne({
      where: {
        user: {
          id: userId
        }
      },
      relations: {
        items: {
          product: true
        }
      },
    });

    if (!cart) {
      cart = await this.createCart(user);
    }

    const product = await this.productsService.findOne(productId);
    if (!product) {
      throw new NotFoundException('Product not found');
    }

    const cartItem = cart?.items?.find(item => Number(item?.product?.id) === Number(productId));

    if (cartItem) {
      cartItem.quantity += quantity;
    } else {
      const newCartItem = new CartItemEntity();
      newCartItem.product = product;
      newCartItem.quantity = quantity;
      newCartItem.cart = cart;
      cart?.items?.push(newCartItem);
    }

    await this.cartRepository.save(cart);
    return { message: 'add to cart success', cart: this.stripCartData(cart) };
  }

  async removeCartItem(cartItemId: number): Promise<{ message: string }> {
    await this.cartItemRepository.delete(cartItemId);
    return { message: 'remove cart item success' };
  }

  async getCartByUserId(userId: number): Promise<{ cart: Partial<CartEntity> }> {
    const user = await this.usersService.findOne(userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const cart = await this.cartRepository.findOne({
      where: {
        user: {
          id: userId
        }
      },
      relations: {
        items: {
          product: {
            category: true,
          },
        }
      },
    });

    if (!cart) {
      throw new NotFoundException('Cart not found');
    }

    return { cart: this.stripCartData(cart) };
  }

  private async createCart(user: UserEntity): Promise<CartEntity> {
    const cart = new CartEntity();
    cart.user = user;
    return await this.cartRepository.save(cart);
  }

  private stripCartData(cart: CartEntity): Partial<any> {
    return {
      id: cart?.id,
      createdAt: cart?.createdAt,
      updatedAt: cart?.updatedAt,
      items: cart?.items?.map(item => ({
        id: item?.id,
        quantity: item?.quantity,
        product: {
          id: item?.product?.id,
          title: item?.product?.title,
          price: item?.product?.price,
          category: {
            id: item?.product?.category?.id,
            title: item?.product?.category?.title,
          },
          stock: item?.product?.stock,
          images: item?.product?.images,
        }
      }))
    };
  }

  async updateCartItemQuantity(cartItemId: number, quantity: number): Promise<{ message: string }> {
    const cartItem = await this.cartItemRepository.findOne({ where: { cart: { items: { id: cartItemId } } }, relations: { cart: true } });
    if (!cartItem) {
      throw new NotFoundException('Cart item not found');
    }

    cartItem.quantity = quantity;
    await this.cartItemRepository.save(cartItem);
    return { message: 'Cart item quantity updated successfully' };
  }
}
