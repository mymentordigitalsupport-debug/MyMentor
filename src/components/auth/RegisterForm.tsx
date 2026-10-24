"use client";

import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { Input } from "@/components/ui/Input";
import { PasswordInput } from "@/components/ui/PasswordInput";
import { useToast } from "@/components/ui/ToastProvider";
import { ANONYMOUS_NAMES } from "@/types";
import { randomAnonymousName } from "@/lib/utils";
import { COURSE_LIBRARY, DEFAULT_COURSE_TITLE, normalizeCourseKey } from "@/lib/course-library";

type BookOption = {
  title: string;
  description: string;
  image: string;
  courseId: string | null;
  isAvailable: boolean;
};

export function RegisterForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const isAnonymousMode = searchParams.get("mode") === "anonymous";
  const toast = useToast();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [privacyAccepted, setPrivacyAccepted] = useState(false);
  const [showPopiaDetails, setShowPopiaDetails] = useState(false);
  const [books, setBooks] = useState<BookOption[]>([]);
  const [selectedBookTitle, setSelectedBookTitle] = useState<string | null>(DEFAULT_COURSE_TITLE);
  const [loadingBooks, setLoadingBooks] = useState(true);

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let isMounted = true;

    async function loadBooks() {
      try {
        const supabase = createSupabaseBrowserClient();
        const { data } = await supabase
          .from("course_versions")
          .select("course_id, title, description, status, guidance_path")
          .eq("status", "published")
          .eq("guidance_path", "religious");

        const courseMap = new Map<string, { id: string; description: string }>();

        for (const version of data ?? []) {
          const matchedBook = COURSE_LIBRARY.find((book) =>
            normalizeCourseKey(version.title).startsWith(normalizeCourseKey(book.title))
          );

          if (!matchedBook || courseMap.has(normalizeCourseKey(matchedBook.title))) {
            continue;
          }

          courseMap.set(normalizeCourseKey(matchedBook.title), {
            id: version.course_id,
            description: version.description ?? "",
          });
        }

        if (isMounted) {
          setBooks(
            COURSE_LIBRARY.map((book) => {
              const course = courseMap.get(normalizeCourseKey(book.title)) ?? null;
              return {
                title: book.title,
                description: course?.description || book.description,
                image: book.image,
                courseId: course?.id ?? null,
                isAvailable: book.isAvailable,
              };
            })
          );
          setSelectedBookTitle(DEFAULT_COURSE_TITLE);
        }
      } finally {
        if (isMounted) {
          setLoadingBooks(false);
        }
      }
    }

    void loadBooks();

    return () => {
      isMounted = false;
    };
  }, []);

  const selectedBook = useMemo(
    () => books.find((book) => book.title === selectedBookTitle) ?? null,
    [books, selectedBookTitle]
  );

  const selectedBookCourseId = selectedBook?.courseId ?? null;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();


    if (!email) {

      toast.error("Missing Email", "Please enter your email address.");
      return;
    }

    if (password !== confirmPassword) {

      toast.error("Password Mismatch", "The passwords you entered do not match.");
      return;
    }

    if (password.length < 8) {

      toast.error("Weak Password", "Password must be at least 8 characters long.");
      return;
    }

    if (!privacyAccepted) {

      toast.error("POPIA Notice", "Please acknowledge the privacy notice before creating your account.");
      return;
    }

    if (!selectedBook || !selectedBook.isAvailable) {

      toast.error("Choose a Book", "Please select the book you want to study before continuing.");
      return;
    }

    setLoading(true);

    const supabase = createSupabaseBrowserClient();
    let resolvedCourseId = selectedBookCourseId;

    if (!resolvedCourseId) {
      const { data: fallbackCourse, error: fallbackError } = await supabase
        .from("course_versions")
        .select("course_id")
        .eq("status", "published")
        .eq("guidance_path", "religious")
        .ilike("title", `${selectedBook.title} - %`)
        .maybeSingle();

      if (!fallbackError) {
        resolvedCourseId = fallbackCourse?.course_id ?? null;
      }
    }

    if (!resolvedCourseId) {

      toast.error(
        "Book Unavailable",
        "The selected book does not have an active study path yet. Please choose the available book."
      );
      setLoading(false);
      return;
    }

    // First, check if email already exists
    try {
      const checkResponse = await fetch("/api/auth/check-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const checkData = await checkResponse.json();

      if (checkData.exists) {

        toast.error("Account Exists", "An account with this email already exists. Please sign in instead.");
        setLoading(false);
        return;
      }
    } catch (err) {
      console.error("Email check failed:", err);
      // Continue with signup anyway
    }

    // Generate a display name for anonymous mode
    const baseUsername = email.split("@")[0]?.trim() || "Friend";
    const displayName = isAnonymousMode
      ? randomAnonymousName(ANONYMOUS_NAMES)
      : baseUsername;

    const { data, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          display_name: displayName,
          anonymous_name: isAnonymousMode ? displayName : null,
          is_anonymous: isAnonymousMode,
          preferred_guidance_path: "religious",
          selected_course_id: resolvedCourseId,
          username: isAnonymousMode ? null : baseUsername,
        },
      },
    });

    if (authError) {
      setLoading(false);

      // Check for duplicate email error
      if (
        authError.message.toLowerCase().includes("already registered") ||
        authError.message.toLowerCase().includes("already exists") ||
        authError.message.toLowerCase().includes("user already registered")
      ) {

        toast.error("Account Exists", "An account with this email already exists. Please sign in instead.");
        return;
      }

      toast.error("Registration Failed", authError.message);
      return;
    }

    // Check if user was actually created
    if (!data.user) {

      toast.error("Registration Failed", "Failed to create account. Please try again.");
      setLoading(false);
      return;
    }

    // Update profile with display_name_mode
    await supabase
      .from("profiles")
      .update({
        display_name: displayName,
        display_name_mode: isAnonymousMode ? "nickname" : "real_name",
        anonymous_name: isAnonymousMode ? displayName : null,
        is_anonymous: isAnonymousMode,
        selected_course_id: resolvedCourseId,
        username: isAnonymousMode ? null : baseUsername,
      })
      .eq("user_id", data.user.id);

    // Success!
    toast.success("Account Created!", "Your account has been created successfully. Welcome!");

    // Redirect to onboarding - profile is created by DB trigger
    router.push("/onboarding");
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="register-form flex flex-col gap-4" noValidate>
      {isAnonymousMode && (
        <div className="rounded-2xl border border-sage/30 bg-sage/10 px-4 py-3">
          <p className="text-sm text-forest">
            🌿 <strong>Anonymous mode</strong> - you&apos;ll receive a private nickname.
            Your email is only used for account recovery.
          </p>
        </div>
      )}

      <Input
        label="Email address"
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="your@email.com"
        autoComplete="email"
        required
      />
      <div className="grid grid-cols-2 gap-3">
      <PasswordInput
        label="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="At least 8 characters"
        autoComplete="new-password"
        showStrengthMeter={true}
        required
      />
      <PasswordInput
        label="Confirm password"
        value={confirmPassword}
        onChange={(e) => setConfirmPassword(e.target.value)}
        placeholder="Repeat your password"
        autoComplete="new-password"
        required
      />
      </div>

      <div className="rounded-2xl border border-sage/20 bg-white/80 p-3 shadow-sm">
        <div className="flex items-center justify-between gap-2">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-forest">Choose your course</p>
            <p className="mt-1 text-sm text-muted">Uprooting Drug Abuse is currently available. The other journeys are coming soon.</p>
          </div>
          {selectedBook ? (
            <span className="rounded-full border border-sage/20 bg-sage/10 px-3 py-1 text-xs font-semibold text-forest">
              Selected
            </span>
          ) : null}
        </div>

        {loadingBooks ? (
          <div className="mt-3 flex items-center justify-center rounded-2xl border border-mist bg-cream py-5">
            <div className="h-5 w-5 animate-spin rounded-full border-2 border-sage border-t-transparent" />
          </div>
        ) : (
          <div className="mt-3 grid gap-2.5 md:grid-cols-3">
            {books.map((book) => {
              const selected = book.title === selectedBookTitle;
              const available = book.isAvailable;

                return (
                  <button
                    key={book.title}
                    type="button"
                    onClick={() => available && setSelectedBookTitle(book.title)}
                    disabled={!available}
                    aria-pressed={selected}
                    className={`group relative overflow-hidden rounded-2xl border text-left outline-none transform-gpu will-change-transform transition-[transform,box-shadow,border-color,background-color,opacity] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] focus-visible:ring-2 focus-visible:ring-sage/30 focus-visible:ring-offset-2 focus-visible:ring-offset-white disabled:cursor-not-allowed ${
                      selected
                        ? "border-sage/70 bg-sage/10 shadow-[0_16px_30px_-26px_rgba(84,112,73,0.45)] scale-[1.01]"
                        : available
                          ? "border-mist bg-cream hover:border-sage/35 hover:shadow-[0_12px_24px_-24px_rgba(31,42,36,0.2)] hover:-translate-y-0.5"
                          : "border-mist/70 bg-cream/60 opacity-60"
                    }`}
                  >
                    <div className="relative flex h-[136px] items-center justify-center p-3">
                      <div
                        className={`relative h-[108px] w-[80px] transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] ${
                          selected ? "scale-[1.04]" : "group-hover:scale-[1.02]"
                        }`}
                      >
                        <Image src={book.image} alt={book.title} fill className="object-contain" />
                      </div>
                      <span
                        className={`absolute bottom-3 left-1/2 h-1.5 w-1.5 -translate-x-1/2 rounded-full transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] ${
                          selected ? "scale-100 bg-sage opacity-100" : "scale-75 bg-sage/40 opacity-0 group-hover:opacity-45"
                        }`}
                        aria-hidden="true"
                      />
                      {!available ? (
                        <span className="absolute right-3 top-3 rounded-full border border-mist bg-cream px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-muted">
                          Coming soon
                        </span>
                      ) : null}
                    </div>
                  </button>
                );
              })}
          </div>
        )}

      </div>


      <div className="rounded-2xl border border-sage/20 bg-white/70 px-4 py-3 text-left shadow-sm">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-forest">
          POPIA notice
        </p>
        <p className="mt-2.5 text-xs leading-relaxed text-muted">
          We process your account and learning data to provide My Mentor.
        </p>
        {showPopiaDetails && <div className="mt-2.5 space-y-1.5 text-xs leading-relaxed text-muted">
          <p>
            By creating an account, you acknowledge that My Mentor will store and process your
            account information and profile settings, and any content you choose to add while
            using the app, such as progress, journal entries, mood check-ins, and saved insights.
          </p>
          <p>
            We use essential cookies and session data to sign you in, keep your session active,
            and make the app work correctly.
          </p>
          <p>
            Our database is hosted in Singapore. We use reasonable safeguards to protect your
            personal information.
          </p>
        </div>}
        <button type="button" onClick={() => setShowPopiaDetails(!showPopiaDetails)} className="mt-2 text-xs font-semibold text-forest underline underline-offset-2 hover:text-[#24392f]">
          {showPopiaDetails ? "Read less" : "Read more"}
        </button>

        <label className="mt-3 flex items-start gap-3 text-xs leading-relaxed text-text">
          <input
            type="checkbox"
            checked={privacyAccepted}
            onChange={(e) => setPrivacyAccepted(e.target.checked)}
            className="mt-0.5 h-4 w-4 rounded border-sage/40 text-sage focus:ring-sage/50"
          />
          <span>I have read and understand this POPIA notice.</span>
        </label>
      </div>

      <div className="mt-1 grid grid-cols-2 gap-3">
        <button
          type="submit"
          disabled={!privacyAccepted || loading}
          className="w-full rounded-full bg-[#e8c573] px-6 py-3.5 text-sm font-semibold text-[#1f1710] transition hover:bg-[#dcb45d] disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loading ? "Creating account…" : isAnonymousMode ? "Continue Anonymously" : "Create Account"}
        </button>
        <Link
        href={isAnonymousMode ? "/register" : "/register?mode=anonymous"}
        className="inline-flex w-full items-center justify-center rounded-full border-2 border-sage/30 bg-sage/5 px-3 py-2.5 text-center text-sm font-medium text-forest transition-all duration-300 hover:bg-sage/10"
      >
        {isAnonymousMode ? "Continue with Name" : "Continue Anonymously"}
      </Link>
      </div>
    </form>
  );
}
