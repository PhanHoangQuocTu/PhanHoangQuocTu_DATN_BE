import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn } from 'typeorm';
import { UserEntity } from './user.entity';
import { PostEntity } from './post.entity';

@Entity({ name: 'comments' })
export class CommentEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'text' })
  content: string;

  @ManyToOne(() => UserEntity, user => user.comments)
  author: UserEntity;

  @ManyToOne(() => PostEntity, post => post.comments)
  post: PostEntity;

  @CreateDateColumn()
  createdAt: Date;
}