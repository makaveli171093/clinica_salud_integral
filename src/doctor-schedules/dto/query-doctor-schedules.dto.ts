import { ApiPropertyOptional } from "@nestjs/swagger";
import { Type } from "class-transformer";
import { IsEnum, IsInt, IsOptional, Max, Min } from "class-validator";
import { DayOfWeek } from "../../generated/prisma/enums.js";

export class QueryDoctorSchedulesDto {
  @ApiPropertyOptional({
    example: 1,
    description: "Filtrar por médico",
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(2147483647)
  doctorId?: number;

  @ApiPropertyOptional({
    example: 1,
    description: "Filtrar por consultorio",
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(2147483647)
  consultingRoomId?: number;

  @ApiPropertyOptional({
    enum: DayOfWeek,
    example: DayOfWeek.LUNES,
    description: "Filtrar por día de la semana",
  })
  @IsOptional()
  @IsEnum(DayOfWeek)
  dayOfWeek?: DayOfWeek;

  @ApiPropertyOptional({
    default: 1,
    minimum: 1,
    maximum: 1000000,
    description: "Página solicitada",
  })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(1000000)
  page: number = 1;

  @ApiPropertyOptional({
    default: 20,
    minimum: 1,
    maximum: 100,
    description: "Cantidad de horarios por página",
  })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit: number = 20;
}
