import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsIn, IsString, MaxLength, MinLength } from 'class-validator';
import { LoginDto } from '../auth/auth.dto.js';
import { ROLES, type Role } from '../database/user-store.js';
export class CreateUserDto extends LoginDto {
  @ApiProperty({ format: 'password', minLength: 12, maxLength: 72 })
  @IsString()
  @MinLength(12)
  @MaxLength(72)
  override password: string = "";
  @ApiProperty({ enum: ROLES })
  @IsIn(ROLES)
  role!: Role;
}
export class SetActiveDto {
  @ApiProperty()
  @IsBoolean()
  isActive!: boolean;
}
