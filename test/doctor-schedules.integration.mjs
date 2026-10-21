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

test("consulta: combina médico, consultorio y día", async () => {
  await withFixture(async (fixture) => {
    const [doctorA, doctorB] = fixture.doctors;
    const [roomA, roomB] = fixture.rooms;

    const expected = await serviceA.create(
      schedule(doctorA.id, roomA.id, "08:00", "09:00"),
    );

    await serviceA.create(schedule(doctorA.id, roomB.id, "09:00", "10:00"));

    await serviceA.create(schedule(doctorB.id, roomA.id, "09:00", "10:00"));

    await serviceA.create({
      ...schedule(doctorA.id, roomA.id, "08:00", "09:00"),
      dayOfWeek: "MARTES",
    });

    const result = await serviceA.findAllActive({
      doctorId: doctorA.id,
      consultingRoomId: roomA.id,
      dayOfWeek: "LUNES",
      page: 1,
      limit: 10,
    });

    assert.deepEqual(
      result.data.map((item) => item.id),
      [expected.id],
    );
    assert.equal(result.total, 1);
    assert.equal(result.totalPages, 1);
  });
});

test("consulta: pagina en orden y conserva el total en páginas vacías", async () => {
  await withFixture(async (fixture) => {
    const doctor = fixture.doctors[0];
    const room = fixture.rooms[0];

    for (const [start, end] of [
      ["10:00", "11:00"],
      ["08:00", "09:00"],
      ["09:00", "10:00"],
    ]) {
      await serviceA.create(schedule(doctor.id, room.id, start, end));
    }

    const query = {
      doctorId: doctor.id,
      dayOfWeek: "LUNES",
      limit: 2,
    };

    const first = await serviceA.findAllActive({
      ...query,
      page: 1,
    });

    assert.deepEqual(
      first.data.map((item) => item.startTime),
      ["08:00", "09:00"],
    );
    assert.equal(first.total, 3);
    assert.equal(first.page, 1);
    assert.equal(first.limit, 2);
    assert.equal(first.totalPages, 2);

    const second = await serviceA.findAllActive({
      ...query,
      page: 2,
    });

    assert.deepEqual(
      second.data.map((item) => item.startTime),
      ["10:00"],
    );
    assert.equal(second.total, 3);
    assert.equal(second.totalPages, 2);

    const outside = await serviceA.findAllActive({
      ...query,
      page: 3,
    });

    assert.deepEqual(outside.data, []);
    assert.equal(outside.total, 3);
    assert.equal(outside.page, 3);
    assert.equal(outside.totalPages, 2);
  });
});

test("consulta: excluye horarios cuando alguna entidad está inactiva", async () => {
  await withFixture(async (fixture) => {
    const doctor = fixture.doctors[0];
    const room = fixture.rooms[0];

    const created = await serviceA.create(
      schedule(doctor.id, room.id, "08:00", "09:00"),
    );

    const query = {
      doctorId: doctor.id,
      page: 1,
      limit: 10,
    };

    const targets = [
      [dbA.doctorSchedule, created.id],
      [dbA.doctor, doctor.id],
      [dbA.specialty, fixture.specialty.id],
      [dbA.consultingRoom, room.id],
      [dbA.branch, fixture.branch.id],
    ];

    for (const [model, id] of targets) {
      await model.update({
        where: { id },
        data: { isActive: false },
      });

      try {
        const result = await serviceA.findAllActive(query);

        assert.deepEqual(result.data, []);
        assert.equal(result.total, 0);
        assert.equal(result.totalPages, 0);
      } finally {
        await model.update({
          where: { id },
          data: { isActive: true },
        });
      }

      const restored = await serviceA.findAllActive(query);

      assert.deepEqual(
        restored.data.map((item) => item.id),
        [created.id],
      );
      assert.equal(restored.total, 1);
    }
  });
});
