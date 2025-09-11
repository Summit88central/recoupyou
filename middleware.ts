import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  // 1. Get the admin session cookie from the request
  const sessionCookie = request.cookies.get("admin-session");

  // 2. Check if the user is trying to access a protected admin route
  if (request.nextUrl.pathname.startsWith("/admin")) {
    // 3. If there's no session cookie, redirect them to the login page
    if (!sessionCookie) {
      console.log("No session cookie found, redirecting to login.");
      // The absolute URL is needed for redirects in middleware
      const loginUrl = new URL("/login", request.url);
      return NextResponse.redirect(loginUrl);
    }
  }

  // 4. If they have a cookie or are not on an admin route, let them proceed
  return NextResponse.next();
}

// This config specifies which routes the middleware should run on.
export const config = {
  matcher: "/admin/:path*", // Protects all routes inside the /admin directory
};
