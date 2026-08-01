import { Request, Response, NextFunction } from "express";
import { AuthService, JWTPayload } from "../db/services/AuthService.ts";

const authService = new AuthService();

export interface AuthenticatedRequest extends Request {
  user?: JWTPayload;
}

// Access token verification middleware
export const requireAuth = (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Access Denied: No token provided" });
  }

  const token = authHeader.split("Bearer ")[1];
  try {
    const payload = authService.verifyAccessToken(token);
    req.user = payload;
    next();
  } catch (error) {
    return res.status(401).json({ error: error instanceof Error ? error.message : "Access Denied: Invalid token" });
  }
};

// Role-based authorization middleware generator
export const requireRole = (allowedRoles: string[]) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ error: "Access Denied: User not authenticated" });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ error: `Access Denied: Authorized roles are: [${allowedRoles.join(", ")}]` });
    }

    next();
  };
};
