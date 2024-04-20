import { Column, CreateDateColumn, Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn, Timestamp, UpdateDateColumn } from "typeorm";
import { UserEntity } from "./user.entity";
import { ProductEntity } from "./product.entity";

@Entity('categories')
export class CategoryEntity {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    title: string;

    @Column()
    description: string;

    @CreateDateColumn()
    createdAt: Timestamp;

    @UpdateDateColumn()
    updatedAt: Timestamp;

    @ManyToOne(() => UserEntity, (user) => user.categories)
    addedBy: UserEntity

    @OneToMany(() => ProductEntity, (product) => product.category)
    products: ProductEntity[]
}
