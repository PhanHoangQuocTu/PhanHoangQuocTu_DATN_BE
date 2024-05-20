// import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { BadRequestException, Body, Controller, Delete, Get, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { UsersService } from './users.service';

// import { UpdateUserDto } from './dto/update-user.dto';
import { ApiBearerAuth, ApiQuery, ApiTags } from '@nestjs/swagger';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserEntity } from 'src/entities/user.entity';
import { CurrentUser } from 'src/utils/decorators/current-user.decorator';
import { AuthenticationGuard } from 'src/utils/guards/authentication.guard';
import { AuthorizeGuard } from 'src/utils/guards/authorization.guard';
import { Roles } from 'src/utils/common/user-roles.enum';
import { IStatusResponse } from 'src/utils/common';
import { ActiveAccountDto } from './dto/active-account.dto';
import { FindAllUserParamsDto } from './dto/find-all-user-params.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
// import { AuthorizeRoles } from 'src/utils/decorators/authorize-roles.decorator';

@ApiTags('User')
@Controller('user')
export class UsersController {
  constructor(private readonly usersService: UsersService) { }

  @ApiBearerAuth('JWT-auth')
  @UseGuards(AuthenticationGuard)
  @Get('me')
  me(@CurrentUser() currentUser: UserEntity) {
    return currentUser
  }

  @ApiBearerAuth('JWT-auth')
  @UseGuards(AuthenticationGuard)
  @Get('isAdmin')
  async isAdmin(@CurrentUser() currentUser: UserEntity): Promise<{ data: boolean }> {
    return await this.usersService.isAdmin(currentUser);
  }

  @ApiBearerAuth('JWT-auth')
  @UseGuards(AuthenticationGuard, AuthorizeGuard([Roles.ADMIN]))
  @Get()
  @ApiQuery({ name: 'search', type: String, required: false },)
  @ApiQuery({ name: 'limit', type: Number, required: false },)
  @ApiQuery({ name: 'page', type: Number, required: false })
  @ApiQuery({ name: 'isActive', type: Boolean, required: false })
  async findAll(
    @Query() query: FindAllUserParamsDto
  ): Promise<{ users: UserEntity[]; meta: { limit: number; totalItems: number; totalPages: number; currentPage: number; } }> {
    return await this.usersService.findAll(query);
  }

  @Get(':id')
  async findOne(@Param('id') id: string): Promise<UserEntity> {
    return await this.usersService.findOne(+id);
  }

  @ApiBearerAuth('JWT-auth')
  @UseGuards(AuthenticationGuard)
  @Patch('/edit-profile')
  async update(@CurrentUser() currentUser: UserEntity, @Body() updateUserDto: UpdateUserDto): Promise<UserEntity> {
    return await this.usersService.update(+currentUser?.id, updateUserDto);
  }

  @ApiBearerAuth('JWT-auth')
  @UseGuards(AuthenticationGuard, AuthorizeGuard([Roles.USER, Roles.ADMIN]))
  @Post('change-password')
  async changePassword(@CurrentUser() currentUser: UserEntity, @Body() changePasswordDto: ChangePasswordDto): Promise<{ message: string }> {
    return await this.usersService.changePassword(+currentUser.id, changePasswordDto);

  }

  @ApiBearerAuth('JWT-auth')
  @UseGuards(AuthenticationGuard, AuthorizeGuard([Roles.ADMIN]))
  @Delete(':id')
  async remove(@Param('id') id: string): Promise<IStatusResponse> {
    return await this.usersService.remove(+id);
  }

  @ApiBearerAuth('JWT-auth')
  @UseGuards(AuthenticationGuard, AuthorizeGuard([Roles.USER, Roles.ADMIN]))
  @Post('generate-verify-code')
  async generateVerifyCode(@CurrentUser() currentUser: UserEntity): Promise<{ message: string }> {
    try {
      return await this.usersService.generateVerifyCode(currentUser.email);
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  @ApiBearerAuth('JWT-auth')
  @UseGuards(AuthenticationGuard, AuthorizeGuard([Roles.USER, Roles.ADMIN]))
  @Post('activate-user')
  async activateUser(
    @Body() activeAccountDto: ActiveAccountDto,
    @CurrentUser() currentUser: UserEntity
  ) {
    try {
      return await this.usersService.activateUser(currentUser?.email, activeAccountDto.verifyCode);
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }
}
