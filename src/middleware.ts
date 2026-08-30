import { NextRequest, NextResponse } from "next/server";
import { getSessionFromRequest, isStaff } from "@/lib/auth";

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const session = getSessionFromRequest(req);

  if (pathname.startsWith("/admin")) {
    if (!session || !isStaff(session.role)) {
      const loginUrl = new URL("/login", req.url);
      loginUrl.searchParams.set("next", pathname);
      loginUrl.searchParams.set("as", "admin");
      return NextResponse.redirect(loginUrl);
    }
  }

  if (pathname.startsWith("/student")) {
    if (!session || session.role !== "STUDENT") {
      const loginUrl = new URL("/login", req.url);
      loginUrl.searchParams.set("next", pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/student/:path*"],
};
