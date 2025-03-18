import { Request, Response } from "express";
import { GoogleAuthService } from "../services/AuthService";

export class AuthController {
  constructor() {}

  async getGoogleLoginCallback(req: Request, res: Response) {
    try {
      const codeParam = req.query?.code as string;
      const stateParam = req.query?.state as string;
      const protocol = req.get("X-Forwarded-Proto") || req.protocol;
      const host = req.get("X-Forwarded-Host") || req.get("host");
      const origin = `${protocol}://${host}`;
      if (!codeParam) {
        return res.redirect(
          `${process.env.NEXT_PUBLIC_FRONTEND_URL}/login?error=authorization_code_not_found`
        );
      }
      let returnUri = process.env.NEXT_PUBLIC_FRONTEND_URL || "/";
      if (stateParam) {
        try {
          const stateObj = JSON.parse(decodeURIComponent(stateParam));
          if (stateObj && stateObj.return_uri) {
            returnUri = stateObj.return_uri;
          }
        } catch (error) {
          console.error(error);
        }
      }

      // const redirect_uri = `${origin}/auth/callback/google`;
      const redirect_uri = `${process.env.NEXT_PUBLIC_BACKEND_URL}/auth/callback/google`;
      console.log(redirect_uri);
      console.log(process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID);
      console.log(process.env.GOOGLE_CLIENT_SECRET);
      console.log(process.env.NEXT_PUBLIC_FRONTEND_URL);
      const authService = new GoogleAuthService(
        process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID!,
        process.env.GOOGLE_CLIENT_SECRET!,
        redirect_uri
      );
      const { sessionToken, user, credentials, sign_up } =
        await authService.handleCallback({ code: codeParam });
      console.log(`user=`, user);

      res.cookie("google_access_token", credentials.access_token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: 60 * 60 * 1 * 1000,
      });

      res.cookie("session_token", sessionToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: 60 * 60 * 1 * 1000,
      });

      try {
        console.log("return_uri:", returnUri);
        res.redirect(new URL(returnUri).toString());
      } catch {
        const uri = new URL(
          returnUri,
          process.env.NEXT_PUBLIC_FRONTEND_URL
        ).toString();
        console.log("return_uri:", uri);
        res.redirect(uri);
      }
    } catch (error) {
      console.error(error);
      res.redirect(
        `${process.env.NEXT_PUBLIC_FRONTEND_URL}/login?error=${error}`
      );
    }
  }
}
