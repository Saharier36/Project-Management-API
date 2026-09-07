import { Request, Response, NextFunction } from "express";
import { UnauthorizedError } from "../utils/AppError";
import { verifyToken } from "../utils/jwt";

/**
 * Authentication middleware: validates JWT from Authorization header and attaches user to request.
 */
export function authenticate(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    throw new UnauthorizedError("No token provided");
  }

  const token = authHeader.split(" ")[1];
  if (!token) {
    throw new UnauthorizedError("No token provided");
  }

  const decoded = verifyToken(token);
  req.user = { id: decoded.userId };

  next();
}
