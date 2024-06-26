import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Query } from '@nestjs/common';
import { AuthorsService } from './authors.service';
import { CreateAuthorDto } from './dto/create-author.dto';
import { UpdateAuthorDto } from './dto/update-author.dto';
import { ApiBearerAuth, ApiQuery, ApiTags } from '@nestjs/swagger';
import { Roles } from 'src/utils/common/user-roles.enum';
import { AuthorizeGuard } from 'src/utils/guards/authorization.guard';
import { AuthenticationGuard } from 'src/utils/guards/authentication.guard';
import { CurrentUser } from 'src/utils/decorators/current-user.decorator';
import { UserEntity } from 'src/entities/user.entity';
import { AuthorEntity } from 'src/entities/author.entity';
import { FindAllAuthorsParamsDto } from './dto/find-all-authors-params.dto';

@ApiTags('Author')

@Controller('authors')
export class AuthorsController {
  constructor(private readonly authorsService: AuthorsService) { }

  @ApiBearerAuth('JWT-auth')
  @UseGuards(AuthenticationGuard, AuthorizeGuard([Roles.ADMIN]))
  @Post()
  async create(@Body() createAuthorDto: CreateAuthorDto, @CurrentUser() currentUser: UserEntity) {
    return await this.authorsService.create(createAuthorDto, currentUser);
  }

  @ApiQuery({ name: 'search', type: String, required: false },)
  @ApiQuery({ name: 'limit', type: Number, required: false },)
  @ApiQuery({ name: 'page', type: Number, required: false })
  @Get()
  async findAll(
    @Query() query: FindAllAuthorsParamsDto,
  ): Promise<{ authors: AuthorEntity[]; meta: { limit: number; totalItems: number; totalPages: number; currentPage: number; } }> {
    return await this.authorsService.findAll(query);
  }

  @Get(':id')
  async findOne(@Param('id') id: string): Promise<AuthorEntity> {
    return await this.authorsService.findOne(+id);
  }

  @ApiBearerAuth('JWT-auth')
  @UseGuards(AuthenticationGuard, AuthorizeGuard([Roles.ADMIN]))
  @Patch(':id')
  async update(@Param('id') id: string, @Body() updateAuthorDto: UpdateAuthorDto) {
    return await this.authorsService.update(+id, updateAuthorDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.authorsService.remove(+id);
  }
}
