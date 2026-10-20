import {
  ConflictException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { PrismaService } from "../database/prisma.service.js";
import type { CreateBranchDto } from "./dto/branch.dto.js";

@Injectable()
export class BranchesService {
  constructor(private readonly prisma: PrismaService) {}

  async findAllActive() {
    return this.prisma.branch.findMany({
      where: { isActive: true },
      include: {
        consultingRooms: {
          where: { isActive: true },
          select: { id: true, name: true, isActive: true },
          orderBy: { name: "asc" },
        },
      },
      orderBy: { name: "asc" },
    });
  }

  async findById(id: number) {
    const branch = await this.prisma.branch.findFirst({
      where: { id, isActive: true },
      include: {
        consultingRooms: {
          where: { isActive: true },
          select: { id: true, name: true, isActive: true },
          orderBy: { name: "asc" },
        },
      },
    });

    if (!branch) {
      throw new NotFoundException("Sede no encontrada");
    }

    return branch;
  }

  async create(dto: CreateBranchDto) {
    try {
      return await this.prisma.branch.create({
        data: {
          name: dto.name,
          address: dto.address,
          ...(dto.phone !== undefined ? { phone: dto.phone } : {}),
        },
        include: {
          consultingRooms: {
            where: { isActive: true },
            select: { id: true, name: true, isActive: true },
            orderBy: { name: "asc" },
          },
        },
      });
    } catch (error) {
      if (
        error &&
        typeof error === "object" &&
        "code" in error &&
        error.code === "P2002"
      ) {
        throw new ConflictException("Ya existe una sede con ese nombre");
      }
      throw error;
    }
  }
}
