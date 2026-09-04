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
    const summary = {
      date,
      completadas: 0,
      canceladas: 0,
    };

    counts.forEach((entry) => {
      if (entry.status === "COMPLETADA")
        summary.completadas = entry._count.status;
      if (entry.status === "CANCELADA")
        summary.canceladas = entry._count.status;
    });

    res.json(summary);
  } catch {
    res.status(500).json({ message: "Error al generar el corte diario" });
  }
}
