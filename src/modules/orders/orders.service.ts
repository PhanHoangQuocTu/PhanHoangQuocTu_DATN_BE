import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateOrderDto } from './dto/create-order.dto';
import { UserEntity } from 'src/entities/user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { OrderEntity } from 'src/entities/order.entity';
import { Repository } from 'typeorm';
import { OrdersProductsEntity } from 'src/entities/orders-products.entity';
import { ShippingEntity } from 'src/entities/shipping.entity';
import { ProductEntity } from 'src/entities/product.entity';
import { ProductsService } from '../products/products.service';
import { UpdateOrderStatusDto } from './dto/update-order-status.dto';
import { OrderStatus } from 'src/utils/common/order-status.enum';

@Injectable()
export class OrdersService {
  constructor(
    @InjectRepository(OrderEntity)
    private readonly orderRepository: Repository<OrderEntity>,

    @InjectRepository(OrdersProductsEntity)
    private readonly ordersProductRepository: Repository<OrdersProductsEntity>,

    private readonly productService: ProductsService
  ) { }

  async create(createOrderDto: CreateOrderDto, currentUser: UserEntity): Promise<OrderEntity> {
    const shippingEntity = new ShippingEntity();

    Object.assign(shippingEntity, createOrderDto.shippingAddress);

    const orderEntity = new OrderEntity();

    orderEntity.shippingAddress = shippingEntity;

    orderEntity.user = currentUser;

    const orderTbl = await this.orderRepository.save(orderEntity);

    const ordersProductsEntity: {
      order: OrderEntity;
      product: ProductEntity;
      product_unit_price: number;
      product_quantity: number;
    }[] = []

    for (let i = 0; i < createOrderDto.orderedProducts.length; i++) {
      const order = orderTbl;

      const product = await this.productService.findOne(createOrderDto.orderedProducts[i].id);

      const product_quantity = createOrderDto.orderedProducts[i].product_quanity;

      const product_unit_price = createOrderDto.orderedProducts[i].product_unit_price;

      ordersProductsEntity.push({ order, product, product_unit_price, product_quantity })
    }

    await this.ordersProductRepository.createQueryBuilder()
      .insert()
      .into(OrdersProductsEntity)
      .values(ordersProductsEntity)
      .execute()

    return await this.findOne(orderTbl.id);
  }

  async findAll(): Promise<OrderEntity[]> {
    return await this.orderRepository.find({
      relations: {
        shippingAddress: true,
        user: true,
        products: { product: true }
      }
    });
  }

  async findOne(id: number): Promise<OrderEntity> {
    const order = await this.orderRepository.findOne({
      where: { id },
      relations: {
        shippingAddress: true,
        user: true,
        products: { product: true }
      }
    });

    if (!order) throw new NotFoundException('Order not found');

    return order
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async update(
    id: number,
    updateOrderStatusDto: UpdateOrderStatusDto,
    currentUser: UserEntity
  ): Promise<OrderEntity> {
    let order = await this.findOne(id);

    if ((order.status === OrderStatus.DELIVERED || order.status === OrderStatus.CANCELLED)) {
      throw new BadRequestException('Order already delivered or cancelled');
    }

    if ((order.status === OrderStatus.PROCESSING && updateOrderStatusDto.status !== OrderStatus.SHIPPED)) {
      throw new BadRequestException('Delivery before shipped !!!');
    }

    if ((updateOrderStatusDto.status === OrderStatus.SHIPPED && order.status === OrderStatus.SHIPPED)) {
      return order;
    }

    if (updateOrderStatusDto.status === OrderStatus.SHIPPED) {
      order.shippedAt = new Date();
    }

    if (updateOrderStatusDto.status === OrderStatus.DELIVERED) {
      order.deliveredAt = new Date();
    }

    order.status = updateOrderStatusDto.status;

    order.updatedBy = currentUser;

    order = await this.orderRepository.save(order);

    if (updateOrderStatusDto.status === OrderStatus.DELIVERED) {
      await this.stockUpdate(order, OrderStatus.DELIVERED);
    }

    return order;
  }

  async cancel(id: number, currentUser: UserEntity) {
    let order = await this.findOne(id);

    if (order.status === OrderStatus.CANCELLED) {
      return order
    }

    order.status = OrderStatus.CANCELLED;

    order.updatedBy = currentUser;

    order = await this.orderRepository.save(order);

    await this.stockUpdate(order, OrderStatus.CANCELLED);

    return order;
  }

  remove(id: number) {
    return `This action removes a #${id} order`;
  }

  async stockUpdate(order: OrderEntity, status: string): Promise<void> {
    for (const orderProduct of order.products) {
      await this.productService.updateStock(orderProduct.product.id, orderProduct.product_quantity, status);
    }
  }
}
