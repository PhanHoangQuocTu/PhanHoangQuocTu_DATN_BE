import { Column, Entity, OneToOne, PrimaryGeneratedColumn } from "typeorm";
import { OrderEntity } from "./order.entity";

@Entity("shippings")
export class ShippingEntity { 
    @PrimaryGeneratedColumn()
    id: number

    @Column()
    phoneNumber: string;

    @Column({ default: ""})
    name: string;

    @Column()
    address: string;

    @Column()
    city: string;

    @Column()
    postCode: string;

    @Column()
    state: string;

    @Column()
    country: string;

    @OneToOne(() => OrderEntity, (order) => order.shippingAddress)
    order: OrderEntity
}