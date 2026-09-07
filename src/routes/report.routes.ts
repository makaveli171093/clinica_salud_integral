import { Router } from "express";
import {
  handleGetAppointmentsBySpecialty,
  handleGetBookedSchedule,
  handleGetDailyCutoff,
} from "../controllers/report.controller.js";
import { verifyToken } from "../middlewares/auth.middleware.js";
import { authorize } from "../middlewares/authorize.middleware.js";

const router: Router = Router();

router.use(verifyToken, authorize("GERENCIA", "RECEPCIONISTA"));

router.get("/appointments-by-specialty", handleGetAppointmentsBySpecialty);
router.get("/daily-cutoff", handleGetDailyCutoff);
router.get(
  "/booked-schedule",
  authorize("GERENCIA", "RECEPCIONISTA"),
  handleGetBookedSchedule,
);

export default router;
