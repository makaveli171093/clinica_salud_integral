import { Router } from "express";
import authRoutes from "./auth.routes.js";
import patientRoutes from "./patient.routes.js";
import doctorRoutes from "./doctor.routes.js";
import appointmentRoutes from "./appointment.routes.js";
import reportRoutes from "./report.routes.js";

const router: Router = Router();

router.use("/auth", authRoutes);
router.use("/specialties", specialtyRoutes);
router.use("/patients", patientRoutes);
router.use("/doctors", doctorRoutes);
router.use("/appointments", appointmentRoutes);
router.use("/reports", reportRoutes);

export default router;
