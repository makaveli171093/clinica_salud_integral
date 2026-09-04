import { Router } from "express";
import {
  handleGetAppointmentsBySpecialty,
  handleGetDailyCutoff,
} from "../controllers/report.controller.js";
import { verifyToken } from "../middlewares/auth.middleware.js";
import { authorize } from "../middlewares/authorize.middleware.js";

const router: Router = Router();

router.use(verifyToken, authorize("GERENCIA"));

router.get("/appointments-by-specialty", handleGetAppointmentsBySpecialty);
router.get("/daily-cutoff", handleGetDailyCutoff);

export default router;
