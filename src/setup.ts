import { ValidationPipe } from "@nestjs/common";
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";
import type { NestFastifyApplication } from "@nestjs/platform-fastify";
import helmet from "@fastify/helmet";
import { ErrorsFilter } from "./common/errors.filter.js";
import type { Environment } from "./config/env.validation.js";
export async function setup(app: NestFastifyApplication, config: Environment) {
  app.setGlobalPrefix("api/v1");
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      forbidNonWhitelisted: true,
      validationError: { target: false, value: false },
    }),
  );
  app.useGlobalFilters(new ErrorsFilter());
  await app.register(helmet);
  app.enableCors({
    origin: config.CORS_ORIGINS.split(",").map((s) => s.trim()),
    credentials: false,
  });
  if (config.NODE_ENV !== "production") {
    const options = new DocumentBuilder()
      .setTitle("Clínica Salud Integral — NestJS")
      .setDescription(
        "Bloque 1: acceso seguro. Los módulos clínicos aún no están migrados.",
      )
      .setVersion("0.2.0")
      .addBearerAuth()
      .build();
    SwaggerModule.setup(
      "api-docs",
      app,
      SwaggerModule.createDocument(app, options),
    );
  }
  app.enableShutdownHooks();
}
