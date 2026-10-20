import { ApiProperty } from "@nestjs/swagger";
import { Transform } from "class-transformer";
import {
  IsInt,
  IsNotEmpty,
  IsString,
  Max,
  MaxLength,
  Min,
} from "class-validator";

export class CreateConsultingRoomDto {
  @ApiProperty({
    example: 1,
    description: "ID de la sede a la que pertenece el consultorio",
  })
  @IsInt()
  @Min(1)
  @Max(2147483647)
  branchId!: number;

  @ApiProperty({
    example: "Consultorio 101",
    maxLength: 50,
  })
  @Transform(({ value }: { value: unknown }) =>
    typeof value === "string" ? value.trim() : value,
  )
  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  name!: string;

  @ApiProperty({
    example: 5,
    minimum: 0,
    description: "Minutos de preparación después de cada atención",
  })
  @IsInt()
  @Min(0)
  @Max(2147483647)
  preparationMinutes!: number;
}
