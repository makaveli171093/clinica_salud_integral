import { Injectable, UnauthorizedException, type CanActivate, type ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';
import { UserStore, publicUser } from '../database/user-store.js';
import { PUBLIC, type AuthRequest } from './access.js';
@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private readonly reflector: Reflector, private readonly jwt: JwtService, private readonly users: UserStore) {}
  async canActivate(context: ExecutionContext): Promise<boolean> {
    if (this.reflector.getAllAndOverride<boolean>(PUBLIC, [context.getHandler(), context.getClass()])) return true;
    const request = context.switchToHttp().getRequest<AuthRequest>();
    const header = request.headers.authorization;
    if (!header || !/^Bearer \S+$/.test(header)) throw new UnauthorizedException('Sesión requerida');
    let claims: Record<string, unknown>;
    try {
      claims = await this.jwt.verifyAsync<Record<string, unknown>>(header.slice(7));
      if (typeof claims.sub !== 'string' || !/^[1-9]\d*$/.test(claims.sub) ||
          !Number.isSafeInteger(Number(claims.sub)) || !Number.isInteger(claims.ver) ||
          typeof claims.exp !== 'number') throw new Error('Invalid claims');
    } catch { throw new UnauthorizedException('Sesión inválida o expirada'); }
    // Database failures stay server errors, never masquerade as bad credentials.
    const user = await this.users.findById(Number(claims.sub));
    if (!user || !user.isActive || user.tokenVersion !== claims.ver) throw new UnauthorizedException('Sesión revocada');
    request.currentUser = publicUser(user);
    return true;
  }
}
