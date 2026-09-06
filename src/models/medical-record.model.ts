import prisma from "../config/prisma.js";

export function getMedicalRecordByPatientId(
  patientId: number,
  includeSensitiveData: boolean,
) {
  return prisma.medicalRecord.findUnique({
    where: { patientId },
    include: {
      patient: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          birthDate: true,
          gender: true,
          phone: true,
          // Las citas confirmadas / completadas / atendidas las puede ver recepción para control de turnos
          appointments: {
            where: { status: { in: ["COMPLETADA", "ATENDIDO"] } },
            orderBy: { scheduledAt: "desc" },
            select: {
              id: true,
              scheduledAt: true,
              status: true,
              doctor: {
                select: { firstName: true, lastName: true, specialty: true },
              },
            },
          },
        },
      },
      // DATOS SENSIBLES: solo si es MEDICO o GERENCIA
      consultations: includeSensitiveData
        ? {
            orderBy: { consultationDate: "desc" },
            include: {
              doctor: { select: { firstName: true, lastName: true } },
            },
          }
        : false,
    },
  });
}

// Crear o actualizar la portada de la historia clínica
export function upsertMedicalRecord(patientId: number, data: any) {
  return prisma.medicalRecord.upsert({
    where: { patientId },
    create: { patientId, ...data },
    update: data,
  });
}

// Registrar una atención médica y opcionalmente marcar la cita como ATENDIDO
export function createConsultation(data: {
  medicalRecordId: number;
  doctorId: number;
  appointmentId?: number;
  symptoms: string;
  diagnosis: string;
  studiesRequested?: string;
  prescription?: string;
}) {
  return prisma.$transaction(async (tx) => {
    const consultation = await tx.medicalConsultation.create({ data });

    if (data.appointmentId) {
      await tx.appointment.update({
        where: { id: data.appointmentId },
        data: { status: "ATENDIDO" },
      });
    }

    return consultation;
  });
}
