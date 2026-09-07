import { Request, Response } from "express";
import * as projectService from "./project.service";

/**
 * Handles project creation.
 */
export async function createProject(req: Request, res: Response): Promise<void> {
  const result = await projectService.createProject(req.user!.id, req.body);
  res.status(201).json({
    success: true,
    data: result,
  });
}

/**
 * Handles fetching all projects for the authenticated user.
 */
export async function getProjects(req: Request, res: Response): Promise<void> {
  const result = await projectService.getUserProjects(req.user!.id);
  res.status(200).json({
    success: true,
    data: result,
  });
}

/**
 * Handles fetching a single project by ID.
 */
export async function getProject(req: Request, res: Response): Promise<void> {
  const result = await projectService.getProjectById(
    req.params.id as string,
    req.user!.id
  );
  res.status(200).json({
    success: true,
    data: result,
  });
}

/**
 * Handles updating a project by ID.
 */
export async function updateProject(req: Request, res: Response): Promise<void> {
  const result = await projectService.updateProject(
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
 * Handles deleting a project by ID.
 */
export async function deleteProject(req: Request, res: Response): Promise<void> {
  await projectService.deleteProject(req.params.id as string, req.user!.id);
  res.status(200).json({
    success: true,
    message: "Project deleted",
  });
}
