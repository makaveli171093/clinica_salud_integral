import type { Request, Response } from "express";
import * as SpecialtyModel from "../models/specialty.model.js";

export async function handleCreateSpecialty(req: Request, res: Response) {
  /*  #swagger.tags = ['Especialidades']
      #swagger.summary = 'Crear nueva especialidad'
      #swagger.description = 'Registra una especialidad médica con restricciones clínicas opcionales de edad y género.'
      #swagger.security = [{ "bearerAuth": [] }]
      #swagger.parameters['body'] = {
        in: 'body',
        description: 'Datos de la especialidad',
        required: true,
        schema: {
          name: 'Ginecología',
          allowedGender: 'FEMENINO',
          minAge: 12,
          maxAge: null
        }
      }
  */
  try {
    const specialty = await SpecialtyModel.createSpecialty(req.body);
    res.status(201).json(specialty);
  } catch (error: any) {
    if (error.code === "P2002") {
      return res.status(409).json({ message: "La especialidad ya existe" });
    }
    res.status(500).json({ message: "Error al crear especialidad" });
  }
}

export async function handleGetAllSpecialties(req: Request, res: Response) {
  /*  #swagger.tags = ['Especialidades']
      #swagger.summary = 'Listar especialidades'
      #swagger.description = 'Retorna las especialidades. Gerencia visualiza activas e inactivas; los demás roles solo ven las activas.'
      #swagger.security = [{ "bearerAuth": [] }]
  */
  try {
    const isManager = req.user?.role === "GERENCIA";
    const specialties = await SpecialtyModel.getAllSpecialties(isManager);
    res.json(specialties);
  } catch {
    res.status(500).json({ message: "Error al listar especialidades" });
  }
}

export async function handleGetSpecialtyById(req: Request, res: Response) {
  /*  #swagger.tags = ['Especialidades']
      #swagger.summary = 'Obtener especialidad por ID'
      #swagger.security = [{ "bearerAuth": [] }]
  */
  try {
    const id = Number(req.params.id);
    const isManager = req.user?.role === "GERENCIA";
    const specialty = await SpecialtyModel.getSpecialtyById(id, isManager);
    if (!specialty)
      return res.status(404).json({ message: "Especialidad no encontrada" });
    res.json(specialty);
  } catch {
    res.status(500).json({ message: "Error al consultar especialidad" });
  }
}

export async function handleUpdateSpecialty(req: Request, res: Response) {
  /*  #swagger.tags = ['Especialidades']
      #swagger.summary = 'Actualizar especialidad (PUT)'
      #swagger.security = [{ "bearerAuth": [] }]
      #swagger.parameters['body'] = {
        in: 'body',
        description: 'Campos a actualizar',
        required: true,
        schema: {
          name: 'Pediatría General',
          allowedGender: 'TODOS',
          minAge: null,
          maxAge: 15
        }
      }
  */
  try {
    const id = Number(req.params.id);
    const updated = await SpecialtyModel.updateSpecialty(id, req.body);
    res.json(updated);
  } catch (error: any) {
    if (error.code === "P2025")
      return res.status(404).json({ message: "Especialidad no encontrada" });
    res.status(500).json({ message: "Error al actualizar especialidad" });
  }
}

export async function handleSoftDeleteSpecialty(req: Request, res: Response) {
  /*  #swagger.tags = ['Especialidades']
      #swagger.summary = 'Desactivar especialidad (Soft Delete)'
      #swagger.security = [{ "bearerAuth": [] }]
  */
  try {
    const id = Number(req.params.id);
    await SpecialtyModel.softDeleteSpecialty(id);
    res.json({ message: "Especialidad desactivada correctamente" });
  } catch (error: any) {
    if (error.code === "P2025")
      return res.status(404).json({ message: "Especialidad no encontrada" });
    res.status(500).json({ message: "Error al desactivar especialidad" });
  }
}
