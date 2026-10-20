import { ApiProperty } from "@nestjs/swagger";

export class DoctorResponseDto {
  @ApiProperty({ example: 1 })
  id!: number;

  @ApiProperty({ example: "Ana" })
  firstName!: string;

  @ApiProperty({ example: "Pérez López" })
  lastName!: string;

  @ApiProperty({ example: 1 })
  specialtyId!: number;

  @ApiProperty({ type: Number, example: 2, nullable: true })
  userId!: number | null;

  @ApiProperty({ example: true })
  isActive!: boolean;
}
