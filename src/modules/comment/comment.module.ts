import { Module } from '@nestjs/common';
import { CommentService } from './comment.service';
import { CommentController } from './comment.controller';
import { CommentEntity } from 'src/entities/comment.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersModule } from '../users/users.module';
import { PostEntity } from 'src/entities/post.entity';

@Module({
  imports: [TypeOrmModule.forFeature([CommentEntity, PostEntity]), UsersModule],
  controllers: [CommentController],
  providers: [CommentService],
  exports: [CommentService]
})
export class CommentModule { }
