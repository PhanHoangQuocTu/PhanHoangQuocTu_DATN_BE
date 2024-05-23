import { Controller, Post, Body, UseGuards, Patch, Param, Get, Query, Delete } from '@nestjs/common';
import { CommentService } from './comment.service';
import { CreateCommentDto } from './dto/create-comment.dto';
import { ApiBearerAuth, ApiQuery, ApiTags } from '@nestjs/swagger';
import { AuthenticationGuard } from 'src/utils/guards/authentication.guard';
import { AuthorizeGuard } from 'src/utils/guards/authorization.guard';
import { Roles } from 'src/utils/common/user-roles.enum';
import { CurrentUser } from 'src/utils/decorators/current-user.decorator';
import { UserEntity } from 'src/entities/user.entity';
import { UpdateCommentDto } from './dto/update-comment.dto';
import { GetCommentByPostIdParams } from './dto/get-comment-by-postId-params.dto';

@ApiTags('Comment')
@Controller('comment')
export class CommentController {
  constructor(private readonly commentService: CommentService) { }

  @ApiQuery({ name: 'limit', type: Number, required: false },)
  @ApiQuery({ name: 'page', type: Number, required: false })
  @ApiQuery({ name: 'postId', type: Number, required: false })
  @Get('by-post/:postId')
  async getCommentsByPost(
    @Query() query: GetCommentByPostIdParams,
  ) {
    return await this.commentService.getCommentsByPost(+query.postId, query);
  }

  @ApiBearerAuth('JWT-auth')
  @UseGuards(AuthenticationGuard, AuthorizeGuard([Roles.ADMIN, Roles.USER]))
  @Patch(':id')
  async updateComment(
    @Param('id') id: string,
    @Body() updateCommentDto: UpdateCommentDto
  ) {
    return await this.commentService.updateComment(+id, updateCommentDto);
  }

  @ApiBearerAuth('JWT-auth')
  @UseGuards(AuthenticationGuard, AuthorizeGuard([Roles.ADMIN, Roles.USER]))
  @Delete(':id')
  async softDeleteComment(@Param('id') id: string) {
    return await this.commentService.softDeleteComment(+id);
  }

  @ApiBearerAuth('JWT-auth')
  @UseGuards(AuthenticationGuard, AuthorizeGuard([Roles.ADMIN, Roles.USER]))
  @Post('comment/:id')
  async comment(@Body() createCommentDto: CreateCommentDto, @CurrentUser() currentUser: UserEntity) {
    return await this.commentService.addComment(+currentUser.id, createCommentDto);
  }
}
