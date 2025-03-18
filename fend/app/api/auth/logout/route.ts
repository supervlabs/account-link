import { NextResponse } from "next/server";

export async function POST() {
  try {
    const response = NextResponse.json({ success: true });
    response.cookies.delete("session_token");
    // response.cookies.delete("google_id_token");
    response.cookies.delete("google_access_token");
    return response;
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "logout_failed" }, { status: 500 });
  }
}
