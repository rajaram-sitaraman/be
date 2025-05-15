import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LocalStrategy } from './local.strategy';
import { JwtStrategy } from './jwt.strategy';
import { UsersModule } from '../users/users.module';
import { PassportModule } from '@nestjs/passport';
import { jwtConstants } from './constants';
import { AuthController } from './auth.controller';
import { LocalAuthGuard } from './local-auth.guards';
import { JwtModule } from '@nestjs/jwt';
import { WebSocketAuthMiddleware } from 'src/gateways/messages/socket-auth.middleware';

@Module({
  imports: [
    UsersModule,
    PassportModule,
    JwtModule.register({
      secret: jwtConstants.secret,
      signOptions: { expiresIn: '3600s' },
    }),
  ],
  providers: [AuthService, LocalStrategy, JwtStrategy, LocalAuthGuard, WebSocketAuthMiddleware],
  exports: [AuthService, JwtModule],
  controllers: [AuthController]
})
export class AuthModule {}