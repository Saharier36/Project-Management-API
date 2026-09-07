import dotenv from "dotenv";

// Load environment variables from .env file before anything else reads process.env
dotenv.config();

/**
 * Validating environment variables at application startup ensures a fail-fast strategy:
 * 1. If critical configuration is missing, the application halts immediately with a clear error
 *    instead of failing unpredictably during runtime (e.g., failed DB connection or invalid JWT signing).
 * 2. Centralizes configuration access so the codebase imports validated, typed variables
 *    rather than scattering untyped and unchecked `process.env` calls.
 */
const REQUIRED_ENV_VARS = [
  "PORT",
  "DATABASE_URL",
  "JWT_SECRET",
  "JWT_EXPIRES_IN",
] as const;

const missingEnvVars: string[] = [];

for (const key of REQUIRED_ENV_VARS) {
  if (!process.env[key] || process.env[key]?.trim() === "") {
    missingEnvVars.push(key);
  }
}

if (missingEnvVars.length > 0) {
  throw new Error(
    `Missing required environment variable(s): ${missingEnvVars.join(", ")}. Please check your .env file.`
  );
}

export interface EnvConfig {
  port: string;
  databaseUrl: string;
  jwtSecret: string;
  jwtExpiresIn: string;
}

export const env: EnvConfig = {
  port: process.env.PORT as string,
  databaseUrl: process.env.DATABASE_URL as string,
  jwtSecret: process.env.JWT_SECRET as string,
  jwtExpiresIn: process.env.JWT_EXPIRES_IN as string,
};
