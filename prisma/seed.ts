import prisma from "../src/config/prisma.js";
import bcrypt from "bcryptjs";

async function main() {
  console.log("Limpiando tablas anteriores...");
  await prisma.medicalConsultation.deleteMany();
  await prisma.medicalRecord.deleteMany();
  await prisma.appointment.deleteMany();
  await prisma.doctor.deleteMany();
  await prisma.specialty.deleteMany();
  await prisma.patient.deleteMany();
  await prisma.user.deleteMany();

  const passwordHash = await bcrypt.hash("Clinica123!", 10);

  // ==========================================
  // 1. ESPECIALIDADES MÉDICAS (8)
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
  // 2. USUARIOS ADMINISTRATIVOS (5)
  // ==========================================
  console.log("Insertando usuarios administrativos...");
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
      {
        email: "recepcion4@clinica.com",
        password: passwordHash,
        role: "RECEPCIONISTA",
      },
    ],
  });

  // ==========================================
  // 3. MÉDICOS Y CUENTAS VINCULADAS (20)
  // ==========================================
  console.log("Insertando médicos y enlazando cuentas...");
  const rawDoctors = [
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
      firstName: "Marcos",
      lastName: "Suárez",
      email: "dr.suarez.m@clinica.com",
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
      lastName: "Campero",
      email: "dr.campero@clinica.com",
      specId: geriatria.id,
    },
    {
      firstName: "Beatriz",
      lastName: "Cabrera",
      email: "dra.cabrera@clinica.com",
      specId: geriatria.id,
    },
    {
      firstName: "Irene",
      lastName: "Delgado",
      email: "dra.delgado@clinica.com",
      specId: geriatria.id,
    },
  ];

  const doctorsList = [];
  for (const doc of rawDoctors) {
    const user = await prisma.user.create({
      data: { email: doc.email, password: passwordHash, role: "MEDICO" },
    });

    const doctor = await prisma.doctor.create({
      data: {
        firstName: doc.firstName,
        lastName: doc.lastName,
        specialtyId: doc.specId,
        userId: user.id,
      },
    });

    doctorsList.push(doctor);
  }

  // ==========================================
  // 4. PACIENTES (40)
  // ==========================================
  console.log("Insertando pacientes...");
  const rawPatients = [
    // Pediátricos (< 16 años) [0 al 7]
    {
      firstName: "Mateo",
      lastName: "Vargas",
      email: "mateo.v@gmail.com",
      phone: "70100001",
      gender: "MASCULINO" as const,
      birthDate: new Date("2018-05-12"),
    },
    {
      firstName: "Camila",
      lastName: "Rojas",
      email: "camila.r@gmail.com",
      phone: "70100002",
      gender: "FEMENINO" as const,
      birthDate: new Date("2020-03-22"),
    },
    {
      firstName: "Lucas",
      lastName: "Mamani",
      email: "lucas.m@gmail.com",
      phone: "70100003",
      gender: "MASCULINO" as const,
      birthDate: new Date("2015-11-05"),
    },
    {
      firstName: "Valery",
      lastName: "Gutierrez",
      email: "valery.g@gmail.com",
      phone: "70100004",
      gender: "FEMENINO" as const,
      birthDate: new Date("2014-07-19"),
    },
    {
      firstName: "Emiliano",
      lastName: "Paz",
      email: "emiliano.p@gmail.com",
      phone: "70100005",
      gender: "MASCULINO" as const,
      birthDate: new Date("2022-01-30"),
    },
    {
      firstName: "Santiago",
      lastName: "Arias",
      email: "santiago.a@gmail.com",
      phone: "70100006",
      gender: "MASCULINO" as const,
      birthDate: new Date("2019-09-14"),
    },
    {
      firstName: "Mia",
      lastName: "Fernández",
      email: "mia.f@gmail.com",
      phone: "70100007",
      gender: "FEMENINO" as const,
      birthDate: new Date("2016-12-03"),
    },
    {
      firstName: "Joaquín",
      lastName: "Cabrera",
      email: "joaquin.c@gmail.com",
      phone: "70100008",
      gender: "MASCULINO" as const,
      birthDate: new Date("2017-04-27"),
    },

    // Mujeres adultas [8 al 19]
    {
      firstName: "Lucía",
      lastName: "Morales",
      email: "lucia.m@gmail.com",
      phone: "70200001",
      gender: "FEMENINO" as const,
      birthDate: new Date("1995-04-12"),
    },
    {
      firstName: "Gabriela",
      lastName: "Díaz",
      email: "gabriela.d@gmail.com",
      phone: "70200002",
      gender: "FEMENINO" as const,
      birthDate: new Date("1988-09-15"),
    },
    {
      firstName: "Andrea",
      lastName: "Salas",
      email: "andrea.s@gmail.com",
      phone: "70200003",
      gender: "FEMENINO" as const,
      birthDate: new Date("1992-12-01"),
    },
    {
      firstName: "Paola",
      lastName: "Nuñez",
      email: "paola.n@gmail.com",
      phone: "70200004",
      gender: "FEMENINO" as const,
      birthDate: new Date("2000-06-18"),
    },
    {
      firstName: "Carla",
      lastName: "Ríos",
      email: "carla.r@gmail.com",
      phone: "70200005",
      gender: "FEMENINO" as const,
      birthDate: new Date("1985-02-14"),
    },
    {
      firstName: "Ximena",
      lastName: "Chávez",
      email: "ximena.c@gmail.com",
      phone: "70200006",
      gender: "FEMENINO" as const,
      birthDate: new Date("1997-10-25"),
    },
    {
      firstName: "Daniela",
      lastName: "Fuentes",
      email: "daniela.f@gmail.com",
      phone: "70200007",
      gender: "FEMENINO" as const,
      birthDate: new Date("1991-03-08"),
    },
    {
      firstName: "Natalia",
      lastName: "Quispe",
      email: "natalia.q@gmail.com",
      phone: "70200008",
      gender: "FEMENINO" as const,
      birthDate: new Date("1989-08-11"),
    },
    {
      firstName: "Jessica",
      lastName: "Villanueva",
      email: "jessica.v@gmail.com",
      phone: "70200009",
      gender: "FEMENINO" as const,
      birthDate: new Date("1993-01-29"),
    },
    {
      firstName: "Lorena",
      lastName: "Montenegro",
      email: "lorena.m@gmail.com",
      phone: "70200010",
      gender: "FEMENINO" as const,
      birthDate: new Date("1986-11-17"),
    },
    {
      firstName: "Rocío",
      lastName: "Vallejos",
      email: "rocio.v@gmail.com",
      phone: "70200011",
      gender: "FEMENINO" as const,
      birthDate: new Date("1999-05-21"),
    },
    {
      firstName: "Fabiola",
      lastName: "Pérez",
      email: "fabiola.p@gmail.com",
      phone: "70200012",
      gender: "FEMENINO" as const,
      birthDate: new Date("1994-08-04"),
    },

    // Varones adultos [20 al 30]
    {
      firstName: "Carlos",
      lastName: "Mendoza",
      email: "carlos.m@gmail.com",
      phone: "70300001",
      gender: "MASCULINO" as const,
      birthDate: new Date("1982-01-20"),
    },
    {
      firstName: "Jorge",
      lastName: "Navarro",
      email: "jorge.n@gmail.com",
      phone: "70300002",
      gender: "MASCULINO" as const,
      birthDate: new Date("1978-06-30"),
    },
    {
      firstName: "Mauricio",
      lastName: "Soliz",
      email: "mauricio.s@gmail.com",
      phone: "70300003",
      gender: "MASCULINO" as const,
      birthDate: new Date("1993-07-14"),
    },
    {
      firstName: "Alejandro",
      lastName: "Pardo",
      email: "alejandro.p@gmail.com",
      phone: "70300004",
      gender: "MASCULINO" as const,
      birthDate: new Date("1986-11-23"),
    },
    {
      firstName: "Sergio",
      lastName: "Cruz",
      email: "sergio.c@gmail.com",
      phone: "70300005",
      gender: "MASCULINO" as const,
      birthDate: new Date("1990-04-05"),
    },
    {
      firstName: "Diego",
      lastName: "Mercado",
      email: "diego.m@gmail.com",
      phone: "70300006",
      gender: "MASCULINO" as const,
      birthDate: new Date("1998-09-17"),
    },
    {
      firstName: "Andrés",
      lastName: "Zárate",
      email: "andres.z@gmail.com",
      phone: "70300007",
      gender: "MASCULINO" as const,
      birthDate: new Date("1980-03-12"),
    },
    {
      firstName: "Gabriel",
      lastName: "López",
      email: "gabriel.l@gmail.com",
      phone: "70300008",
      gender: "MASCULINO" as const,
      birthDate: new Date("1984-12-09"),
    },
    {
      firstName: "Hugo",
      lastName: "Alarcón",
      email: "hugo.a@gmail.com",
      phone: "70300009",
      gender: "MASCULINO" as const,
      birthDate: new Date("1992-06-25"),
    },
    {
      firstName: "Raúl",
      lastName: "Cárdenas",
      email: "raul.c@gmail.com",
      phone: "70300010",
      gender: "MASCULINO" as const,
      birthDate: new Date("1987-10-10"),
    },
    {
      firstName: "Mario",
      lastName: "Espinosa",
      email: "mario.e@gmail.com",
      phone: "70300011",
      gender: "MASCULINO" as const,
      birthDate: new Date("1995-02-18"),
    },

    // Adultos mayores (> 65 años) [31 al 36]
    {
      firstName: "Armando",
      lastName: "Romero",
      email: "armando.r@gmail.com",
      phone: "70400001",
      gender: "MASCULINO" as const,
      birthDate: new Date("1950-02-15"),
    },
    {
      firstName: "Teresa",
      lastName: "Cardozo",
      email: "teresa.c@gmail.com",
      phone: "70400002",
      gender: "FEMENINO" as const,
      birthDate: new Date("1955-08-20"),
    },
    {
      firstName: "Guillermo",
      lastName: "Villalba",
      email: "guillermo.v@gmail.com",
      phone: "70400003",
      gender: "MASCULINO" as const,
      birthDate: new Date("1948-11-10"),
    },
    {
      firstName: "Esperanza",
      lastName: "Mejía",
      email: "esperanza.m@gmail.com",
      phone: "70400004",
      gender: "FEMENINO" as const,
      birthDate: new Date("1952-04-03"),
    },
    {
      firstName: "Vicente",
      lastName: "Bravo",
      email: "vicente.b@gmail.com",
      phone: "70400005",
      gender: "MASCULINO" as const,
      birthDate: new Date("1945-09-28"),
    },
    {
      firstName: "Rosa",
      lastName: "Campos",
      email: "rosa.c@gmail.com",
      phone: "70400006",
      gender: "FEMENINO" as const,
      birthDate: new Date("1958-01-17"),
    },

    // Pacientes género OTRO [37 al 39]
    {
      firstName: "Alex",
      lastName: "Montero",
      email: "alex.m@gmail.com",
      phone: "70500001",
      gender: "OTRO" as const,
      birthDate: new Date("1996-05-18"),
    },
    {
      firstName: "René",
      lastName: "Silva",
      email: "rene.s@gmail.com",
      phone: "70500002",
      gender: "OTRO" as const,
      birthDate: new Date("1994-10-31"),
    },
    {
      firstName: "Ariel",
      lastName: "Luna",
      email: "ariel.l@gmail.com",
      phone: "70500003",
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
  // 5. HISTORIAS CLÍNICAS (PORTADAS)
  // ==========================================
  console.log("Creando portadas de historias clínicas para pacientes...");
  const bloodTypes = ["O+", "A+", "B+", "AB+", "O-"];

  for (let i = 0; i < patientsList.length; i++) {
    const patient = patientsList[i]!;
    await prisma.medicalRecord.create({
      data: {
        patientId: patient.id,
        bloodType: bloodTypes[i % bloodTypes.length]!,
        allergies:
          i % 3 === 0
            ? "Penicilina, Sulfas"
            : i % 5 === 0
              ? "Aspirina"
              : "Ninguna reportada",
        emergencyContact: `Familiar de ${patient.firstName}`,
        emergencyPhone: `799${String(10000 + i)}`,
        notes: `Historia clínica aperturada en admisión central. Paciente clasificado en sector ${i % 2 === 0 ? "A" : "B"}.`,
      },
    });
  }

  // ==========================================
  // 6. CITAS MÉDICAS
  // ==========================================
  console.log("Insertando citas pasadas y futuras sin solapamientos...");

  // Referencias a médicos por especialidad usando aserción no nula (!)
  const dCardio1 = doctorsList[0]!;
  const dCardio2 = doctorsList[1]!;
  const dPediatria1 = doctorsList[2]!;
  const dPediatria2 = doctorsList[3]!;
  const dGineco1 = doctorsList[5]!;
  const dGineco2 = doctorsList[6]!;
  const dUrologia1 = doctorsList[7]!;
  const dTrauma1 = doctorsList[9]!;
  const dTrauma2 = doctorsList[10]!;
  const dDerma1 = doctorsList[12]!;
  const dOftalmo1 = doctorsList[14]!;
  const dGeriatria1 = doctorsList[17]!;
  const dGeriatria2 = doctorsList[18]!;

  const appointmentsToCreate = [
    // --- CORTE DEL 2026-07-16 (Requerido en el brief) ---
    {
      patientId: patientsList[20]!.id, // Carlos Mendoza (Adulto)
      doctorId: dCardio1.id,
      scheduledAt: new Date("2026-07-16T08:30:00.000Z"),
      reason: "Evaluación cardiovascular anual",
      status: "COMPLETADA" as const,
    },
    {
      patientId: patientsList[8]!.id, // Lucía Morales (Mujer)
      doctorId: dGineco1.id,
      scheduledAt: new Date("2026-07-16T10:00:00.000Z"),
      reason: "Control prenatal",
      status: "ATENDIDO" as const,
    },
    {
      patientId: patientsList[0]!.id, // Mateo Vargas (Niño)
      doctorId: dPediatria1.id,
      scheduledAt: new Date("2026-07-16T11:30:00.000Z"),
      reason: "Control de peso y talla",
      status: "CANCELADA" as const,
    },
    {
      patientId: patientsList[21]!.id, // Jorge Navarro (Varón)
      doctorId: dUrologia1.id,
      scheduledAt: new Date("2026-07-16T14:30:00.000Z"),
      reason: "Chequeo prostático preventivo",
      status: "ATENDIDO" as const,
    },
    {
      patientId: patientsList[22]!.id, // Mauricio Soliz
      doctorId: dTrauma1.id,
      scheduledAt: new Date("2026-07-16T16:00:00.000Z"),
      reason: "Dolor en rodilla derecha",
      status: "COMPLETADA" as const,
    },

    // --- OTRAS CITAS PASADAS (Historiales y reportes) ---
    {
      patientId: patientsList[1]!.id, // Camila (Niña)
      doctorId: dPediatria1.id,
      scheduledAt: new Date("2026-06-10T09:00:00.000Z"),
      reason: "Fiebre persistente y tos seca",
      status: "ATENDIDO" as const,
    },
    {
      patientId: patientsList[2]!.id, // Lucas (Niño)
      doctorId: dPediatria2.id,
      scheduledAt: new Date("2026-06-12T10:30:00.000Z"),
      reason: "Gastroenteritis aguda",
      status: "ATENDIDO" as const,
    },
    {
      patientId: patientsList[9]!.id, // Gabriela Díaz (Mujer)
      doctorId: dGineco2.id,
      scheduledAt: new Date("2026-06-15T09:00:00.000Z"),
      reason: "Ecografía pélvica de rutina",
      status: "ATENDIDO" as const,
    },
    {
      patientId: patientsList[10]!.id, // Andrea Salas (Mujer)
      doctorId: dGineco1.id,
      scheduledAt: new Date("2026-06-18T15:00:00.000Z"),
      reason: "Consulta de planificación familiar",
      status: "CANCELADA" as const,
    },
    {
      patientId: patientsList[23]!.id, // Alejandro Pardo (Adulto)
      doctorId: dCardio2.id,
      scheduledAt: new Date("2026-06-20T08:00:00.000Z"),
      reason: "Palpitaciones frecuentes",
      status: "COMPLETADA" as const,
    },
    {
      patientId: patientsList[24]!.id, // Sergio Cruz (Adulto)
      doctorId: dTrauma2.id,
      scheduledAt: new Date("2026-06-22T11:00:00.000Z"),
      reason: "Esguince de muñeca por caída",
      status: "ATENDIDO" as const,
    },
    {
      patientId: patientsList[11]!.id, // Paola Nuñez (Mujer)
      doctorId: dDerma1.id,
      scheduledAt: new Date("2026-06-25T16:00:00.000Z"),
      reason: "Dermatitis por contacto",
      status: "ATENDIDO" as const,
    },
    {
      patientId: patientsList[31]!.id, // Armando Romero (Adulto mayor)
      doctorId: dGeriatria1.id,
      scheduledAt: new Date("2026-06-28T09:30:00.000Z"),
      reason: "Control geriátrico por artritis",
      status: "ATENDIDO" as const,
    },
    {
      patientId: patientsList[32]!.id, // Teresa Cardozo (Adulta mayor)
      doctorId: dGeriatria2.id,
      scheduledAt: new Date("2026-07-02T10:00:00.000Z"),
      reason: "Revisión de polifarmacia",
      status: "COMPLETADA" as const,
    },
    {
      patientId: patientsList[37]!.id, // Alex Montero (Género Otro)
      doctorId: dOftalmo1.id,
      scheduledAt: new Date("2026-07-05T15:30:00.000Z"),
      reason: "Disminución progresiva de agudeza visual",
      status: "ATENDIDO" as const,
    },

    // --- CITAS FUTURAS (Estado PROGRAMADA) ---
    {
      patientId: patientsList[20]!.id, // Carlos Mendoza
      doctorId: dCardio1.id,
      scheduledAt: new Date("2026-10-10T09:00:00.000Z"),
      reason: "Prueba de esfuerzo programada",
      status: "PROGRAMADA" as const,
    },
    {
      patientId: patientsList[8]!.id, // Lucía Morales
      doctorId: dGineco1.id,
      scheduledAt: new Date("2026-10-10T10:30:00.000Z"),
      reason: "Control mensual de embarazo",
      status: "PROGRAMADA" as const,
    },
    {
      patientId: patientsList[3]!.id, // Valery (Niña)
      doctorId: dPediatria1.id,
      scheduledAt: new Date("2026-10-11T14:00:00.000Z"),
      reason: "Control de asma estacional",
      status: "PROGRAMADA" as const,
    },
    {
      patientId: patientsList[25]!.id, // Diego Mercado (Adulto)
      doctorId: dUrologia1.id,
      scheduledAt: new Date("2026-10-12T08:30:00.000Z"),
      reason: "Evaluación urológica de rutina",
      status: "PROGRAMADA" as const,
    },
    {
      patientId: patientsList[33]!.id, // Guillermo Villalba (Adulto mayor)
      doctorId: dGeriatria1.id,
      scheduledAt: new Date("2026-10-15T11:00:00.000Z"),
      reason: "Monitoreo cognitivo semestral",
      status: "PROGRAMADA" as const,
    },
  ];

  const createdAppointments = [];
  for (const app of appointmentsToCreate) {
    const createdApp = await prisma.appointment.create({ data: app });
    createdAppointments.push(createdApp);
  }

  // ==========================================
  // 7. ATENCIONES MÉDICAS (DATOS SENSIBLES)
  // ==========================================
  console.log(
    "Insertando atenciones médicas para las citas en estado ATENDIDO...",
  );

  // Obtenemos las historias clínicas para asociarlas a las atenciones
  const medicalRecords = await prisma.medicalRecord.findMany();
  const recordMap = new Map<number, number>();
  for (const mr of medicalRecords) {
    recordMap.set(mr.patientId, mr.id);
  }

  // Consultas sensibles detalladas
  const consultationsData = [
    {
      appIndex: 1, // Cita de Lucía Morales con Dra. Ana Ríos (Gineco)
      symptoms:
        "Paciente en segundo trimestre de gestación refiere leves molestias lumbares y náuseas matutinas ocasionales.",
      diagnosis:
        "Embarazo normoevolutivo de 24 semanas sin signos de alarma obstétrica.",
      studiesRequested: "Ecografía morfológica y analítica completa de orina.",
      prescription:
        "Hierro elemental 60mg/día, Ácido fólico 5mg/día, Paracetamol 500mg condicionado a dolor lumbar.",
    },
    {
      appIndex: 3, // Cita de Jorge Navarro con Dr. Gonzalo Morales (Urología)
      symptoms:
        "Dificultad leve para iniciar la micción y nicturia en dos ocasiones por noche.",
      diagnosis: "Hiperplasia prostática benigna grado I.",
      studiesRequested:
        "Antígeno Prostático Específico (PSA) total y libre, Ecografía vesicoprostática pre y postmiccional.",
      prescription: "Tamsulosina 0.4mg una cápsula diaria por la noche.",
    },
    {
      appIndex: 5, // Cita de Camila Rojas con Dr. Carlos Sánchez (Pediatría)
      symptoms:
        "Fiebre de 38.5°C de 48 horas de evolución, congestión nasal y tos seca nocturna.",
      diagnosis: "Rinofaringitis aguda de probable etiología viral.",
      studiesRequested:
        "Hemograma completo si la fiebre persiste más de 72 horas.",
      prescription:
        "Paracetamol jarabe (120mg/5ml) 5ml cada 6 horas por fiebre, lavados nasales con solución fisiológica.",
    },
    {
      appIndex: 6, // Cita de Lucas Mamani con Dra. Mariana Torres (Pediatría)
      symptoms:
        "Dolor abdominal tipo cólico difuso y tres deposiciones diarreicas sin sangre.",
      diagnosis: "Gastroenteritis aguda sin deshidratación aparente.",
      studiesRequested: "Coprocultivo y examen parasitológico seriado.",
      prescription:
        "Sales de rehidratación oral a libre demanda, Probióticos en sobres cada 12 horas por 5 días.",
    },
    {
      appIndex: 7, // Cita de Gabriela Díaz con Dra. Patricia Vega (Gineco)
      symptoms: "Acude para ecografía pélvica de rutina. Asintomática.",
      diagnosis: "Aparato reproductor sin alteraciones ecográficas visibles.",
      studiesRequested: "Papanicolaou para control anual.",
      prescription: "Mantener hábitos higiénicos y control anual preventivo.",
    },
    {
      appIndex: 10, // Cita de Sergio Cruz con Dra. Lucía Molina (Trauma)
      symptoms:
        "Edema moderado y dolor focalizado en cara externa de muñeca tras apoyo forzado.",
      diagnosis: "Esguince de muñeca grado I.",
      studiesRequested:
        "Radiografía de muñeca frente y perfil para descartar fisura en escafoides.",
      prescription:
        "Ibuprofeno 400mg cada 8 horas con las comidas por 5 días, inmovilización con férula elástica por 7 días.",
    },
    {
      appIndex: 11, // Cita de Paola Nuñez con Dra. Claudia Herrera (Dermatología)
      symptoms:
        "Lesiones eritematosas pruriginosas en ambas manos tras uso continuo de detergente.",
      diagnosis: "Dermatitis por contacto irritativa.",
      studiesRequested: "Ninguno por el momento.",
      prescription:
        "Betametasona crema 0.05% aplicar capa fina cada 12 horas por 7 días, emoliente humectante continuo.",
    },
    {
      appIndex: 12, // Cita de Armando Romero con Dr. Hugo Campero (Geriatría)
      symptoms:
        "Rigidez matutina en manos y rodillas mayor a 30 minutos, dolor al deambular distancias medias.",
      diagnosis:
        "Gonartrosis bilateral y osteoartritis en articulaciones interfalángicas.",
      studiesRequested:
        "Proteína C Reactiva, Factor Reumatoide y Radiografía bilateral de rodillas en bipedestación.",
      prescription:
        "Celecoxib 200mg cada 24 horas por 10 días, derivación a Fisioterapia y Rehabilitación.",
    },
    {
      appIndex: 14, // Cita de Alex Montero con Dr. Rodrigo Mendoza (Oftalmo)
      symptoms:
        "Visión borrosa lejana progresiva y cefalea frontal tras trabajo prolongado frente al computador.",
      diagnosis: "Miopía simple leve (-1.25 D) y astenopía acomodativa.",
      studiesRequested: "Campimetría visual y fondo de ojo.",
      prescription:
        "Prescripción de lentes correctores con filtro azul, Lágrimas artificiales 1 gota cada 4 horas.",
    },
  ];

  for (const c of consultationsData) {
    const appointment = createdAppointments[c.appIndex]!;
    const medicalRecordId = recordMap.get(appointment.patientId);

    if (medicalRecordId) {
      await prisma.medicalConsultation.create({
        data: {
          medicalRecordId,
          doctorId: appointment.doctorId,
          appointmentId: appointment.id,
          symptoms: c.symptoms,
          diagnosis: c.diagnosis,
          studiesRequested: c.studiesRequested,
          prescription: c.prescription,
          consultationDate: appointment.scheduledAt,
        },
      });
    }
  }

  console.log("============================================================");
  console.log("SEED EJECUTADO EXITOSAMENTE");
  console.log(" - 8 Especialidades configuradas.");
  console.log(
    " - 25 Cuentas de usuario creadas (Contraseña unificada: Clinica123!)",
  );
  console.log(" - 20 Médicos vinculados 1:1 a sus usuarios.");
  console.log(" - 40 Pacientes registrados.");
  console.log(" - 40 Historias clínicas con portadas administrativas.");
  console.log(
    " - 20 Citas programadas / completadas / atendidas / canceladas.",
  );
  console.log(" - 9 Atenciones médicas (consultas clínicas sensibles).");
  console.log("============================================================");
}

main()
  .catch((e) => {
    console.error("Error al ejecutar seed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
