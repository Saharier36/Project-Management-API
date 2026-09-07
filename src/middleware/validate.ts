import { Request, Response, NextFunction } from "express";
import { ZodSchema } from "zod";
import { BadRequestError } from "../utils/AppError";

/**
 * Generic Express middleware factory to validate request body or query parameters against a Zod schema.
 */
export function validate(
  schema: ZodSchema,
  source: "body" | "query" = "body"
) {
  return (req: Request, res: Response, next: NextFunction): void => {
    const dataToValidate = source === "query" ? req.query : req.body;
    const result = schema.safeParse(dataToValidate);

    if (!result.success) {
      const errorMessage = result.error.issues
        .map((issue) => issue.message)
        .join(", ");
      throw new BadRequestError(errorMessage);
    }

    if (source === "query") {
      Object.defineProperty(req, "query", {
        value: result.data,
        writable: true,
        configurable: true,
        enumerable: true,
      });
    } else {
      req.body = result.data;
    }

    next();
  };
}
