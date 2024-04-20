import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { PublisherService } from './publisher.service';
import { CreatePublisherDto } from './dto/create-publisher.dto';
import { UpdatePublisherDto } from './dto/update-publisher.dto';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Roles } from 'src/utils/common/user-roles.enum';
import { AuthorizeGuard } from 'src/utils/guards/authorization.guard';
import { AuthenticationGuard } from 'src/utils/guards/authentication.guard';
import { UserEntity } from 'src/entities/user.entity';
import { CurrentUser } from 'src/utils/decorators/current-user.decorator';
import { PublisherEntity } from 'src/entities/publisher.entity';

@ApiTags('Publisher')
@Controller('publisher')
export class PublisherController {
  constructor(private readonly publisherService: PublisherService) { }

  @ApiBearerAuth('JWT-auth')
  @UseGuards(AuthenticationGuard, AuthorizeGuard([Roles.ADMIN]))
  @Post()
  async create(@Body() createPublisherDto: CreatePublisherDto, @CurrentUser() currentUser: UserEntity): Promise<PublisherEntity> {
    return await this.publisherService.create(createPublisherDto, currentUser);
  }

  @Get()
  async findAll(): Promise<PublisherEntity[]> {
    return await this.publisherService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return await this.publisherService.findOne(+id);
  }

  @Patch(':id')
  async update(@Param('id') id: string, @Body() updatePublisherDto: UpdatePublisherDto) {
    return await this.publisherService.update(+id, updatePublisherDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.publisherService.remove(+id);
  }
}
