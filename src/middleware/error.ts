import { Request, Response, NextFunction } from "express";

export const centralErrorHandler = (
  err: any,
  req: Request,
  res: Response,
  _next: NextFunction
) => {
  console.error(`[Central Error Handler] Caught Exception at: ${req.method} ${req.url}`);
  console.error(err);

  const statusCode = err.statusCode || err.status || 500;
  const message = err.message || "An unexpected system error occurred. Please try again later.";

  res.status(statusCode).json({
    error: message,
    // Hide DB/internal schemas in production but show causes in development/preview
    cause: process.env.NODE_ENV !== "production" && err.cause ? String(err.cause) : undefined,
  });
};
