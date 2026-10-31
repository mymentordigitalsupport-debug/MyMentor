import { createSupabaseAdminClient } from "@/lib/supabase/admin";

function configuredOrigins() {
  return [process.env.NEXT_PUBLIC_SITE_URL, process.env.SITE_URL]
    .filter((value): value is string => Boolean(value))
    .map((value) => {
      try {
        return new URL(value).origin;
      } catch {
        return null;
      }
    })
    .filter((value): value is string => Boolean(value));
}

export function hasTrustedOrigin(request: Request) {
  const origin = request.headers.get("origin");
  if (!origin) return false;

  const requestOrigin = new URL(request.url).origin;
  return origin === requestOrigin || configuredOrigins().includes(origin);
}

export function requestClientKey(request: Request) {
  const forwarded = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim();
  const realIp = request.headers.get("x-real-ip")?.trim();
  return forwarded || realIp || "unknown";
}

export async function takeRateLimit(bucket: string, windowSeconds: number, maxRequests: number) {
  const admin = createSupabaseAdminClient();
  if (!admin) return false;

  const { data, error } = await admin.rpc("security_take_rate_limit", {
    p_bucket: bucket,
    p_window_seconds: windowSeconds,
    p_max_requests: maxRequests,
  });

  if (error) {
    console.error("[security] rate-limit check failed", { code: error.code, message: error.message });
    return false;
  }

  return data === true;
}
