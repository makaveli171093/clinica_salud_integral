import { Injectable } from "@nestjs/common";
import { PrismaService } from "../database/prisma.service.js";

@Injectable()
export class SpecialtiesService {
  constructor(private readonly prisma: PrismaService) {}

  async findAllActive() {
    return this.prisma.specialty.findMany({
      where: { isActive: true },
      orderBy: { name: "asc" },
      select: {
        id: true,
        name: true,
        durationMinutes: true,
        requiresReferral: true,
        allowedGender: true,
        minAge: true,
        maxAge: true,
        isActive: true,
      },
    });
  }

  async findById(id: number) {
    return this.prisma.specialty.findUnique({
      where: { id },
    });
  }
}
