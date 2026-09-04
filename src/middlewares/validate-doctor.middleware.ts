import type { Request, Response, NextFunction } from "express";
import { z, ZodError } from "zod";

export const createDoctorSchema = z.object({
  firstName: z.string().min(1, "El nombre es obligatorio"),
  lastName: z.string().min(1, "El apellido es obligatorio"),
  specialtyId: z.number().int().positive("ID de especialidad inválido"),
  userId: z.number().int().positive("ID de usuario inválido").optional(),
});

export const updateDoctorSchema = z.object({
  firstName: z.string().min(1).optional(),
  lastName: z.string().min(1).optional(),
  specialtyId: z.number().int().positive().optional(),
  userId: z.number().int().positive().nullable().optional(),
});

export function validateCreateDoctor(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    req.body = createDoctorSchema.parse(req.body);
    next();
  } catch (error) {
    if (error instanceof ZodError) {
      return res.status(400).json({
        errors: error.issues.map((e) => ({
          field: e.path.join("."),
          message: e.message,
        })),
      });
    }
    res.status(500).json({ message: "Error en validación" });
  }
}

export function validateUpdateDoctor(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    req.body = updateDoctorSchema.parse(req.body);
    next();
  } catch (error) {
    if (error instanceof ZodError) {
      return res.status(400).json({
        errors: error.issues.map((e) => ({
          field: e.path.join("."),
          message: e.message,
        })),
      });
    }
    res.status(500).json({ message: "Error en validación" });
  }
}
