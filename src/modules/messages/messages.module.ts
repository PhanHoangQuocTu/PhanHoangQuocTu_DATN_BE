import { Module } from '@nestjs/common';
import { MessageService } from './messages.service';
import { MessagesController } from './messages.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MessageEntity } from 'src/entities/message.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([MessageEntity]),
  ],
  controllers: [MessagesController],
  providers: [MessageService],
  exports: [MessageService]
})
export class MessagesModule { }
