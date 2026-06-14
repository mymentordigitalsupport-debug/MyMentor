import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

// Routes that require authentication
const PROTECTED_ROUTES = [
  "/today",
  "/course",
  "/journey",
  "/journal",
  "/progress",
  "/resources",
  "/onboarding",
  "/admin",
  "/admin/courses",
  "/admin/journeys",
];

// Routes that authenticated users should not see
const AUTH_ROUTES = ["/login", "/register"];

// Admin auth routes must remain public so they can bootstrap the admin flow.
const ADMIN_AUTH_ROUTES = ["/admin/login", "/admin-login"];

function isAdminPath(pathname: string) {
  return pathname === "/admin" || pathname.startsWith("/admin/");
}

function isAdminAuthPath(pathname: string) {
  return ADMIN_AUTH_ROUTES.some((route) => pathname === route || pathname.startsWith(`${route}/`));
}

export async function middleware(request: NextRequest) {
  // If Supabase env vars are not set, skip auth checks entirely (dev convenience)
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (
    !supabaseUrl ||
    !supabaseKey ||
    supabaseUrl === "https://your-project-ref.supabase.co"
  ) {
    return NextResponse.next({ request: { headers: request.headers } });
  }

  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  const supabase = createServerClient(supabaseUrl, supabaseKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(
        cookiesToSet: Array<{
          name: string;
          value: string;
          options: CookieOptions;
        }>
      ) {
        cookiesToSet.forEach(({ name, value }) =>
          request.cookies.set(name, value)
        );
        response = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) =>
          response.cookies.set(name, value, options)
        );
      },
    },
  });

  // Refresh session — primary purpose of middleware
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { pathname } = request.nextUrl;
  const nextParam = request.nextUrl.searchParams.get("next") ?? "";

  let role: string | null = null;
  if (user) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("user_id", user.id)
      .maybeSingle();
    role = (user.app_metadata?.role as string | undefined) ?? profile?.role ?? null;
  }

  // Redirect authenticated users away from auth pages
  if (user && AUTH_ROUTES.some((route) => pathname.startsWith(route))) {
    if (nextParam.startsWith("/admin") && role === "admin") {
      return NextResponse.redirect(new URL("/admin", request.url));
    }

    if (nextParam.startsWith("/admin")) {
      return NextResponse.redirect(new URL("/admin", request.url));
    }

    return NextResponse.redirect(new URL("/today", request.url));
  }

  // Keep admin auth routes public so unauthenticated users can reach the dedicated admin login.
  if (isAdminAuthPath(pathname)) {
    return response;
  }

  // Redirect unauthenticated users away from protected routes
  if (!user && PROTECTED_ROUTES.some((route) => pathname.startsWith(route))) {
    const loginUrl = new URL(isAdminPath(pathname) ? "/admin/login" : "/login", request.url);
    loginUrl.searchParams.set("next", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Non-admin users should not stay on admin pages.
  if (user && isAdminPath(pathname) && role !== "admin") {
    return NextResponse.redirect(new URL("/today", request.url));
  }

  return response;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|icon.svg|apple-icon.svg|sw.js|manifest.webmanifest|branding/).*)",
  ],
};

