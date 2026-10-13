import { z } from 'zod';

const schema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  DATABASE_URL: z.string().url().refine(v => /^postgres(ql)?:/.test(v)),
  JWT_SECRET: z.string().min(48),
  PORT: z.coerce.number().int().min(1).max(65535).default(3000),
  CORS_ORIGINS: z.string().default('http://localhost:5173'),
});
export type Environment = z.infer<typeof schema>;
export const ENVIRONMENT = Symbol('ENVIRONMENT');
export function validateEnvironment(input: Record<string, unknown>): Environment {
  const result = schema.safeParse(input);
  if (!result.success) {
    throw new Error('Configuración inválida: ' + [...new Set(result.error.issues.map(i => i.path.join('.')))].join(', '));
  }
  const config = result.data;
  const origins = config.CORS_ORIGINS.split(',').map(s => s.trim());
  if (origins.some(origin => {
    try { const url = new URL(origin); return !['http:', 'https:'].includes(url.protocol) || url.origin !== origin; }
    catch { return true; }
  })) throw new Error('Configuración inválida: CORS_ORIGINS');
  return config;
}
