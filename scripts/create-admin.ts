import 'dotenv/config';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '../src/generated/prisma/client.js';
import bcrypt from 'bcryptjs';
import { z } from 'zod';
const schema = z.object({
  DATABASE_URL: z.string().url(),
  ADMIN_EMAIL: z.string().trim().toLowerCase().email().max(150),
  ADMIN_PASSWORD: z.string().min(12).refine(p => Buffer.byteLength(p, 'utf8') <= 72),
});
async function main() {
  const parsed = schema.safeParse(process.env);
  if (!parsed.success) throw new Error('Revise DATABASE_URL, ADMIN_EMAIL y ADMIN_PASSWORD (mínimo 12 caracteres, máximo 72 bytes).');
  const env = parsed.data;
  const prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString: env.DATABASE_URL }) });
  try {
    const password = await bcrypt.hash(env.ADMIN_PASSWORD, 12);
    await prisma.$transaction(async tx => {
      // Serialize first-admin bootstrap even when run concurrently.
      await tx.$executeRaw`SELECT pg_advisory_xact_lock(240101)`;
      if (await tx.user.count({ where: { role: 'ADMINISTRADOR' } })) throw new Error('Ya existe un administrador; no se modificó ninguna cuenta.');
      await tx.user.create({ data: { email: env.ADMIN_EMAIL, password, role: 'ADMINISTRADOR' } });
    });
    console.log('Administrador creado. Retire ADMIN_PASSWORD del entorno.');
  } finally { await prisma.$disconnect(); }
}
main().catch(error => { console.error(error instanceof Error && !('code' in error) ? error.message : 'No se pudo crear el administrador; compruebe la base y que el correo no exista.'); process.exitCode = 1; });
