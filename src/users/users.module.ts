import { Module } from "@nestjs/common";
import { UsersController } from "./users.controller.js";
import { UsersService } from "./users.service.js";
import { UserStore } from "../database/user-store.js";
import { PrismaUserStore } from "../database/prisma-user.store.js";

@Module({
  controllers: [UsersController],
  providers: [UsersService, { provide: UserStore, useClass: PrismaUserStore }],
  exports: [UsersService, UserStore],
})
export class UsersModule {}
