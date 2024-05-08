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
    const page = query?.page > 0 ? query.page : 1; // Đảm bảo rằng số trang ít nhất là 1
    const limit = query?.limit > 0 ? query.limit : 10; // Đặt một giới hạn mặc định nếu không có hoặc không hợp lệ
    const offset = (page - 1) * limit; // Tính toán offset
    
    // Tạo một QueryBuilder cho PublisherEntity
    const queryBuilder = this.publisherRepository.createQueryBuilder('publisher');
    
    // Nếu có tham số tìm kiếm, thêm điều kiện tìm kiếm không phân biệt chữ hoa chữ thường vào truy vấn
    if (query?.search) {
      const searchQuery = `%${query.search.toLowerCase()}%`;
      queryBuilder.where('LOWER(publisher.name) LIKE :search', { search: searchQuery });
    }
    
    // Thêm phân trang vào truy vấn
    queryBuilder.skip(offset).take(limit);
    
    // Thực hiện truy vấn để lấy kết quả và tổng số lượng bản ghi
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

  remove(id: number) {
    return `This action removes a #${id} publisher`;
  }
}
