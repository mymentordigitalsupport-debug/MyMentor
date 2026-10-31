import { createSupabaseServerClient } from "@/lib/supabase/server";

export type ArticleActorRole = "user" | "author_pending" | "author" | "author_rejected" | "admin" | null;

export async function getArticleActor() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { supabase, user: null, role: null as ArticleActorRole };

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("user_id", user.id)
    .maybeSingle();

  return {
    supabase,
    user,
    role: (profile?.role as ArticleActorRole | undefined) ?? (user.app_metadata?.role as ArticleActorRole | undefined) ?? "user",
  };
}

export function isArticleAdmin(role: ArticleActorRole) {
  return role === "admin";
}

export function isApprovedAuthor(role: ArticleActorRole) {
  return role === "author";
}
