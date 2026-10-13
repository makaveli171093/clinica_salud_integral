import { Router } from "express";
import { register, login } from "../controllers/auth.controller.js";

const router: Router = Router();
// Registro público eliminado también del servidor heredado.
router.post("/login", login);

export default router;
