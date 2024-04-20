import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateAuthorDto } from './dto/create-author.dto';
import { UpdateAuthorDto } from './dto/update-author.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { AuthorEntity } from 'src/entities/author.entity';
import { Repository } from 'typeorm';
import { UserEntity } from 'src/entities/user.entity';

@Injectable()
export class AuthorsService {
  constructor(
    @InjectRepository(AuthorEntity)
    private readonly authorRepository: Repository<AuthorEntity>,
  ) { }

  async create(createAuthorDto: CreateAuthorDto, currentUser: UserEntity): Promise<AuthorEntity> {
    const existAuthor = await this.authorRepository.findOne({
      where: { name: createAuthorDto.name },
    })

    if (existAuthor) throw new BadRequestException('Author already exists')
    const author = await this.authorRepository.create(createAuthorDto);

    author.addedBy = currentUser;

    return await this.authorRepository.save(author);
  }

  async findAll(): Promise<AuthorEntity[]> {
    return await this.authorRepository.find();
  }

  async findOne(id: number): Promise<AuthorEntity> {
    const category = await this.authorRepository.findOne({
      where: { id }, relations: { addedBy: true }, select: {
        addedBy: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
          phoneNumber: true,
          address: true,
        }
      }
    });

    if (!category) throw new NotFoundException('Author not found');

    return category
  }

  async update(id: number, fields: Partial<UpdateAuthorDto>): Promise<AuthorEntity> {
    const author = await this.findOne(id);

    if (!author) throw new NotFoundException('Author not found');

    Object.assign(author, fields);

    return await this.authorRepository.save(author);
  }

  remove(id: number) {
    return `This action removes a #${id} author`;
  }
}
