import { type Response, type Request, type NextFunction } from "express";
import { logger } from "@/utils/logger.ts";
export class CustomError extends Error {
  statusCode: number;
  constructor(message: string, statusCode: number) {
    super(message);
    this.statusCode = statusCode;
  }
}
export function globalMiddlewareError(
  err: Error,
  req: Request,
  res: Response,
  _next: NextFunction,
) {
  if (
    err instanceof SyntaxError &&
    "status" in err &&
    err.status === StatusCode.BAD_REQUEST
  ) {
    logger.warn(`${req.method} ${req.url} -> 400: invalid JSON body`);
    return res.status(StatusCode.BAD_REQUEST).json({
      status: StatusCode.BAD_REQUEST,
      message: "Invalid JSON in request body",
    });
  }
  if (err instanceof CustomError) {
    logger.warn(
      `${req.method} ${req.url} -> ${err.statusCode}: ${err.message}`,
    );
    return res.status(err.statusCode).json({
      status: err.statusCode,
      message: err.message,
    });
  }
  logger.error(`${req.method} ${req.url} -> 500: ${err.stack ?? err.message}`);
  return res.status(StatusCode.INTERNAL_SERVER_ERROR).json({
    status: StatusCode.INTERNAL_SERVER_ERROR,
    message: "Something went wrong on the server",
  });
}

export const StatusCode = {
  OK: 200,
  CREATED: 201,
  NO_CONTENT: 204,
  BAD_REQUEST: 400,
  NOT_FOUND: 404,
  CONFLICT: 409,
  UNPROCESSABLE_ENTITY: 422,
  INTERNAL_SERVER_ERROR: 500,
} as const;
