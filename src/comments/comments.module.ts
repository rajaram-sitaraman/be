import { forwardRef, Module } from '@nestjs/common';
import { CommentsController } from './comments.controller';
import { commentsProviders } from './comments.provider';
import { DatabaseModule } from 'src/database/database.module';
import { AuthModule } from 'src/auth/auth.module';

@Module({
  imports: [DatabaseModule, forwardRef(() => AuthModule)],
  controllers: [CommentsController],
  providers: [...commentsProviders],
  exports: [...commentsProviders],
})
export class CommentsModule {}