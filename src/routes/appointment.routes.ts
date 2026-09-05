import { Router } from "express";
import {
  handleCreateAppointment,
  handleGetAppointmentById,
  handleUpdateAppointment,
  handleUpdateAppointmentStatus,
  handleCancelAppointment,
} from "../controllers/appointment.controller.js";
import { verifyToken } from "../middlewares/auth.middleware.js";
import { authorize } from "../middlewares/authorize.middleware.js";
import {
  validateAppointment,
  validateAppointmentStatus,
  validateUpdateAppointment,
} from "../middlewares/validate-appointment.middleware.js";

const router: Router = Router();

router.use(verifyToken);

router.get(
  "/:id",
  authorize("RECEPCIONISTA", "MEDICO", "GERENCIA"),
  handleGetAppointmentById,
);
router.post(
  "/",
  authorize("RECEPCIONISTA"),
  validateAppointment,
  handleCreateAppointment,
);
router.put(
  "/:id",
  authorize("RECEPCIONISTA"),
  validateUpdateAppointment,
  handleUpdateAppointment,
);
router.patch(
  "/:id/status",
  authorize("MEDICO"),
  validateAppointmentStatus,
  handleUpdateAppointmentStatus,
);
router.delete(
  "/:id",
  authorize("RECEPCIONISTA", "GERENCIA"),
  handleCancelAppointment,
);

export default router;
