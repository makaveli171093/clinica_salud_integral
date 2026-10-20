import "reflect-metadata";
import { test, before, after } from "node:test";
import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { PrismaService } from "../dist/database/prisma.service.js";
import { DoctorSchedulesService } from "../dist/doctor-schedules/doctor-schedules.service.js";

const url = process.env.TEST_DATABASE_URL;

if (!url || !new URL(url).pathname.endsWith("_test")) {
  throw new Error(
    "TEST_DATABASE_URL debe apuntar a una base terminada en _test",
  );
}

// Dos clientes: cada servicio puede usar una conexión independiente.
const dbA = new PrismaService({ DATABASE_URL: url });
const dbB = new PrismaService({ DATABASE_URL: url });

const serviceA = new DoctorSchedulesService(dbA);
const serviceB = new DoctorSchedulesService(dbB);

before(async () => {
  await Promise.all([dbA.$connect(), dbB.$connect()]);
});

after(async () => {
  await Promise.all([dbA.$disconnect(), dbB.$disconnect()]);
});

async function withFixture(run) {
  const tag = randomUUID();

  const fixture = await dbA.$transaction(async (tx) => {
    const branch = await tx.branch.create({
      data: {
        name: `Sede prueba ${tag}`,
        address: "Dirección de prueba",
      },
    });

    const specialty = await tx.specialty.create({
      data: {
        name: `Especialidad prueba ${tag}`,
        durationMinutes: 20,
      },
    });

    const doctors = [];

    for (const firstName of ["Ana", "Luis"]) {
      doctors.push(
        await tx.doctor.create({
          data: {
            firstName,
            lastName: "Prueba",
            specialtyId: specialty.id,
          },
        }),
      );
    }

    const rooms = [];

    for (const name of ["Consultorio A", "Consultorio B"]) {
      rooms.push(
        await tx.consultingRoom.create({
          data: {
            name,
            branchId: branch.id,
            preparationMinutes: 5,
          },
        }),
      );
    }

    return { branch, specialty, doctors, rooms };
  });

  try {
    await run(fixture);
  } finally {
    const doctorIds = fixture.doctors.map((doctor) => doctor.id);

    // Elimina únicamente los registros creados por esta prueba.
    await dbA.$transaction([
      dbA.doctorSchedule.deleteMany({
        where: { doctorId: { in: doctorIds } },
      }),
      dbA.doctor.deleteMany({
        where: { id: { in: doctorIds } },
      }),
      dbA.consultingRoom.deleteMany({
        where: { branchId: fixture.branch.id },
      }),
      dbA.branch.deleteMany({
        where: { id: fixture.branch.id },
      }),
      dbA.specialty.deleteMany({
        where: { id: fixture.specialty.id },
      }),
    ]);
  }
}

function schedule(doctorId, consultingRoomId, startTime, endTime) {
  return {
    doctorId,
    consultingRoomId,
    dayOfWeek: "LUNES",
    startTime,
    endTime,
  };
}

async function countSchedules(fixture) {
  return dbA.doctorSchedule.count({
    where: {
      doctorId: {
        in: fixture.doctors.map((doctor) => doctor.id),
      },
    },
  });
}

test("PostgreSQL permite bloques contiguos", async () => {
  await withFixture(async (fixture) => {
    const doctor = fixture.doctors[0];
    const room = fixture.rooms[0];

    await serviceA.create(schedule(doctor.id, room.id, "08:00", "10:00"));

    await serviceA.create(schedule(doctor.id, room.id, "10:00", "12:00"));

    assert.equal(await countSchedules(fixture), 2);
  });
});

test("PostgreSQL detecta cruces del médico y del consultorio", async () => {
  await withFixture(async (fixture) => {
    const [doctorA, doctorB] = fixture.doctors;
    const [roomA, roomB] = fixture.rooms;

    await serviceA.create(schedule(doctorA.id, roomA.id, "08:00", "10:00"));

    // Mismo médico, otro consultorio.
    await assert.rejects(
      serviceA.create(schedule(doctorA.id, roomB.id, "09:00", "11:00")),
      (error) => error.getStatus?.() === 409,
    );

    // Otro médico, mismo consultorio.
    await assert.rejects(
      serviceA.create(schedule(doctorB.id, roomA.id, "09:00", "11:00")),
      (error) => error.getStatus?.() === 409,
    );

    assert.equal(await countSchedules(fixture), 1);
  });
});

function assertOneSuccess(results) {
  const fulfilled = results.filter((result) => result.status === "fulfilled");

  const rejected = results.filter((result) => result.status === "rejected");

  assert.equal(fulfilled.length, 1);
  assert.equal(rejected.length, 1);
  assert.equal(rejected[0].reason.getStatus?.(), 409);
}

test("concurrencia: un médico no ocupa dos consultorios a la vez", async () => {
  await withFixture(async (fixture) => {
    const doctor = fixture.doctors[0];
    const [roomA, roomB] = fixture.rooms;

    const results = await Promise.allSettled([
      serviceA.create(schedule(doctor.id, roomA.id, "08:00", "10:00")),
      serviceB.create(schedule(doctor.id, roomB.id, "09:00", "11:00")),
    ]);

    assertOneSuccess(results);
    assert.equal(await countSchedules(fixture), 1);
  });
});

test("concurrencia: un consultorio no recibe dos médicos a la vez", async () => {
  await withFixture(async (fixture) => {
    const [doctorA, doctorB] = fixture.doctors;
    const room = fixture.rooms[0];

    const results = await Promise.allSettled([
      serviceA.create(schedule(doctorA.id, room.id, "08:00", "10:00")),
      serviceB.create(schedule(doctorB.id, room.id, "09:00", "11:00")),
    ]);

    assertOneSuccess(results);
    assert.equal(await countSchedules(fixture), 1);
  });
});
