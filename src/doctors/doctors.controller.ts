import { Body, Controller, Get, Param, Post } from "@nestjs/common";
import {
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiTags,
} from "@nestjs/swagger";
import { Roles } from "../auth/access.js";
import { PositiveIdPipe } from "../common/positive-id.pipe.js";
import { DoctorsService } from "./doctors.service.js";
import { CreateDoctorDto } from "./dto/create-doctor.dto.js";
import { DoctorResponseDto } from "./dto/doctor-response.dto.js";

@ApiTags("Médicos")
@ApiBearerAuth()
@Controller("doctors")
export class DoctorsController {
  constructor(private readonly doctors: DoctorsService) {}

  @Post()
  @Roles("ADMINISTRADOR")
  @ApiCreatedResponse({ type: DoctorResponseDto })
  create(@Body() dto: CreateDoctorDto) {
    return this.doctors.create(dto);
  }

  @Get()
  @ApiOkResponse({ type: [DoctorResponseDto] })
  findAll() {
    return this.doctors.findAllActive();
  }

  @Get(":id")
  @ApiOkResponse({ type: DoctorResponseDto })
  findById(@Param("id", PositiveIdPipe) id: number) {
    return this.doctors.findById(id);
  }
}
