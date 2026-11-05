"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowLeft, ArrowRight, Check, CheckCheck, LockKeyhole, Mail, MailCheck, ShieldCheck, Sprout } from "lucide-react";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
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
type AccountField = "email" | "password" | "confirmPassword";

const STEPS = ["Your account", "Your journey", "Ready to grow"];
const STEP_TITLES = ["First, a little about you", "Find your starting point", "Make yourself at home"];
const STEP_DESCRIPTIONS = [
  "Create your own space for learning and growth.",
  "Choose the book you’d like to explore with us.",
  "A quick check, and your next chapter can begin.",
];

export function RegisterForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const isAnonymousMode = searchParams.get("mode") === "anonymous";
  const toast = useToast();
  const [step, setStep] = useState(0);
  const stepHeading = useRef<HTMLHeadingElement>(null);
  const previousStep = useRef(0);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [fieldErrors, setFieldErrors] = useState<Partial<Record<AccountField, string>>>({});
  const [privacyAccepted, setPrivacyAccepted] = useState(false);
  const [showPopiaDetails, setShowPopiaDetails] = useState(false);
  const [books, setBooks] = useState<BookOption[]>([]);
  const [selectedBookTitle, setSelectedBookTitle] = useState(DEFAULT_COURSE_TITLE);
  const [loadingBooks, setLoadingBooks] = useState(true);
  const [booksError, setBooksError] = useState(false);
  const [booksAttempt, setBooksAttempt] = useState(0);
  const [loading, setLoading] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [confirmationEmail, setConfirmationEmail] = useState<string | null>(null);

  useEffect(() => {
    if (previousStep.current !== step && stepHeading.current) {
      stepHeading.current.focus({ preventScroll: true });
      const headingTop = stepHeading.current.getBoundingClientRect().top;
      if (headingTop < 24 || headingTop > window.innerHeight - 80) {
        window.scrollTo({ top: window.scrollY + headingTop - 24, behavior: "instant" });
      }
    }
    previousStep.current = step;
  }, [step]);

  useEffect(() => {
    let isMounted = true;
    async function loadBooks() {
      setLoadingBooks(true);
      setBooksError(false);
      try {
        const supabase = createSupabaseBrowserClient();
        const { data, error } = await supabase
          .from("course_versions")
          .select("course_id, title, description, status, guidance_path")
          .eq("status", "published")
          .eq("guidance_path", "religious");
        if (error) throw error;

        const courseMap = new Map<string, { id: string; description: string }>();
        for (const version of data ?? []) {
          const matchedBook = COURSE_LIBRARY.find((book) =>
            normalizeCourseKey(version.title).startsWith(normalizeCourseKey(book.title))
          );
          if (!matchedBook || courseMap.has(normalizeCourseKey(matchedBook.title))) continue;
          courseMap.set(normalizeCourseKey(matchedBook.title), {
            id: version.course_id,
            description: version.description ?? "",
          });
        }
        if (isMounted) {
          setBooks(COURSE_LIBRARY.map((book) => {
            const course = courseMap.get(normalizeCourseKey(book.title));
            return { ...book, description: course?.description || book.description, courseId: course?.id ?? null };
          }));
        }
      } catch {
        if (isMounted) setBooksError(true);
      } finally {
        if (isMounted) setLoadingBooks(false);
      }
    }
    void loadBooks();
    return () => { isMounted = false; };
  }, [booksAttempt]);

  const selectedBook = books.find((book) => book.title === selectedBookTitle) ?? null;

  function clearFieldError(field: AccountField) {
    setFieldErrors((current) => ({ ...current, [field]: undefined }));
  }

  function goToStep(nextStep: number) {
    setSubmitError(null);
    setStep(nextStep);
  }

  function validateAccount() {
    const errors: Partial<Record<AccountField, string>> = {};
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) errors.email = "Enter a valid email address.";
    if (password.length < 8) errors.password = "Use at least 8 characters for your password.";
    if (!confirmPassword || password !== confirmPassword) errors.confirmPassword = "Your passwords need to match.";
    setFieldErrors(errors);
    const firstInvalidField = (Object.keys(errors) as AccountField[])[0];
    if (firstInvalidField) {
      document.getElementById(`register-${firstInvalidField}`)?.focus();
      return false;
    }
    return true;
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (loading) return;
    setSubmitError(null);
    if (step === 0) {
      if (validateAccount()) goToStep(1);
      return;
    }
    if (step === 1) {
      if (!loadingBooks && !booksError && selectedBook?.isAvailable) goToStep(2);
      return;
    }
    if (!validateAccount()) { goToStep(0); return; }
    if (loadingBooks || booksError || !selectedBook?.isAvailable) { goToStep(1); return; }
    if (!privacyAccepted) {
      setSubmitError("Please acknowledge the privacy notice to continue.");
      return;
    }

    setLoading(true);
    try {
      const supabase = createSupabaseBrowserClient();
      let resolvedCourseId = selectedBook.courseId;
      if (!resolvedCourseId) {
        const { data: fallbackCourse, error: fallbackError } = await supabase
          .from("course_versions")
          .select("course_id")
          .eq("status", "published")
          .eq("guidance_path", "religious")
          .ilike("title", `${selectedBook.title} - %`)
          .maybeSingle();
        if (!fallbackError) resolvedCourseId = fallbackCourse?.course_id ?? null;
      }
      if (!resolvedCourseId) throw new Error("This book does not have an active study path yet. Please try again later.");

      const normalizedEmail = email.trim();
      const baseUsername = normalizedEmail.split("@")[0]?.trim() || "Friend";
      const displayName = isAnonymousMode ? randomAnonymousName(ANONYMOUS_NAMES) : baseUsername;
      const { data, error: authError } = await supabase.auth.signUp({
        email: normalizedEmail,
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
        if (/already registered|already exists/i.test(authError.message)) {
          throw new Error("An account with this email already exists. Please sign in instead.");
        }
        throw authError;
      }
      if (!data.user) throw new Error("Unable to create your account. Please try again.");
      if (!data.session) {
        setConfirmationEmail(normalizedEmail);
        return;
      }

      await supabase.from("profiles").update({
        display_name: displayName,
        display_name_mode: isAnonymousMode ? "nickname" : "real_name",
        anonymous_name: isAnonymousMode ? displayName : null,
        is_anonymous: isAnonymousMode,
        selected_course_id: resolvedCourseId,
        username: isAnonymousMode ? null : baseUsername,
      }).eq("user_id", data.user.id);
      await fetch("/api/auth/member-welcome", { method: "POST" }).catch(() => undefined);
      toast.success("Account Created!", "Your account has been created successfully. Welcome!");
      router.push("/onboarding");
      router.refresh();
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unable to create your account right now. Please try again.";
      setSubmitError(message);
      toast.error("Registration unavailable", message);
    } finally {
      setLoading(false);
    }
  }

  if (confirmationEmail) {
    return (
      <div className="signup-confirmation" role="status">
        <span className="signup-confirmation-icon"><MailCheck size={36} strokeWidth={1.5} aria-hidden="true" /></span>
        <p className="signup-eyebrow">One last little step</p>
        <h2>Check your inbox</h2>
        <p>We’ve sent a confirmation link to <strong>{confirmationEmail}</strong>. Follow the link to finish creating your account.</p>
        <p className="signup-fine-print">Can’t find it? Take a look in your spam folder.</p>
        <Link href="/login" className="signup-primary">Back to sign in <ArrowRight size={19} aria-hidden="true" /></Link>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="member-signup-form" aria-label="Create a member account" aria-busy={loading} noValidate>
      <nav className="signup-progress" aria-label="Registration progress">
        <ol>
          {STEPS.map((label, index) => (
            <li key={label} className={index < step ? "is-complete" : index === step ? "is-current" : ""}>
              <button type="button" onClick={() => goToStep(index)} disabled={index > step || loading} aria-current={index === step ? "step" : undefined}>
                <span className="signup-step-number">{index < step ? <Check size={16} strokeWidth={2.5} aria-hidden="true" /> : index + 1}</span>
                <span>{label}</span>
              </button>
            </li>
          ))}
        </ol>
      </nav>

      <div className="signup-step-body" key={step}>
        <div className="signup-step-heading">
          <h2 ref={stepHeading} tabIndex={-1}>{STEP_TITLES[step]}</h2>
          <p>{STEP_DESCRIPTIONS[step]}</p>
        </div>

        {step === 0 && (
          <>
            <div className="signup-account-fields">
              <div>
                <div className="login-field">
                  <Mail strokeWidth={1.7} aria-hidden="true" />
                  <label htmlFor="register-email" className="sr-only">Email address</label>
                  <input id="register-email" name="email" type="email" value={email} onChange={(event) => { setEmail(event.target.value); clearFieldError("email"); }} placeholder="E-mail address" autoComplete="email" autoCapitalize="none" spellCheck={false} required aria-invalid={Boolean(fieldErrors.email)} aria-describedby={fieldErrors.email ? "register-email-error" : undefined} />
                </div>
                {fieldErrors.email && <p className="signup-field-error" id="register-email-error" role="alert">{fieldErrors.email}</p>}
              </div>
              <div>
                <div className="login-field">
                  <LockKeyhole strokeWidth={1.7} aria-hidden="true" />
                  <label htmlFor="register-password" className="sr-only">Password</label>
                  <PasswordInput id="register-password" name="password" value={password} onChange={(event) => { setPassword(event.target.value); clearFieldError("password"); }} placeholder="Create a password" autoComplete="new-password" showStrengthMeter required minLength={8} aria-invalid={Boolean(fieldErrors.password)} aria-describedby={fieldErrors.password ? "register-password-error" : "register-password-hint"} />
                </div>
                {fieldErrors.password ? <p className="signup-field-error" id="register-password-error" role="alert">{fieldErrors.password}</p> : <p className={`signup-password-hint${password.length >= 8 ? " is-valid" : ""}`} id="register-password-hint">{password.length >= 8 && <Check size={13} aria-hidden="true" />}At least 8 characters. Make it your own.</p>}
              </div>
              <div>
                <div className="login-field">
                  <CheckCheck strokeWidth={1.7} aria-hidden="true" />
                  <label htmlFor="register-confirmPassword" className="sr-only">Confirm password</label>
                  <PasswordInput id="register-confirmPassword" name="confirmPassword" value={confirmPassword} onChange={(event) => { setConfirmPassword(event.target.value); clearFieldError("confirmPassword"); }} placeholder="Confirm your password" autoComplete="new-password" required aria-invalid={Boolean(fieldErrors.confirmPassword)} aria-describedby={fieldErrors.confirmPassword ? "register-confirmPassword-error" : undefined} />
                </div>
                {fieldErrors.confirmPassword && <p className="signup-field-error" id="register-confirmPassword-error" role="alert">{fieldErrors.confirmPassword}</p>}
              </div>
            </div>
            <div className={`signup-privacy-mode${isAnonymousMode ? " is-active" : ""}`}>
              <ShieldCheck size={19} strokeWidth={1.6} aria-hidden="true" />
              <p>{isAnonymousMode ? "Your profile will use a private nickname." : "Prefer a little privacy?"} <Link href={isAnonymousMode ? "/register" : "/register?mode=anonymous"} scroll={false}>{isAnonymousMode ? "Use my name" : "Use a nickname"}</Link></p>
            </div>
          </>
        )}

        {step === 1 && (
          <>
            {loadingBooks ? <div className="signup-loading" role="status"><span className="signup-spinner" />Finding your next chapter…</div> : booksError ? (
              <div className="signup-load-error" role="alert"><p>We couldn’t load the journeys. Please try again.</p><button type="button" className="signup-text-button" onClick={() => setBooksAttempt((attempt) => attempt + 1)}>Try again</button></div>
            ) : (
              <fieldset className="signup-books">
                <legend className="sr-only">Choose your journey</legend>
                {books.map((book) => {
                  const selected = book.title === selectedBookTitle;
                  return (
                    <label key={book.title} className={`signup-book${selected ? " is-selected" : ""}${!book.isAvailable ? " is-coming-soon" : ""}`}>
                      <input type="radio" name="journey" value={book.title} checked={selected} disabled={!book.isAvailable} onChange={() => setSelectedBookTitle(book.title)} />
                      <Image src={book.image} alt="" width={51} height={67} className="signup-book-cover" />
                      <span className="signup-book-copy"><span className="signup-book-status">{book.isAvailable ? "Available now" : "Coming soon"}</span><strong>{book.title}</strong><span className="signup-book-description">{book.description}</span></span>
                      <span className="signup-book-check" aria-hidden="true">{selected && <Check size={14} strokeWidth={2.5} />}</span>
                    </label>
                  );
                })}
              </fieldset>
            )}
          </>
        )}

        {step === 2 && (
          <>
            <div className="signup-review">
              <div className="signup-review-row"><Mail size={19} aria-hidden="true" /><div><span>Your account</span><strong>{email.trim()}</strong>{isAnonymousMode && <small>Community profile: private nickname</small>}</div><button type="button" onClick={() => goToStep(0)} className="signup-text-button" aria-label="Edit account">Edit</button></div>
              <div className="signup-review-row"><Sprout size={20} aria-hidden="true" /><div><span>Your journey</span><strong>{selectedBook?.title}</strong></div><button type="button" onClick={() => goToStep(1)} className="signup-text-button" aria-label="Edit journey">Edit</button></div>
            </div>
            <div className="signup-notice">
              <h3><ShieldCheck size={18} aria-hidden="true" />Your privacy matters</h3>
              <p>We process your account and learning data to provide MyMentor.</p>
              <button type="button" className="signup-text-button" aria-expanded={showPopiaDetails} aria-controls="signup-popia-details" onClick={() => setShowPopiaDetails((shown) => !shown)}>{showPopiaDetails ? "Close privacy notice" : "Read the POPIA notice"}</button>
              {showPopiaDetails && <div id="signup-popia-details" className="signup-notice-details">
                <p>By creating an account, you acknowledge that My Mentor will store and process your account information and profile settings, and any content you choose to add while using the app, such as progress, journal entries, mood check-ins, and saved insights.</p>
                <p>We use essential cookies and session data to sign you in, keep your session active, and make the app work correctly.</p>
                <p>Our database is hosted in Singapore. We use reasonable safeguards to protect your personal information.</p>
                <Link href="/privacy" target="_blank" rel="noopener noreferrer">Full privacy policy <ArrowRight size={12} aria-hidden="true" /></Link>
              </div>}
            </div>
            <label className={`signup-consent${privacyAccepted ? " is-accepted" : ""}`}>
              <input type="checkbox" checked={privacyAccepted} onChange={(event) => setPrivacyAccepted(event.target.checked)} />
              <span>I have read and understand the POPIA notice.</span>
            </label>
          </>
        )}
      </div>

      {submitError && <p className="signup-submit-error" role="alert">{submitError}</p>}
      <div className={`signup-actions${step === 0 ? " signup-actions--first" : ""}`}>
        {step > 0 && <button type="button" className="signup-back" onClick={() => goToStep(step - 1)} disabled={loading}><ArrowLeft size={18} aria-hidden="true" />Back</button>}
        <button type="submit" className="signup-primary" disabled={loading || (step === 1 && (loadingBooks || booksError || !selectedBook?.isAvailable)) || (step === 2 && !privacyAccepted)}>
          {loading ? <><span className="signup-spinner" />Creating your account…</> : <>{step === 0 ? "Choose my journey" : step === 1 ? "Continue" : "Create my account"}<ArrowRight size={19} aria-hidden="true" /></>}
        </button>
      </div>
      <p className="signup-signin">Already part of MyMentor? <Link href="/login">Sign in</Link></p>
    </form>
  );
}
