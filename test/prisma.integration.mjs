import 'reflect-metadata';
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import { PrismaUserStore } from '../dist/nest/database/prisma-user.store.js';
import { PrismaClient } from '../dist/generated/prisma/client.js';
import { PrismaPg } from '@prisma/adapter-pg';

const url = process.env.TEST_DATABASE_URL;
if (!url || !new URL(url).pathname.endsWith('_test')) throw new Error('TEST_DATABASE_URL debe identificar una base aislada terminada en _test');
test('PostgreSQL: user creation, uniqueness, session revocation and lifecycle', async () => {
  const store = new PrismaUserStore({DATABASE_URL:url});
  const cleanup = new PrismaClient({adapter:new PrismaPg({connectionString:url})});
  const email=`integration-${randomUUID()}@clinic.test`;
  await store.onModuleInit();
  try {
    const u=await store.create({email,password:'not-an-authentication-test',role:'MEDICO'});
    assert.equal(u.tokenVersion,0); assert.equal(u.isActive,true);
    assert.equal((await store.findByEmail(email)).id,u.id);
    await assert.rejects(store.create({email,password:'duplicate',role:'MEDICO'}),e=>e.code==='P2002');
    await store.setActive(u.id,false);
    const disabled=await store.findById(u.id); assert.equal(disabled.isActive,false); assert.equal(disabled.tokenVersion,1);
    await store.setActive(u.id,true); await store.revokeSessions(u.id);
    assert.equal((await store.findById(u.id)).tokenVersion,3);
  } finally {
    await cleanup.user.deleteMany({where:{email}});
    await cleanup.$disconnect(); await store.onModuleDestroy();
  }
});
