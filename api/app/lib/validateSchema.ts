import { z, ZodError } from "zod";
import { type Request, type Response, type NextFunction } from "express";
import { CustomError, StatusCode } from "./validationError.ts";
export const validateDataSchema = (schema: z.ZodObject) => {
  return (req: Request, _res: Response, next: NextFunction) => {
    try {
      req.body = schema.parse(req.body);
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const message = error.issues
          .map((issue) => `${issue.path.join(".")}: ${issue.message}`)
          .join("; ");
        next(new CustomError(message, StatusCode.UNPROCESSABLE_ENTITY));
        return;
      }
      next(error);
    }
  };
};
