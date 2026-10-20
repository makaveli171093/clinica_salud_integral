import { type DynamicModule, Module } from "@nestjs/common";
import { APP_GUARD } from "@nestjs/core";
import { JwtModule } from "@nestjs/jwt";
import { ThrottlerGuard, ThrottlerModule } from "@nestjs/throttler";
import { type Environment } from "./config/env.validation.js";
import { AuthGuard } from "./auth/auth.guard.js";
import { RolesGuard } from "./auth/roles.guard.js";
import { AppConfigModule } from "./config/config.module.js";
import { PrismaModule } from "./database/prisma.module.js";
import { UsersModule } from "./users/users.module.js";
import { AuthModule } from "./auth/auth.module.js";
import { SpecialtiesModule } from "./specialties/specialties.module.js";
import { BranchesModule } from "./branches/branches.module.js";
import { ConsultingRoomsModule } from "./consulting-rooms/consulting-rooms.module.js";

@Module({})
export class AppModule {
  static register(config: Environment): DynamicModule {
    return {
      module: AppModule,
      imports: [
        AppConfigModule.register(config),
        PrismaModule,
        JwtModule.register({
          global: true,
          secret: config.JWT_SECRET,
          signOptions: {
            algorithm: "HS256",
            expiresIn: 900,
            issuer: "clinica-salud-integral",
            audience: "clinica-api",
          },
          verifyOptions: {
            algorithms: ["HS256"],
            issuer: "clinica-salud-integral",
            audience: "clinica-api",
          },
        }),
        UsersModule,
        AuthModule,
        SpecialtiesModule,
        BranchesModule,
        BranchesModule,
        ConsultingRoomsModule,
        ThrottlerModule.forRoot([{ name: "default", ttl: 60000, limit: 120 }]),
      ],
      controllers: [],
      providers: [
        { provide: APP_GUARD, useClass: ThrottlerGuard },
        { provide: APP_GUARD, useClass: AuthGuard },
        { provide: APP_GUARD, useClass: RolesGuard },
      ],
    };
  }
}
