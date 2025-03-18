import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { google } from "googleapis";
import { getRefreshToken } from "@/lib/redis";
import { verifyAccessToken } from "@/lib/google-auth";

const oauth2Client = new google.auth.OAuth2(
  process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  `${process.env.NEXT_PUBLIC_FRONTEND_URL}/api/auth/login/google`
);

export async function POST() {
  try {
    const cookieStore = await cookies();
    const googleAccessToken = cookieStore.get("google_access_token");
    if (!googleAccessToken) {
      throw new Error("no_google_access_token");
    }
    const keyInfo = await verifyAccessToken(
      oauth2Client,
      googleAccessToken.value
    );

    const refreshToken = await getRefreshToken(keyInfo.sub);

    if (!refreshToken) {
      throw new Error("no_refresh_token_found");
    }

    oauth2Client.setCredentials({ refresh_token: refreshToken });
    const { credentials } = await oauth2Client.refreshAccessToken();
    if (!credentials.access_token) {
      throw new Error("access_token_not_found");
    }
    const response = NextResponse.json({
      access_token: credentials.access_token,
      expires_in: credentials.expiry_date
        ? Math.floor((credentials.expiry_date - Date.now()) / 1000)
        : undefined,
    });
    response.cookies.set("google_access_token", credentials.access_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 60 * 60 * 1,
    });

    return response;
  } catch (error) {
    console.error(error);
    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    return NextResponse.json(
      { error: "token_refresh_failed" },
      { status: 500 }
    );
  }
}
