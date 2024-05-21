import { Injectable, NotFoundException } from '@nestjs/common';
import { CreatePostDto } from './dto/create-post.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { PostEntity } from 'src/entities/post.entity';
import { Repository } from 'typeorm';
import { FindAllPostParams } from './dto/get-all-post-params.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { FindAllPostByMeParams } from './dto/get-all-post-by-me-params.dto';

@Injectable()
export class PostService {
  constructor(
    @InjectRepository(PostEntity)
    private postRepository: Repository<PostEntity>,
  ) { }

  async findOne(postId: number): Promise<PostEntity> {
    const post = await this.postRepository.findOneBy({ id: postId });
    
    if (!post) {
      throw new NotFoundException('Post not found');
    }

    return post;
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

  async findAllPosts(query: FindAllPostParams): Promise<{ posts: PostEntity[]; meta: { limit: number; totalItems: number; totalPages: number; currentPage: number; } }> {
    const page = query.page > 0 ? query.page : 1;
    const limit = query.limit > 0 ? query.limit : 10;
    const offset = (page - 1) * limit;
  
    const queryBuilder = this.postRepository.createQueryBuilder('post')
      .leftJoinAndSelect('post.author', 'author');
  
    if (query.isApprove !== undefined) {
      queryBuilder.andWhere('post.isApproved = :isApproved', { isApproved: query.isApprove });
    }
  
    if (query.search) {
      const searchQuery = `%${query.search.toLowerCase()}%`;
      queryBuilder.andWhere('(LOWER(post.title) LIKE :search OR LOWER(author.email) LIKE :search)', { search: searchQuery });
    }
  
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

  async updatePost(id: number, updatePostDto: UpdatePostDto): Promise<PostEntity> {
    const post = await this.findOne(id);
    Object.assign(post, updatePostDto);
    await this.postRepository.save(post);
    return post;
  }

  async softDeletePost(id: number): Promise<{ message: string; code: number }> {
    const result = await this.postRepository.softDelete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`Post with ID "${id}" not found`);
    }

    return {
      message: `Post with ID "${id}" deleted successfully`,
      code: 200,
    }
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
