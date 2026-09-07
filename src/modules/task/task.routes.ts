import { Router } from "express";
import * as taskController from "./task.controller";
import { authenticate } from "../../middleware/authenticate";
import { validate } from "../../middleware/validate";
import {
  createTaskSchema,
  taskQuerySchema,
  updateTaskSchema,
} from "./task.validation";

// Nested task router mounted under /api/projects/:projectId/tasks
// mergeParams: true allows reading :projectId from parent router
const nestedTaskRouter = Router({ mergeParams: true });

nestedTaskRouter.use(authenticate);
nestedTaskRouter.post(
  "/",
  validate(createTaskSchema),
  taskController.createTask
);
nestedTaskRouter.get(
  "/",
  validate(taskQuerySchema, "query"),
  taskController.getProjectTasks
);

// Standalone task router mounted under /api/tasks
const taskRouter = Router();

taskRouter.use(authenticate);
taskRouter.get("/:id", taskController.getTask);
taskRouter.patch(
  "/:id",
  validate(updateTaskSchema),
  taskController.updateTask
);
taskRouter.delete("/:id", taskController.deleteTask);

export { nestedTaskRouter, taskRouter };
