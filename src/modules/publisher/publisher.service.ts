import { Injectable, NotFoundException } from '@nestjs/common';
import { CreatePublisherDto } from './dto/create-publisher.dto';
import { UpdatePublisherDto } from './dto/update-publisher.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { PublisherEntity } from 'src/entities/publisher.entity';
import { Repository } from 'typeorm';
import { UserEntity } from 'src/entities/user.entity';
import { FindAllPublisherParamsDto } from './dto/find-all-publisher-params.dto';

@Injectable()
export class PublisherService {
  constructor(
    @InjectRepository(PublisherEntity)
    private readonly publisherRepository: Repository<PublisherEntity>,
  ) { }
  async create(createPublisherDto: CreatePublisherDto, currentUser: UserEntity): Promise<PublisherEntity> {
    const publisher = await this.publisherRepository.create(createPublisherDto);

    publisher.addedBy = currentUser;

    return await this.publisherRepository.save(publisher);
  }

  async findAll(query: FindAllPublisherParamsDto): Promise<{ publishers: PublisherEntity[]; meta: { limit: number; totalItems: number; totalPages: number; currentPage: number; } }> {
    const page = query?.page > 0 ? query.page : 1;
    const limit = query?.limit > 0 ? query.limit : 10;
    const offset = (page - 1) * limit;

    const queryBuilder = this.publisherRepository.createQueryBuilder('publisher').where('publisher.deletedAt IS NULL');

    if (query?.search) {
      const searchQuery = `%${query.search.toLowerCase()}%`;
      queryBuilder.where('LOWER(publisher.name) LIKE :search', { search: searchQuery });
    }

    queryBuilder.skip(offset).take(limit);

    const [publishers, totalItems] = await queryBuilder.getManyAndCount();

    const totalPages = Math.ceil(totalItems / limit);
    const currentPage = page;

    return {
      publishers,
      meta: {
        limit,
        totalItems,
        totalPages,
        currentPage,
      },
    };
  }

  async findOne(id: number): Promise<PublisherEntity> {
    const publisher = await this.publisherRepository.findOne({
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

    if (!publisher) throw new NotFoundException('Publisher not found');

    return publisher
  }

  async update(id: number, fields: Partial<UpdatePublisherDto>): Promise<PublisherEntity> {
    const publisher = await this.findOne(id);

    if (!publisher) throw new NotFoundException('Publisher not found');

    Object.assign(publisher, fields);

    return await this.publisherRepository.save(publisher);
  }

  async remove(id: number): Promise<{ status: number, message: string }> {
    const publisher = await this.findOne(id);

    if (!publisher) throw new NotFoundException('Publisher not found');

    await this.publisherRepository.softDelete(id);

    return {
      status: 200,
      message: 'Publisher deleted successfully',
    }
  }
}
