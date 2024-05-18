import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { OrderEntity } from "./order.entity";
import { ProductEntity } from "./product.entity";

@Entity("orders_products")
export class OrdersProductsEntity {
    @PrimaryGeneratedColumn()
    id: number

    @Column({ type: "decimal", precision: 10, scale: 2, default: 0 })
    product_unit_price: number;

    @Column()
    product_quantity: number;

    @ManyToOne(() => OrderEntity, (order) => order.products)
    order: OrderEntity

    @Column({
        type: 'decimal',
        precision: 10,
        scale: 2,
        default: 0.0,
        nullable: true
    })
    discount: number;

    @Column({ nullable: true })
    title: string;

    @Column({ type: 'simple-array', nullable: true })
    images: string[]

    @Column({ nullable: true })
    description: string;

    @ManyToOne(() => ProductEntity, (product) => product.products, {
        eager: true
    })
    product: ProductEntity
}