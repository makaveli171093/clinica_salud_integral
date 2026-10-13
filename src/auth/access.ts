import { SetMetadata } from '@nestjs/common';
import type { FastifyRequest } from 'fastify';
import type { PublicUser, Role } from '../database/user-store.js';
export const PUBLIC = 'clinic:public';
export const ROLES_KEY = 'clinic:roles';
export const Public = () => SetMetadata(PUBLIC, true);
export const Roles = (...roles: Role[]) => SetMetadata(ROLES_KEY, roles);
export type AuthRequest = FastifyRequest & { currentUser: PublicUser };
