import { Column, CreateDateColumn, DeleteDateColumn, Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn, Timestamp, UpdateDateColumn } from "typeorm";
import { UserEntity } from "./user.entity";
import { ProductEntity } from "./product.entity";

@Entity('authors')
export class AuthorEntity {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    name: string;

    @Column({ type: "enum", enum: ["Male", "Female"], nullable: true })
    gender: string;

    @Column({ nullable: true })
    dateOfBirth: Date

    @CreateDateColumn()
    createdAt: Timestamp;

    @UpdateDateColumn()
    updatedAt: Timestamp;

    @DeleteDateColumn()
    deletedAt?: Date;

    @ManyToOne(() => UserEntity, (user) => user.authors)
    addedBy: UserEntity

    @OneToMany(() => ProductEntity, (product) => product.author)
    products: ProductEntity[]
}
