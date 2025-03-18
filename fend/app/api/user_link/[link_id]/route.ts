import { NextRequest, NextResponse } from "next/server";
import { getUserLinkData } from "@/lib/redis";
// import { verifyUserLink } from "@/lib/jwt";
import { IUserLink } from "@/lib/types";

export async function GET(
  request: NextRequest,
  { params }: { params: { link_id: string } }
) {
  const { link_id } = await params;
  const data = await getUserLinkData(link_id);
  if (!data) {
    return NextResponse.json({ error: "user_link_not_found" }, { status: 404 });
  }
  return NextResponse.json(data);
}

export async function POST(request: Request) {
  try {
    // const token = request.headers.get("x-user-link-token");
    // if (!token) {
    //   return NextResponse.json(
    //     { error: "missing_user_link_token" },
    //     { status: 400 }
    //   );
    // }

    // const userLink = verifyUserLink<IUserLink>(token);
    const userLink = await request.json() as IUserLink;
    if (!userLink.link_id) {
      return NextResponse.json(
        { error: "missing_user_link_id" },
        { status: 400 }
      );
    }
    const sourceLinkData = await getUserLinkData(userLink.link_id);
    if (!sourceLinkData) {
      return NextResponse.json(
        { error: "source_link_not_found" },
        { status: 404 }
      );
    }
    if (
      sourceLinkData.initiator !== userLink.destination ||
      sourceLinkData.destination !== userLink.initiator
    ) {
      return NextResponse.json(
        { error: "invalid_user_link_data" },
        { status: 400 }
      );
    }

    // [FIXME]
    // const userUpdateResp = await fetch(
    //   `${process.env.NEXT_PUBLIC_BACKEND_URL}/users`,
    //   {
    //     method: "PUT",
    //     credentials: "include",
    //     headers: {
    //       "Content-Type": "application/json",
    //     },
    //     body: JSON.stringify({
    //       linked_users: [
    //         {
    //           domain: sourceLinkData.initiator,
    //           user: sourceLinkData.user,
    //         },
    //       ],
    //     }),
    //   }
    // );

    // if (!userUpdateResp.ok) {
    //   throw new Error("user_update_failed");
    // }
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
