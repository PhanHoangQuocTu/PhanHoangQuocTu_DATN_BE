import { Module } from '@nestjs/common';
import { PublisherService } from './publisher.service';
import { PublisherController } from './publisher.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PublisherEntity } from 'src/entities/publisher.entity';

@Module({
  imports: [TypeOrmModule.forFeature([PublisherEntity])],
  controllers: [PublisherController],
  providers: [PublisherService],
  exports: [PublisherService]

})
export class PublisherModule { }
