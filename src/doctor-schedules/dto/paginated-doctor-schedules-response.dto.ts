import { ApiProperty } from "@nestjs/swagger";
import { DoctorScheduleResponseDto } from "./doctor-schedule-response.dto.js";

export class PaginatedDoctorSchedulesResponseDto {
  @ApiProperty({ type: [DoctorScheduleResponseDto] })
  data!: DoctorScheduleResponseDto[];

  @ApiProperty({ example: 23, minimum: 0 })
  total!: number;

  @ApiProperty({ example: 3, minimum: 1 })
  page!: number;

  @ApiProperty({ example: 10, minimum: 1, maximum: 100 })
  limit!: number;

  @ApiProperty({ example: 3, minimum: 0 })
  totalPages!: number;
}
