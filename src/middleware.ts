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
  "/settings",
  "/onboarding",
  "/admin",
  "/admin/courses",
  "/admin/journeys",
  "/author",
];

// Routes that authenticated users should not see
const AUTH_ROUTES = ["/login", "/register"];

// Admin auth routes must remain public so they can bootstrap the admin flow.
const ADMIN_AUTH_ROUTES = ["/admin/login", "/admin-login"];
const AUTHOR_AUTH_ROUTES = ["/authors-login", "/authors-register"];

function isAdminPath(pathname: string) {
  return pathname === "/admin" || pathname.startsWith("/admin/");
}

function isAdminAuthPath(pathname: string) {
  return ADMIN_AUTH_ROUTES.some((route) => pathname === route || pathname.startsWith(`${route}/`));
}

function isAuthorPath(pathname: string) {
  return pathname === "/author" || pathname.startsWith("/author/");
}

function isAuthorAuthPath(pathname: string) {
  return AUTHOR_AUTH_ROUTES.some((route) => pathname === route || pathname.startsWith(`${route}/`));
}

function redirectForRequest(request: NextRequest, path: string) {
  // Keep the origin the visitor used. In development, switching between
  // localhost and 127.0.0.1 loses the host-only Supabase session cookie.
  const host = request.headers.get("x-forwarded-host") ?? request.headers.get("host");
  const protocol = (request.headers.get("x-forwarded-proto") ?? request.nextUrl.protocol).split(",")[0].trim().replace(/:$/, "");
  const origin = host ? `${protocol}://${host}` : request.nextUrl.origin;
  return NextResponse.redirect(new URL(path, origin));
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const nextParam = request.nextUrl.searchParams.get("next") ?? "";

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

  let role: string | null = null;
  if (user) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("user_id", user.id)
      .maybeSingle();
    role = (user.app_metadata?.role as string | undefined) ?? profile?.role ?? null;
  }

  if (isAdminAuthPath(pathname) || isAuthorAuthPath(pathname)) {
    if (user && role === "admin") return redirectForRequest(request, "/admin");
    if (user && role === "author") return redirectForRequest(request, "/author");
    if (user) return redirectForRequest(request, "/today");
    return response;
  }

  if (user && AUTH_ROUTES.some((route) => pathname.startsWith(route))) {
    if (nextParam.startsWith("/admin") && role === "admin") return redirectForRequest(request, "/admin");
    if (nextParam.startsWith("/author") && role === "author") return redirectForRequest(request, "/author");
    if (role === "admin") return redirectForRequest(request, "/admin");
    if (role === "author") return redirectForRequest(request, "/author");
    return redirectForRequest(request, "/today");
  }

  // Redirect unauthenticated users away from protected routes
  if (!user && PROTECTED_ROUTES.some((route) => pathname.startsWith(route))) {
    const host = request.headers.get("x-forwarded-host") ?? request.headers.get("host");
    const protocol = (request.headers.get("x-forwarded-proto") ?? request.nextUrl.protocol).split(",")[0].trim().replace(/:$/, "");
    const origin = host ? `${protocol}://${host}` : request.nextUrl.origin;
    const loginUrl = new URL(isAdminPath(pathname) ? "/admin-login" : isAuthorPath(pathname) ? "/authors-login" : "/login", origin);
    loginUrl.searchParams.set("next", `${pathname}${request.nextUrl.search}`);
    return NextResponse.redirect(loginUrl);
  }

  // Non-admin users should not stay on admin pages.
  if (user && isAdminPath(pathname) && role !== "admin") {
    return redirectForRequest(request, role === "author" ? "/author" : "/today");
  }

  if (user && isAuthorPath(pathname) && role !== "author") {
    return redirectForRequest(request, role === "admin" ? "/admin" : "/today");
  }

  return response;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|icon.svg|apple-icon.svg|sw.js|manifest.webmanifest|branding/).*)",
  ],
};

