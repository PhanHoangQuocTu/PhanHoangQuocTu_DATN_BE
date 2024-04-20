import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { ProductEntity } from "./product.entity";
import { CartEntity } from "./cart.entity";

@Entity('cart_items')
export class CartItemEntity {
    @PrimaryGeneratedColumn()
    id: number;

    @ManyToOne(() => ProductEntity, (product) => product.cartItems)
    product: ProductEntity;

    @Column()
    quantity: number;

    @ManyToOne(() => CartEntity, (cart) => cart.items)
    cart: CartEntity;
}