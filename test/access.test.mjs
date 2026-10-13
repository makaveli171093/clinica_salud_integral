import "reflect-metadata";
import { test, before, after } from "node:test";
import assert from "node:assert/strict";
import bcrypt from "bcryptjs";
import { Test } from "@nestjs/testing";
import { FastifyAdapter } from "@nestjs/platform-fastify";
import { JwtService } from "@nestjs/jwt";
import { AppModule } from "../dist/app.module.js";
import { UserStore } from "../dist/database/user-store.js";
import { validateEnvironment } from "../dist/config.js";
import { setup } from "../dist/setup.js";

const password = "Testing-Clinic-2026!";
const config = validateEnvironment({
  NODE_ENV: "test",
  DATABASE_URL: "postgresql://test:test@localhost/clinic_test",
  JWT_SECRET: "x".repeat(64),
});
class MemoryStore extends UserStore {
  users = [];
  async findByEmail(email) {
    return this.users.find((u) => u.email === email) ?? null;
  }
  async findById(id) {
    return this.users.find((u) => u.id === id) ?? null;
  }
  async create(data) {
    if (await this.findByEmail(data.email)) throw { code: "P2002" };
    const user = {
      ...data,
      id: this.users.length + 1,
      isActive: true,
      tokenVersion: 0,
    };
    this.users.push(user);
    return user;
  }
  async setActive(id, isActive) {
    const u = await this.findById(id);
    u.isActive = isActive;
    u.tokenVersion++;
    return u;
  }
  async revokeSessions(id) {
    const u = await this.findById(id);
    u.tokenVersion++;
  }
}
let app, store, jwt;
let ip = 0;
async function request(method, url, payload, token, remoteAddress) {
  return app.inject({
    method,
    url,
    ...(payload === undefined ? {} : { payload }),
    headers: token ? { authorization: `Bearer ${token}` } : {},
    remoteAddress: remoteAddress ?? `10.0.0.${++ip}`,
  });
}
async function token(id) {
  const u = await store.findById(id);
  return jwt.signAsync({ sub: String(id), ver: u.tokenVersion });
}
before(async () => {
  store = new MemoryStore();
  const hash = await bcrypt.hash(password, 12);
  for (const [email, role] of [
    ["admin@clinic.test", "ADMINISTRADOR"],
    ["doctor@clinic.test", "MEDICO"],
    ["manager@clinic.test", "GERENCIA"],
  ]) {
    await store.create({ email, role, password: hash });
  }
  const module = await Test.createTestingModule({
    imports: [AppModule.register(config)],
  })
    .overrideProvider(UserStore)
    .useValue(store)
    .compile();
  app = module.createNestApplication(
    new FastifyAdapter({ bodyLimit: 65536, trustProxy: false }),
    { logger: false },
  );
  await setup(app, config);
  await app.init();
  await app.getHttpAdapter().getInstance().ready();
  jwt = app.get(JwtService);
});
after(async () => {
  if (app) await app.close();
});

