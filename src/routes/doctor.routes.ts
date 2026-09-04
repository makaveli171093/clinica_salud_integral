import { Router } from "express";
import {
  handleCreateDoctor,
  handleGetAllDoctors,
  handleGetDoctorById,
  handleUpdateDoctor,
  handleSoftDeleteDoctor,
} from "../controllers/doctor.controller.js";
import { handleGetDoctorAgenda } from "../controllers/appointment.controller.js";
import { verifyToken } from "../middlewares/auth.middleware.js";
import { authorize } from "../middlewares/authorize.middleware.js";
import {
  validateCreateDoctor,
  validateUpdateDoctor,
} from "../middlewares/validate-doctor.middleware.js";

const router: Router = Router();
router.use(verifyToken);

router.post(
  "/",
  authorize("GERENCIA"),
  validateCreateDoctor,
  handleCreateDoctor,
);
router.get(
  "/",
  authorize("RECEPCIONISTA", "MEDICO", "GERENCIA"),
  handleGetAllDoctors,
);
router.get(
  "/:id",
  authorize("RECEPCIONISTA", "MEDICO", "GERENCIA"),
  handleGetDoctorById,
);
router.get(
  "/:id/appointments",
  authorize("MEDICO", "GERENCIA"),
  handleGetDoctorAgenda,
);
router.put(
  "/:id",
  authorize("GERENCIA"),
  validateUpdateDoctor,
  handleUpdateDoctor,
);
router.delete("/:id", authorize("GERENCIA"), handleSoftDeleteDoctor);

export default router;
