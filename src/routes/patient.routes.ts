import { Router } from "express";
import {
  handleCreatePatient,
  handleGetAllPatients,
  handleGetPatientById,
  handleUpdatePatient,
  handleSoftDeletePatient,
} from "../controllers/patient.controller.js";
import { verifyToken } from "../middlewares/auth.middleware.js";
import { authorize } from "../middlewares/authorize.middleware.js";
import { validatePatient } from "../middlewares/validate-patient.middleware.js";

const router: Router = Router();

router.use(verifyToken);

router.post(
  "/",
  authorize("RECEPCIONISTA"),
  validatePatient,
  handleCreatePatient,
);
router.get("/", authorize("RECEPCIONISTA", "GERENCIA"), handleGetAllPatients);
router.get(
  "/:id",
  authorize("RECEPCIONISTA", "MEDICO", "GERENCIA"),
  handleGetPatientById,
);
router.put(
  "/:id",
  authorize("RECEPCIONISTA", "GERENCIA"),
  validatePatient,
  handleUpdatePatient,
);
router.delete("/:id", authorize("GERENCIA"), handleSoftDeletePatient);

export default router;
