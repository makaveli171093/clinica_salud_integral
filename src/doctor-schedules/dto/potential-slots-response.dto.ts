import { ApiProperty } from "@nestjs/swagger";
import { DayOfWeek } from "../../generated/prisma/enums.js";

export class ScheduleSlotResponseDto {
  @ApiProperty({ example: "08:00" })
  startTime!: string;

  @ApiProperty({ example: "08:20" })
  endTime!: string;

  @ApiProperty({ example: "08:25" })
  preparationEndTime!: string;
}

export class SchedulePotentialSlotsResponseDto {
  @ApiProperty({ example: 1 })
  scheduleId!: number;

  @ApiProperty({ example: 1 })
  consultingRoomId!: number;

  @ApiProperty({ type: [ScheduleSlotResponseDto] })
  slots!: ScheduleSlotResponseDto[];
}

export class PotentialSlotsResponseDto {
  @ApiProperty({ example: 1 })
  doctorId!: number;

  @ApiProperty({ example: "2026-10-26" })
  date!: string;

  @ApiProperty({ enum: DayOfWeek, example: DayOfWeek.LUNES })
  dayOfWeek!: DayOfWeek;

  @ApiProperty({ type: [SchedulePotentialSlotsResponseDto] })
  schedules!: SchedulePotentialSlotsResponseDto[];
}
