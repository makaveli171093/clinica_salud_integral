import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { PrismaService } from "../database/prisma.service.js";
import type { CreatePatientDto } from "./dto/create-patient.dto.js";

const patientSelect = {
  id: true,
  firstName: true,
  lastName: true,
  email: true,
  phone: true,
  gender: true,
  birthDate: true,
  isActive: true,
} as const;

function getClinicToday(): string {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: "America/La_Paz",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(new Date());

  const get = (type: string) => parts.find((part) => part.type === type)?.value;

  return `${get("year")}-${get("month")}-${get("day")}`;
}

@Injectable()
export class PatientsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreatePatientDto) {
    if (dto.birthDate > getClinicToday()) {
      throw new BadRequestException(
        "La fecha de nacimiento no puede ser futura",
      );
    }

    try {
      return await this.prisma.patient.create({
        data: {
          firstName: dto.firstName,
          lastName: dto.lastName,
          email: dto.email,
          phone: dto.phone,
          gender: dto.gender,
          birthDate: new Date(`${dto.birthDate}T00:00:00.000Z`),
          medicalRecord: {
            create: {},
          },
        },
        select: patientSelect,
      });
    } catch (error) {
      if (
        error &&
        typeof error === "object" &&
        "code" in error &&
        error.code === "P2002"
      ) {
        throw new ConflictException("Ya existe un paciente con ese correo");
      }

      throw error;
    }
  }

  async findById(id: number) {
    const patient = await this.prisma.patient.findFirst({
      where: {
        id,
        isActive: true,
      },
      select: patientSelect,
    });

    if (!patient) {
      throw new NotFoundException("Paciente no encontrado");
    }

    return patient;
  }
}
