import jwt, { SignOptions } from "jsonwebtoken";
import { env } from "../config/env";
import { UnauthorizedError } from "./AppError";

/**
 * Signs a JWT with the given user payload.
 */
export function signToken(payload: { userId: string }): string {
  const options: SignOptions = {
    expiresIn: env.jwtExpiresIn as SignOptions["expiresIn"],
  };

  return jwt.sign(payload, env.jwtSecret, options);
}

/**
 * Verifies a JWT and extracts the user payload.
 * Throws an UnauthorizedError if the token is invalid or expired.
 */
export function verifyToken(token: string): { userId: string } {
  try {
    const decoded = jwt.verify(token, env.jwtSecret) as { userId: string };
    if (!decoded || !decoded.userId) {
      throw new UnauthorizedError("Invalid or expired token");
    }
    return decoded;
  } catch (error) {
    if (error instanceof UnauthorizedError) {
      throw error;
    }
    throw new UnauthorizedError("Invalid or expired token");
  }
}
