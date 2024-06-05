/* eslint-disable @typescript-eslint/no-unused-vars */
// chat.gateway.ts
import { WebSocketGateway, SubscribeMessage, MessageBody, WebSocketServer, ConnectedSocket } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { MessageService } from 'src/modules/messages/messages.service';

@WebSocketGateway({ namespace: '/chat', cors: true })
export class ChatGateway {
  constructor(private readonly messageService: MessageService) { }

  @WebSocketServer()
  server: Server;

  @SubscribeMessage('joinChat')
  async handleJoinChat(@ConnectedSocket() client: Socket, @MessageBody() data: { userId: string }): Promise<void> {
    const commonRoom = 'CommonRoom';
    client.join(commonRoom);

    const messages = await this.messageService.getAllMessages();
    client.emit('previousMessages', messages);
  }

  @SubscribeMessage('sendMessage')
  async handleMessage(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { senderId: number; text: string; senderName: string }
  ): Promise<void> {
    // Save message with senderId, text, and senderName
    const message = await this.messageService.saveMessage(data.text, data.senderId, data.senderName);

    // Emit the saved message back to all clients in the room
    this.server.to('CommonRoom').emit('receiveMessage', message);
  }
}