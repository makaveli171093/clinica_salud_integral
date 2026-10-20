import { ApiProperty } from "@nestjs/swagger";
import { IsEnum, IsInt, IsString, Matches, Max, Min } from "class-validator";
import { DayOfWeek } from "../../generated/prisma/enums.js";

export class CreateDoctorScheduleDto {
  @ApiProperty({ example: 1 })
  @IsInt()
  @Min(1)
  @Max(2147483647)
  doctorId!: number;

  @ApiProperty({ example: 1 })
  @IsInt()
  @Min(1)
  @Max(2147483647)
  consultingRoomId!: number;

  @ApiProperty({
    enum: DayOfWeek,
    example: DayOfWeek.LUNES,
  })
  @IsEnum(DayOfWeek)
  dayOfWeek!: DayOfWeek;

  @ApiProperty({
    example: "08:00",
    description: "Hora local de inicio, formato HH:mm",
  })
  @IsString()
  @Matches(/^([01]\d|2[0-3]):[0-5]\d$/, {
    message: "startTime debe tener formato HH:mm válido",
  })
  startTime!: string;

  @ApiProperty({
    example: "12:00",
    description: "Hora local de fin, formato HH:mm",
  })
  @IsString()
  @Matches(/^([01]\d|2[0-3]):[0-5]\d$/, {
    message: "endTime debe tener formato HH:mm válido",
  })
  endTime!: string;
}
