import { getToken } from "next-auth/jwt";
import { NextResponse } from "next/server";

export async function proxy(request) {
  const token = await getToken({
    req: request,
    secret: process.env.NEXTAUTH_SECRET,
  });

  const pathname = request.nextUrl.pathname;

  // Allow public routes
  if (pathname === "/login" || pathname === "/sign-up" || pathname === "/") {
    return NextResponse.next();
  }

  // Protect dashboard routes
  if (!token) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  // Role-based route protection
  if (pathname.startsWith("/dashboard/admin")) {
    if (token.role !== "admin") {
      return NextResponse.redirect(new URL("/dashboard/user", request.url));
    }
  }

  if (pathname.startsWith("/dashboard/user")) {
    if (token.role === "admin") {
      return NextResponse.redirect(new URL("/dashboard/admin", request.url));
    }
  }

  if (pathname.startsWith("/dashboard/organiser")) {
    if (token.role !== "organiser") {
      return NextResponse.redirect(new URL(`/dashboard/${token.role || "user"}`, request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/api/protected/:path*",
    "/profile/:path*",
  ],
};
