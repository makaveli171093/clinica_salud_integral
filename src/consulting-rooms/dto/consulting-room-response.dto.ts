import { ApiProperty } from "@nestjs/swagger";

export class ConsultingRoomResponseDto {
  @ApiProperty({ example: 1 })
  id!: number;

  @ApiProperty({ example: 1 })
  branchId!: number;

  @ApiProperty({ example: "Consultorio 101" })
  name!: string;

  @ApiProperty({ example: true })
  isActive!: boolean;

  @ApiProperty({
    type: Number,
    example: 5,
    nullable: true,
  })
  preparationMinutes!: number | null;
}
