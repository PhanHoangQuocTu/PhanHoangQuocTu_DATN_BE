import { isPaidType, OrderStatus, OrderType } from "src/utils/common/order-status.enum";
import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, OneToMany, OneToOne, PrimaryGeneratedColumn, Timestamp } from "typeorm";
import { UserEntity } from "./user.entity";
import { ShippingEntity } from "./shipping.entity";
import { OrdersProductsEntity } from "./orders-products.entity";

@Entity({ name: "orders" })
export class OrderEntity {
    @PrimaryGeneratedColumn()
    id: number;

    @CreateDateColumn()
    orderAt: Timestamp;

    @Column({ type: "enum", enum: OrderStatus, default: OrderStatus.PROCESSING })
    status: string;

    @Column({ type: "enum", enum: OrderType, default: OrderType.cash })
    type: string;

    @Column({ type: "enum", enum: isPaidType, default: isPaidType.false })
    isPaid: string;

    @Column({ nullable: true })
    shippedAt: Date;

    @Column({ nullable: true })
    deliveredAt: Date;

    @ManyToOne(() => UserEntity, (user) => user.ordersUpdateBy)
    updatedBy: UserEntity;


    @OneToOne(() => ShippingEntity, (shipping) => shipping.order, {
        cascade: true
    })
    @JoinColumn()
    shippingAddress: ShippingEntity;

    @OneToMany(() => OrdersProductsEntity, (orderProduct) => orderProduct.order, {
        cascade: true
    })
    products: OrdersProductsEntity[]

    @ManyToOne(() => UserEntity, (user) => user.orders)
    user: UserEntity
}
