import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateCommentDto } from './dto/create-comment.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { PostEntity } from 'src/entities/post.entity';
import { Repository } from 'typeorm';
import { CommentEntity } from 'src/entities/comment.entity';
import { UpdateCommentDto } from './dto/update-comment.dto';
import { GetCommentByPostIdParams } from './dto/get-comment-by-postId-params.dto';

@Injectable()
export class CommentService {
  constructor(
    @InjectRepository(PostEntity)
    private postRepository: Repository<PostEntity>,

    @InjectRepository(CommentEntity)
    private commentRepository: Repository<CommentEntity>,
  ) { }

  async getCommentsByPost(postId: number, query: GetCommentByPostIdParams): Promise<{ comments: CommentEntity[]; meta: { limit: number; totalItems: number; totalPages: number; currentPage: number; } }> {
    const page = query.page > 0 ? query.page : 1;
    const limit = query.limit > 0 ? query.limit : 10;
    const offset = (page - 1) * limit;

    const queryBuilder = this.commentRepository.createQueryBuilder('comment')
      .leftJoinAndSelect('comment.author', 'author')
      .where('comment.deletedAt IS NULL')
      .where('comment.postId = :postId', { postId })
      .orderBy('comment.createdAt', 'DESC')
      .take(limit)
      .skip(offset);

    const [comments, totalItems] = await queryBuilder.getManyAndCount();

    const totalPages = Math.ceil(totalItems / limit);
    return {
      comments,
      meta: {
        limit,
        totalItems,
        totalPages,
        currentPage: page,
      },
    };
  }

  async findOne(commentId: number): Promise<CommentEntity> {
    const comment = await this.commentRepository.findOneBy({ id: commentId });
    if (!comment) {
      throw new NotFoundException('Comment not found');
    }
    return comment;
  }

  async updateComment(id: number, updateCommentDto: UpdateCommentDto): Promise<CommentEntity> {
    const comment = await this.findOne(id);

    Object.assign(comment, updateCommentDto);

    await this.commentRepository.save(comment);

    return comment;
  }

  async softDeleteComment(id: number): Promise<{ message: string; code: number }> {
    const result = await this.commentRepository.softDelete(id);

    if (result.affected === 0) {
      throw new NotFoundException('Post not found or already deleted');
    }

    return {
      message: 'Post deleted successfully',
      code: 200,
    };
  }

  async addComment(userId: number, createCommentDto: CreateCommentDto): Promise<CommentEntity> {
    const post = await this.postRepository.findOneBy({ id: createCommentDto.postId });

    if (!post) {
      throw new NotFoundException('Post not found');
    }

    const comment = this.commentRepository.create({ ...createCommentDto, author: { id: userId }, post });
    await this.commentRepository.save(comment);
    return comment;
  }
}
