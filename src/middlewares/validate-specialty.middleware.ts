import type { Request, Response, NextFunction } from "express";
import { z, ZodError } from "zod";

export const specialtySchema = z.object({
  name: z.string().min(2, "El nombre de la especialidad es obligatorio"),
  allowedGender: z.enum(["TODOS", "MASCULINO", "FEMENINO"]).default("TODOS"),
  minAge: z
    .number()
    .int()
    .nonnegative("La edad mínima no puede ser negativa")
    .nullable()
    .optional(),
  maxAge: z
    .number()
    .int()
    .positive("La edad máxima debe ser mayor a 0")
    .nullable()
    .optional(),
});

export const updateSpecialtySchema = specialtySchema.partial();

export function validateCreateSpecialty(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    req.body = specialtySchema.parse(req.body);
    next();
  } catch (error) {
    if (error instanceof ZodError) {
      return res
        .status(400)
        .json({
          errors: error.issues.map((e) => ({
            field: e.path.join("."),
            message: e.message,
          })),
        });
    }
    res.status(500).json({ message: "Error en validación" });
  }
}

export function validateUpdateSpecialty(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    req.body = updateSpecialtySchema.parse(req.body);
    next();
  } catch (error) {
    if (error instanceof ZodError) {
      return res
        .status(400)
        .json({
          errors: error.issues.map((e) => ({
            field: e.path.join("."),
            message: e.message,
          })),
        });
    }
    res.status(500).json({ message: "Error en validación" });
  }
}
