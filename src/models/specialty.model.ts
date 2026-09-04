import prisma from "../config/prisma.js";

export function getAllSpecialties(isManager: boolean = false) {
  return prisma.specialty.findMany({
    where: isManager ? {} : { isActive: true },
    orderBy: { name: "asc" },
  });
}

export function createSpecialty(data: {
  name: string;
  allowedGender?: "TODOS" | "MASCULINO" | "FEMENINO";
  minAge?: number | null;
  maxAge?: number | null;
}) {
  return prisma.specialty.create({ data });
}

export function getSpecialtyById(id: number, isManager: boolean = false) {
  return prisma.specialty.findFirst({
    where: {
      id,
      ...(isManager ? {} : { isActive: true }),
    },
  });
}

export function updateSpecialty(id: number, data: any) {
  return prisma.specialty.update({
    where: { id },
    data,
  });
}

export function softDeleteSpecialty(id: number) {
  return prisma.specialty.update({
    where: { id },
    data: { isActive: false },
  });
}
