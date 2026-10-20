import { ApiProperty } from "@nestjs/swagger";
import { DayOfWeek } from "../../generated/prisma/enums.js";

export class DoctorScheduleResponseDto {
  @ApiProperty({ example: 1 })
  id!: number;

  @ApiProperty({ example: 1 })
  doctorId!: number;

  @ApiProperty({ example: 1 })
  consultingRoomId!: number;

  @ApiProperty({ enum: DayOfWeek, example: DayOfWeek.LUNES })
  dayOfWeek!: DayOfWeek;

  @ApiProperty({ example: "08:00" })
  startTime!: string;

  @ApiProperty({ example: "10:00" })
  endTime!: string;

  @ApiProperty({ example: true })
  isActive!: boolean;
}
