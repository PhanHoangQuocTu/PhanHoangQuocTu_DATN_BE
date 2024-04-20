// import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { Body, Controller, Delete, Get, Param, Patch, UseGuards } from '@nestjs/common';
import { UsersService } from './users.service';

// import { UpdateUserDto } from './dto/update-user.dto';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserEntity } from 'src/entities/user.entity';
import { CurrentUser } from 'src/utils/decorators/current-user.decorator';
import { AuthenticationGuard } from 'src/utils/guards/authentication.guard';
import { AuthorizeGuard } from 'src/utils/guards/authorization.guard';
import { Roles } from 'src/utils/common/user-roles.enum';
import { IStatusResponse } from 'src/utils/common';
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
  @UseGuards(AuthenticationGuard, AuthorizeGuard([Roles.ADMIN]))
  @Get()
  async findAll(): Promise<UserEntity[]> {
    return await this.usersService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id') id: string): Promise<UserEntity> {
    return await this.usersService.findOne(+id);
  }

  @ApiBearerAuth('JWT-auth')
  @UseGuards(AuthenticationGuard)
  @Patch(':id')
  async update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto): Promise<UserEntity> {
    return await this.usersService.update(+id, updateUserDto);
  }

  @ApiBearerAuth('JWT-auth')
  @UseGuards(AuthenticationGuard, AuthorizeGuard([Roles.ADMIN]))
  @Delete(':id')
  async remove(@Param('id') id: string): Promise<IStatusResponse> {
    return await this.usersService.remove(+id);
  }
}
