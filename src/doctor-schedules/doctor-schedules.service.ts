import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { PrismaService } from "../database/prisma.service.js";
import type { CreateDoctorScheduleDto } from "./dto/create-doctor-schedule.dto.js";
import type { Prisma } from "../generated/prisma/client.js";
import type { QueryDoctorSchedulesDto } from "./dto/query-doctor-schedules.dto.js";

function toMinutes(time: string): number {
  if (!/^([01]\d|2[0-3]):[0-5]\d$/.test(time)) {
    throw new BadRequestException("Hora inválida: utilice HH:mm");
  }

  const hours = Number(time.slice(0, 2));
  const minutes = Number(time.slice(3, 5));

  return hours * 60 + minutes;
}

@Injectable()
export class DoctorSchedulesService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateDoctorScheduleDto) {
    const start = toMinutes(dto.startTime);
    const end = toMinutes(dto.endTime);

    if (start >= end) {
      throw new BadRequestException(
        "La hora de inicio debe ser anterior a la hora de fin",
      );
    }

    for (let attempt = 0; attempt < 3; attempt++) {
      try {
        return await this.createOnce(dto, end - start);
      } catch (error) {
        if (error && typeof error === "object" && "code" in error) {
          if (error.code === "P2034") {
            if (attempt < 2) continue;

            throw new ConflictException(
              "La agenda cambió simultáneamente. Intente nuevamente",
            );
          }

          if (error.code === "P2002") {
            throw new ConflictException(
              "Ya existe un horario con ese inicio para el médico y día",
            );
          }

          if (error.code === "P2003") {
            throw new NotFoundException(
              "El médico o el consultorio asociado ya no existe",
            );
          }
        }

        throw error;
      }
    }

    throw new ConflictException("No se pudo registrar el horario");
  }

  async findAllActive(query: QueryDoctorSchedulesDto) {
    const where: Prisma.DoctorScheduleWhereInput = {
      isActive: true,

      doctor: {
        isActive: true,
        specialty: {
          isActive: true,
        },
      },

      consultingRoom: {
        isActive: true,
        branch: {
          isActive: true,
        },
      },

      ...(query.doctorId !== undefined ? { doctorId: query.doctorId } : {}),

      ...(query.consultingRoomId !== undefined
        ? { consultingRoomId: query.consultingRoomId }
        : {}),

      ...(query.dayOfWeek !== undefined ? { dayOfWeek: query.dayOfWeek } : {}),
    };

    const skip = (query.page - 1) * query.limit;

    const [data, total] = await this.prisma.$transaction(
      [
        this.prisma.doctorSchedule.findMany({
          where,
          select: {
            id: true,
            doctorId: true,
            consultingRoomId: true,
            dayOfWeek: true,
            startTime: true,
            endTime: true,
            isActive: true,
          },
          orderBy: [
            { doctorId: "asc" },
            { dayOfWeek: "asc" },
            { startTime: "asc" },
            { id: "asc" },
          ],
          skip,
          take: query.limit,
        }),

        this.prisma.doctorSchedule.count({
          where,
        }),
      ],
      {
        isolationLevel: "RepeatableRead",
      },
    );

    return {
      data,
      total,
      page: query.page,
      limit: query.limit,
      totalPages: Math.ceil(total / query.limit),
    };
  }

  private async createOnce(dto: CreateDoctorScheduleDto, blockMinutes: number) {
    return this.prisma.$transaction(
      async (tx) => {
        const doctor = await tx.doctor.findFirst({
          where: {
            id: dto.doctorId,
            isActive: true,
            specialty: { isActive: true },
          },
          select: {
            id: true,
            specialty: {
              select: { durationMinutes: true },
            },
          },
        });

        if (!doctor) {
          throw new NotFoundException(
            "El médico o su especialidad no están disponibles",
          );
        }

        const room = await tx.consultingRoom.findFirst({
          where: {
            id: dto.consultingRoomId,
            isActive: true,
            branch: { isActive: true },
          },
          select: {
            id: true,
            preparationMinutes: true,
          },
        });

        if (!room) {
          throw new NotFoundException(
            "El consultorio o su sede no están disponibles",
          );
        }

        if (room.preparationMinutes === null) {
          throw new BadRequestException(
            "Configure el tiempo de preparación del consultorio",
          );
        }

        const consultationMinutes = doctor.specialty.durationMinutes;

        if (consultationMinutes <= 0) {
          throw new BadRequestException(
            "La especialidad tiene una duración de consulta inválida",
          );
        }

        const minimumMinutes = consultationMinutes + room.preparationMinutes;

        if (blockMinutes < minimumMinutes) {
          throw new BadRequestException(
            `El horario requiere al menos ${minimumMinutes} minutos`,
          );
        }

        const overlap = await tx.doctorSchedule.findFirst({
          where: {
            dayOfWeek: dto.dayOfWeek,
            isActive: true,
            OR: [
              { doctorId: dto.doctorId },
              { consultingRoomId: dto.consultingRoomId },
            ],
            startTime: { lt: dto.endTime },
            endTime: { gt: dto.startTime },
          },
          select: {
            id: true,
            doctorId: true,
          },
        });

        if (overlap) {
          throw new ConflictException(
            overlap.doctorId === dto.doctorId
              ? "El médico ya tiene un horario que se solapa"
              : "El consultorio ya está ocupado en ese intervalo",
          );
        }

        return tx.doctorSchedule.create({
          data: {
            doctorId: doctor.id,
            consultingRoomId: room.id,
            dayOfWeek: dto.dayOfWeek,
            startTime: dto.startTime,
            endTime: dto.endTime,
          },
          select: {
            id: true,
            doctorId: true,
            consultingRoomId: true,
            dayOfWeek: true,
            startTime: true,
            endTime: true,
            isActive: true,
          },
        });
      },
      {
        isolationLevel: "Serializable",
      },
    );
  }
}
