import type { Request, Response } from "express";
import * as AppointmentModel from "../models/appointment.model.js";
import * as PatientModel from "../models/patient.model.js";
import * as DoctorModel from "../models/doctor.model.js";
import { calculateAge } from "../utils/date.util.js";

export async function handleCreateAppointment(req: Request, res: Response) {
  /*  #swagger.tags = ['Citas']
      #swagger.summary = 'Programar nueva cita'
      #swagger.security = [{ "bearerAuth": [] }]
      #swagger.parameters['body'] = {
        in: 'body',
        description: 'Datos de la cita a programar',
        required: true,
        schema: {
          patientId: 1,
          doctorId: 1,
          scheduledAt: '2026-10-15T10:30:00.000Z',
          reason: 'Control anual'
        }
      }
  */
  try {
    const { patientId, doctorId, scheduledAt, reason } = req.body;
    const appointmentDate = new Date(scheduledAt);

    const existingAppointment =
      await AppointmentModel.findExistingDoctorAppointment(
        doctorId,
        appointmentDate,
      );
    if (existingAppointment) {
      return res.status(409).json({
        message:
          "Conflicto de horario: El médico ya tiene una cita programada en la fecha y hora seleccionada.",
      });
    }

    const patient = await PatientModel.getPatientById(patientId, false);
    if (!patient) {
      return res
        .status(404)
        .json({ message: "El paciente no existe o se encuentra inactivo" });
    }

    const doctor = await DoctorModel.getDoctorById(doctorId);
    if (!doctor || !doctor.isActive || !doctor.specialty.isActive) {
      return res.status(404).json({
        message: "El médico o su especialidad no se encuentran activos",
      });
    }

    const { specialty } = doctor;

    if (
      // Control de Género
      specialty.allowedGender !== "TODOS" &&
      patient.gender !== specialty.allowedGender
    ) {
      return res.status(400).json({
        message: `Restricción clínica: La especialidad ${specialty.name} solo admite pacientes de género ${specialty.allowedGender}`,
      });
    }

    // Control de Edad
    const patientAge = calculateAge(
      new Date(patient.birthDate),
      appointmentDate,
    );
    if (specialty.minAge !== null && patientAge < specialty.minAge) {
      return res.status(400).json({
        message: `Restricción clínica: La especialidad ${specialty.name} requiere una edad mínima de ${specialty.minAge} años (Edad del paciente: ${patientAge} años)`,
      });
    }

    if (specialty.maxAge !== null && patientAge > specialty.maxAge) {
      return res.status(400).json({
        message: `Restricción clínica: La especialidad ${specialty.name} solo admite pacientes de hasta ${specialty.maxAge} años (Edad del paciente: ${patientAge} años)`,
      });
    }

    const appointment = await AppointmentModel.createAppointment({
      patientId,
      doctorId,
      scheduledAt: appointmentDate,
      reason,
    });

    res.status(201).json(appointment);
  } catch {
    res.status(500).json({ message: "Error al agendar la cita" });
  }
}

export async function handleGetAppointmentById(req: Request, res: Response) {
  /*  #swagger.tags = ['Citas']
      #swagger.summary = 'Consultar cita por ID'
      #swagger.security = [{ "bearerAuth": [] }]
  */
  try {
    const id = Number(req.params.id);
    const appointment = await AppointmentModel.getAppointmentById(id);
    if (!appointment)
      return res.status(404).json({ message: "Cita no encontrada" });
    res.json(appointment);
  } catch {
    res.status(500).json({ message: "Error al consultar cita" });
  }
}

export async function handleGetDoctorAgenda(req: Request, res: Response) {
  /*  #swagger.tags = ['Citas']
      #swagger.summary = 'Consultar agenda del médico por rango de fechas'
      #swagger.security = [{ "bearerAuth": [] }]
      #swagger.parameters['from'] = { in: 'query', type: 'string', description: 'Fecha inicio (YYYY-MM-DD)' }
      #swagger.parameters['to'] = { in: 'query', type: 'string', description: 'Fecha fin (YYYY-MM-DD)' }
  */
  try {
    const doctorId = Number(req.params.id);
    const { from, to } = req.query;

    // Reto Extra: Ownership para rol MEDICO
    if (req.user?.role === "MEDICO") {
      const assignedDoctor = await DoctorModel.getDoctorByUserId(req.user.id);
      if (!assignedDoctor || assignedDoctor.id !== doctorId) {
        return res
          .status(403)
          .json({ message: "No puedes consultar la agenda de otro médico" });
      }
    }

    const fromDate = from ? new Date(from as string) : undefined;
    const toDate = to ? new Date(to as string) : undefined;

    const appointments = await AppointmentModel.getDoctorAgenda(
      doctorId,
      fromDate,
      toDate,
    );
    res.json(appointments);
  } catch {
    res
      .status(500)
      .json({ message: "Error al consultar la agenda del médico" });
  }
}

