import prisma from "../config/prisma.js";

export function createPatient(data: {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  gender: "MASCULINO" | "FEMENINO" | "OTRO";
  birthDate: Date;
}) {
  return prisma.patient.create({ data });
}

export function getAllPatients(isManager: boolean = false) {
  return prisma.patient.findMany({
    where: isManager ? {} : { isActive: true },
    orderBy: { lastName: "asc" },
  });
}

export function getPatientById(id: number, isManager: boolean = false) {
  return prisma.patient.findFirst({
    where: {
      id,
      ...(isManager ? {} : { isActive: true }),
    },
    include: {
      appointments: {
        include: {
          doctor: {
            include: { specialty: true },
          },
        },
        orderBy: { scheduledAt: "desc" },
      },
    },
  });
}

export function updatePatient(id: number, data: any) {
  return prisma.patient.update({
    where: { id },
    data,
  });
}

export function softDeletePatient(id: number) {
  return prisma.patient.update({
    where: { id },
    data: { isActive: false },
  });
}
