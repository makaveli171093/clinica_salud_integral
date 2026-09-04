import prisma from "../config/prisma.js";

export function getAllDoctors(
  specialtyName?: string,
  isManager: boolean = false,
) {
  return prisma.doctor.findMany({
    where: {
      ...(isManager ? {} : { isActive: true, specialty: { isActive: true } }),
      ...(specialtyName
        ? {
            specialty: { name: { equals: specialtyName, mode: "insensitive" } },
          }
        : {}),
    },
    include: { specialty: true },
    orderBy: { lastName: "asc" },
  });
}

export function getDoctorById(id: number) {
  return prisma.doctor.findUnique({
    where: { id },
    include: { specialty: true },
  });
}

export function getDoctorByUserId(userId: number) {
  return prisma.doctor.findUnique({
    where: { userId },
  });
}

export function createDoctor(data: {
  firstName: string;
  lastName: string;
  specialtyId: number;
  userId?: number;
}) {
  return prisma.doctor.create({ data });
}

export function updateDoctor(id: number, data: any) {
  return prisma.doctor.update({
    where: { id },
    data,
  });
}

export function softDeleteDoctor(id: number) {
  return prisma.doctor.update({
    where: { id },
    data: { isActive: false },
  });
}
