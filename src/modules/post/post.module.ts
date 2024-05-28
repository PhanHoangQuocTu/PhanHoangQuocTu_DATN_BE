import { Module } from '@nestjs/common';
import { PostService } from './post.service';
import { PostController } from './post.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PostEntity } from 'src/entities/post.entity';
import { UsersModule } from '../users/users.module';
import { CommentModule } from '../comment/comment.module';
import { LikeEntity } from 'src/entities/like.entity';
import { LikesModule } from '../likes/likes.module';

@Module({
  imports: [TypeOrmModule.forFeature([PostEntity, LikeEntity]), UsersModule, CommentModule, LikesModule],
  controllers: [PostController],
  providers: [PostService],
  exports: [PostService],
})
export class PostModule { }