export async function handleUpdateAppointmentStatus(
  req: Request,
  res: Response,
) {
  /*  #swagger.tags = ['Citas']
      #swagger.summary = 'Actualizar estado de la cita (PATCH)'
      #swagger.security = [{ "bearerAuth": [] }]
      #swagger.parameters['body'] = {
        in: 'body',
        description: 'Nuevo estado de la cita',
        required: true,
        schema: {
          status: 'COMPLETADA o CANCELADA'
        }
      }
  */
  try {
    const id = Number(req.params.id);
    const { status } = req.body;

    // Reto Extra: Ownership en cambio de estado
    if (req.user?.role === "MEDICO") {
      const appointment = await AppointmentModel.getAppointmentById(id);
      if (!appointment) {
        return res.status(404).json({ message: "Cita no encontrada" });
      }

      const assignedDoctor = await DoctorModel.getDoctorByUserId(req.user.id);
      if (!assignedDoctor || appointment.doctorId !== assignedDoctor.id) {
        return res
          .status(403)
          .json({ message: "Solo puedes modificar citas que te correspondan" });
      }
    }

    const updated = await AppointmentModel.updateAppointmentStatus(id, status);
    res.json(updated);
  } catch (error: any) {
    if (error.code === "P2025") {
      return res.status(404).json({ message: "Cita no encontrada" });
    }
    res.status(500).json({ message: "Error al actualizar estado de la cita" });
  }
}

export async function handleUpdateAppointment(req: Request, res: Response) {
  /*  #swagger.tags = ['Citas']
      #swagger.summary = 'Reprogramar o modificar cita (PUT)'
      #swagger.security = [{ "bearerAuth": [] }]
      #swagger.parameters['body'] = {
        in: 'body',
        description: 'Datos a actualizar de la cita',
        required: true,
        schema: {
          scheduledAt: '2026-11-01T15:00:00.000Z',
          reason: 'Reprogramación por viaje'
        }
      }
  */
  try {
    const id = Number(req.params.id);
    const { scheduledAt, reason } = req.body;

    const currentAppointment = await AppointmentModel.getAppointmentById(id);
    if (!currentAppointment) {
      return res.status(404).json({ message: "Cita no encontrada" });
    }

    let appointmentDate: Date | undefined;
    const updateData: { scheduledAt?: Date; reason?: string } = {};
    if (scheduledAt) {
      appointmentDate = new Date(scheduledAt);

      // Comprobar que no choque con otra cita del mismo doctor
      const clash = await AppointmentModel.findExistingDoctorAppointment(
        currentAppointment.doctorId,
        appointmentDate,
        id, // excluimos la cita actual
      );

      if (clash) {
        return res.status(409).json({
          message:
            "Conflicto de horario: El médico ya tiene otra cita en la fecha y hora seleccionada.",
        });
      }
      updateData.scheduledAt = appointmentDate;
    }

    if (reason !== undefined) {
      updateData.reason = reason;
    }

    const updated = await AppointmentModel.updateAppointment(id, updateData);
    res.json(updated);
  } catch (error: any) {
    if (error.code === "P2025")
      return res.status(404).json({ message: "Cita no encontrada" });
    res.status(500).json({ message: "Error al actualizar cita" });
  }
}

export async function handleCancelAppointment(req: Request, res: Response) {
  /*  #swagger.tags = ['Citas']
      #swagger.summary = 'Cancelar cita médica'
      #swagger.security = [{ "bearerAuth": [] }]
  */
  try {
    const id = Number(req.params.id);
    await AppointmentModel.softDeleteAppointment(id);
    res.json({ message: "Cita cancelada con éxito" });
  } catch (error: any) {
    if (error.code === "P2025")
      return res.status(404).json({ message: "Cita no encontrada" });
    res.status(500).json({ message: "Error al cancelar cita" });
  }
}
