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
import { DayOfWeek } from "../generated/prisma/enums.js";
import type { QueryAvailabilityDto } from "./dto/query-availability.dto.js";

function toMinutes(time: string): number {
  if (!/^([01]\d|2[0-3]):[0-5]\d$/.test(time)) {
    throw new BadRequestException("Hora inválida: utilice HH:mm");
  }

  const hours = Number(time.slice(0, 2));
  const minutes = Number(time.slice(3, 5));

  return hours * 60 + minutes;
}

type ScheduleSlot = {
  startTime: string;
  endTime: string;
  preparationEndTime: string;
};

function toTime(totalMinutes: number): string {
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;

  return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`;
}

function buildScheduleSlots(
  startTime: string,
  endTime: string,
  consultationMinutes: number,
  preparationMinutes: number,
): ScheduleSlot[] {
  if (
    !Number.isInteger(consultationMinutes) ||
    consultationMinutes <= 0 ||
    !Number.isInteger(preparationMinutes) ||
    preparationMinutes < 0
  ) {
    throw new BadRequestException(
      "La duración de consulta o preparación es inválida",
    );
  }

  const start = toMinutes(startTime);
  const end = toMinutes(endTime);

  if (start >= end) {
    throw new BadRequestException(
      "La hora de inicio debe ser anterior a la hora de fin",
    );
  }

  const step = consultationMinutes + preparationMinutes;
  const slots: ScheduleSlot[] = [];

  for (let current = start; current + step <= end; current += step) {
    slots.push({
      startTime: toTime(current),
      endTime: toTime(current + consultationMinutes),
      preparationEndTime: toTime(current + step),
    });
  }

  return slots;
}

function getDayOfWeek(date: string): DayOfWeek {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    throw new BadRequestException("Utilice una fecha en formato YYYY-MM-DD");
  }

  const parsed = new Date(`${date}T00:00:00.000Z`);

  if (
    Number.isNaN(parsed.getTime()) ||
    parsed.toISOString().slice(0, 10) !== date
  ) {
    throw new BadRequestException("Fecha inválida");
  }

  const days: DayOfWeek[] = [
    DayOfWeek.DOMINGO,
    DayOfWeek.LUNES,
    DayOfWeek.MARTES,
    DayOfWeek.MIERCOLES,
    DayOfWeek.JUEVES,
    DayOfWeek.VIERNES,
    DayOfWeek.SABADO,
  ];

  const day = days[parsed.getUTCDay()];

  if (day === undefined) {
    throw new BadRequestException("No se pudo determinar el día");
  }

  return day;
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

  async findPotentialSlots(query: QueryAvailabilityDto) {
    const dayOfWeek = getDayOfWeek(query.date);

    const doctor = await this.prisma.doctor.findFirst({
      where: {
        id: query.doctorId,
        isActive: true,
        specialty: {
          isActive: true,
        },
      },
      select: {
        id: true,
        specialty: {
          select: {
            durationMinutes: true,
          },
        },
        schedules: {
          where: {
            isActive: true,
            dayOfWeek,
            consultingRoom: {
              isActive: true,
              branch: {
                isActive: true,
              },
            },
          },
          select: {
            id: true,
            startTime: true,
            endTime: true,
            consultingRoom: {
              select: {
                id: true,
                preparationMinutes: true,
              },
            },
          },
          orderBy: {
            startTime: "asc",
          },
        },
      },
    });

    if (!doctor) {
      throw new NotFoundException(
        "El médico o su especialidad no están disponibles",
      );
    }

    const schedules = doctor.schedules.map((schedule) => {
      const preparationMinutes = schedule.consultingRoom.preparationMinutes;

      if (preparationMinutes === null) {
        throw new BadRequestException(
          "Configure el tiempo de preparación del consultorio",
        );
      }

      return {
        scheduleId: schedule.id,
        consultingRoomId: schedule.consultingRoom.id,
        slots: buildScheduleSlots(
          schedule.startTime,
          schedule.endTime,
          doctor.specialty.durationMinutes,
          preparationMinutes,
        ),
      };
    });

    return {
      doctorId: doctor.id,
      date: query.date,
      dayOfWeek,
      schedules,
    };
  }

  async findAvailableSlots(query: QueryAvailabilityDto) {
    const potential = await this.findPotentialSlots(query);

    // Interpretamos las horas como horas locales de Bolivia.
    const toInstant = (time: string): Date =>
      new Date(`${query.date}T${time}:00-04:00`);

    const schedules = [];

    for (const schedule of potential.schedules) {
      const firstSlot = schedule.slots[0];
      const lastSlot = schedule.slots[schedule.slots.length - 1];

      if (!firstSlot || !lastSlot) {
        schedules.push({
          ...schedule,
          slots: [],
        });
        continue;
      }

      const preparationMilliseconds =
        toInstant(firstSlot.preparationEndTime).getTime() -
        toInstant(firstSlot.endTime).getTime();

      const rangeStart = toInstant(firstSlot.startTime);
      const rangeEnd = toInstant(lastSlot.preparationEndTime);

      const appointments = await this.prisma.appointment.findMany({
        where: {
          isActive: true,
          status: {
            not: "CANCELADA",
          },
          startTime: {
            lt: rangeEnd,
          },
          OR: [
            {
              doctorId: query.doctorId,
              endTime: {
                gt: rangeStart,
              },
            },
            {
              consultingRoomId: schedule.consultingRoomId,
              endTime: {
                gt: new Date(rangeStart.getTime() - preparationMilliseconds),
              },
            },
          ],
        },
        select: {
          doctorId: true,
          consultingRoomId: true,
          startTime: true,
          endTime: true,
        },
      });

      const availableSlots = schedule.slots.filter((slot) => {
        const start = toInstant(slot.startTime).getTime();
        const end = toInstant(slot.endTime).getTime();
        const preparationEnd = toInstant(slot.preparationEndTime).getTime();

        const hasConflict = appointments.some((appointment) => {
          const appointmentStart = appointment.startTime.getTime();
          const appointmentEnd = appointment.endTime.getTime();

          const doctorConflict =
            appointment.doctorId === query.doctorId &&
            appointmentStart < end &&
            appointmentEnd > start;

          const roomConflict =
            appointment.consultingRoomId === schedule.consultingRoomId &&
            appointmentStart < preparationEnd &&
            appointmentEnd + preparationMilliseconds > start;

          return doctorConflict || roomConflict;
        });

        return !hasConflict;
      });

      schedules.push({
        ...schedule,
        slots: availableSlots,
      });
    }

    return {
      ...potential,
      schedules,
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
