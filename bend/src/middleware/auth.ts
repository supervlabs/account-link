import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { JwtPayloadX, verifyAndDecodeToken } from "../utils/jwt";

declare global {
  namespace Express {
    interface Request {
      user?: JwtPayloadX;
    }
  }
}

export const verifyToken = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      res.status(401).json({ error: "no_token_provided" });
      return;
    }
    // Bearer token
    const parts = authHeader
      .split(" ")
      .filter((p) => p)
      .map((p) => p.trim());
    if (parts.length !== 2 || parts[0] !== "Bearer") {
      res.status(401).json({ error: "token_format_invalid" });
      return;
    }
    const token = parts[1];
    req.user = verifyAndDecodeToken(token);
    next();
  } catch (error) {
    console.error(error);
    if (error instanceof jwt.TokenExpiredError) {
      res.status(401).json({ error: "token_expired" });
    } else if (error instanceof jwt.JsonWebTokenError) {
      res.status(401).json({ error: "invalid_token" });
    } else {
      res.status(500).json({ error: "internal_server_error" });
    }
  }
};

// optional verification
export const VerifyTokenOptionally = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      return next();
    }

    const parts = authHeader
      .split(" ")
      .filter((p) => p)
      .map((p) => p.trim());
    if (parts.length !== 2 || parts[0] !== "Bearer") {
      return next();
    }

    const token = parts[1];
    req.user = verifyAndDecodeToken(token);
    next();
  } catch (error) {
    console.error(error);
    if (error instanceof jwt.TokenExpiredError) {
      res.status(401).json({ error: "token_expired" });
    } else if (error instanceof jwt.JsonWebTokenError) {
      res.status(401).json({ error: "invalid_token" });
    } else {
      res.status(500).json({ error: "internal_server_error" });
    }
  }
};

export const checkRole = (roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ error: "unauthorized" });
    }
    if (!req.user?.role) {
      return res.status(403).json({ error: "no_role_in_user" });
    }
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ error: "insufficient_permissions" });
    }
    next();
  };
};
