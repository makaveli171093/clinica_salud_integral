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
import {
  validatePatient,
  validateUpdatePatient,
} from "../middlewares/validate-patient.middleware.js";

const router: Router = Router();
router.use(verifyToken);

router.get("/", authorize("RECEPCIONISTA", "GERENCIA"), handleGetAllPatients);
router.get(
  "/:id",
  authorize("RECEPCIONISTA", "MEDICO", "GERENCIA"),
  handleGetPatientById,
);
router.post(
  "/",
  authorize("RECEPCIONISTA"),
  validatePatient,
  handleCreatePatient,
);
router.put(
  "/:id",
  authorize("RECEPCIONISTA", "GERENCIA"),
  validateUpdatePatient,
  handleUpdatePatient,
);
router.delete("/:id", authorize("GERENCIA"), handleSoftDeletePatient);

export default router;
