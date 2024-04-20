/* eslint-disable @typescript-eslint/no-unused-vars */
import { Column, CreateDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn, Timestamp, UpdateDateColumn } from "typeorm";
import { UserEntity } from "./user.entity";
import { ProductEntity } from "./product.entity";

@Entity('reviews')
export class ReviewEntity {
    @PrimaryGeneratedColumn()
    id: number

    @Column()
    ratings: number

    @Column()
    comment: string

    @CreateDateColumn()
    createdAt: Timestamp

    @UpdateDateColumn()
    updatedAt: Timestamp

    @ManyToOne(type => UserEntity, user => user.reviews)
    user: UserEntity

    @ManyToOne(type => ProductEntity, product => product.reviews)
    product: ProductEntity
}
