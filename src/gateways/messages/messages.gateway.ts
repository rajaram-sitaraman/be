import { OnGatewayDisconnect, SubscribeMessage, WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Socket } from 'socket.io';
import { Server } from "net";

@WebSocketGateway({ cors: '*:*' })
export class MessagesGateway implements OnGatewayDisconnect {

  nicknames: Map<string, string> = new Map();

  @WebSocketServer()
  server: Server;

  handleDisconnect(client: Socket) {
    this.server.emit('users-changed', { user: this.nicknames[client.id], event: 'left' });
    this.nicknames.delete(client.id);
  }

  @SubscribeMessage('set-nickname')
  setNickname(client: Socket, nickname: string) {
    this.nicknames[client.id] = nickname;
    this.server.emit('users-changed', { user: nickname, event: 'joined' });
  }

  @SubscribeMessage('add-message')
  addMessage(client: Socket, message) {
    this.server.emit('message', { text: message.text, from: this.nicknames[client.id], created: new Date() });
  }
}