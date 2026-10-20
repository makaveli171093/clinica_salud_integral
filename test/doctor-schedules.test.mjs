import "reflect-metadata";
import { test } from "node:test";
import assert from "node:assert/strict";
import { DoctorSchedulesService } from "../dist/doctor-schedules/doctor-schedules.service.js";

const validDto = {
  doctorId: 1,
  consultingRoomId: 1,
  dayOfWeek: "LUNES",
  startTime: "08:00",
  endTime: "10:00",
};

function prepare({ preparationMinutes = 5, overlap = null } = {}) {
  let creations = 0;

  const tx = {
    doctor: {
      findFirst: async () => ({
        id: 1,
        specialty: { durationMinutes: 20 },
      }),
    },
    consultingRoom: {
      findFirst: async () => ({
        id: 1,
        preparationMinutes,
      }),
    },
    doctorSchedule: {
      findFirst: async () => overlap,
      create: async ({ data }) => {
        creations++;
        return { id: 10, ...data, isActive: true };
      },
    },
  };

  const prisma = {
    $transaction: async (operation, options) => {
      assert.equal(options.isolationLevel, "Serializable");
      return operation(tx);
    },
  };

  return {
    service: new DoctorSchedulesService(prisma),
    prisma,
    creations: () => creations,
  };
}

test("crea un horario válido", async () => {
  const context = prepare();

  const result = await context.service.create(validDto);

  assert.equal(result.id, 10);
  assert.equal(result.startTime, "08:00");
  assert.equal(context.creations(), 1);
});

test("rechaza intervalos invertidos, vacíos o insuficientes", async () => {
  const intervals = [
    { startTime: "12:00", endTime: "08:00" },
    { startTime: "08:00", endTime: "08:00" },
    { startTime: "14:00", endTime: "14:10" },
  ];

  for (const interval of intervals) {
    const context = prepare();

    await assert.rejects(
      context.service.create({ ...validDto, ...interval }),
      (error) => error.getStatus() === 400,
    );

    assert.equal(context.creations(), 0);
  }
});

test("rechaza preparación pendiente, pero permite cero explícito", async () => {
  const pending = prepare({ preparationMinutes: null });

  await assert.rejects(
    pending.service.create(validDto),
    (error) => error.getStatus() === 400,
  );

  assert.equal(pending.creations(), 0);

  const configured = prepare({ preparationMinutes: 0 });

  await configured.service.create(validDto);

  assert.equal(configured.creations(), 1);
});

test("rechaza conflictos del médico o del consultorio", async () => {
  for (const doctorId of [1, 2]) {
    const context = prepare({
      overlap: { id: 99, doctorId },
    });

    await assert.rejects(
      context.service.create(validDto),
      (error) => error.getStatus() === 409,
    );

    assert.equal(context.creations(), 0);
  }
});

test("reintenta después de un conflicto P2034", async () => {
  const context = prepare();
  const transaction = context.prisma.$transaction;
  let attempts = 0;

  context.prisma.$transaction = async (...args) => {
    attempts++;

    if (attempts === 1) {
      throw Object.assign(new Error("Conflicto simulado"), {
        code: "P2034",
      });
    }

    return transaction(...args);
  };

  const result = await context.service.create(validDto);

  assert.equal(result.id, 10);
  assert.equal(attempts, 2);
  assert.equal(context.creations(), 1);
});

test("limita a tres intentos los conflictos P2034 persistentes", async () => {
  const context = prepare();
  let attempts = 0;

  context.prisma.$transaction = async () => {
    attempts++;

    throw Object.assign(new Error("Conflicto simulado"), {
      code: "P2034",
    });
  };

  await assert.rejects(
    context.service.create(validDto),
    (error) => error.getStatus() === 409,
  );

  assert.equal(attempts, 3);
  assert.equal(context.creations(), 0);
});
