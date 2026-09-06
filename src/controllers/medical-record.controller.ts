import type { Request, Response } from "express";
import * as MRModel from "../models/medical-record.model.js";

export async function handleGetPatientMedicalRecord(
  req: Request,
  res: Response,
) {
  try {
    const patientId = Number(req.params.patientId);

    // Regla de negocio: Recepcionistas NO ven consultas sensibles
    const canViewSensitiveData =
      req.user?.role === "MEDICO" || req.user?.role === "GERENCIA";

    const record = await MRModel.getMedicalRecordByPatientId(
      patientId,
      canViewSensitiveData,
    );
    if (!record) {
      return res.status(404).json({
        message: "El paciente aún no cuenta con historia clínica aperturada",
      });
    }

    res.json({
      roleViewer: req.user?.role,
      recordType: canViewSensitiveData
        ? "HISTORIA_CLINICA_COMPLETA"
        : "PORTADA_ADMINISTRATIVA",
      data: record,
    });
  } catch {
    res.status(500).json({ message: "Error al consultar historia clínica" });
  }
}

export async function handleCreateConsultation(req: Request, res: Response) {
  // Solo rol MEDICO puede asentar una atención médica
  try {
    const consultation = await MRModel.createConsultation(req.body);
    res.status(201).json({
      message: "Atención médica asentada y cita marcada como ATENDIDO",
      consultation,
    });
  } catch (error) {
    res.status(500).json({ message: "Error al registrar la atención médica" });
  }
}
