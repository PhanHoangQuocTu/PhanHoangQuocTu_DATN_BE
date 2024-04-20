import { CreateDateColumn, Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn, Timestamp, UpdateDateColumn } from "typeorm";
import { UserEntity } from "./user.entity";
import { CartItemEntity } from "./cart-item.entity";

@Entity('carts')
export class CartEntity {
    @PrimaryGeneratedColumn()
    id: number;

    @ManyToOne(() => UserEntity, (user) => user.carts)
    user: UserEntity;

    @OneToMany(() => CartItemEntity, (item) => item.cart, { cascade: true })
    items: CartItemEntity[];

    @CreateDateColumn()
    createdAt: Timestamp;

    @UpdateDateColumn()
    updatedAt: Timestamp;
}