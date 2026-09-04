import prisma from "../config/prisma.js";

export function createAppointment(data: {
  patientId: number;
  doctorId: number;
  scheduledAt: Date;
  reason?: string;
}) {
  return prisma.appointment.create({ data });
}

export function getDoctorAgenda(doctorId: number, from?: Date, to?: Date) {
  return prisma.appointment.findMany({
    where: {
      doctorId,
      ...(from && to ? { scheduledAt: { gte: from, lte: to } } : {}),
    },
    include: { patient: true },
    orderBy: { scheduledAt: "asc" },
  });
}

export function getAppointmentById(id: number) {
  return prisma.appointment.findUnique({
    where: { id },
    include: { doctor: true },
  });
}

export function updateAppointmentStatus(
  id: number,
  status: "COMPLETADA" | "CANCELADA",
) {
  return prisma.appointment.update({
    where: { id },
    data: { status },
  });
}

export function updateAppointment(
  id: number,
  data: { scheduledAt?: Date; reason?: string },
) {
  return prisma.appointment.update({
    where: { id },
    data,
  });
}

export function softDeleteAppointment(id: number) {
  return prisma.appointment.update({
    where: { id },
    data: { status: "CANCELADA" },
  });
}
