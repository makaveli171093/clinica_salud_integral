import { BadRequestException, ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import bcrypt from 'bcryptjs';
import { UserStore, publicUser } from '../database/user-store.js';
import type { CreateUserDto } from './users.dto.js';
@Injectable()
export class UsersService {
  constructor(private readonly users: UserStore) {}
  async create(dto: CreateUserDto) {
    if (Buffer.byteLength(dto.password, 'utf8') > 72) throw new BadRequestException('La contraseña excede 72 bytes');
    const password = await bcrypt.hash(dto.password, 12);
    try { return publicUser(await this.users.create({ email: dto.email, password, role: dto.role })); }
    catch (error) {
      if (error && typeof error === 'object' && 'code' in error && error.code === 'P2002') throw new ConflictException('Correo ya registrado');
      throw error;
    }
  }
  async setActive(id: number, isActive: boolean) {
    const user = await this.users.findById(id);
    if (!user) throw new NotFoundException('Usuario no encontrado');
    // Administrator lifecycle needs a dedicated last-admin policy; fail closed in this milestone.
    if (user.role === 'ADMINISTRADOR') throw new BadRequestException('La baja de administradores no está habilitada en este bloque');
    return publicUser(await this.users.setActive(id, isActive));
  }
}
