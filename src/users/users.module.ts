import { forwardRef, Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { APP_GUARD } from '@nestjs/core';
import { UsersController } from './users.controller';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { userProviders } from './user.provider';
import { DatabaseModule } from 'src/database/database.module';
import { JwtStrategy } from 'src/auth/jwt.strategy';
import { AuthModule } from 'src/auth/auth.module';

@Module({
  providers: [
    UsersService,
    ...userProviders
  ],
  imports: [DatabaseModule, forwardRef(() => AuthModule)],
  exports: [UsersService, ...userProviders],
  controllers: [UsersController]
})
export class UsersModule { }