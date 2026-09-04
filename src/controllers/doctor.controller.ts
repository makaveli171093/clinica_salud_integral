import type { Request, Response } from "express";
import * as DoctorModel from "../models/doctor.model.js";

export async function handleGetAllDoctors(req: Request, res: Response) {
  /*  #swagger.tags = ['Médicos']
      #swagger.summary = 'Listar médicos'
      #swagger.parameters['specialty'] = {
        in: 'query',
        description: 'Filtrar por nombre de especialidad médica',
        type: 'string'
      }
      #swagger.security = [{ "bearerAuth": [] }]
  */
  try {
    const specialty = req.query.specialty as string | undefined;
    const isManager = req.user?.role === "GERENCIA";
    const doctors = await DoctorModel.getAllDoctors(specialty, isManager);
    res.json(doctors);
  } catch {
    res.status(500).json({ message: "Error al listar médicos" });
  }
}

export async function handleGetDoctorById(req: Request, res: Response) {
  /*  #swagger.tags = ['Médicos']
      #swagger.summary = 'Obtener médico por ID'
      #swagger.security = [{ "bearerAuth": [] }]
  */
  try {
    const id = Number(req.params.id);
    const doctor = await DoctorModel.getDoctorById(id);
    if (!doctor)
      return res.status(404).json({ message: "Médico no encontrado" });
    res.json(doctor);
  } catch {
    res.status(500).json({ message: "Error al consultar médico" });
  }
}

export async function handleCreateDoctor(req: Request, res: Response) {
  /*  #swagger.tags = ['Médicos']
      #swagger.summary = 'Registrar un médico'
      #swagger.security = [{ "bearerAuth": [] }]
      #swagger.parameters['body'] = {
        in: 'body',
        description: 'Datos del médico',
        required: true,
        schema: {
          firstName: 'David',
          lastName: 'Flores',
          specialtyId: 1,
          userId: 3
        }
      }
  */
  try {
    const doctor = await DoctorModel.createDoctor(req.body);
    res.status(201).json(doctor);
  } catch (error: any) {
    if (error.code === "P2003") {
      return res
        .status(404)
        .json({ message: "Especialidad o usuario asociado no existe" });
    }
    res.status(500).json({ message: "Error al registrar médico" });
  }
}

export async function handleUpdateDoctor(req: Request, res: Response) {
  /*  #swagger.tags = ['Médicos']
      #swagger.summary = 'Actualizar médico (PUT)'
      #swagger.security = [{ "bearerAuth": [] }]
      #swagger.parameters['body'] = {
        in: 'body',
        description: 'Datos a actualizar del médico',
        required: true,
        schema: {
          firstName: 'David',
          lastName: 'Flores Silva',
          specialtyId: 2,
          userId: null
        }
      }
  */
  try {
    const id = Number(req.params.id);
    const updated = await DoctorModel.updateDoctor(id, req.body);
    res.json(updated);
  } catch (error: any) {
    if (error.code === "P2025")
      return res.status(404).json({ message: "Médico no encontrado" });
    res.status(500).json({ message: "Error al actualizar médico" });
  }
}

export async function handleSoftDeleteDoctor(req: Request, res: Response) {
  /*  #swagger.tags = ['Médicos']
      #swagger.summary = 'Desactivar médico (Soft Delete)'
      #swagger.security = [{ "bearerAuth": [] }]
  */
  try {
    const id = Number(req.params.id);
    await DoctorModel.softDeleteDoctor(id);
    res.json({ message: "Médico desactivado correctamente (Soft Delete)" });
  } catch (error: any) {
    if (error.code === "P2025") {
      return res.status(404).json({ message: "Médico no encontrado" });
    }
    res.status(500).json({ message: "Error al desactivar médico" });
  }
}
