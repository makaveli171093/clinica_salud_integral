import { Router } from "express";
import {
  handleCreateSpecialty,
  handleGetAllSpecialties,
  handleGetSpecialtyById,
  handleUpdateSpecialty,
  handleSoftDeleteSpecialty,
} from "../controllers/specialty.controller.js";
import { verifyToken } from "../middlewares/auth.middleware.js";
import { authorize } from "../middlewares/authorize.middleware.js";
import {
  validateCreateSpecialty,
  validateUpdateSpecialty,
} from "../middlewares/validate-specialty.middleware.js";

const router: Router = Router();
router.use(verifyToken);

router.post(
  "/",
  authorize("GERENCIA"),
  validateCreateSpecialty,
  handleCreateSpecialty,
);
router.get(
  "/",
  authorize("RECEPCIONISTA", "MEDICO", "GERENCIA"),
  handleGetAllSpecialties,
);
router.get(
  "/:id",
  authorize("RECEPCIONISTA", "MEDICO", "GERENCIA"),
  handleGetSpecialtyById,
);
router.put(
  "/:id",
  authorize("GERENCIA"),
  validateUpdateSpecialty,
  handleUpdateSpecialty,
);
router.delete("/:id", authorize("GERENCIA"), handleSoftDeleteSpecialty);

export default router;
