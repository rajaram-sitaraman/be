import { Injectable, NestMiddleware, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Socket } from 'socket.io';

@Injectable()
export class WebSocketAuthMiddleware implements NestMiddleware {
  constructor(private readonly jwtService: JwtService) {}

  use(socket: Socket, next: (err?: Error) => void) {
    try {
      // Extract the token from the handshake query or headers
      const token = socket.handshake.auth?.token || socket.handshake.headers['authorization']?.split(' ')[1];

      if (!token) {
        throw new UnauthorizedException('Token not provided');
      }

      // Verify the token
      const payload = this.jwtService.verify(token);

      // Attach the user information to the socket object
      socket.data.user = payload;

      next(); // Allow the connection
    } catch (err) {
      console.error('WebSocket Authentication Error:', err.message);
      next(new UnauthorizedException('Invalid or expired token'));
    }
  }
}