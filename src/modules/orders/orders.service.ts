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
import { FindAllOrdersParamsDto } from './dto/find-all-orders-params.dto';
import { CartService } from '../cart/cart.service';
import { CartEntity } from 'src/entities/cart.entity';
import * as moment from 'moment';
import { env } from 'src/types/const';
import * as qs from 'qs';
import * as crypto from 'crypto';
import { OrderMeParamsDto } from './dto/order-me-params.dto';
import { MonthlyRevenueParamsDto, MonthlyRevenueResponse, MonthlyRevenueResult } from './dto/monthly-revenue-params.dto';
@Injectable()
export class OrdersService {
  constructor(
    @InjectRepository(OrderEntity)
    private readonly orderRepository: Repository<OrderEntity>,

    @InjectRepository(OrdersProductsEntity)
    private readonly ordersProductRepository: Repository<OrdersProductsEntity>,

    @InjectRepository(OrdersProductsEntity)
    private readonly cartRepository: Repository<CartEntity>,

    private readonly productService: ProductsService,

    private readonly cartService: CartService

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
      title: string;
      description: string;
      discount: number;
      images: string[];
    }[] = []

    for (let i = 0; i < createOrderDto.orderedProducts.length; i++) {
      const order = orderTbl;

      const product = await this.productService.findOne(createOrderDto.orderedProducts[i].id);

      const product_quantity = createOrderDto.orderedProducts[i].product_quanity;

      const product_unit_price = createOrderDto.orderedProducts[i].product_unit_price;
      const title = createOrderDto.orderedProducts[i].title;
      const description = createOrderDto.orderedProducts[i].description;
      const discount = createOrderDto.orderedProducts[i].discount;
      const images = createOrderDto.orderedProducts[i].images;

      ordersProductsEntity.push({ order, product, product_unit_price, product_quantity, title, description, discount, images });
    }

    await this.ordersProductRepository.createQueryBuilder()
      .insert()
      .into(OrdersProductsEntity)
      .values(ordersProductsEntity)
      .execute()

    const cart = await this.cartService.getCartByUserId(currentUser.id);

    if (cart) {
      await this.cartService.updateIsOrderd(cart.cart.id);
    }

