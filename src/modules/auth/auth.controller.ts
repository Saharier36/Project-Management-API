import { Request, Response } from "express";
import * as authService from "./auth.service";

/**
 * Handles user registration.
 */
export async function register(req: Request, res: Response): Promise<void> {
  const result = await authService.registerUser(req.body);
  res.status(201).json({
    success: true,
    data: result,
  });
}

/**
 * Handles user login.
 */
export async function login(req: Request, res: Response): Promise<void> {
  const result = await authService.loginUser(req.body);
  res.status(200).json({
    success: true,
    data: result,
  });
}

/**
 * Handles fetching current authenticated user profile.
 */
export async function me(req: Request, res: Response): Promise<void> {
  const result = await authService.getCurrentUser(req.user!.id);
  res.status(200).json({
    success: true,
    data: result,
  });
}
