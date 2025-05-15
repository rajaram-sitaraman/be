import { DatabaseModule } from "src/database/database.module";
import { OpinionsController } from "./opinions.controller";
import { opinionsProviders } from "./opinions.provider";
import { forwardRef, Module } from "@nestjs/common";
import { AuthModule } from "src/auth/auth.module";

@Module({
  imports: [DatabaseModule, forwardRef(() => AuthModule)],
  controllers: [OpinionsController],
  providers: [...opinionsProviders],
  exports: [...opinionsProviders],
})
export class OpinionsModule { }