test("login normalizes email and never returns password or tokenVersion", async () => {
  const res = await request("POST", "/api/v1/auth/login", {
    email: " ADMIN@clinic.test ",
    password,
  });
  assert.equal(res.statusCode, 200);
  const body = res.json();
  assert.ok(body.accessToken);
  assert.equal(body.expiresIn, 900);
  assert.deepEqual(Object.keys(body.user).sort(), [
    "email",
    "id",
    "isActive",
    "role",
  ]);
});
test("login rejects wrong password and unknown user with same response", async () => {
  for (const email of ["admin@clinic.test", "unknown@clinic.test"]) {
    const r = await request("POST", "/api/v1/auth/login", {
      email,
      password: "wrong",
    });
    assert.equal(r.statusCode, 401);
    assert.equal(r.json().message, "Credenciales inválidas");
  }
});
test("public role injection and malformed email are rejected", async () => {
  assert.equal(
    (
      await request("POST", "/api/v1/auth/login", {
        email: "admin@clinic.test",
        password,
        role: "ADMINISTRADOR",
      })
    ).statusCode,
    400,
  );
  assert.equal(
    (
      await request("POST", "/api/v1/auth/login", {
        email: "invalid",
        password,
      })
    ).statusCode,
    400,
  );
});
test("no public register route exists, including legacy URL on Nest server", async () => {
  for (const path of ["/api/v1/auth/register", "/api/auth/register"])
    assert.equal(
      (
        await request("POST", path, {
          email: "intruder@clinic.test",
          password,
          role: "ADMINISTRADOR",
        })
      ).statusCode,
      404,
    );
});
test("protected routes deny missing or invalid tokens", async () => {
  assert.equal((await request("GET", "/api/v1/auth/me")).statusCode, 401);
  assert.equal(
    (await request("GET", "/api/v1/auth/me", undefined, "invalid")).statusCode,
    401,
  );
});
test("expired token and wrong audience are denied", async () => {
  for (const options of [{ expiresIn: -1 }, { audience: "other-api" }]) {
    const t = await jwt.signAsync({ sub: "1", ver: 0 }, options);
    assert.equal(
      (await request("GET", "/api/v1/auth/me", undefined, t)).statusCode,
      401,
    );
  }
});
test("authenticated non-administrators cannot create staff", async () => {
  for (const id of [2, 3])
    assert.equal(
      (
        await request(
          "POST",
          "/api/v1/users",
          { email: "new@clinic.test", password, role: "MEDICO" },
          await token(id),
        )
      ).statusCode,
      403,
    );
  assert.equal(
    (
      await request("POST", "/api/v1/users", {
        email: "new@clinic.test",
        password,
        role: "MEDICO",
      })
    ).statusCode,
    401,
  );
});
test("administrator creates staff, password is hashed and duplicate returns 409", async () => {
  const body = {
    email: " STAFF@clinic.test ",
    password,
    role: "RECEPCIONISTA",
  };
  const t = await token(1);
  const r = await request("POST", "/api/v1/users", body, t);
  assert.equal(r.statusCode, 201);
  assert.equal(r.json().email, "staff@clinic.test");
  assert.equal(r.json().password, undefined);
  const saved = await store.findByEmail("staff@clinic.test");
  assert.notEqual(saved.password, password);
  assert.ok(await bcrypt.compare(password, saved.password));
  assert.equal(
    (await request("POST", "/api/v1/users", body, t)).statusCode,
    409,
  );
});
test("user validation rejects short password, invalid role and internal properties", async () => {
  const base = { email: "invalid-new@clinic.test", password, role: "MEDICO" };
  for (const extra of [
    { password: "short" },
    { role: "SUPERADMIN" },
    { isActive: false },
    { tokenVersion: 7 },
    { password: "é".repeat(40) },
  ]) {
    assert.equal(
      (
        await request(
          "POST",
          "/api/v1/users",
          { ...base, ...extra },
          await token(1),
        )
      ).statusCode,
      400,
    );
  }
});
test("deactivation revokes an existing token; reactivation does not restore it", async () => {
  const t = await token(2);
  const admin = await token(1);
  assert.equal(
    (
      await request(
        "PATCH",
        "/api/v1/users/2/active",
        { isActive: false },
        admin,
      )
    ).statusCode,
    200,
  );
  assert.equal(
    (await request("GET", "/api/v1/auth/me", undefined, t)).statusCode,
    401,
  );
  assert.equal(
    (
      await request("POST", "/api/v1/auth/login", {
        email: "doctor@clinic.test",
        password,
      })
    ).statusCode,
    401,
  );
  assert.equal(
    (
      await request(
        "PATCH",
        "/api/v1/users/2/active",
        { isActive: true },
        admin,
      )
    ).statusCode,
    200,
  );
  assert.equal(
    (await request("GET", "/api/v1/auth/me", undefined, t)).statusCode,
    401,
  );
});
test("authorization uses current database role, not a role embedded in the token", async () => {
  const t = await token(1);
  const user = await store.findById(1);
  user.role = "GERENCIA";
  try {
    assert.equal(
      (
        await request(
          "POST",
          "/api/v1/users",
          { email: "denied@clinic.test", password, role: "MEDICO" },
          t,
        )
      ).statusCode,
      403,
    );
  } finally {
    user.role = "ADMINISTRADOR";
  }
});
test("logout invalidates all tokens issued before logout", async () => {
  const t = await token(2);
  assert.equal(
    (await request("POST", "/api/v1/auth/logout", {}, t)).statusCode,
    204,
  );
  assert.equal(
    (await request("GET", "/api/v1/auth/me", undefined, t)).statusCode,
    401,
  );
});
test("admin deactivation is blocked, missing user returns 404 and malformed ID 400", async () => {
  const t = await token(1);
  for (const [id, status] of [
    ["1", 400],
    ["9999", 404],
    ["abc", 400],
    ["-1", 400],
    ["0", 400],
    ["9007199254740993", 400],
  ])
    assert.equal(
      (
        await request(
          "PATCH",
          `/api/v1/users/${id}/active`,
          { isActive: false },
          t,
        )
      ).statusCode,
      status,
    );
});
test("login is throttled after five attempts from same address", async () => {
  for (let i = 0; i < 5; i++)
    assert.equal(
      (
        await request(
          "POST",
          "/api/v1/auth/login",
          { email: "missing@clinic.test", password: "bad" },
          undefined,
          "192.0.2.1",
        )
      ).statusCode,
      401,
    );
  assert.equal(
    (
      await request(
        "POST",
        "/api/v1/auth/login",
        { email: "missing@clinic.test", password: "bad" },
        undefined,
        "192.0.2.1",
      )
    ).statusCode,
    429,
  );
});
test("OpenAPI documents protected routes and response schemas", async () => {
  const r = await request("GET", "/api-docs-json");
  assert.equal(r.statusCode, 200);
  const doc = r.json();
  assert.ok(doc.paths["/api/v1/auth/me"].get.security);
  assert.ok(doc.components.schemas.UserResponseDto);
  assert.equal(
    doc.components.schemas.UserResponseDto.properties.password,
    undefined,
  );
});
test("invalid environment fails without echoing credentials", () => {
  assert.throws(
    () =>
      validateEnvironment({
        DATABASE_URL: "private-invalid-value",
        JWT_SECRET: "short",
      }),
    /Configuración inválida: DATABASE_URL, JWT_SECRET/,
  );
  assert.throws(
    () => validateEnvironment({ ...config, CORS_ORIGINS: "*" }),
    /CORS_ORIGINS/,
  );
});

test("database errors return a safe 500 with a request identifier", async () => {
  const original = store.findById;
  store.findById = async () => {
    throw new Error("password=must-never-leak");
  };
  try {
    const t = await jwt.signAsync({ sub: "1", ver: 0 });
    const r = await request("GET", "/api/v1/auth/me", undefined, t);
    assert.equal(r.statusCode, 500);
    assert.ok(r.json().requestId);
    assert.equal(r.body.includes("must-never-leak"), false);
  } finally {
    store.findById = original;
  }
});
test("JWT payload with invalid subject is rejected", async () => {
  const t = await jwt.signAsync({ sub: "not-a-user", ver: 0 });
  assert.equal(
    (await request("GET", "/api/v1/auth/me", undefined, t)).statusCode,
    401,
  );
});
test("security headers are enabled and untrusted origins get no CORS access", async () => {
  const r = await app.inject({
    method: "GET",
    url: "/api/v1/auth/me",
    headers: { origin: "https://untrusted.invalid" },
  });
  assert.equal(r.headers["x-content-type-options"], "nosniff");
  assert.equal(r.headers["access-control-allow-origin"], undefined);
});
