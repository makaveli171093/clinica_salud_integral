import { Router } from "express";
import {
  handleGetPatientMedicalRecord,
  handleCreateConsultation,
} from "../controllers/medical-record.controller.js";
import { verifyToken } from "../middlewares/auth.middleware.js";
import { authorize } from "../middlewares/authorize.middleware.js";

const router: Router = Router();
router.use(verifyToken);

// 1. Ver historia clínica (Recepción ve solo portada; Médico y Gerencia ven todo)
router.get(
  "/patient/:patientId",
  authorize("RECEPCIONISTA", "MEDICO", "GERENCIA"),
  handleGetPatientMedicalRecord,
);

// 2. Asentar una atención médica (Exclusivo para médicos)
router.post("/consultations", authorize("MEDICO"), handleCreateConsultation);

export default router;
