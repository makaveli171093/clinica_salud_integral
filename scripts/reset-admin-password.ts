import "dotenv/config";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client.js";

const schema = z.object({
  DATABASE_URL: z.string().url(),
  RESET_ADMIN_EMAIL: z.string().trim().toLowerCase().email(),
  RESET_ADMIN_PASSWORD: z
    .string()
    .min(12)
    .refine(
      (value) => Buffer.byteLength(value, "utf8") <= 72,
      "La contraseña no puede superar 72 bytes",
    ),
});

async function main() {
  if (process.env.NODE_ENV === "production") {
    throw new Error("Este script local no está habilitado en producción");
  }

  const result = schema.safeParse(process.env);

  if (!result.success) {
    throw new Error(
      "Revise DATABASE_URL, RESET_ADMIN_EMAIL y RESET_ADMIN_PASSWORD",
    );
  }

  const env = result.data;
  const password = await bcrypt.hash(env.RESET_ADMIN_PASSWORD, 12);

  const prisma = new PrismaClient({
    adapter: new PrismaPg({
      connectionString: env.DATABASE_URL,
    }),
  });

  try {
    const updated = await prisma.user.updateMany({
      where: {
        email: env.RESET_ADMIN_EMAIL,
        role: "ADMINISTRADOR",
        isActive: true,
      },
      data: {
        password,
        tokenVersion: {
          increment: 1,
        },
      },
    });

    if (updated.count !== 1) {
      throw new Error("No se encontró un administrador activo con ese correo");
    }

    console.log("Contraseña actualizada y sesiones anteriores revocadas");
  } finally {
    await prisma.$disconnect();
  }
}

main().catch(() => {
  console.error(
    "No se pudo restablecer: compruebe el entorno, las credenciales de entrada, el correo del administrador activo y la conexión.",
  );
  process.exitCode = 1;
});
