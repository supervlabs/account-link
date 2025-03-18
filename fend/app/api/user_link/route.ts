import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { signUserLink, verifyAndDecodeToken, verifyUserLink } from "@/lib/jwt";
import { randomUUID } from "crypto";
import { storeUserLinkData } from "@/lib/redis";
import { IUserLink } from "@/lib/types";

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const { searchParams } = url;
    const redirectUri = searchParams.get("redirect_uri");
    const userLinkUri = searchParams.get("user_link_uri");
    const cookieStore = await cookies();
    const sessionToken = cookieStore.get("session_token");
    if (!sessionToken) {
      return NextResponse.json({ error: "unauthorized_user" }, { status: 401 });
    }
    if (!redirectUri || !userLinkUri) {
      return NextResponse.json(
        { error: "redirect_uri and user_link_uri are required" },
        { status: 401 }
      );
    }
    const linkId = randomUUID();
    const decoded = verifyAndDecodeToken(sessionToken.value);
    const userLink = {
      link_id: linkId, // `${decoded.iss}:$${decoded.sub}`,
      initiator: new URL(process.env.NEXT_PUBLIC_FRONTEND_URL!).hostname,
      destination: new URL(userLinkUri).hostname,
      redirect_uri: redirectUri,
      user: {
        id: decoded.id,
        name: decoded.name,
        email: decoded.email,
      },
    } as IUserLink;
    const encodedUserLink = signUserLink(userLink);
    await storeUserLinkData(userLink, userLink.link_id, 60);
    return NextResponse.json({
      "x-user-link-token": encodedUserLink,
    });
  } catch (error) {
    console.error(error);
    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    return NextResponse.json(
      { error: "failed_to_generate_user_link" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const token = request.headers.get("x-user-link-token");
    if (!token) {
      // [FIXME] 응답보다 오류 페이지로 redirect ...
      return NextResponse.json(
        { error: "missing_user_link_token" },
        { status: 400 }
      );
    }
    const userLink = verifyUserLink<IUserLink>(token);
    if (!userLink.link_id || !userLink.redirect_uri) {
      return NextResponse.json(
        { error: "missing_user_link_data" },
        { status: 400 }
      );
    }
    // Store the user link data
    await storeUserLinkData(userLink, userLink.link_id, 60);

    const linkUrl = new URL(
      `/user_link/${userLink.link_id}`,
      process.env.NEXT_PUBLIC_FRONTEND_URL
    ).toString();
    // return NextResponse.redirect(linkUrl, { status: 308 });
    return NextResponse.json({
      user_link: linkUrl,
    });
  } catch (error) {
    console.error(error);
    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    return NextResponse.json(
      { error: "user_link_processing_failed" },
      { status: 500 }
    );
  }
}
