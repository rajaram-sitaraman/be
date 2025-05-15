import { forwardRef, Module } from '@nestjs/common';
import { RosterController } from './roster.controller';
import { rostersProviders } from './roster.provider';
import { DatabaseModule } from 'src/database/database.module';
import { AuthModule } from 'src/auth/auth.module';
import { userProviders } from 'src/users/user.provider';

@Module({
  imports: [DatabaseModule, forwardRef(() => AuthModule)],
  controllers: [RosterController],
  providers: [...rostersProviders, ...userProviders],
  exports: [...rostersProviders]
})
export class RosterModule {}
