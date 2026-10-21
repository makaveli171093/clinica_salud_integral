import { Body, Controller, Post, Get, Query } from "@nestjs/common";
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiConflictResponse,
  ApiCreatedResponse,
  ApiNotFoundResponse,
  ApiTags,
  ApiOkResponse,
} from "@nestjs/swagger";
import { Roles } from "../auth/access.js";
import { DoctorSchedulesService } from "./doctor-schedules.service.js";
import { CreateDoctorScheduleDto } from "./dto/create-doctor-schedule.dto.js";
import { DoctorScheduleResponseDto } from "./dto/doctor-schedule-response.dto.js";
import { QueryDoctorSchedulesDto } from "./dto/query-doctor-schedules.dto.js";
import { PaginatedDoctorSchedulesResponseDto } from "./dto/paginated-doctor-schedules-response.dto.js";

@ApiTags("Horarios médicos")
@ApiBearerAuth()
@Controller("doctor-schedules")
export class DoctorSchedulesController {
  constructor(private readonly schedules: DoctorSchedulesService) {}

  @Get()
  @ApiOkResponse({
    description: "Horarios activos con filtros y paginación",
    type: PaginatedDoctorSchedulesResponseDto,
  })
  @ApiBadRequestResponse({
    description: "Filtros o parámetros de paginación inválidos",
  })
  findAll(@Query() query: QueryDoctorSchedulesDto) {
    return this.schedules.findAllActive(query);
  }

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
