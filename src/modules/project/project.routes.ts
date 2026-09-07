import { Router } from "express";
import * as projectController from "./project.controller";
import { authenticate } from "../../middleware/authenticate";
import { validate } from "../../middleware/validate";
import {
  createProjectSchema,
  updateProjectSchema,
} from "./project.validation";

const router = Router();

// All project routes require authentication
router.use(authenticate);

router.post("/", validate(createProjectSchema), projectController.createProject);
router.get("/", projectController.getProjects);
router.get("/:id", projectController.getProject);
router.patch(
  "/:id",
  validate(updateProjectSchema),
  projectController.updateProject
);
router.delete("/:id", projectController.deleteProject);

export default router;
