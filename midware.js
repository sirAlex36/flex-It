import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token;
    const path = req.nextUrl.pathname;

    // If trying to access dashboard without token, redirect to login
    if (path.startsWith("/dashboard") && !token) {
      return NextResponse.redirect(new URL("/login", req.url));
    }

    // If already logged in and trying to access login page, redirect to dashboard
    if (path === "/login" && token) {
      const role = token.role || "user";
      const redirectPaths = {
        admin: "/dashboard/admin",
        organiser: "/dashboard/organiser",
        user: "/dashboard/user",
      };
      return NextResponse.redirect(new URL(redirectPaths[role] || redirectPaths.user, req.url));
    }

    // Role-based access control for admin routes
    if (path.startsWith("/dashboard/admin") && token?.role !== "admin") {
      return NextResponse.redirect(new URL("/dashboard/user", req.url));
    }

    // Role-based access control for organiser routes
    if (path.startsWith("/dashboard/organiser") && !["admin", "organiser"].includes(token?.role)) {
      return NextResponse.redirect(new URL("/dashboard/user", req.url));
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        const path = req.nextUrl.pathname;
        // Allow access to login page
        if (path === "/login") return true;
        // Protect dashboard routes
        if (path.startsWith("/dashboard")) return !!token;
        // Allow all other routes
        return true;
      },
    },
  }
);

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/login",
    "/",
  ],
};