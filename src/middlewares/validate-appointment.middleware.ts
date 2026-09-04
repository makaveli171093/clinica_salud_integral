import type { Request, Response, NextFunction } from "express";
import { z, ZodError } from "zod";

export const appointmentSchema = z.object({
  patientId: z.number().int().positive("ID de paciente inválido"),
  doctorId: z.number().int().positive("ID de médico inválido"),
  scheduledAt: z.coerce
    .date()
    .min(
      new Date(),
      "No puedes agendar una cita en una fecha u hora que ya pasó",
    ),
  reason: z.string().optional(),
});

export const appointmentStatusSchema = z.object({
  status: z.enum(["COMPLETADA", "CANCELADA"], {
    error: () => ({
      message: "El estado solo puede ser COMPLETADA o CANCELADA",
    }),
  }),
});

export const updateAppointmentSchema = z.object({
  scheduledAt: z.coerce
    .date()
    .min(new Date(), "La fecha u hora debe ser futura")
    .optional(),
  reason: z.string().optional(),
});

export function validateAppointment(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    req.body = appointmentSchema.parse(req.body);
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

export function validateAppointmentStatus(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    req.body = appointmentStatusSchema.parse(req.body);
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

export function validateUpdateAppointment(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    req.body = updateAppointmentSchema.parse(req.body);
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
