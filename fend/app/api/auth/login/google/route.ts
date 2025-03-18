import { NextResponse } from "next/server";
import { OAuth2Client } from "google-auth-library";
import { createSessionToken } from "@/lib/jwt";
import { storeRefreshToken } from "@/lib/redis";

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    // const origin = url.origin;
    const { searchParams } = url;
    const codeParam = searchParams.get("code");
    const stateParam = searchParams.get("state");
    const protocol =
      request.headers.get("X-Forwarded-Proto") || url.protocol.replace(":", "");
    const host = request.headers.get("X-Forwarded-Host") || url.host;
    const origin = `${protocol}://${host}`;
    console.log("url.protocol", url.protocol);
    console.log("X-Forwarded-Proto", request.headers.get("X-Forwarded-Proto"));
    console.log("X-Forwarded-Host", request.headers.get("X-Forwarded-Host"));
    console.log("X-Forwarded-Port", request.headers.get("X-Forwarded-Port"));
    console.log("X-Forwarded-For", request.headers.get("X-Forwarded-For"));
    console.log("X-Real-IP", request.headers.get("X-Real-IP"));

    console.log(`request.url=${request.url}`);
    console.log(`request.url.code (Authorization Code)=${codeParam}`);

    if (!codeParam) {
      throw new Error("no_authorization_code");
    }
    let returnUri = "/";
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

    // const redirect_uri = `${origin}/api/auth/login/google`;
    const redirect_uri = `${process.env.NEXT_PUBLIC_FRONTEND_URL}/api/auth/login/google`;
    const oauth2Client = new OAuth2Client(
      process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      redirect_uri
    );

    const { tokens } = await oauth2Client.getToken(codeParam);
    if (!tokens.id_token) {
      throw new Error("token_fetch_failed");
    }
    if (!tokens.access_token) {
      throw new Error("access_token_fetch_failed");
    }
    const ticket = await oauth2Client.verifyIdToken({
      idToken: tokens.id_token,
      audience: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID,
    });
    const idTokenPayload = ticket.getPayload();
    if (!idTokenPayload) {
      throw new Error("invalid_id_token_payload");
    }
    if (!idTokenPayload.iss || !idTokenPayload.sub) {
      throw new Error("invalid_user_iss_or_sub");
    }
    if (!idTokenPayload.email || !idTokenPayload.name) {
      throw new Error("invalid_user_email_or_name");
    }
    if (tokens.refresh_token && tokens.expiry_date) {
      const expiresIn = Math.floor((tokens.expiry_date - Date.now()) / 1000);
      storeRefreshToken(idTokenPayload.sub, tokens.refresh_token, expiresIn);
    }

    oauth2Client.setCredentials(tokens);
    const userInfo = await fetchGoogleUserInfo(oauth2Client);
    console.log(`userInfo(google)=`, userInfo);

    let sessionToken = createSessionToken({
      iss: idTokenPayload.iss,
      sub: idTokenPayload.sub,
      email: idTokenPayload.email,
      name: idTokenPayload.name,
    });
    const user_added_resp = await fetch(`${process.env.BACKEND_URL}/users`, {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${sessionToken}`,
      },
    });
    const user = await user_added_resp.json();
    if (!user_added_resp.ok) {
      const errmsg = user?.message || "add_user_failed";
      throw new Error(errmsg);
    }

    sessionToken = createSessionToken({
      id: user.id,
      iss: idTokenPayload.iss,
      sub: idTokenPayload.sub,
      email: idTokenPayload.email,
      name: idTokenPayload.name,
    });

    let response: NextResponse;
    try {
      response = NextResponse.redirect(new URL(returnUri));
    } catch {
      response = NextResponse.redirect(new URL(returnUri, origin));
    }
    response.cookies.set("session_token", sessionToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 60 * 60 * 24,
    });
    response.cookies.set("google_access_token", tokens.access_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 60 * 60 * 24,
    });
    return response;
  } catch (error) {
    console.error(error);
    if (error instanceof Error) {
      return NextResponse.redirect(
        new URL(`/login/google?error=${error.message}`, request.url)
      );
    }
    return NextResponse.redirect(
      new URL(`/login/google?error=auth_failed`, request.url)
    );
  }
}

async function fetchGoogleUserInfo(client: OAuth2Client) {
  const userInfoResponse = await client.request({
    url: "https://www.googleapis.com/oauth2/v3/userinfo",
  });
  if (userInfoResponse.status !== 200) {
    throw new Error("getting userinfo failed");
  }
  return userInfoResponse.data as GoogleUserInfo;
}

interface GoogleUserInfo {
  sub: string;
  email: string;
  name: string;
  picture?: string;
  email_verified?: boolean;
}
