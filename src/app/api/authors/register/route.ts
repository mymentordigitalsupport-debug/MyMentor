import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { queueUserEmail } from "@/lib/transactional-email";

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

    if (!fullName || !publicName || !email || password.length < 8 || !bio || !expertiseSummary || !motivation || !intendedTopics.length) {
      return NextResponse.json({ error: "Please complete all required application fields. Passwords must be at least 8 characters." }, { status: 400 });
    }
    if (!/^\S+@\S+\.\S+$/.test(email) || !validUrl(websiteUrl) || !validUrl(portfolioUrl)) {
      return NextResponse.json({ error: "Enter a valid email address and valid website links where supplied." }, { status: 400 });
    }

    const { data: created, error: createError } = await admin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { full_name: fullName, display_name: publicName },
    });
    let userId = created.user?.id ?? null;

    if (createError || !userId) {
      // A previous incomplete application, or an existing member applying to write,
      // can safely continue only after proving ownership of the account password.
      const url = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
      const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";
      const authClient = createClient(url, anonKey, { auth: { persistSession: false, autoRefreshToken: false } });
      const { data: signedIn, error: signInError } = await authClient.auth.signInWithPassword({ email, password });
      if (signInError || !signedIn.user) {
        return NextResponse.json({ error: "An account already uses this email. Sign in with its correct password or use a different email address." }, { status: 409 });
      }
      userId = signedIn.user.id;
      await authClient.auth.signOut();
    } else {
      createdUserId = userId;
    }

    const { data: existingApplication, error: existingApplicationError } = await admin
      .from("article_author_applications")
      .select("status")
      .eq("user_id", userId)
      .maybeSingle();
    if (existingApplicationError) throw existingApplicationError;
    if (existingApplication) {
      return NextResponse.json({
        success: true,
        alreadySubmitted: true,
        status: existingApplication.status,
      });
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

    return NextResponse.json({ success: true }, { status: 201 });
  } catch (error) {
    // Avoid leaving an authentication account behind if its application could not be saved.
    if (createdUserId) await admin.auth.admin.deleteUser(createdUserId);
    if (typeof error === "object" && error && "code" in error && error.code === "23514") {
      return NextResponse.json({ error: "Author registration is not ready yet. The author-role database update still needs to be applied." }, { status: 503 });
    }
    const message = error instanceof Error ? error.message : "Unable to submit your author application.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
