import { PrismaClient } from "@prisma/client";

/**
 * Prisma Client Singleton:
 * We create exactly one PrismaClient instance and export it, so every 
 * part of the app reuses the same database connection pool instead of 
 * creating a new one each time this file is imported.
 */
export const prisma = new PrismaClient({
  log: process.env.NODE_ENV === "development" ? ["warn", "error"] : ["error"],
});
