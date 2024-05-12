import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateAuthorDto } from './dto/create-author.dto';
import { UpdateAuthorDto } from './dto/update-author.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { AuthorEntity } from 'src/entities/author.entity';
import { IsNull, Repository } from 'typeorm';
import { UserEntity } from 'src/entities/user.entity';
import { FindAllAuthorsParamsDto } from './dto/find-all-authors-params.dto';

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

  async findAll(query: FindAllAuthorsParamsDto): Promise<{ authors: AuthorEntity[]; meta: { limit: number; totalItems: number; totalPages: number; currentPage: number; } }> {
    const page = query?.page > 0 ? query.page : 1; // Đảm bảo rằng số trang ít nhất là 1
    const limit = query?.limit > 0 ? query.limit : 10; // Đặt một giới hạn mặc định nếu không có hoặc không hợp lệ
    const offset = (page - 1) * limit; // Tính toán offset

    const queryBuilder = this.authorRepository.createQueryBuilder('author').where('author.deletedAt IS NULL');

    if (query?.search) {
      const searchQuery = `%${query.search.toLowerCase()}%`;
      queryBuilder.andWhere('LOWER(author.name) LIKE :search', { search: searchQuery });
    }

    queryBuilder.skip(offset).take(limit);

    const [authors, totalItems] = await queryBuilder.getManyAndCount();

    const totalPages = Math.ceil(totalItems / limit);
    const currentPage = page;

    return {
      authors,
      meta: {
        limit,
        totalItems,
        totalPages,
        currentPage,
      },
    };
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

  async remove(id: number): Promise<{ status: number; message: string; }> {
    const author = await this.authorRepository.findOne({
      where: { id, deletedAt: IsNull() },
    });

    if (!author) throw new NotFoundException('Author not found or already deleted');

    await this.authorRepository.softDelete(id); // Perform a soft delete

    return {
      status: 200,
      message: 'Author deleted successfully',
    };
  }
}
