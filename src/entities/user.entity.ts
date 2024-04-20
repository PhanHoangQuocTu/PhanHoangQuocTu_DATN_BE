import { Roles } from "src/utils/common/user-roles.enum";
import { Column, CreateDateColumn, DeleteDateColumn, Entity, OneToMany, PrimaryGeneratedColumn, Timestamp, UpdateDateColumn } from "typeorm";
import { CategoryEntity } from "./category.entity";
import { ProductEntity } from "./product.entity";
import { ReviewEntity } from "./review.entity";
import { OrderEntity } from "./order.entity";
import { CartEntity } from "./cart.entity";
import { AuthorEntity } from "./author.entity";
import { PublisherEntity } from "./publisher.entity";

@Entity({ name: "users" })
export class UserEntity {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ nullable: true })
    firstName: string;

    @Column({ nullable: true })
    lastName: string;

    @Column({ unique: true })
    email: string;

    @Column({ unique: true })
    phoneNumber: string;

    @Column({ nullable: true })
    address: string;

    @Column({ type: "enum", enum: ["Male", "Female"], nullable: true })
    gender: string;

    @Column({ nullable: true })
    DateOfBirth: Date

    @Column({ select: false })
    password: string;

    @Column({ type: "enum", enum: Roles, array: true, default: [Roles.USER] })
    roles: Roles[]

    @CreateDateColumn()
    createdAt: Timestamp;

    @UpdateDateColumn()
    updatedAt: Timestamp;

    @DeleteDateColumn()
    deletedAt?: Date;

    @Column({ default: false })
    isActice: boolean

    @Column({ nullable: true })
    verifyCode: string

    @OneToMany(() => CategoryEntity, (category) => category.addedBy)
    categories: CategoryEntity[]

    @OneToMany(() => AuthorEntity, (author) => author.addedBy)
    authors: AuthorEntity[]

    @OneToMany(() => PublisherEntity, (publisher) => publisher.addedBy)
    publishers: PublisherEntity[]

    @OneToMany(() => ProductEntity, (product) => product.addedBy)
    products: ProductEntity[]

    @OneToMany(() => ReviewEntity, (review) => review.user)
    reviews: ReviewEntity[]

    @OneToMany(() => OrderEntity, (order) => order.updatedBy)
    ordersUpdateBy: OrderEntity[]

    @OneToMany(() => OrderEntity, (order) => order.user)
    orders: OrderEntity[]

    @OneToMany(() => CartEntity, (cart) => cart.user)
    carts: CartEntity[]
}
