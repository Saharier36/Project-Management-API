import { Request, Response } from "express";
import * as taskService from "./task.service";
import { TaskQueryInput } from "./task.validation";

/**
 * Handles task creation under a specific project.
 */
export async function createTask(req: Request, res: Response): Promise<void> {
  const result = await taskService.createTask(
    req.params.projectId as string,
    req.user!.id,
    req.body
  );
  res.status(201).json({
    success: true,
    data: result,
  });
}

/**
 * Handles fetching paginated/filtered tasks for a specific project.
 */
export async function getProjectTasks(
  req: Request,
  res: Response
): Promise<void> {
  const result = await taskService.getProjectTasks(
    req.params.projectId as string,
    req.user!.id,
    req.query as unknown as TaskQueryInput
  );
  res.status(200).json({
    success: true,
    data: result.tasks,
    pagination: result.pagination,
  });
}

/**
 * Handles fetching a single task by ID.
 */
export async function getTask(req: Request, res: Response): Promise<void> {
  const result = await taskService.getTaskById(
    req.params.id as string,
    req.user!.id
  );
  res.status(200).json({
    success: true,
    data: result,
  });
}

/**
 * Handles updating a task by ID.
 */
export async function updateTask(req: Request, res: Response): Promise<void> {
  const result = await taskService.updateTask(
    req.params.id as string,
    req.user!.id,
    req.body
  );
  res.status(200).json({
    success: true,
    data: result,
  });
}

/**
 * Handles deleting a task by ID.
 */
export async function deleteTask(req: Request, res: Response): Promise<void> {
  await taskService.deleteTask(req.params.id as string, req.user!.id);
  res.status(200).json({
    success: true,
    message: "Task deleted",
  });
}
