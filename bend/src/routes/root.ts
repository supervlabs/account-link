import { Request, Response } from "express";
import { asyncifyRouter } from "../utils/asyncify";

export const rootRouter = asyncifyRouter();
rootRouter.get("/", (req: Request, res: Response) => {
  res.redirect(`${process.env.NEXT_PUBLIC_FRONTEND_URL}`);
});
