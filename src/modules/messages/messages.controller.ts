import { Controller } from '@nestjs/common';
import { MessageService } from './messages.service';

@Controller('messages')
export class MessagesController {
  constructor(private readonly messagesService: MessageService) { }

}
