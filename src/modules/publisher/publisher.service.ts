import { Injectable, NotFoundException } from '@nestjs/common';
import { CreatePublisherDto } from './dto/create-publisher.dto';
import { UpdatePublisherDto } from './dto/update-publisher.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { PublisherEntity } from 'src/entities/publisher.entity';
import { Repository } from 'typeorm';
import { UserEntity } from 'src/entities/user.entity';

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

  async findAll(): Promise<PublisherEntity[]> {
    return await this.publisherRepository.find();
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
