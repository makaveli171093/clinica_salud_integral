import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsOptional, IsString, MaxLength } from "class-validator";
import { Transform } from "class-transformer";

export class CreateBranchDto {
  @ApiProperty({ example: "Sede Norte" })
  @Transform(({ value }: { value: unknown }) =>
    typeof value === "string" ? value.trim() : value,
  )
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  name!: string;

  @ApiProperty({ example: "Av. America 456" })
  @Transform(({ value }: { value: unknown }) =>
    typeof value === "string" ? value.trim() : value,
  )
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  address!: string;

  @ApiProperty({ example: "22334455", required: false })
  @IsString()
  @IsOptional()
  @MaxLength(20)
  phone?: string;
}

export class ConsultingRoomResponseDto {
  @ApiProperty({ example: 1 })
  id!: number;

  @ApiProperty({ example: "Consultorio 101" })
  name!: string;

  @ApiProperty({ example: true })
  isActive!: boolean;
}

export class BranchResponseDto {
  @ApiProperty({ example: 1 })
  id!: number;

  @ApiProperty({ example: "Sede Central" })
  name!: string;

  @ApiProperty({ example: "Av. Principal #123, Zona Centro" })
  address!: string;

  @ApiProperty({ example: "22114455", nullable: true })
  phone!: string | null;

  @ApiProperty({ example: true })
  isActive!: boolean;

  @ApiProperty({ type: [ConsultingRoomResponseDto] })
  consultingRooms!: ConsultingRoomResponseDto[];
}
