import prisma from "../src/config/prisma.js";
import bcrypt from "bcryptjs";

async function main() {
  console.log("Limpiando base de datos previa...");
  await prisma.appointment.deleteMany();
  await prisma.doctor.deleteMany();
  await prisma.specialty.deleteMany();
  await prisma.patient.deleteMany();
  await prisma.user.deleteMany();

  const passwordHash = await bcrypt.hash("Clinica123!", 10);

  // ==========================================
  // 1. ESPECIALIDADES (8)
  // ==========================================
  console.log("Insertando especialidades...");
  const cardio = await prisma.specialty.create({
    data: {
      name: "Cardiología",
      allowedGender: "TODOS",
      minAge: 18,
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
  const gineco = await prisma.specialty.create({
    data: {
      name: "Ginecología",
      allowedGender: "FEMENINO",
      minAge: 12,
      maxAge: null,
    },
  });
  const urologia = await prisma.specialty.create({
    data: {
      name: "Urología",
      allowedGender: "MASCULINO",
      minAge: 18,
      maxAge: null,
    },
  });
  const trauma = await prisma.specialty.create({
    data: {
      name: "Traumatología",
      allowedGender: "TODOS",
      minAge: null,
      maxAge: null,
    },
  });
  const derma = await prisma.specialty.create({
    data: {
      name: "Dermatología",
      allowedGender: "TODOS",
      minAge: null,
      maxAge: null,
    },
  });
  const oftalmo = await prisma.specialty.create({
    data: {
      name: "Oftalmología",
      allowedGender: "TODOS",
      minAge: 5,
      maxAge: null,
    },
  });
  const geriatria = await prisma.specialty.create({
    data: {
      name: "Geriatría",
      allowedGender: "TODOS",
      minAge: 65,
      maxAge: null,
    },
  });

  // ==========================================
  // 2. USUARIOS ADMINISTRATIVOS (4)
  // ==========================================
  console.log("Insertando personal administrativo...");
  await prisma.user.create({
    data: {
      email: "gerencia@clinica.com",
      password: passwordHash,
      role: "GERENCIA",
    },
  });

  await prisma.user.createMany({
    data: [
      {
        email: "recepcion1@clinica.com",
        password: passwordHash,
        role: "RECEPCIONISTA",
      },
      {
        email: "recepcion2@clinica.com",
        password: passwordHash,
        role: "RECEPCIONISTA",
      },
      {
        email: "recepcion3@clinica.com",
        password: passwordHash,
        role: "RECEPCIONISTA",
      },
    ],
  });

  // ==========================================
  // 3. MÉDICOS Y SUS USUARIOS VINCULADOS (18)
  // ==========================================
  console.log("Insertando médicos y vinculando cuentas...");
  const doctorsData = [
    {
      firstName: "Roberto",
      lastName: "Pérez",
      email: "dr.perez@clinica.com",
      specId: cardio.id,
    },
    {
      firstName: "Elena",
      lastName: "Gómez",
      email: "dra.gomez@clinica.com",
      specId: cardio.id,
    },
    {
      firstName: "Carlos",
      lastName: "Sánchez",
      email: "dr.sanchez@clinica.com",
      specId: pediatria.id,
    },
    {
      firstName: "Mariana",
      lastName: "Torres",
      email: "dra.torres@clinica.com",
      specId: pediatria.id,
    },
    {
      firstName: "Sofía",
      lastName: "Castro",
      email: "dra.castro@clinica.com",
      specId: pediatria.id,
    },
    {
      firstName: "Ana",
      lastName: "Ríos",
      email: "dra.rios@clinica.com",
      specId: gineco.id,
    },
    {
      firstName: "Patricia",
      lastName: "Vega",
      email: "dra.vega@clinica.com",
      specId: gineco.id,
    },
    {
      firstName: "Gonzalo",
      lastName: "Morales",
      email: "dr.morales@clinica.com",
      specId: urologia.id,
    },
    {
      firstName: "Fernando",
      lastName: "Blanco",
      email: "dr.blanco@clinica.com",
      specId: urologia.id,
    },
    {
      firstName: "David",
      lastName: "Flores",
      email: "dr.flores@clinica.com",
      specId: trauma.id,
    },
    {
      firstName: "Lucía",
      lastName: "Molina",
      email: "dra.molina@clinica.com",
      specId: trauma.id,
    },
    {
      firstName: "Claudia",
      lastName: "Herrera",
      email: "dra.herrera@clinica.com",
      specId: derma.id,
    },
    {
      firstName: "Javier",
      lastName: "Ortiz",
      email: "dr.ortiz@clinica.com",
      specId: derma.id,
    },
    {
      firstName: "Rodrigo",
      lastName: "Mendoza",
      email: "dr.mendoza@clinica.com",
      specId: oftalmo.id,
    },
    {
      firstName: "Valeria",
      lastName: "Paredes",
      email: "dra.paredes@clinica.com",
      specId: oftalmo.id,
    },
    {
      firstName: "Esteban",
      lastName: "Aguirre",
      email: "dr.aguirre@clinica.com",
      specId: oftalmo.id,
    },
    {
      firstName: "Hugo",
      lastName: "Suárez",
      email: "dr.suarez@clinica.com",
      specId: geriatria.id,
    },
    {
      firstName: "Beatriz",
      lastName: "Cabrera",
      email: "dra.cabrera@clinica.com",
      specId: geriatria.id,
    },
  ];

  const doctorsList = [];

  for (const doc of doctorsData) {
    const user = await prisma.user.create({
      data: { email: doc.email, password: passwordHash, role: "MEDICO" },
    });

    const createdDoctor = await prisma.doctor.create({
      data: {
        firstName: doc.firstName,
        lastName: doc.lastName,
        specialtyId: doc.specId,
        userId: user.id,
      },
    });

    doctorsList.push(createdDoctor);
  }

  // ==========================================
  // 4. PACIENTES (30)
  // ==========================================
  console.log("Insertando pacientes con perfiles de edad variados...");
  const rawPatients = [
    // Pediátricos (< 16 años)
    {
      firstName: "Mateo",
      lastName: "Vargas",
      email: "mateo.v@gmail.com",
      phone: "70010001",
      gender: "MASCULINO" as const,
      birthDate: new Date("2018-05-12"),
    },
    {
      firstName: "Camila",
      lastName: "Rojas",
      email: "camila.r@gmail.com",
      phone: "70010002",
      gender: "FEMENINO" as const,
      birthDate: new Date("2020-03-22"),
    },
    {
      firstName: "Lucas",
      lastName: "Mamani",
      email: "lucas.m@gmail.com",
      phone: "70010003",
      gender: "MASCULINO" as const,
      birthDate: new Date("2015-11-05"),
    },
    {
      firstName: "Valery",
      lastName: "Gutierrez",
      email: "valery.g@gmail.com",
      phone: "70010004",
      gender: "FEMENINO" as const,
      birthDate: new Date("2014-07-19"),
    },
    {
      firstName: "Emiliano",
      lastName: "Paz",
      email: "emiliano.p@gmail.com",
      phone: "70010005",
      gender: "MASCULINO" as const,
      birthDate: new Date("2022-01-30"),
    },

    // Mujeres adultas (aptas para Ginecología, Cardio, Derma, etc.)
    {
      firstName: "Lucía",
      lastName: "Morales",
      email: "lucia.m@gmail.com",
      phone: "70020001",
      gender: "FEMENINO" as const,
      birthDate: new Date("1995-04-12"),
    },
    {
      firstName: "Gabriela",
      lastName: "Díaz",
      email: "gabriela.d@gmail.com",
      phone: "70020002",
      gender: "FEMENINO" as const,
      birthDate: new Date("1988-09-15"),
    },
    {
      firstName: "Andrea",
      lastName: "Salas",
      email: "andrea.s@gmail.com",
      phone: "70020003",
      gender: "FEMENINO" as const,
      birthDate: new Date("1992-12-01"),
    },
    {
      firstName: "Paola",
      lastName: "Nuñez",
      email: "paola.n@gmail.com",
      phone: "70020004",
      gender: "FEMENINO" as const,
      birthDate: new Date("2000-06-18"),
    },
    {
      firstName: "Carla",
      lastName: "Ríos",
      email: "carla.r@gmail.com",
      phone: "70020005",
      gender: "FEMENINO" as const,
      birthDate: new Date("1985-02-14"),
    },
    {
      firstName: "Ximena",
      lastName: "Chávez",
      email: "ximena.c@gmail.com",
      phone: "70020006",
      gender: "FEMENINO" as const,
      birthDate: new Date("1997-10-25"),
    },
    {
      firstName: "Daniela",
      lastName: "Fuentes",
      email: "daniela.f@gmail.com",
      phone: "70020007",
      gender: "FEMENINO" as const,
      birthDate: new Date("1991-03-08"),
    },
    {
      firstName: "Natalia",
      lastName: "Quispe",
      email: "natalia.q@gmail.com",
      phone: "70020008",
      gender: "FEMENINO" as const,
      birthDate: new Date("1989-08-11"),
    },

    // Varones adultos (aptos para Urología, Cardio, Derma, etc.)
    {
      firstName: "Carlos",
      lastName: "Mendoza",
      email: "carlos.m@gmail.com",
      phone: "70030001",
      gender: "MASCULINO" as const,
      birthDate: new Date("1982-01-20"),
    },
    {
      firstName: "Jorge",
      lastName: "Navarro",
      email: "jorge.n@gmail.com",
      phone: "70030002",
      gender: "MASCULINO" as const,
      birthDate: new Date("1978-06-30"),
    },
    {
      firstName: "Mauricio",
      lastName: "Soliz",
      email: "mauricio.s@gmail.com",
      phone: "70030003",
      gender: "MASCULINO" as const,
      birthDate: new Date("1993-07-14"),
    },
    {
      firstName: "Alejandro",
      lastName: "Pardo",
      email: "alejandro.p@gmail.com",
      phone: "70030004",
      gender: "MASCULINO" as const,
      birthDate: new Date("1986-11-23"),
    },
    {
      firstName: "Sergio",
      lastName: "Cruz",
      email: "sergio.c@gmail.com",
      phone: "70030005",
      gender: "MASCULINO" as const,
      birthDate: new Date("1990-04-05"),
    },
    {
      firstName: "Diego",
      lastName: "Mercado",
      email: "diego.m@gmail.com",
      phone: "70030006",
      gender: "MASCULINO" as const,
      birthDate: new Date("1998-09-17"),
    },
    {
      firstName: "Andrés",
      lastName: "Zárate",
      email: "andres.z@gmail.com",
      phone: "70030007",
      gender: "MASCULINO" as const,
      birthDate: new Date("1980-03-12"),
    },
    {
      firstName: "Gabriel",
      lastName: "López",
      email: "gabriel.l@gmail.com",
      phone: "70030008",
      gender: "MASCULINO" as const,
      birthDate: new Date("1984-12-09"),
    },

    // Adultos Mayores (> 65 años, aptos para Geriatría y generales)
    {
      firstName: "Armando",
      lastName: "Romero",
      email: "armando.r@gmail.com",
      phone: "70040001",
      gender: "MASCULINO" as const,
      birthDate: new Date("1950-02-15"),
    },
    {
      firstName: "Teresa",
      lastName: "Cardozo",
      email: "teresa.c@gmail.com",
      phone: "70040002",
      gender: "FEMENINO" as const,
      birthDate: new Date("1955-08-20"),
    },
    {
      firstName: "Guillermo",
      lastName: "Villalba",
      email: "guillermo.v@gmail.com",
      phone: "70040003",
      gender: "MASCULINO" as const,
      birthDate: new Date("1948-11-10"),
    },
    {
      firstName: "Esperanza",
      lastName: "Mejía",
      email: "esperanza.m@gmail.com",
      phone: "70040004",
      gender: "FEMENINO" as const,
      birthDate: new Date("1952-04-03"),
    },
    {
      firstName: "Vicente",
      lastName: "Bravo",
      email: "vicente.b@gmail.com",
      phone: "70040005",
      gender: "MASCULINO" as const,
      birthDate: new Date("1945-09-28"),
    },
    {
      firstName: "Rosa",
      lastName: "Campos",
      email: "rosa.c@gmail.com",
      phone: "70040006",
      gender: "FEMENINO" as const,
      birthDate: new Date("1958-01-17"),
    },

    // Pacientes género OTRO / Generales
    {
      firstName: "Alex",
      lastName: "Montero",
      email: "alex.m@gmail.com",
      phone: "70050001",
      gender: "OTRO" as const,
      birthDate: new Date("1996-05-18"),
    },
    {
      firstName: "René",
      lastName: "Silva",
      email: "rene.s@gmail.com",
      phone: "70050002",
      gender: "OTRO" as const,
      birthDate: new Date("1994-10-31"),
    },
    {
      firstName: "Ariel",
      lastName: "Luna",
      email: "ariel.l@gmail.com",
      phone: "70050003",
      gender: "OTRO" as const,
      birthDate: new Date("1999-07-07"),
    },
  ];

  const patientsList = [];
  for (const pat of rawPatients) {
    const createdPatient = await prisma.patient.create({ data: pat });
    patientsList.push(createdPatient);
  }

  // ==========================================
  // 5. CITAS (PASADAS Y FUTURAS)
  // ==========================================
  console.log("Insertando citas médicas respetando reglas clínicas...");

  // Referencias a médicos por especialidad
  const docCardio1 = doctorsList[0]!;
  const docPediatria1 = doctorsList[2]!;
  const docGineco1 = doctorsList[5]!;
  const docUrologia1 = doctorsList[7]!;
  const docTrauma1 = doctorsList[9]!;
  const docDerma1 = doctorsList[11]!;
  const docOftalmo1 = doctorsList[13]!;
  const docGeriatria1 = doctorsList[16]!;

  await prisma.appointment.createMany({
    data: [
      // ----------------------------------------------------
      // Corte Operativo del 2026-07-16 (Fecha requerida por la guía)
      // ----------------------------------------------------
      {
        patientId: patientsList[13]!.id, // Carlos Mendoza (Adulto)
        doctorId: docCardio1.id,
        scheduledAt: new Date("2026-07-16T09:00:00.000Z"),
        reason: "Evaluación post-esfuerzo",
        status: "COMPLETADA",
      },
      {
        patientId: patientsList[5]!.id, // Lucía Morales (Mujer)
        doctorId: docGineco1.id,
        scheduledAt: new Date("2026-07-16T10:30:00.000Z"),
        reason: "Chequeo ginecológico anual",
        status: "COMPLETADA",
      },
      {
        patientId: patientsList[0]!.id, // Mateo Vargas (Niño)
        doctorId: docPediatria1.id,
        scheduledAt: new Date("2026-07-16T14:00:00.000Z"),
        reason: "Control de vacunas",
        status: "CANCELADA",
      },
      {
        patientId: patientsList[14]!.id, // Jorge Navarro (Varón)
        doctorId: docUrologia1.id,
        scheduledAt: new Date("2026-07-16T16:00:00.000Z"),
        reason: "Consulta urológica preventiva",
        status: "COMPLETADA",
      },

      // ----------------------------------------------------
      // Otras citas pasadas (Historial clínico y reportes)
      // ----------------------------------------------------
      {
        patientId: patientsList[1]!.id, // Camila (Niña)
        doctorId: docPediatria1.id,
        scheduledAt: new Date("2026-07-10T08:30:00.000Z"),
        reason: "Fiebre persistente",
        status: "COMPLETADA",
      },
      {
        patientId: patientsList[2]!.id, // Lucas (Niño)
        doctorId: docPediatria1.id,
        scheduledAt: new Date("2026-07-12T11:00:00.000Z"),
        reason: "Dolor estomacal",
        status: "COMPLETADA",
      },
      {
        patientId: patientsList[6]!.id, // Gabriela Díaz (Mujer)
        doctorId: docGineco1.id,
        scheduledAt: new Date("2026-07-14T09:30:00.000Z"),
        reason: "Ecografía de rutina",
        status: "COMPLETADA",
      },
      {
        patientId: patientsList[7]!.id, // Andrea Salas (Mujer)
        doctorId: docGineco1.id,
        scheduledAt: new Date("2026-07-15T15:00:00.000Z"),
        reason: "Consulta preconcepcional",
        status: "CANCELADA",
      },
      {
        patientId: patientsList[15]!.id, // Mauricio Soliz (Adulto)
        doctorId: docTrauma1.id,
        scheduledAt: new Date("2026-07-18T10:00:00.000Z"),
        reason: "Esguince de tobillo derecho",
        status: "COMPLETADA",
      },
      {
        patientId: patientsList[8]!.id, // Paola Nuñez (Adulta)
        doctorId: docDerma1.id,
        scheduledAt: new Date("2026-07-20T11:30:00.000Z"),
        reason: "Revisión de manchas solares",
        status: "COMPLETADA",
      },
      {
        patientId: patientsList[21]!.id, // Armando Romero (Adulto Mayor)
        doctorId: docGeriatria1.id,
        scheduledAt: new Date("2026-07-22T08:00:00.000Z"),
        reason: "Control integral de la tercera edad",
        status: "COMPLETADA",
      },
      {
        patientId: patientsList[22]!.id, // Teresa Cardozo (Adulta Mayor)
        doctorId: docGeriatria1.id,
        scheduledAt: new Date("2026-07-25T10:00:00.000Z"),
        reason: "Manejo de hipertensión crónica",
        status: "COMPLETADA",
      },
      {
        patientId: patientsList[27]!.id, // Alex Montero (Género Otro)
        doctorId: docOftalmo1.id,
        scheduledAt: new Date("2026-07-28T16:30:00.000Z"),
        reason: "Examen de agudeza visual",
        status: "COMPLETADA",
      },

      // ----------------------------------------------------
      // Citas futuras (Estado PROGRAMADA para probar agendas)
      // ----------------------------------------------------
      {
        patientId: patientsList[13]!.id, // Carlos Mendoza
        doctorId: docCardio1.id,
        scheduledAt: new Date("2026-10-10T09:00:00.000Z"),
        reason: "Seguimiento cardiológico trimestral",
        status: "PROGRAMADA",
      },
      {
        patientId: patientsList[5]!.id, // Lucía Morales
        doctorId: docGineco1.id,
        scheduledAt: new Date("2026-10-10T11:00:00.000Z"),
        reason: "Seguimiento ginecológico",
        status: "PROGRAMADA",
      },
      {
        patientId: patientsList[3]!.id, // Valery (Niña)
        doctorId: docPediatria1.id,
        scheduledAt: new Date("2026-10-11T15:00:00.000Z"),
        reason: "Control de crecimiento y desarrollo",
        status: "PROGRAMADA",
      },
      {
        patientId: patientsList[16]!.id, // Alejandro Pardo
        doctorId: docUrologia1.id,
        scheduledAt: new Date("2026-10-12T10:00:00.000Z"),
        reason: "Revisión anual",
        status: "PROGRAMADA",
      },
    ],
  });

  console.log("------------------------------------------------------------");
  console.log("Seed completado exitosamente:");
  console.log(" - 8 Especialidades configuradas.");
  console.log(
    " - 22 Cuentas de usuario creadas (Contraseña general: Clinica123!)",
  );
  console.log(" - 18 Médicos asociados a sus respectivas cuentas.");
  console.log(" - 30 Pacientes creados.");
  console.log(" - Citas sembradas para corte diario, reportes y agendas.");
  console.log("------------------------------------------------------------");
}

main()
  .catch((e) => {
    console.error("Error al ejecutar seed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
