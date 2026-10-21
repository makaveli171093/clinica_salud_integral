import { Body, Controller, Get, Param, Post } from "@nestjs/common";
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiConflictResponse,
  ApiCreatedResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiTags,
} from "@nestjs/swagger";
import { Roles } from "../auth/access.js";
import { PositiveIdPipe } from "../common/positive-id.pipe.js";
import { CreatePatientDto } from "./dto/create-patient.dto.js";
import { PatientResponseDto } from "./dto/patient-response.dto.js";
import { PatientsService } from "./patients.service.js";

@ApiTags("Pacientes")
@ApiBearerAuth()
@Controller("patients")
export class PatientsController {
  constructor(private readonly patients: PatientsService) {}

  @Post()
  @Roles("ADMINISTRADOR", "GERENCIA", "RECEPCIONISTA")
  @ApiCreatedResponse({ type: PatientResponseDto })
  @ApiBadRequestResponse({
    description: "Datos inválidos o fecha de nacimiento futura",
  })
  @ApiConflictResponse({
    description: "Ya existe un paciente con ese correo",
  })
  create(@Body() dto: CreatePatientDto) {
    return this.patients.create(dto);
  }

  @Get(":id")
  @Roles("ADMINISTRADOR", "GERENCIA", "RECEPCIONISTA", "MEDICO")
  @ApiOkResponse({ type: PatientResponseDto })
  @ApiBadRequestResponse({
    description: "El identificador debe ser un entero positivo válido",
  })
  @ApiNotFoundResponse({
    description: "Paciente no encontrado o inactivo",
  })
  findById(@Param("id", PositiveIdPipe) id: number) {
    return this.patients.findById(id);
  }
}
