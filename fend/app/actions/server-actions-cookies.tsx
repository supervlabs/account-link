"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export async function setApprovalCookie(linkId: string, redirectUrl: string) {
  const cookieStore = await cookies();
  // 쿠키 설정
  cookieStore.set({
    name: "approved_link",
    value: linkId,
    path: "/",
    maxAge: 60 * 60, // 1h
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
  });

  redirect(redirectUrl);
}

export async function clearApprovalCookie(linkId: string, redirectUrl: string) {
  const cookieStore = await cookies();
  cookieStore.delete(`approved_link`);
  redirect(redirectUrl);
}

export async function cancelApproval(redirectUrl: string) {
  redirect(redirectUrl);
}
