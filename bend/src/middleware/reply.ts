import { Request, Response, NextFunction } from "express";
declare global {
  namespace Express {
    interface Response {
      reply: (status: number, body?: object) => void;
    }
  }
}
export function setupReply(
  req: Request,
  res: Response,
  next: NextFunction
) {
  res.reply = (status: number, body?: object) => {
    if (body) {
        res.status(status).json(body);
        return;
    }
    res.status(status);
    return;
  };
  next();
}
