import "reflect-metadata";
import { test } from "node:test";
import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { PrismaUserStore } from "../dist/database/prisma-user.store.js";
import { PrismaService } from "../dist/database/prisma.service.js";

const url = process.env.TEST_DATABASE_URL;

if (!url || !new URL(url).pathname.endsWith("_test")) {
  throw new Error(
    "TEST_DATABASE_URL debe identificar una base aislada terminada en _test",
  );
}

test("PostgreSQL: creación, unicidad y revocación de usuarios", async () => {
  const prisma = new PrismaService({ DATABASE_URL: url });
  const store = new PrismaUserStore(prisma);
  const email = `integration-${randomUUID()}@clinic.test`;

  let connected = false;

  try {
    await prisma.$connect();
    connected = true;

    const user = await store.create({
      email,
      password: "valor-sintetico-no-es-una-prueba-de-login",
      role: "MEDICO",
    });

    assert.equal(user.tokenVersion, 0);
    assert.equal(user.isActive, true);

    const found = await store.findByEmail(email);
    assert.equal(found.id, user.id);

    await assert.rejects(
      store.create({
        email,
        password: "duplicado",
        role: "MEDICO",
      }),
      (error) => error.code === "P2002",
    );

    await store.setActive(user.id, false);

    const disabled = await store.findById(user.id);
    assert.equal(disabled.isActive, false);
    assert.equal(disabled.tokenVersion, 1);

    await store.setActive(user.id, true);
    await store.revokeSessions(user.id);

    const reactivated = await store.findById(user.id);
    assert.equal(reactivated.isActive, true);
    assert.equal(reactivated.tokenVersion, 3);
  } finally {
    try {
      if (connected) {
        await prisma.user.deleteMany({
          where: { email },
        });
      }
    } finally {
      await prisma.$disconnect();
    }
  }
});
