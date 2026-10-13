import {
  Inject,
  Injectable,
  type OnModuleInit,
  type OnModuleDestroy,
} from "@nestjs/common";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../generated/prisma/client.js";
import { ENVIRONMENT, type Environment } from "../config/env.validation.js";
import { UserStore, type StoredUser } from "./user-store.js";

@Injectable()
export class PrismaUserStore
  extends UserStore
  implements OnModuleInit, OnModuleDestroy
{
  private readonly prisma: PrismaClient;
  constructor(@Inject(ENVIRONMENT) config: Environment) {
    super();
    this.prisma = new PrismaClient({
      adapter: new PrismaPg({ connectionString: config.DATABASE_URL }),
    });
  }
  async onModuleInit() {
    await this.prisma.$connect();
  }
  async onModuleDestroy() {
    await this.prisma.$disconnect();
  }
  findByEmail(email: string) {
    return this.prisma.user.findUnique({ where: { email } });
  }
  findById(id: number) {
    return this.prisma.user.findUnique({ where: { id } });
  }
  create(data: Pick<StoredUser, "email" | "password" | "role">) {
    return this.prisma.user.create({ data });
  }
  setActive(id: number, isActive: boolean) {
    return this.prisma.user.update({
      where: { id },
      data: { isActive, tokenVersion: { increment: 1 } },
    });
  }
  async revokeSessions(id: number) {
    await this.prisma.user.update({
      where: { id },
      data: { tokenVersion: { increment: 1 } },
    });
  }
}
