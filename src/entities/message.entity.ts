import { UserEntity } from "src/entities/user.entity";
import { Column, CreateDateColumn, DeleteDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";

@Entity({ name: "messages" })
export class MessageEntity {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    text: string;

    @Column({ nullable: true })
    senderName: string;

    @ManyToOne(() => UserEntity)
    sender: UserEntity;

    @CreateDateColumn()
    createdAt: Date;

    @DeleteDateColumn()
    deletedAt?: Date;
}