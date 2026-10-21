import { ApiProperty } from "@nestjs/swagger";
import { Gender } from "../../generated/prisma/enums.js";

export class PatientResponseDto {
  @ApiProperty({ example: 1 })
  id!: number;

  @ApiProperty({ example: "Ana María" })
  firstName!: string;

  @ApiProperty({ example: "Flores Pérez" })
  lastName!: string;

  @ApiProperty({ example: "ana@example.com" })
  email!: string;

  @ApiProperty({ example: "+591 70000000" })
  phone!: string;

  @ApiProperty({ enum: Gender })
  gender!: Gender;

  @ApiProperty({
    type: String,
    format: "date-time",
    example: "1995-03-15T00:00:00.000Z",
  })
  birthDate!: Date;

  @ApiProperty({ example: true })
  isActive!: boolean;
}
