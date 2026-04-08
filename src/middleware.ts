import { NextRequest, NextResponse } from "next/server";

// Routes that require authentication
const protectedRoutes = ["/app"];
const protectedApiRoutes = ["/api/children", "/api/frames", "/api/images"];

// Routes that should redirect to app if authenticated
const authRoutes = ["/auth"];

// Legacy routes that redirect to /auth
const legacyAuthRoutes = ["/login", "/register"];

export async function middleware(request: NextRequest) {
  const sessionCookie = request.cookies.get("auth_session");
  const { pathname } = request.nextUrl;

  // Redirect legacy auth routes to /auth
  const isLegacyRoute = legacyAuthRoutes.some((route) =>
    pathname.startsWith(route)
  );
  if (isLegacyRoute) {
    return NextResponse.redirect(new URL("/auth", request.url));
  }

  // Check if accessing protected route without session
  const isProtectedRoute = protectedRoutes.some((route) =>
    pathname.startsWith(route)
  );

  const isProtectedApiRoute = protectedApiRoutes.some((route) =>
    pathname.startsWith(route)
  );

  if (isProtectedRoute && !sessionCookie) {
    return NextResponse.redirect(new URL("/auth", request.url));
  }

  if (isProtectedApiRoute && !sessionCookie) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Redirect authenticated users away from auth pages
  const isAuthRoute = authRoutes.some((route) => pathname.startsWith(route));

  if (isAuthRoute && sessionCookie) {
    return NextResponse.redirect(new URL("/app", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/app/:path*",
    "/auth",
    "/login",
    "/register",
    "/api/children/:path*",
    "/api/frames/:path*",
    "/api/images/:path*",
  ],
};
