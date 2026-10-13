import { ApiProperty } from '@nestjs/swagger';
import { ROLES, type Role } from '../database/user-store.js';
export class UserResponseDto {
  @ApiProperty() id!: number;
  @ApiProperty() email!: string;
  @ApiProperty({ enum: ROLES }) role!: Role;
  @ApiProperty() isActive!: boolean;
}
export class SessionDto {
  @ApiProperty() accessToken!: string;
  @ApiProperty({ example: 'Bearer' }) tokenType!: string;
  @ApiProperty({ example: 900 }) expiresIn!: number;
  @ApiProperty({ type: UserResponseDto }) user!: UserResponseDto;
}
