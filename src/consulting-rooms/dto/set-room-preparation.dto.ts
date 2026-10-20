import { ApiProperty } from "@nestjs/swagger";
import { IsInt, Max, Min } from "class-validator";

export class SetRoomPreparationDto {
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
