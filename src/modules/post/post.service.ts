import { Injectable, NotFoundException } from '@nestjs/common';
import { CreatePostDto } from './dto/create-post.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { PostEntity } from 'src/entities/post.entity';
import { Repository } from 'typeorm';
import { FindAllPostParams } from './dto/get-all-post-params.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { FindAllPostByMeParams } from './dto/get-all-post-by-me-params.dto';
import { LikeEntity } from 'src/entities/like.entity';

@Injectable()
export class PostService {
  constructor(
    @InjectRepository(PostEntity)
    private postRepository: Repository<PostEntity>,

    @InjectRepository(LikeEntity)
    private likeRepository: Repository<LikeEntity>,
  ) { }

  async findOne(postId: number): Promise<PostEntity> {
    const post = await this.postRepository.createQueryBuilder('post')
      .leftJoinAndSelect('post.author', 'author')
      .leftJoinAndSelect('post.likes', 'likes')
      .leftJoinAndSelect('likes.user', 'likeUser')
      .loadRelationCountAndMap('post.commentCount', 'post.comments')
      .where('post.id = :postId', { postId })
      .andWhere('post.deletedAt IS NULL')
      .getOne();

    if (!post) {
      throw new NotFoundException('Post not found');
    }

    return post;
  }

  async toggleLike(userId: number, postId: number): Promise<{ data: PostEntity; code: number }> {
    const post = await this.postRepository.findOne({ where: { id: Number(postId) } });
    if (!post) {
      throw new NotFoundException('Post not found');
    }

    const existingLike = await this.likeRepository.findOne({ where: { post: { id: postId }, user: { id: userId } } });

    if (existingLike) {
      await this.likeRepository.delete({ id: existingLike.id });
      await this.postRepository
        .createQueryBuilder()
        .update(PostEntity)
        .set({ likeCount: () => "likeCount - 1" })
        .where("id = :id", { id: postId })
        .execute();
    } else {
      const newLike = this.likeRepository.create({ user: { id: userId }, post: { id: postId } });
      await this.likeRepository.save(newLike);
      await this.postRepository
        .createQueryBuilder()
        .update(PostEntity)
        .set({ likeCount: () => "likeCount + 1" })
        .where("id = :id", { id: postId })
        .execute();
    }

    const updatedPost = await this.postRepository.findOne({ where: { id: Number(postId) } });

    return {
      data: updatedPost,
      code: 200,
    };
  }

  async create(userId: number, createPostDto: CreatePostDto): Promise<PostEntity> {
    const post = this.postRepository.create({ ...createPostDto, author: { id: userId } });

    await this.postRepository.save(post);

    return post;
  }


  async approvePost(postId: number): Promise<PostEntity> {
    const post = await this.findOne(postId);

    post.isApproved = true;

    await this.postRepository.save(post);

    return post;
  }

  async findAllPosts(query: FindAllPostParams): Promise<{ posts: PostEntity[]; meta: { limit: number; totalItems: number; totalPages: number; currentPage: number; }, likesInfo: any[] }> {
    const page = query.page > 0 ? query.page : 1;
    const limit = query.limit > 0 ? query.limit : 10;
    const offset = (page - 1) * limit;

    const queryBuilder = this.postRepository.createQueryBuilder('post')
      .where('post.deletedAt IS NULL')
      .leftJoinAndSelect('post.author', 'author')
      .leftJoinAndSelect('post.likes', 'likes')
      .leftJoinAndSelect('likes.user', 'likeUser');

    if (query.isApprove !== undefined) {
      queryBuilder.andWhere('post.isApproved = :isApproved', { isApproved: query.isApprove });
    }

    if (query.search) {
      const searchQuery = `%${query.search.toLowerCase()}%`;
      queryBuilder.andWhere('(LOWER(post.title) LIKE :search OR LOWER(author.email) LIKE :search)', { search: searchQuery });
    }

    queryBuilder.loadRelationCountAndMap('post.commentCount', 'post.comments');

    queryBuilder.orderBy('post.createdAt', 'DESC');

    queryBuilder.skip(offset).take(limit);

    const [posts, totalItems] = await queryBuilder.getManyAndCount();

    const likesInfo = posts.map(post => ({
      postId: post.id,
      likes: post.likes.map(like => ({
        userId: like.user.id,
        userName: like.user.firstName + ' ' + like.user.lastName
      }))
    }));

    const totalPages = Math.ceil(totalItems / limit);
    const currentPage = page;

    return {
      posts,
      meta: {
        limit,
        totalItems,
        totalPages,
        currentPage,
      },
      likesInfo
    };
  }

  async updatePost(id: number, updatePostDto: UpdatePostDto): Promise<PostEntity> {
    const post = await this.findOne(id);
    Object.assign(post, updatePostDto);
    await this.postRepository.save(post);
    return post;
  }

  async softDeletePost(id: number): Promise<{ message: string; code: number }> {
    const result = await this.postRepository.softDelete(id);

    if (result.affected === 0) {
      throw new NotFoundException('Post not found or already deleted');
    }

    return {
      message: 'Post deleted successfully',
      code: 200,
    };
  }

  async findAllPostsByUser(userId: number, query: FindAllPostByMeParams): Promise<{ posts: PostEntity[]; meta: { limit: number; totalItems: number; totalPages: number; currentPage: number; } }> {
    const page = query.page > 0 ? query.page : 1;
    const limit = query.limit > 0 ? query.limit : 10;
    const offset = (page - 1) * limit;

    const queryBuilder = this.postRepository.createQueryBuilder('post')
      .leftJoinAndSelect('post.author', 'author')
      .where('post.authorId = :userId', { userId });

    if (query.search) {
      const searchQuery = `%${query.search.toLowerCase()}%`;
      queryBuilder.andWhere('(LOWER(post.title) LIKE :search OR LOWER(post.content) LIKE :search)', { search: searchQuery });
    }
    queryBuilder.loadRelationCountAndMap('post.commentCount', 'post.comments');

    queryBuilder.orderBy('post.createdAt', 'DESC');

    queryBuilder.skip(offset).take(limit);

    const [posts, totalItems] = await queryBuilder.getManyAndCount();

    const totalPages = Math.ceil(totalItems / limit);
    const currentPage = page;

    return {
      posts,
      meta: {
        limit,
        totalItems,
        totalPages,
        currentPage,
      },
    };
  }


}
