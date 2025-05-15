import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { MessagesGateway } from './gateways/messages/messages.gateway';
import { CommentsModule } from './comments/comments.module';
import { OpinionsModule } from './opinions/opinions.module';
import { RosterModule } from './roster/roster.module';

@Module({
  imports: [AuthModule, UsersModule, CommentsModule, OpinionsModule, RosterModule],
  controllers: [AppController],
  providers: [AppService, MessagesGateway],
})
export class AppModule {}
