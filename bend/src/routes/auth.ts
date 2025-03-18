import { Request, Response } from "express";
import { asyncifyRouter } from "../utils/asyncify";
import { AuthController } from "../controllers/AuthController";

export const authRouter = asyncifyRouter();
const authController = new AuthController();
authRouter.get(
  "/auth/callback/google",
  async (req: Request, res: Response) =>
    await authController.getGoogleLoginCallback(req, res)
);
