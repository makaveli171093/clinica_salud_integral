import { defineConfig } from "prisma/config";

const url = process.env.TEST_DATABASE_URL;

if (!url) {
  throw new Error("TEST_DATABASE_URL no está definida");
}

const databaseName = new URL(url).pathname.slice(1);

if (!databaseName.endsWith("_test")) {
  throw new Error("La base de pruebas debe tener un nombre terminado en _test");
}

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    url,
  },
});
