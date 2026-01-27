// proxy.ts

import { auth } from "./auth";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const protectedRoutes = ["/admin", "/requests"];

export async function proxy(req: NextRequest) {
  const session = await auth();
  const url = req.nextUrl;

  // ✅ Safe access with fallback
  const userRole = (session?.user?.role as string | undefined)?.toLowerCase();

  if (
    !session &&
    protectedRoutes.some((route) => url.pathname.startsWith(route))
  ) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  if (url.pathname.startsWith("/admin") && userRole !== "admin") {
    return NextResponse.redirect(new URL("/dashboard", req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/requests/:path*"],
};
