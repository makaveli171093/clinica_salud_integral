import type { Request, Response, NextFunction } from "express";
import { z, ZodError } from "zod";

export const patientSchema = z.object({
  firstName: z.string().min(1, "El nombre es obligatorio"),
  lastName: z.string().min(1, "El apellido es obligatorio"),
  email: z.string().email("El correo no tiene un formato válido"),
  phone: z.string().min(6, "El teléfono debe tener al menos 6 caracteres"),
  gender: z.enum(["MASCULINO", "FEMENINO", "OTRO"], {
    error: () => ({
      message: "El género debe ser MASCULINO, FEMENINO u OTRO",
    }),
  }),
  birthDate: z.coerce
    .date()
    .max(new Date(), "La fecha de nacimiento no puede ser futura"),
});

export const updatePatientSchema = patientSchema.partial();

export function validatePatient(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    req.body = patientSchema.parse(req.body);
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

export function validateUpdatePatient(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    req.body = updatePatientSchema.parse(req.body);
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
