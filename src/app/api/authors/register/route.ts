import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { queueAdminNotification, queueUserEmail } from "@/lib/transactional-email";
import { hasTrustedOrigin, requestClientKey, takeRateLimit } from "@/lib/security";

type Payload = {
  fullName?: string;
  publicName?: string;
  email?: string;
  password?: string;
  bio?: string;
  expertiseSummary?: string;
  intendedTopics?: string[];
  motivation?: string;
  websiteUrl?: string;
  portfolioUrl?: string;
};

function text(value: unknown, max: number) {
  return typeof value === "string" ? value.trim().slice(0, max) : "";
}

function validUrl(value: string) {
  if (!value) return true;
  try {
    const url = new URL(value);
    return url.protocol === "https:" || url.protocol === "http:";
  } catch {
    return false;
  }
}

export async function POST(request: Request) {
  if (!hasTrustedOrigin(request)) return NextResponse.json({ error: "Invalid request origin." }, { status: 403 });
  const admin = createSupabaseAdminClient();
  if (!admin) return NextResponse.json({ error: "Registration is not configured." }, { status: 503 });

  let createdUserId: string | null = null;

  try {
    const raw = (await request.json()) as Payload;
    const fullName = text(raw.fullName, 120);
    const publicName = text(raw.publicName, 120);
    const email = text(raw.email, 254).toLowerCase();
    const password = text(raw.password, 256);
    const bio = text(raw.bio, 900);
    const expertiseSummary = text(raw.expertiseSummary, 1200);
    const motivation = text(raw.motivation, 1200);
    const intendedTopics = Array.from(new Set((raw.intendedTopics ?? []).map((topic) => text(topic, 80)).filter(Boolean))).slice(0, 8);
    const websiteUrl = text(raw.websiteUrl, 500);
    const portfolioUrl = text(raw.portfolioUrl, 500);

    if (!await takeRateLimit(`author-registration:ip:${requestClientKey(request)}`, 3600, 5)) {
      return NextResponse.json({ error: "Too many requests. Please try again later." }, { status: 429 });
    }

    if (!fullName || !publicName || !email || password.length < 8 || !bio || !expertiseSummary || !motivation || !intendedTopics.length) {
      return NextResponse.json({ error: "Please complete all required application fields. Passwords must be at least 8 characters." }, { status: 400 });
    }
    if (!/^\S+@\S+\.\S+$/.test(email) || !validUrl(websiteUrl) || !validUrl(portfolioUrl)) {
      return NextResponse.json({ error: "Enter a valid email address and valid website links where supplied." }, { status: 400 });
    }

    if (!await takeRateLimit(`author-registration:email:${email}`, 86400, 3)) {
      return NextResponse.json({ error: "Too many requests. Please try again later." }, { status: 429 });
    }

    const url = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
    const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";
    if (!url || !anonKey) return NextResponse.json({ error: "Registration is not configured." }, { status: 503 });

    // Use the normal sign-up flow so Supabase owns password handling and email
    // confirmation. This route never creates an already-confirmed account.
    const authClient = createClient(url, anonKey, { auth: { persistSession: false, autoRefreshToken: false } });
    const { data: created, error: createError } = await authClient.auth.signUp({
      email,
      password,
      options: { data: { full_name: fullName, display_name: publicName } },
    });
    const userId = created.user?.id ?? null;

    if (createError || !userId) {
      return NextResponse.json({ success: true, pendingConfirmation: true }, { status: 202 });
    }

    // Supabase deliberately returns an obfuscated user for an existing address
    // when email confirmation is enabled. Do not attach an application to it.
    if ((created.user?.identities?.length ?? 0) === 0) {
      return NextResponse.json({ success: true, pendingConfirmation: true }, { status: 202 });
    }
    createdUserId = userId;

    const { data: existingApplication, error: existingApplicationError } = await admin
      .from("article_author_applications")
      .select("status")
      .eq("user_id", userId)
      .maybeSingle();
    if (existingApplicationError) throw existingApplicationError;
    if (existingApplication) {
      return NextResponse.json({ success: true, alreadySubmitted: true, status: existingApplication.status });
    }

    const { error: profileError } = await admin
      .from("profiles")
      .update({ display_name: publicName, role: "author_pending", updated_at: new Date().toISOString() })
      .eq("user_id", userId);
    if (profileError) throw profileError;

    const { error: applicationError } = await admin.from("article_author_applications").insert({
      user_id: userId,
      full_name: fullName,
      public_name: publicName,
      bio,
      expertise_summary: expertiseSummary,
      intended_topics: intendedTopics,
      motivation,
      website_url: websiteUrl || null,
      portfolio_url: portfolioUrl || null,
    });
    if (applicationError) throw applicationError;

    try {
      await queueUserEmail(admin, {
        userId,
        eventKey: `author-application-received:${userId}`,
        eventType: "author_application_received",
        template: "authorApplicationReceived",
        firstName: fullName,
      });
    } catch {
      console.error("[transactional-email] author application email queue failed", { userId });
    }
    try {
      await queueAdminNotification(admin, {
        eventKey: `admin-author-application:${userId}`,
        eventType: "admin_author_application_received",
        title: "New author application",
        details: `${fullName} (${email}) submitted an author application as ${publicName}.`,
        pathname: "/admin/articles",
      });
    } catch {
      console.error("[transactional-email] admin author application notification queue failed", { userId });
    }

    return NextResponse.json({ success: true }, { status: 201 });
  } catch (error) {
    // Avoid leaving an authentication account behind if its application could not be saved.
    if (createdUserId) await admin.auth.admin.deleteUser(createdUserId);
    if (typeof error === "object" && error && "code" in error && error.code === "23514") {
      return NextResponse.json({ error: "Author registration is not ready yet. The author-role database update still needs to be applied." }, { status: 503 });
    }
    console.error("[authors/register] application failed", error);
    return NextResponse.json({ error: "Unable to submit your author application." }, { status: 500 });
  }
}
