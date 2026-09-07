import express, { Application, Request, Response, NextFunction } from "express";
import cors from "cors";
import morgan from "morgan";
import helmet from "helmet";
import { Prisma } from "@prisma/client";
import { AppError } from "./utils/AppError";
import authRoutes from "./modules/auth/auth.routes";
import projectRoutes from "./modules/project/project.routes";

const app: Application = express();

/**
 * Core Middleware Pipeline:
 * 1. helmet: Secures Express apps by setting various HTTP headers to guard against common attacks.
 * 2. cors: Configures Cross-Origin Resource Sharing headers before processing requests.
 * 3. morgan: Logs incoming requests for observability (enabled in non-production environments).
 * 4. express.json: Parses incoming requests with JSON payloads and populates req.body.
 */
app.use(helmet());
app.use(cors());

if (process.env.NODE_ENV !== "production") {
  app.use(morgan("dev"));
}

app.use(express.json());

/**
 * API Routes
 */
app.use("/api/auth", authRoutes);
app.use("/api/projects", projectRoutes);

/**
 * Health Check Endpoint:
 * Simple route to verify server availability and uptime monitoring.
 */
app.get("/health", (req: Request, res: Response) => {
  res.status(200).json({
    success: true,
    message: "Server is running",
  });
});

/**
 * 404 Not Found Handler:
 * Placed after all valid routes to catch any request that does not match an existing endpoint.
 */
app.use((req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    message: "Route not found",
  });
});

/**
 * Centralized Error-Handling Middleware:
 * Must be registered last with the 4-parameter signature (err, req, res, next) so Express
 * identifies it as an error handler. Any error passed to next(err) in preceding handlers
 * bubbles down here to ensure consistent error responses without leaking stack traces.
 */
app.use((err: unknown, req: Request, res: Response, next: NextFunction) => {
  if (err instanceof AppError) {
    res.status(err.statusCode).json({
      success: false,
      message: err.message,
    });
    return;
  }

  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    if (err.code === "P2002") {
      res.status(409).json({
        success: false,
        message: "A record with this value already exists",
      });
      return;
    }

    if (err.code === "P2025") {
      res.status(404).json({
        success: false,
        message: "Record not found",
      });
      return;
    }
  }

  console.error("Internal Server Error:", err);

  res.status(500).json({
    success: false,
    message: "Internal Server Error",
  });
});

export { app };
export default app;
