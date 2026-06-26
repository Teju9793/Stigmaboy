import { type NextRequest, NextResponse } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";

// Routes that require authentication
const PROTECTED_ROUTES = ["/dashboard", "/dashboard/:path*"];

// Routes that require admin role
const ADMIN_ROUTES = ["/admin", "/admin/:path*"];

// Routes only for unauthenticated users (redirect if logged in)
const AUTH_ROUTES = ["/login", "/register"];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // 1. Refresh session — always runs
  const { supabaseResponse, user } = await updateSession(request);

  // 2. CSRF check: for all state-mutating API routes, verify Origin header
  if (
    request.method !== "GET" &&
    request.method !== "HEAD" &&
    pathname.startsWith("/api/")
  ) {
    const origin = request.headers.get("origin");
    const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

    // Allow requests with no origin (same-origin form posts) and matching origins
    // Block cross-origin requests to our API routes
    if (origin && !origin.startsWith(appUrl)) {
      return new NextResponse(
        JSON.stringify({
          error: "Forbidden",
          code: "CSRF_VIOLATION",
          message: "Cross-origin request blocked",
        }),
        {
          status: 403,
          headers: { "Content-Type": "application/json" },
        }
      );
    }
  }

  // 3. Auth route redirect (already logged in → go to dashboard)
  if (AUTH_ROUTES.some((route) => pathname === route)) {
    if (user) {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }
    return supabaseResponse;
  }

  // 4. Protected route check
  const isProtected = PROTECTED_ROUTES.some(
    (route) =>
      pathname === route.replace(":path*", "") ||
      pathname.startsWith(route.replace("/:path*", "/"))
  );

  const isAdmin = ADMIN_ROUTES.some(
    (route) =>
      pathname === route.replace(":path*", "") ||
      pathname.startsWith(route.replace("/:path*", "/"))
  );

  if ((isProtected || isAdmin) && !user) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // 5. Admin route — role check happens in the admin layout (server component)
  // Middleware only checks session, role is verified server-side to avoid
  // an extra DB round-trip on every middleware invocation

  return supabaseResponse;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization)
     * - favicon.ico, sitemap.xml, robots.txt
     * - Public images/files
     */
    "/((?!_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