    return await this.findOne(orderTbl.id);
  }

  async findAll(query: FindAllOrdersParamsDto): Promise<{ orders: OrderEntity[]; meta: { limit: number; totalItems: number; totalPages: number; currentPage: number; } }> {
    const page = query?.page > 0 ? query.page : 1;
    const limit = query?.limit > 0 ? query.limit : 10;
    const offset = (page - 1) * limit;

    const queryBuilder = this.orderRepository.createQueryBuilder('order')
      .leftJoinAndSelect('order.shippingAddress', 'shippingAddress')
      .leftJoinAndSelect('order.user', 'user')
      .leftJoinAndSelect('order.products', 'products')
      .leftJoinAndSelect('products.product', 'product');

    if (query?.search) {
      const isSearchNumeric = !isNaN(Number(query.search));
      if (isSearchNumeric) {
        queryBuilder.andWhere('CAST(order.id AS text) LIKE :search', { search: `%${query.search}%` });
      } else {
        const searchQuery = `%${query.search.toLowerCase()}%`;
        queryBuilder.andWhere('LOWER(user.email) LIKE :search', { search: searchQuery });
      }
    }

    if (query?.status) {
      queryBuilder.andWhere('order.status = :status', { status: query.status });
    }

    queryBuilder.orderBy('order.orderAt', 'DESC');

    queryBuilder.skip(offset).take(limit);

    const [orders, totalItems] = await queryBuilder.getManyAndCount();

    const totalPages = Math.ceil(totalItems / limit);
    const currentPage = page;

    return {
      orders,
      meta: {
        limit,
        totalItems,
        totalPages,
        currentPage,
      },
    };
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
  ): Promise<{ message: string; status: number }> {
    let order = await this.findOne(id);

    if ((order.status === OrderStatus.DELIVERED || order.status === OrderStatus.CANCELLED)) {
      throw new BadRequestException('Order already delivered or cancelled');
    }

    if ((order.status === OrderStatus.PROCESSING && updateOrderStatusDto.status !== OrderStatus.SHIPPED)) {
      throw new BadRequestException('Delivery before shipped !!!');
    }

    if ((updateOrderStatusDto.status === OrderStatus.SHIPPED && order.status === OrderStatus.SHIPPED)) {
      return {
        message: `update order ${order.id} status to ${updateOrderStatusDto.status} successfully`,
        status: 200
      };
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

    return {
      message: `update order ${order.id} status to ${updateOrderStatusDto.status} successfully`,
      status: 200
    };
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

  sortObject(obj: any) {
    const sorted = {};
    const str = [];
    let key;
    for (key in obj) {
      if (obj.hasOwnProperty(key)) {
        str.push(encodeURIComponent(key));
      }
    }
    str.sort();
    for (key = 0; key < str.length; key++) {
      sorted[str[key]] = encodeURIComponent(obj[str[key]]).replace(/%20/g, "+");
    }
    return sorted;
  }


  async createPaymentUrl(): Promise<{ url: string }> {
    process.env.TZ = "Asia/Ho_Chi_Minh";

    const date = new Date();
    const createDate = moment(date).format("YYYYMMDDHHmmss");

    const ipAddr = "127.0.0.1";
    const tmnCode = env.VNPAY_TMN_CODE;
    const secretKey = env.VNPAY_HASH_SECRET;
    let vnpUrl = env.VNPAY_URL;
    const returnUrl = env.VNPAY_RETURN_URL;
    const orderId = moment(date).format("DDHHmmss");

    const currCode = "VND";
    let vnp_Params = {};
    vnp_Params["vnp_Version"] = "2.1.0";
    vnp_Params["vnp_Command"] = "pay";
    vnp_Params["vnp_TmnCode"] = tmnCode;
    vnp_Params["vnp_Locale"] = "vn";
    vnp_Params["vnp_CurrCode"] = currCode;
    vnp_Params["vnp_TxnRef"] = orderId;
    vnp_Params["vnp_OrderInfo"] = "Thanh toan cho ma GD:" + orderId;
    vnp_Params["vnp_OrderType"] = "other";
    vnp_Params["vnp_Amount"] = 100000 * 100;
    vnp_Params["vnp_ReturnUrl"] = returnUrl;
    vnp_Params["vnp_IpAddr"] = ipAddr;
    vnp_Params["vnp_CreateDate"] = createDate;
    vnp_Params["vnp_BankCode"] = "VNBANK";

    vnp_Params = this.sortObject(vnp_Params);

    const signData = qs.stringify(vnp_Params, { encode: false });
    const hmac = crypto.createHmac("sha512", secretKey);
    const signed = hmac.update(new Buffer(signData, "utf-8")).digest("hex");
    vnp_Params["vnp_SecureHash"] = signed;
    vnpUrl += "?" + qs.stringify(vnp_Params, { encode: false });

    return {
      url: vnpUrl,
    }
  };

  async verifyReturn(vnp_Params: any) {

    const secureHash = vnp_Params["vnp_SecureHash"];

    delete vnp_Params["vnp_SecureHash"];
    delete vnp_Params["vnp_SecureHashType"];

    vnp_Params = this.sortObject(vnp_Params);

    const secretKey = env.VNPAY_HASH_SECRET;

    const signData = qs.stringify(vnp_Params, { encode: false });
    const hmac = crypto.createHmac("sha512", secretKey);
    const signed = hmac.update(new Buffer(signData, "utf-8")).digest("hex");

    if (secureHash === signed) {
      return {
        message: "success",
      }
    } else {
      return {
        message: "fail",
      }
    }
  };

  async findOrdersByUser(
    userId: number,
    query: OrderMeParamsDto
  ): Promise<{ data: OrderEntity[]; meta: { limit: number; totalItems: number; totalPages: number; currentPage: number; } }> {
    const queryBuilder = this.orderRepository.createQueryBuilder('order')
      .leftJoinAndSelect('order.shippingAddress', 'shippingAddress')
      .leftJoinAndSelect('order.user', 'user')
      .leftJoinAndSelect('order.products', 'orderProducts')
      .leftJoinAndSelect('orderProducts.product', 'product')
      .where('user.id = :userId', { userId })
      .orderBy('order.orderAt', 'DESC');

    const page = query?.page > 0 ? query.page : 1;
    const limit = query?.limit > 0 ? query.limit : 10;
    const offset = (page - 1) * limit;

    const [orders, totalItems] = await queryBuilder
      .skip(offset)
      .take(limit)
      .getManyAndCount();

    const totalPages = Math.ceil(totalItems / limit);

    return {
      data: orders,
      meta: {
        limit,
        totalItems,
        totalPages,
        currentPage: page
      }
    };
  }

  async getMonthlyRevenue(query: MonthlyRevenueParamsDto): Promise<MonthlyRevenueResponse> {
    const page = query.page > 0 ? query.page : 1;
    const limit = query.limit > 0 ? query.limit : 10;

    const deliveredOrdersRaw = await this.orderRepository
      .createQueryBuilder('order')
      .select([
        "TO_CHAR(order.deliveredAt, 'YYYY-MM') AS month",
        'orderProduct.product_unit_price',
        'orderProduct.discount',
        'orderProduct.product_quantity'
      ])
      .leftJoin('order.products', 'orderProduct')
      .where('order.status = :status', { status: 'delivered' })
      .getRawMany();

    const monthlyRevenueData = this.calculateMonthlyRevenue(deliveredOrdersRaw);

    const totalItems = monthlyRevenueData.length;
    const totalPages = Math.ceil(totalItems / limit);
    const paginatedData = this.applyPagination(monthlyRevenueData, page, limit);

    return {
      data: paginatedData,
      meta: {
        totalItems,
        totalPages,
        currentPage: page,
        limit,
      }
    };
  }

  private calculateMonthlyRevenue(deliveredOrders: any[]): MonthlyRevenueResult[] {
    const monthlyRevenue = deliveredOrders.reduce((acc, current) => {
      const month = current.month;
      const unitPrice = Number(current.orderProduct_product_unit_price) || 0;
      const discount = Number(current.orderProduct_discount) || 0;
      const quantity = Number(current.orderProduct_product_quantity) || 0;

      const totalPrice = (unitPrice * (1 - discount / 100)) * quantity;

      if (!acc[month]) {
        acc[month] = { month, totalRevenue: 0 };
      }
      acc[month].totalRevenue += totalPrice;

      return acc;
    }, {});

    return Object.values(monthlyRevenue);
  }

  private applyPagination(monthlyRevenueData: MonthlyRevenueResult[], page: number, limit: number): MonthlyRevenueResult[] {
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;
    return monthlyRevenueData.slice(startIndex, endIndex);
  }
}
