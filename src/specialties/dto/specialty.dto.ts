import { ApiProperty } from "@nestjs/swagger";

export class SpecialtyResponseDto {
  @ApiProperty({ example: 1 })
  id!: number;

  @ApiProperty({ example: "Medicina General" })
  name!: string;

  @ApiProperty({
    example: 20,
    description: "Duración en minutos de la consulta",
  })
  durationMinutes!: number;

  @ApiProperty({
    example: false,
    description: "Si exige orden previa de derivación",
  })
  requiresReferral!: boolean;

  @ApiProperty({ example: "TODOS", enum: ["TODOS", "MASCULINO", "FEMENINO"] })
  allowedGender!: string;

  @ApiProperty({ example: null, nullable: true })
  minAge!: number | null;

  @ApiProperty({ example: null, nullable: true })
  maxAge!: number | null;

  @ApiProperty({ example: true })
  isActive!: boolean;
}
