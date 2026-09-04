import type { Request, Response } from "express";
import * as PatientModel from "../models/patient.model.js";

export async function handleCreatePatient(req: Request, res: Response) {
  /*  #swagger.tags = ['Pacientes']
      #swagger.summary = 'Dar de alta un paciente'
      #swagger.security = [{ "bearerAuth": [] }]
      #swagger.parameters['body'] = {
        in: 'body',
        description: 'Datos del paciente',
        required: true,
        schema: {
          firstName: 'Carlos',
          lastName: 'Mendoza',
          email: 'carlos.mendoza@gmail.com',
          phone: '78945612',
          gender: 'MASCULINO',
          birthDate: '1990-05-15'
        }
      }
  */
  try {
    const patient = await PatientModel.createPatient(req.body);
    res.status(201).json(patient);
  } catch (error: any) {
    if (error.code === "P2002") {
      return res
        .status(409)
        .json({ message: "El correo electrónico ya se encuentra registrado" });
    }
    res.status(500).json({ message: "Error al registrar el paciente" });
  }
}

export async function handleGetAllPatients(req: Request, res: Response) {
  /*  #swagger.tags = ['Pacientes']
      #swagger.summary = 'Listar todos los pacientes'
      #swagger.security = [{ "bearerAuth": [] }]
  */
  try {
    const isManager = req.user?.role === "GERENCIA";
    const patients = await PatientModel.getAllPatients(isManager);
    res.json(patients);
  } catch {
    res.status(500).json({ message: "Error al obtener pacientes" });
  }
}

export async function handleGetPatientById(req: Request, res: Response) {
  /*  #swagger.tags = ['Pacientes']
      #swagger.summary = 'Consultar expediente de paciente con citas'
      #swagger.security = [{ "bearerAuth": [] }]
  */
  try {
    const id = Number(req.params.id);
    const isManager = req.user?.role === "GERENCIA";
    const patient = await PatientModel.getPatientById(id, isManager);

    if (!patient) {
      return res.status(404).json({ message: "Paciente no encontrado" });
    }

    res.json(patient);
  } catch {
    res.status(500).json({ message: "Error al consultar expediente" });
  }
}

export async function handleUpdatePatient(req: Request, res: Response) {
  /*  #swagger.tags = ['Pacientes']
      #swagger.summary = 'Actualizar datos de paciente (PUT)'
      #swagger.security = [{ "bearerAuth": [] }]
      #swagger.parameters['body'] = {
        in: 'body',
        description: 'Datos actualizables del paciente',
        required: true,
        schema: {
          firstName: 'Carlos Alberto',
          lastName: 'Mendoza',
          email: 'carlos.mendoza.nuevo@gmail.com',
          phone: '78945699',
          gender: 'MASCULINO',
          birthDate: '1990-05-15'
        }
      }
  */
  try {
    const id = Number(req.params.id);
    const updated = await PatientModel.updatePatient(id, req.body);
    res.json(updated);
  } catch (error: any) {
    if (error.code === "P2025")
      return res.status(404).json({ message: "Paciente no encontrado" });
    if (error.code === "P2002")
      return res.status(409).json({ message: "El correo ya está en uso" });
    res.status(500).json({ message: "Error al actualizar paciente" });
  }
}

export async function handleSoftDeletePatient(req: Request, res: Response) {
  /*  #swagger.tags = ['Pacientes']
      #swagger.summary = 'Desactivar paciente (Soft Delete)'
      #swagger.security = [{ "bearerAuth": [] }]
  */
  try {
    const id = Number(req.params.id);
    await PatientModel.softDeletePatient(id);
    res.json({ message: "Paciente desactivado correctamente (Soft Delete)" });
  } catch (error: any) {
    if (error.code === "P2025") {
      return res.status(404).json({ message: "Paciente no encontrado" });
    }
    res.status(500).json({ message: "Error al desactivar paciente" });
  }
}
