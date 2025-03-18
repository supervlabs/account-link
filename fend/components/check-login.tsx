import { cookies } from "next/headers";
import { OAuth2Client } from "google-auth-library";
import { verifyAndDecodeToken } from "@/lib/jwt";
import { verifyAccessToken } from "@/lib/google-auth";
import { LoginStatus } from "@/lib/types";

export async function checkLoginStatus(): Promise<LoginStatus> {
  const cookieStore = await cookies();
  const sessionToken = cookieStore.get("session_token");
  const googleIdToken = cookieStore.get("google_id_token");
  const googleAccessToken = cookieStore.get("google_access_token");

  if (!sessionToken && !googleAccessToken && !googleIdToken) {
    return { isLoggedIn: false };
  }

  try {
    if (sessionToken) {
      const decoded = verifyAndDecodeToken(sessionToken.value);
      return { isLoggedIn: true, user: decoded };
    }

    if (googleAccessToken) {
      const oauth2Client = new OAuth2Client(
        process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID
      );
      const keyInfo = await verifyAccessToken(
        oauth2Client,
        googleAccessToken.value
      );
      return { isLoggedIn: true, user: keyInfo };
    }

    if (googleIdToken) {
      const oauth2Client = new OAuth2Client(
        process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID
      );
      const client_ids = [process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID].filter(
        (v) => typeof v === "string"
      );

      try {
        const ticket = await oauth2Client.verifyIdToken({
          idToken: googleIdToken.value,
          audience: client_ids,
        });

        const payload = ticket.getPayload();
        if (!payload) {
          return { isLoggedIn: false, error: "invalid_google_id_token" };
        }

        if (!payload.email || !payload.name) {
          return { isLoggedIn: false, error: "invalid_google_id_token" };
        }

        return {
          isLoggedIn: true,
          user: {
            iss: payload.iss,
            sub: payload.sub,
            email: payload.email,
            name: payload.name,
          },
        };
      } catch (error) {
        console.error(error);
        return { isLoggedIn: false, error: "invalid_google_id_token" };
      }
    }

    return { isLoggedIn: false, error: "no_auth_info" };
  } catch (error) {
    console.error(error);
    return { isLoggedIn: false, error: "invalid_auth_info" };
  }
}
