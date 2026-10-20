import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { PrismaService } from "../database/prisma.service.js";
import type { CreateDoctorDto } from "./dto/create-doctor.dto.js";

const doctorSelect = {
  id: true,
  firstName: true,
  lastName: true,
  specialtyId: true,
  userId: true,
  isActive: true,
} as const;

@Injectable()
export class DoctorsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateDoctorDto) {
    const specialty = await this.prisma.specialty.findFirst({
      where: {
        id: dto.specialtyId,
        isActive: true,
      },
      select: {
        id: true,
      },
    });

    if (!specialty) {
      throw new NotFoundException(
        "La especialidad no existe o se encuentra inactiva",
      );
    }

    if (dto.userId !== undefined) {
      const user = await this.prisma.user.findUnique({
        where: {
          id: dto.userId,
        },
        select: {
          id: true,
          role: true,
          isActive: true,
          doctor: {
            select: {
              id: true,
            },
          },
        },
      });

      if (!user) {
        throw new NotFoundException("La cuenta de usuario no existe");
      }

      if (!user.isActive || user.role !== "MEDICO") {
        throw new BadRequestException(
          "La cuenta debe estar activa y tener el rol MEDICO",
        );
      }

      if (user.doctor) {
        throw new ConflictException(
          "La cuenta ya está vinculada a otro médico",
        );
      }
    }

    try {
      return await this.prisma.doctor.create({
        data: {
          firstName: dto.firstName,
          lastName: dto.lastName,
          specialtyId: specialty.id,
          ...(dto.userId !== undefined ? { userId: dto.userId } : {}),
        },
        select: doctorSelect,
      });
    } catch (error) {
      if (error && typeof error === "object" && "code" in error) {
        if (error.code === "P2002") {
          throw new ConflictException(
            "La cuenta ya está vinculada a otro médico",
          );
        }

        if (error.code === "P2003") {
          throw new NotFoundException(
            "La especialidad o la cuenta asociada ya no existe",
          );
        }
      }

      throw error;
    }
  }

  async findAllActive() {
    return this.prisma.doctor.findMany({
      where: {
        isActive: true,
        specialty: {
          isActive: true,
        },
      },
      select: doctorSelect,
      orderBy: [{ lastName: "asc" }, { firstName: "asc" }, { id: "asc" }],
    });
  }

  async findById(id: number) {
    const doctor = await this.prisma.doctor.findFirst({
      where: {
        id,
        isActive: true,
        specialty: {
          isActive: true,
        },
      },
      select: doctorSelect,
    });

    if (!doctor) {
      throw new NotFoundException("El médico no existe o no está disponible");
    }

    return doctor;
  }
}
