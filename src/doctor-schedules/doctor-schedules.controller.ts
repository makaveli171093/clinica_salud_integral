import { Body, Controller, Post } from "@nestjs/common";
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiConflictResponse,
  ApiCreatedResponse,
  ApiNotFoundResponse,
  ApiTags,
} from "@nestjs/swagger";
import { Roles } from "../auth/access.js";
import { DoctorSchedulesService } from "./doctor-schedules.service.js";
import { CreateDoctorScheduleDto } from "./dto/create-doctor-schedule.dto.js";
import { DoctorScheduleResponseDto } from "./dto/doctor-schedule-response.dto.js";

@ApiTags("Horarios médicos")
@ApiBearerAuth()
@Controller("doctor-schedules")
export class DoctorSchedulesController {
  constructor(private readonly schedules: DoctorSchedulesService) {}

  @Post()
  @Roles("ADMINISTRADOR", "GERENCIA")
  @ApiCreatedResponse({ type: DoctorScheduleResponseDto })
  @ApiBadRequestResponse({
    description: "Datos inválidos o configuración insuficiente",
  })
  @ApiNotFoundResponse({
    description: "Médico, especialidad, consultorio o sede no disponibles",
  })
  @ApiConflictResponse({
    description: "Solapamiento o conflicto al registrar el horario",
  })
  create(@Body() dto: CreateDoctorScheduleDto) {
    return this.schedules.create(dto);
  }
}
