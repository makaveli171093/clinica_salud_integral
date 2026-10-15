import "dotenv/config";
import { PrismaClient } from "../src/generated/prisma/client.js";
import { PrismaPg } from "@prisma/adapter-pg";
import pg from "pg";

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  throw new Error(
    "DATABASE_URL no está definida en las variables de entorno (.env)",
  );
}

const pool = new pg.Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("🌱 Iniciando carga de datos iniciales (Seed)...");

  // 1. Sede y Consultorios iniciales
  const branch = await prisma.branch.upsert({
    where: { name: "Sede Central" },
    update: {},
    create: {
      name: "Sede Central",
      address: "Av. Principal #123, Zona Centro",
      phone: "22114455",
      consultingRooms: {
        create: [
          { name: "Consultorio 101" },
          { name: "Consultorio 102" },
          { name: "Consultorio Dental A" },
        ],
      },
    },
  });
  console.log(`✓ Sede lista: ${branch.name}`);

  // 2. Especialidades base según el alcance clínico
  const specialties = [
    {
      name: "Medicina General",
      durationMinutes: 20,
      requiresReferral: false,
      allowedGender: "TODOS" as const,
    },
    {
      name: "Pediatría",
      durationMinutes: 30,
      requiresReferral: false,
      allowedGender: "TODOS" as const,
      maxAge: 17,
    },
    {
      name: "Ginecología",
      durationMinutes: 30,
      requiresReferral: false,
      allowedGender: "FEMENINO" as const,
    },
    {
      name: "Cardiología",
      durationMinutes: 45,
      requiresReferral: true,
      allowedGender: "TODOS" as const,
    },
  ];

  for (const item of specialties) {
    await prisma.specialty.upsert({
      where: { name: item.name },
      update: {
        durationMinutes: item.durationMinutes,
        requiresReferral: item.requiresReferral,
      },
      create: item,
    });
  }
  console.log(`✓ Especialidades sincronizadas (${specialties.length})`);
}

main()
  .catch((e) => {
    console.error("Error durante el seed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
