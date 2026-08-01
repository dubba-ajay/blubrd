import { Request, Response, NextFunction } from "express";

export const requestLogger = (req: Request, res: Response, next: NextFunction) => {
  const start = Date.now();
  const { method, originalUrl, ip } = req;

  // Listen for the response finish event to log outcome
  res.on("finish", () => {
    const duration = Date.now() - start;
    const { statusCode } = res;
    console.log(
      `[API Log] ${new Date().toISOString()} | ${method} ${originalUrl} | Status: ${statusCode} | IP: ${ip} | Duration: ${duration}ms`
    );
  });

  next();
};
