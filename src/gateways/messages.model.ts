import { Socket } from 'socket.io';
import { User } from 'src/users/user.entity';

export interface CustomSocket extends Socket { 
  userId: string;
}