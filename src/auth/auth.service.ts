import { Injectable, UnauthorizedException } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import bcrypt from "bcryptjs";
import { UserStore, publicUser } from "../database/user-store.js";
import type { LoginDto } from "./dto/login.dto.js";
// Equal-cost comparison also for unknown accounts; not a usable account credential.
const DUMMY_HASH = bcrypt.hashSync("non-account-timing-placeholder", 12);
@Injectable()
export class AuthService {
  constructor(
    private readonly users: UserStore,
    private readonly jwt: JwtService,
  ) {}
  async login(dto: LoginDto) {
    const user = await this.users.findByEmail(dto.email);
    const matches = await bcrypt.compare(
      dto.password,
      user?.password ?? DUMMY_HASH,
    );
    if (!user || !user.isActive || !matches)
      throw new UnauthorizedException("Credenciales inválidas");
    const accessToken = await this.jwt.signAsync({
      sub: String(user.id),
      ver: user.tokenVersion,
    });
    return {
      accessToken,
      tokenType: "Bearer",
      expiresIn: 900,
      user: publicUser(user),
    };
  }
  async logout(id: number) {
    await this.users.revokeSessions(id);
  }
}
