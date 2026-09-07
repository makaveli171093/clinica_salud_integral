import type { Request, Response } from "express";
import * as ReportModel from "../models/report.model.js";

export async function handleGetAppointmentsBySpecialty(
  _req: Request,
  res: Response,
) {
  /*  #swagger.tags = ['Reportes']
      #swagger.summary = 'Volumen total de citas por especialidad'
      #swagger.security = [{ "bearerAuth": [] }]
  */
  try {
    const report = await ReportModel.getAppointmentsBySpecialty();
    res.json(report);
  } catch {
    res
      .status(500)
      .json({ message: "Error al generar reporte de citas por especialidad" });
  }
}

export async function handleGetDailyCutoff(req: Request, res: Response) {
  /*  #swagger.tags = ['Reportes']
      #swagger.summary = 'Corte operativo de citas por fecha'
      #swagger.security = [{ "bearerAuth": [] }]
      #swagger.parameters['date'] = {
        in: 'query',
        description: 'Fecha en formato YYYY-MM-DD',
        required: true,
        type: 'string'
      }
  */
  try {
    const date = req.query.date as string;
    if (!date || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      return res
        .status(400)
        .json({ message: "Parámetro date obligatorio en formato YYYY-MM-DD" });
    }

    const counts = await ReportModel.getDailyCutoff(date);
    type DailyCutoffItem = Awaited<
      ReturnType<typeof ReportModel.getDailyCutoff>
    >[number];
    const summary = {
      date,
      completadas: 0,
      canceladas: 0,
      atendidas: 0,
    };

    counts.forEach((entry: DailyCutoffItem) => {
      if (entry.status === "COMPLETADA")
        summary.completadas = entry._count.status;
      if (entry.status === "CANCELADA")
        summary.canceladas = entry._count.status;
      if (entry.status === "ATENDIDO") summary.atendidas = entry._count.status;
    });

    res.json(summary);
  } catch {
    res.status(500).json({ message: "Error al generar el corte diario" });
  }
}

export async function handleGetBookedSchedule(req: Request, res: Response) {
  /*  #swagger.tags = ['Reportes']
      #swagger.summary = 'Horarios ocupados de citas por fecha y médico opcional'
      #swagger.security = [{ "bearerAuth": [] }]
      #swagger.parameters['date'] = {
        in: 'query',
        description: 'Fecha requerida (YYYY-MM-DD)',
        required: true,
        type: 'string'
      }
      #swagger.parameters['doctorId'] = {
        in: 'query',
        description: 'ID del médico para filtrar sus horarios (opcional)',
        required: false,
        type: 'integer'
      }
  */
  try {
    const date = req.query.date as string;
    const doctorId = req.query.doctorId
      ? Number(req.query.doctorId)
      : undefined;

    if (!date || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      return res
        .status(400)
        .json({ message: "Parámetro date obligatorio en formato YYYY-MM-DD" });
    }

    if (doctorId && isNaN(doctorId)) {
      return res
        .status(400)
        .json({ message: "doctorId debe ser un número válido" });
    }

    const appointments = await ReportModel.getBookedSlotsByDate(date, doctorId);

    const bookedSlots = appointments.map((app) => {
      const timeStr = app.scheduledAt.toISOString().substring(11, 16); // Formato HH:mm
      return {
        cita: app.id,
        time: timeStr,
        status: app.status,
        doctor: `Dr. ${app.doctor.firstName} ${app.doctor.lastName} (${app.doctor.specialty.name})`,
        patient: `${app.patient.firstName} ${app.patient.lastName}`,
      };
    });

    res.json({
      date,
      doctorId: doctorId || "TODOS",
      totalBooked: bookedSlots.length,
      slots: bookedSlots,
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error al consultar los horarios ocupados" });
  }
}
