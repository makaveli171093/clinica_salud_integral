export const ROLES = ['ADMINISTRADOR', 'GERENCIA', 'RECEPCIONISTA', 'MEDICO'] as const;
export type Role = typeof ROLES[number];
export interface StoredUser {
  id: number;
  email: string;
  password: string;
  role: Role;
  isActive: boolean;
  tokenVersion: number;
}
export type PublicUser = Pick<StoredUser, 'id' | 'email' | 'role' | 'isActive'>;
export function publicUser(user: StoredUser): PublicUser {
  return { id: user.id, email: user.email, role: user.role, isActive: user.isActive };
}
export abstract class UserStore {
  abstract findByEmail(email: string): Promise<StoredUser | null>;
  abstract findById(id: number): Promise<StoredUser | null>;
  abstract create(data: Pick<StoredUser, 'email' | 'password' | 'role'>): Promise<StoredUser>;
  abstract setActive(id: number, isActive: boolean): Promise<StoredUser>;
  abstract revokeSessions(id: number): Promise<void>;
}
