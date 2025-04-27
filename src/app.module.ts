import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { MessagesGateway } from './gateways/messages/messages.gateway';
import { JwtStrategy } from './auth/jwt.strategy';
import { OpinionsController } from './opinions/opinions.controller';
import { CommentsController } from './comments/comments.controller';

@Module({
  imports: [AuthModule, UsersModule],
  controllers: [AppController, OpinionsController, CommentsController],
  providers: [AppService, MessagesGateway],
})
export class AppModule {}
