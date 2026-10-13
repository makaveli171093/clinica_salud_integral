import { Body, Controller, Param, Patch, Post } from '@nestjs/common';
import { ApiBearerAuth, ApiCreatedResponse, ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { PositiveIdPipe } from '../common/positive-id.pipe.js';
import { Roles } from '../auth/access.js';
import { CreateUserDto, SetActiveDto } from './users.dto.js';
import { UsersService } from './users.service.js';
import { UserResponseDto } from '../common/responses.js';
@ApiTags('Usuarios')
@ApiBearerAuth()
@Roles('ADMINISTRADOR')
@Controller('users')
export class UsersController {
  constructor(private readonly users: UsersService) {}
  @Post()
  @ApiCreatedResponse({ type: UserResponseDto })
  create(@Body() dto: CreateUserDto) { return this.users.create(dto); }
  @Patch(':id/active')
  @ApiOkResponse({ type: UserResponseDto })
  setActive(@Param('id', PositiveIdPipe) id: number, @Body() dto: SetActiveDto) { return this.users.setActive(id, dto.isActive); }
}
