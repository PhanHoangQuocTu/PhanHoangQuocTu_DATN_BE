import { Column, CreateDateColumn, DeleteDateColumn, Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn, Timestamp, UpdateDateColumn } from "typeorm";
import { UserEntity } from "./user.entity";
import { CategoryEntity } from "./category.entity";
import { ReviewEntity } from "./review.entity";
import { OrdersProductsEntity } from "./orders-products.entity";
import { CartItemEntity } from "./cart-item.entity";
import { AuthorEntity } from "./author.entity";
import { PublisherEntity } from "./publisher.entity";

@Entity('products')
export class ProductEntity {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    title: string;

    @Column()
    description: string;

    @Column({
        type: 'decimal',
        precision: 10,
        scale: 2,
        default: 0.0,
    })
    price: number;

    @Column()
    stock: number;

    @Column('simple-array', { nullable: true })
    images: string[];

    @CreateDateColumn()
    createdAt: Timestamp;

    @UpdateDateColumn()
    updatedAt: Timestamp;

    @DeleteDateColumn()
    deletedAt?: Date;

    @ManyToOne(() => UserEntity, (user) => user.products)
    addedBy: UserEntity;

    @ManyToOne(() => CategoryEntity, (category) => category.products)
    category: CategoryEntity;

    @ManyToOne(() => AuthorEntity, (author) => author.products)
    author: AuthorEntity;

    @ManyToOne(() => PublisherEntity, (publisher) => publisher.products)
    publisher: PublisherEntity;

    @OneToMany(() => ReviewEntity, (review) => review.product)
    reviews: ReviewEntity[];

    @OneToMany(() => OrdersProductsEntity, (orderProduct) => orderProduct.product)
    products: OrdersProductsEntity[];

    @OneToMany(() => CartItemEntity, (cartItem) => cartItem.product)
    cartItems: CartItemEntity[];
}
