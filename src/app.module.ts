import { type DynamicModule, Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { JwtModule } from '@nestjs/jwt';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { ENVIRONMENT, type Environment } from './config.js';
import { UserStore } from './database/user-store.js';
import { PrismaUserStore } from './database/prisma-user.store.js';
import { AuthController } from './auth/auth.controller.js';
import { AuthService } from './auth/auth.service.js';
import { AuthGuard } from './auth/auth.guard.js';
import { RolesGuard } from './auth/roles.guard.js';
import { UsersController } from './users/users.controller.js';
import { UsersService } from './users/users.service.js';
@Module({})
export class AppModule {
  static register(config: Environment): DynamicModule {
    return {
      module: AppModule,
      imports: [
        JwtModule.register({ secret: config.JWT_SECRET,
          signOptions: { algorithm: 'HS256', expiresIn: 900, issuer: 'clinica-salud-integral', audience: 'clinica-api' },
          verifyOptions: { algorithms: ['HS256'], issuer: 'clinica-salud-integral', audience: 'clinica-api' } }),
        ThrottlerModule.forRoot([{ name: 'default', ttl: 60000, limit: 120 }]),
      ],
      controllers: [AuthController, UsersController],
      providers: [
        { provide: ENVIRONMENT, useValue: config },
        { provide: UserStore, useClass: PrismaUserStore },
        AuthService, UsersService,
        { provide: APP_GUARD, useClass: ThrottlerGuard },
        { provide: APP_GUARD, useClass: AuthGuard },
        { provide: APP_GUARD, useClass: RolesGuard },
      ],
    };
  }
}
