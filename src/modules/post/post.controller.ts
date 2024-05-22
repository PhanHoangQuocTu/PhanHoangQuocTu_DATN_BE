import { Controller, Post, Body, Patch, Param, UseGuards, Get, Query, Delete } from '@nestjs/common';
import { PostService } from './post.service';
import { CreatePostDto } from './dto/create-post.dto';
import { AuthorizeGuard } from 'src/utils/guards/authorization.guard';
import { ApiBearerAuth, ApiQuery, ApiTags } from '@nestjs/swagger';
import { AuthenticationGuard } from 'src/utils/guards/authentication.guard';
import { Roles } from 'src/utils/common/user-roles.enum';
import { CurrentUser } from 'src/utils/decorators/current-user.decorator';
import { UserEntity } from 'src/entities/user.entity';
import { UpdatePostDto } from './dto/update-post.dto';
import { FindAllPostParams } from './dto/get-all-post-params.dto';
import { PostEntity } from 'src/entities/post.entity';
import { FindAllPostByMeParams } from './dto/get-all-post-by-me-params.dto';

@ApiTags('Post')
@Controller('post')
export class PostController {
  constructor(private readonly postService: PostService) { }

  @ApiBearerAuth('JWT-auth')
  @UseGuards(AuthenticationGuard, AuthorizeGuard([Roles.ADMIN, Roles.USER]))
  @ApiQuery({ name: 'limit', type: Number, required: false })
  @ApiQuery({ name: 'page', type: Number, required: false })
  @ApiQuery({ name: 'search', type: String, required: false })
  @Get('me')
  async getAllPostByMe(@Query() query: FindAllPostByMeParams, @CurrentUser() currentUser: UserEntity): Promise<{ posts: PostEntity[]; meta: { limit: number; totalItems: number; totalPages: number; currentPage: number; } }> {
    return await this.postService.findAllPostsByUser(+currentUser.id, query);
  }

  @ApiBearerAuth('JWT-auth')
  @UseGuards(AuthenticationGuard, AuthorizeGuard([Roles.ADMIN, Roles.USER]))
  @Get(':id')
  async findOne(@Param('id') id: string): Promise<PostEntity> {
    return await this.postService.findOne(+id);
  }

  @ApiBearerAuth('JWT-auth')
  @UseGuards(AuthenticationGuard, AuthorizeGuard([Roles.ADMIN, Roles.USER]))
  @Post('create')
  async create(@Body() createPostDto: CreatePostDto, @CurrentUser() currentUser: UserEntity): Promise<PostEntity> {
    return await this.postService.create(+currentUser.id, createPostDto);
  }

  @ApiBearerAuth('JWT-auth')
  @UseGuards(AuthenticationGuard, AuthorizeGuard([Roles.ADMIN]))
  @Patch('approve/:id')
  async approvePost(@Param('id') id: string): Promise<PostEntity> {
    return await this.postService.approvePost(+id);
  }

  @ApiQuery({ name: 'limit', type: Number, required: false },)
  @ApiQuery({ name: 'page', type: Number, required: false })
  @ApiQuery({ name: 'search', type: String, required: false })
  @ApiQuery({ name: 'isApprove', type: Boolean, required: false })
  @Get()
  async getAllPosts(@Query() query: FindAllPostParams): Promise<{ posts: PostEntity[]; meta: { limit: number; totalItems: number; totalPages: number; currentPage: number; } }> {
    return await this.postService.findAllPosts(query);
  }

  @ApiBearerAuth('JWT-auth')
  @UseGuards(AuthenticationGuard, AuthorizeGuard([Roles.ADMIN, Roles.USER]))
  @Patch(':id')
  async updatePost(@Param('id') id: string, @Body() updatePostDto: UpdatePostDto): Promise<PostEntity> {
    return await this.postService.updatePost(+id, updatePostDto);
  }

  @ApiBearerAuth('JWT-auth')
  @UseGuards(AuthenticationGuard, AuthorizeGuard([Roles.ADMIN, Roles.USER]))
  @Delete(':id')
  async softDeletePost(@Param('id') id: string): Promise<{ message: string; code: number }> {
    return await this.postService.softDeletePost(+id);
  }

}
