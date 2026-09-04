import prisma from "../src/config/prisma.js";
import bcrypt from "bcryptjs";

async function main() {
  await prisma.appointment.deleteMany();
  await prisma.doctor.deleteMany();
  await prisma.specialty.deleteMany();
  await prisma.patient.deleteMany();
  await prisma.user.deleteMany();

  const passwordHash = await bcrypt.hash("Clinica123!", 10);

  // Usuarios base
  const gerenciaUser = await prisma.user.create({
    data: {
      email: "gerencia@clinica.com",
      password: passwordHash,
      role: "GERENCIA",
    },
  });

  const recepcionUser = await prisma.user.create({
    data: {
      email: "recepcion@clinica.com",
      password: passwordHash,
      role: "RECEPCIONISTA",
    },
  });

  const medicoUser1 = await prisma.user.create({
    data: {
      email: "dr.perez@clinica.com",
      password: passwordHash,
      role: "MEDICO",
    },
  });

  const medicoUser2 = await prisma.user.create({
    data: {
      email: "dra.rios@clinica.com",
      password: passwordHash,
      role: "MEDICO",
    },
  });

  // Especialidades con restricciones
  const cardiologia = await prisma.specialty.create({
    data: {
      name: "Cardiología",
      allowedGender: "TODOS",
      minAge: null,
      maxAge: null,
    },
  });

  const pediatria = await prisma.specialty.create({
    data: {
      name: "Pediatría",
      allowedGender: "TODOS",
      minAge: null,
      maxAge: 16,
    },
  });

  const ginecologia = await prisma.specialty.create({
    data: {
      name: "Ginecología",
      allowedGender: "FEMENINO",
      minAge: 12,
      maxAge: null,
    },
  });

  // Médicos vinculados a usuarios
  await prisma.doctor.create({
    data: {
      firstName: "Roberto",
      lastName: "Pérez",
      specialtyId: cardiologia.id,
      userId: medicoUser1.id,
    },
  });

  await prisma.doctor.create({
    data: {
      firstName: "Ana",
      lastName: "Ríos",
      specialtyId: ginecologia.id,
      userId: medicoUser2.id,
    },
  });

  await prisma.doctor.create({
    data: {
      firstName: "Carlos",
      lastName: "Sánchez",
      specialtyId: pediatria.id,
    },
  });

  // Pacientes de prueba
  await prisma.patient.create({
    data: {
      firstName: "Lucía",
      lastName: "Morales",
      email: "lucia@gmail.com",
      phone: "78912345",
      gender: "FEMENINO",
      birthDate: new Date("1995-04-12"),
    },
  });

  await prisma.patient.create({
    data: {
      firstName: "Mateo",
      lastName: "Gómez",
      email: "mateo@gmail.com",
      phone: "78954321",
      gender: "MASCULINO",
      birthDate: new Date("2015-08-20"),
    },
  });

  console.log("Seed ejecutado con éxito.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
