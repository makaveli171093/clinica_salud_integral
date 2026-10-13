import 'reflect-metadata';
import 'dotenv/config';
import { NestFactory } from '@nestjs/core';
import { FastifyAdapter, type NestFastifyApplication } from '@nestjs/platform-fastify';
import { AppModule } from './app.module.js';
import { validateEnvironment } from './config.js';
import { setup } from './setup.js';
async function bootstrap() {
  const config = validateEnvironment(process.env);
  const app = await NestFactory.create<NestFastifyApplication>(AppModule.register(config), new FastifyAdapter({ bodyLimit: 65536, trustProxy: false }));
  await setup(app, config);
  await app.listen(config.PORT, '0.0.0.0');
}
bootstrap().catch(() => { console.error('No se pudo iniciar la API. Verifique configuración y conexión a PostgreSQL.'); process.exitCode = 1; });
