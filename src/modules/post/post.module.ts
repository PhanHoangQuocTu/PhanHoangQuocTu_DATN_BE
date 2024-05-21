import { Module } from '@nestjs/common';
import { PostService } from './post.service';
import { PostController } from './post.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PostEntity } from 'src/entities/post.entity';
import { UsersModule } from '../users/users.module';
import { CommentModule } from '../comment/comment.module';

@Module({
  imports: [TypeOrmModule.forFeature([PostEntity]), UsersModule, CommentModule],
  controllers: [PostController],
  providers: [PostService],
  exports: [PostService],
})
export class PostModule { }
