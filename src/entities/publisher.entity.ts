import { Entity, PrimaryGeneratedColumn, Column, OneToMany, CreateDateColumn, UpdateDateColumn, DeleteDateColumn, ManyToOne } from 'typeorm';
import { ProductEntity } from './product.entity';
import { UserEntity } from './user.entity';

@Entity('publishers')
export class PublisherEntity {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    name: string;

    @Column({ nullable: true })
    description: string;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;

    @DeleteDateColumn()
    deletedAt?: Date;

    @ManyToOne(() => UserEntity, (user) => user.publishers)
    addedBy: UserEntity

    @OneToMany(() => ProductEntity, (product) => product.publisher)
    products: ProductEntity[];
}