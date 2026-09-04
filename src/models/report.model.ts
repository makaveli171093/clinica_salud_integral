import prisma from "../config/prisma.js";

export function getAppointmentsBySpecialty() {
  return prisma.$queryRaw<
    Array<{ specialty: string; total_appointments: number }>
  >`
    SELECT s.name AS specialty, COUNT(a.id)::int AS total_appointments
    FROM appointments a
    INNER JOIN doctors d ON d.id = a.doctor_id
    INNER JOIN specialties s ON s.id = d.specialty_id
    GROUP BY s.name
    ORDER BY total_appointments DESC
  `;
}

export function getDailyCutoff(date: string) {
  const startOfDay = new Date(`${date}T00:00:00.000Z`);
  const endOfDay = new Date(`${date}T23:59:59.999Z`);

  return prisma.appointment.groupBy({
    by: ["status"],
    where: {
      scheduledAt: { gte: startOfDay, lte: endOfDay },
      status: { in: ["COMPLETADA", "CANCELADA"] },
    },
    _count: { status: true },
  });
}
