import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { MessageEntity } from "src/entities/message.entity";
import { Repository } from "typeorm";

@Injectable()
export class MessageService {
  constructor(
    @InjectRepository(MessageEntity)
    private readonly messageRepository: Repository<MessageEntity>,
  ) { }

  async saveMessage(text: string, senderId: number, senderName: string): Promise<any> {
    const message = this.messageRepository.create({
      text,
      sender: { id: senderId },
      senderName
    });

    await this.messageRepository.save(message);

    return message;
  }

  async getAllMessages(): Promise<any[]> {
    return this.messageRepository.find();
  }
}