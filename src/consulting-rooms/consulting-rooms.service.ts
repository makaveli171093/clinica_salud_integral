import {
  ConflictException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { PrismaService } from "../database/prisma.service.js";
import type { CreateConsultingRoomDto } from "./dto/create-consulting-room.dto.js";
import type { SetRoomPreparationDto } from "./dto/set-room-preparation.dto.js";

@Injectable()
export class ConsultingRoomsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateConsultingRoomDto) {
    const branch = await this.prisma.branch.findFirst({
      where: {
        id: dto.branchId,
        isActive: true,
      },
      select: {
        id: true,
      },
    });

    if (!branch) {
      throw new NotFoundException("La sede no existe o se encuentra inactiva");
    }

    try {
      return await this.prisma.consultingRoom.create({
        data: {
          branchId: branch.id,
          name: dto.name,
          preparationMinutes: dto.preparationMinutes,
        },
        select: {
          id: true,
          branchId: true,
          name: true,
          isActive: true,
        },
      });
    } catch (error) {
      if (error && typeof error === "object" && "code" in error) {
        if (error.code === "P2002") {
          throw new ConflictException(
            "Ya existe un consultorio con ese nombre en esta sede",
          );
        }

        if (error.code === "P2003") {
          throw new NotFoundException("La sede asociada ya no está disponible");
        }
      }

      throw error;
    }
  }

  async findAllActive() {
    return this.prisma.consultingRoom.findMany({
      where: {
        isActive: true,
        branch: {
          isActive: true,
        },
      },
      select: {
        id: true,
        branchId: true,
        name: true,
        isActive: true,
      },
      orderBy: [{ branchId: "asc" }, { name: "asc" }],
    });
  }

  async findById(id: number) {
    const consultingRoom = await this.prisma.consultingRoom.findFirst({
      where: {
        id,
        isActive: true,
        branch: {
          isActive: true,
        },
      },
      select: {
        id: true,
        branchId: true,
        name: true,
        isActive: true,
      },
    });

    if (!consultingRoom) {
      throw new NotFoundException(
        "El consultorio no existe o no está disponible",
      );
    }

    return consultingRoom;
  }

  async setPreparation(id: number, dto: SetRoomPreparationDto) {
    try {
      return await this.prisma.consultingRoom.update({
        where: {
          id,
          isActive: true,
          branch: {
            isActive: true,
          },
        },
        data: {
          preparationMinutes: dto.preparationMinutes,
        },
        select: {
          id: true,
          branchId: true,
          name: true,
          isActive: true,
          preparationMinutes: true,
        },
      });
    } catch (error) {
      if (
        error &&
        typeof error === "object" &&
        "code" in error &&
        error.code === "P2025"
      ) {
        throw new NotFoundException(
          "El consultorio no existe o no está disponible",
        );
      }

      throw error;
    }
  }
}
