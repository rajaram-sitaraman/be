import { MessageBody, OnGatewayDisconnect, SubscribeMessage, WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Socket } from 'socket.io';
import { Server } from "socket.io";
import { CustomSocket } from '../messages.model';
import { User } from 'src/users/user.entity';
import { Comments } from 'src/comments/comment.entity';
import { Repository } from 'typeorm/repository/Repository';
import { Inject } from '@nestjs/common/decorators/core/inject.decorator';
import { WebSocketAuthMiddleware } from './socket-auth.middleware';
import { JwtService } from '@nestjs/jwt';
import { Opinion } from 'src/opinions/opinion.entity';
import { Roster } from 'src/roster/roster.entity';

@WebSocketGateway({ cors: '*:*' })
export class MessagesGateway implements OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  constructor(
    @Inject('COMMENTS_REPOSITORY') private readonly commentsRepository: Repository<Comments>,
    @Inject('USER_REPOSITORY') private readonly userRepository: Repository<User>,
    @Inject('OPINION_REPOSITORY') private readonly opinionRepository: Repository<Opinion>,
    @Inject('ROSTER_REPOSITORY') private readonly rosterRepository: Repository<Roster>,
    private readonly jwtService: JwtService,
  ) { }

  // Map to store nicknames associated with socket IDs
  nicknames: Map<string, string> = new Map();
  users: Map<string, User> = new Map();
  onlineUsers: Map<string, Set<string>> = new Map(); // Map of roomId to a Set of nicknames

  afterInit(server: Server) {
    // Attach the WebSocketAuthMiddleware
    server.use((socket, next) => {
      const authMiddleware = new WebSocketAuthMiddleware(this.jwtService);
      authMiddleware.use(socket, next);
    });
  }

  @SubscribeMessage('set-nickname')
  setNickname(client: Socket, nickname: string) {
    // Remove old socket ID if the nickname already exists
    for (const [id, name] of this.nicknames.entries()) {
      if (name === nickname) {
        this.nicknames.delete(id);
      }
    }

    this.userRepository.findOne({ where: { id: client.data.user.sub } }).then(user => {
      if (!user) {
        console.error(`User not found for ID: ${client.data.user.sub}`);
        return;
      }

      this.users.set(client.id, user);
    });

    // Set the new socket ID for the nickname
    this.nicknames.set(client.id, nickname);
    console.log(`Nickname set: ${nickname} for socket ID: ${client.id}`);
    this.server.emit('users-changed', { user: nickname, event: 'joined' });
  }

  handleConnection(client: CustomSocket) {
    const nickname = this.nicknames.get(client.id);
    if (!nickname) {
      console.log(`Client connected: ${client.id}, but no nickname is set yet.`);
    } else {
      console.log(`Client connected: ${client.id}, Nickname: ${nickname}`);
    }
  }

  async handleDisconnect(client: CustomSocket) {
    const nickname = this.nicknames.get(client.id);
    if (nickname) {
      // Remove the user from all rooms they were part of
      for (const [roomId, users] of this.onlineUsers.entries()) {
        if (users.has(nickname)) {
          users.delete(nickname);

          // If the room is empty, remove it from the map
          if (users.size === 0) {
            this.onlineUsers.delete(roomId);
          }

          // Notify others in the room
          this.server.to(roomId).emit('users-changed', { user: nickname, event: 'left' });
          this.server.emit('online-users', { roomId, users: Array.from(users) });
        }
      }

      this.nicknames.delete(client.id);
    }
  }

  @SubscribeMessage('typing')
  async handleTyping(client: CustomSocket, data: { roomId: string; nickname: string }) {
    const { roomId, nickname } = data;
    console.log(`Broadcasting typing event to room: ${roomId} by ${nickname}`);
    // Broadcast to other users in the room that this user is typing
    client.broadcast.to(roomId.toString()).emit('user-typing', { nickname });
  }

  @SubscribeMessage('stop-typing')
  async handleStopTyping(client: CustomSocket, roomId: string) {
    // Broadcast to other users in the room that this user has stopped typing
    client.broadcast.to(roomId.toString()).emit('user-stopped-typing');
  }

  @SubscribeMessage('enter-chat-room')
  async enterChatRoom(client: CustomSocket, roomId: string) {
    const nickname = this.nicknames.get(client.id);

    // Check if the user is already in another room
    const currentRoom = client.data.currentRoom;
    if (currentRoom && currentRoom !== roomId) {
      console.log(`User ${nickname} is leaving room: ${currentRoom}`);
      client.leave(currentRoom);

      // Remove the user from the online users map for the previous room
      if (this.onlineUsers.has(currentRoom)) {
        if (nickname) {
          if (nickname) {
            this.onlineUsers.get(currentRoom)?.delete(nickname);
          }
        }

        // If the room is empty, remove it from the map
        if (this.onlineUsers.get(currentRoom)?.size === 0) {
          this.onlineUsers.delete(currentRoom);
        }

        // Notify others in the previous room
        this.server.to(currentRoom).emit('users-changed', { user: nickname, event: 'left' });
        this.server.emit('online-users', { roomId: currentRoom, users: Array.from(this.onlineUsers.get(currentRoom) || []) });
      }
    }

    console.log(`User ${nickname} is joining room: ${roomId}`);
    client.join(roomId);

    // Add the user to the online users map for the new room
    if (!this.onlineUsers.has(roomId)) {
      this.onlineUsers.set(roomId, new Set());
    }
    if (nickname) {
      this.onlineUsers.get(roomId)?.add(nickname);
    }

    // Update the user's current room
    client.data.currentRoom = roomId;

    console.log(`Online users in room ${roomId}:`, Array.from(this.onlineUsers.get(roomId) || []));

    // Notify others in the new room
    this.server.to(roomId).emit('users-changed', { user: nickname, event: 'joined' });
    this.server.emit('online-users', { roomId, users: Array.from(this.onlineUsers.get(roomId) || []) });
  }

  @SubscribeMessage('leave-chat-room')
  async leaveChatRoom(client: CustomSocket, roomId: string) {
    const nickname = this.nicknames.get(client.id);
    console.log(`User ${nickname} is leaving room: ${roomId}`);
    client.leave(roomId);

    if (nickname) {
      this.onlineUsers.get(roomId)?.delete(nickname);
    }
    if (this.onlineUsers.has(roomId) && nickname) {
      this.onlineUsers.get(roomId)?.delete(nickname);

      // If the room is empty, remove it from the map
      if (this.onlineUsers.get(roomId)?.size === 0) {
        this.onlineUsers.delete(roomId);
      }
    }

    // Clear the user's current room
    if (client.data.currentRoom === roomId) {
      client.data.currentRoom = null;
    }

    console.log(`Online users in room ${roomId}:`, Array.from(this.onlineUsers.get(roomId) || []));

    // Notify others in the room
    this.server.to(roomId).emit('users-changed', { user: nickname, event: 'left' });
    this.server.emit('online-users', { roomId, users: Array.from(this.onlineUsers.get(roomId) || []) });

  }

  @SubscribeMessage('add-message')
  async addMessage(client: CustomSocket, message: { opinion_id: string; text: string }) {
    const nickname = this.nicknames.get(client.id);
    const user = this.users.get(client.id);

    if (!user) {
      throw new Error(`User not found for client ID: ${client.id}`);
    }

    user.name = nickname || 'Anonymous';

    const comment = new Comments();
    comment.text = message.text;
    comment.owner = user;
    comment.created = new Date();

    // Find the opinion (opinion_id) and associate it with the comment
    const opinion = await this.opinionRepository.findOne({ where: { id: Number(message.opinion_id) } });
    if (!opinion) {
      throw new Error(`Opinion not found for ID: ${message.opinion_id}`);
    }

    comment.opinion = opinion;

    // Save the comment
    await this.commentsRepository.save(comment);

    console.log(`Message sent to room ${message.opinion_id}:`, comment);

    // Emit the message to the correct room
    this.server.in(message.opinion_id.toString()).emit('comments', comment);
  }

  @SubscribeMessage('private-message')
  async privateMessage(client: CustomSocket, message: { roster_id: string; text: string }) {
    const nickname = this.nicknames.get(client.id);
    const user = this.users.get(client.id);

    if (!user) {
      throw new Error(`User not found for client ID: ${client.id}`);
    }

    user.name = nickname || 'Anonymous';

    const comment = new Comments();
    comment.text = message.text;
    comment.owner = user;
    comment.created = new Date();

    // Find the opinion (opinion_id) and associate it with the comment
    const roster = await this.rosterRepository.findOne({ where: { id: Number(message.roster_id.split('p')[1]) } });
    if (!roster) {
      throw new Error(`Opinion not found for ID: ${message.roster_id}`);
    }

    comment.roster = roster; // Ensure the roster property is correctly assigned

    // Save the comment
    await this.commentsRepository.save(comment);

    console.log(`Message sent to room ${message.roster_id}:`, comment);

    // Emit the message to the correct room
    this.server.in(message.roster_id.toString()).emit('comments', comment);
  }

  @SubscribeMessage('audio-message')
  handleAudioMessage(@MessageBody() data: { sender: string; roomId: string; audio: string }) {
    // Broadcast the audio message to the room
    this.server.to(data.roomId).emit('audio-message', {
      sender: data.sender,
      audio: data.audio
    });
  }
}