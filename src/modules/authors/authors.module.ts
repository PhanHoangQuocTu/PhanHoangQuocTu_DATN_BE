import { Module } from '@nestjs/common';
import { AuthorsService } from './authors.service';
import { AuthorsController } from './authors.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthorEntity } from 'src/entities/author.entity';

@Module({
  imports: [TypeOrmModule.forFeature([AuthorEntity])],
  controllers: [AuthorsController],
  providers: [AuthorsService],
  exports: [AuthorsService]
})
export class AuthorsModule { }
