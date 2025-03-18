import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { OAuth2Client } from "google-auth-library";
import { verifyAndDecodeToken } from "@/lib/jwt";
import { verifyAccessToken } from "@/lib/google-auth";

const oauth2Client = new OAuth2Client(process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID);

export async function GET() {
  try {
    const cookieStore = await cookies();
    const sessionToken = cookieStore.get("session_token");
    const googleIdToken = cookieStore.get("google_id_token");
    const googleAccessToken = cookieStore.get("google_access_token");
    // console.log(`sessionToken`, sessionToken);
    // console.log(`googleIdToken`, googleIdToken);
    // console.log(`googleAccessToken`, googleAccessToken);
    if (!sessionToken && !googleAccessToken && !googleIdToken) {
      return NextResponse.json({
        isLoggedIn: false,
      });
    }
    if (sessionToken) {
      const decoded = verifyAndDecodeToken(sessionToken.value);
      return NextResponse.json({
        isLoggedIn: true,
        user: decoded,
      });
    }
    if (googleAccessToken) {
      const keyInfo = await verifyAccessToken(
        oauth2Client,
        googleAccessToken.value
      );
      return NextResponse.json({
        isLoggedIn: true,
        user: {
          ...keyInfo,
        },
      });
    }
    if (googleIdToken) {
      const client_ids = [process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID].filter(
        (v) => {
          return typeof v === "string";
        }
      );
      const ticket = await oauth2Client
        .verifyIdToken({
          idToken: googleIdToken.value,
          audience: client_ids,
        })
        .catch((error) => {
          console.error(error);
          return undefined;
        });
      if (!ticket) {
        throw new Error("invalid_google_id_token");
      }
      const payload = ticket.getPayload();
      if (!payload) {
        throw new Error("invalid_google_id_token");
      }
      return NextResponse.json({
        isLoggedIn: true,
        user: {
          iss: payload.iss,
          sub: payload.sub,
          email: payload.email,
          name: payload.name,
        },
      });
    }
    return NextResponse.json({ error: "no_auth_info" }, { status: 401 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "invalid_auth_info" }, { status: 401 });
  }
}
