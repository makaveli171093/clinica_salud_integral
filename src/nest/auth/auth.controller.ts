import { Body, Controller, Get, HttpCode, Post, Req } from '@nestjs/common';
import { ApiBearerAuth, ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import { AuthService } from './auth.service.js';
import { LoginDto } from './auth.dto.js';
import { Public, type AuthRequest } from './access.js';
import { SessionDto, UserResponseDto } from '../common/responses.js';
@ApiTags('Autenticación')
@Controller('auth')
export class AuthController {
  constructor(private readonly auth: AuthService) {}
  @Public()
  @Throttle({ default: { limit: 5, ttl: 60000 } })
  @Post('login')
  @HttpCode(200)
  @ApiOkResponse({ type: SessionDto })
  login(@Body() dto: LoginDto) { return this.auth.login(dto); }

  @Get('me')
  @ApiBearerAuth()
  @ApiOkResponse({ type: UserResponseDto })
  me(@Req() req: AuthRequest) { return req.currentUser; }

  @Post('logout')
  @ApiBearerAuth()
  @HttpCode(204)
  async logout(@Req() req: AuthRequest) { await this.auth.logout(req.currentUser.id); }
}
