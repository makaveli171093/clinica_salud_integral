import { ApiProperty } from "@nestjs/swagger";
import { Type } from "class-transformer";
import { IsDateString, IsInt, Matches, Max, Min } from "class-validator";

export class QueryAvailabilityDto {
  @ApiProperty({ example: 1, minimum: 1 })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(2147483647)
  doctorId!: number;

  @ApiProperty({
    example: "2026-10-26",
    description: "Fecha de atención en formato YYYY-MM-DD",
  })
  @Matches(/^\d{4}-\d{2}-\d{2}$/)
  @IsDateString({ strict: true })
  date!: string;
}
