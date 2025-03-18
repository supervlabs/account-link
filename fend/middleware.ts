import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  if (!request.nextUrl.pathname.startsWith("/api")) {
    return NextResponse.next();
  }

  const response = NextResponse.next();

  let allowedOrigins = process.env.CORS_ORIGIN?.split(",") || [];
  allowedOrigins = allowedOrigins.filter((u) => !!u);
  allowedOrigins.push(`http://localhost:${process.env.BACKEND_PORT || 3000}`);

  if (process.env.NEXT_PUBLIC_FRONTEND_URL) {
    allowedOrigins.push(`${process.env.NEXT_PUBLIC_FRONTEND_URL}`);
  }
  if (process.env.NEXT_PUBLIC_BACKEND_URL) {
    allowedOrigins.push(`${process.env.NEXT_PUBLIC_BACKEND_URL}`);
  }
  allowedOrigins = [...new Set(allowedOrigins)];

  const disableCorsPaths = ["/api/user_link"];
  if (
    disableCorsPaths.some((path) => request.nextUrl.pathname.startsWith(path))
  ) {
    response.headers.set("Access-Control-Allow-Origin", "*");
    response.headers.set(
      "Access-Control-Allow-Methods",
      "GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS"
    );
    response.headers.set(
      "Access-Control-Allow-Headers",
      "X-CSRF-Token, X-Requested-With, Accept, Accept-Version, " +
        "Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, " +
        "Authorization, x-user-link-token"
    );
  } else {
    const origin = request.headers.get("origin");
    if (origin && allowedOrigins.includes(origin)) {
      response.headers.set("Access-Control-Allow-Origin", origin);
      response.headers.set("Access-Control-Allow-Credentials", "true");
      response.headers.set(
        "Access-Control-Allow-Methods",
        "GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS"
      );
      response.headers.set(
        "Access-Control-Allow-Headers",
        "X-CSRF-Token, X-Requested-With, Accept, Accept-Version, " +
          "Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, " +
          "Authorization, x-user-link-token"
      );
    }
  }

  // OPTIONS Request (preflight)
  if (request.method === "OPTIONS") {
    return new NextResponse(null, { status: 200, headers: response.headers });
  }

  return response;
}

export const config = {
  matcher: "/api/:path*",
};
