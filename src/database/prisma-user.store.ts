import { Injectable } from "@nestjs/common";
import { PrismaService } from "./prisma.service.js";
import { UserStore, type StoredUser } from "./user-store.js";

@Injectable()
export class PrismaUserStore extends UserStore {
  constructor(private readonly prisma: PrismaService) {
    super();
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
