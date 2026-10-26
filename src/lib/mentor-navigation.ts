export type MentorNavigation = {
  href: string;
  label: string;
  description: string;
  auto: boolean;
};

type Access = "public" | "member" | "author" | "admin";

type Destination = Omit<MentorNavigation, "auto"> & {
  access: Access[];
  terms: RegExp;
};

const DESTINATIONS: Destination[] = [
  { href: "/", label: "Home", description: "Return to the My Mentor home page.", access: ["public", "member", "author", "admin"], terms: /\b(home|landing page)\b/i },
  { href: "/#articles", label: "Articles", description: "Browse published My Mentor articles.", access: ["public", "member", "author", "admin"], terms: /\b(articles?|blog|read)\b/i },
  { href: "/about", label: "About My Mentor", description: "Learn about My Mentor and Craig.", access: ["public", "member", "author", "admin"], terms: /\b(about|who is craig|craig)\b/i },
  { href: "/register", label: "Register", description: "Create a My Mentor member account.", access: ["public", "member", "author", "admin"], terms: /\b(register|sign up|signup|create (an )?account)\b/i },
  { href: "/login", label: "Sign in", description: "Sign in to My Mentor.", access: ["public", "member", "author", "admin"], terms: /\b(log ?in|sign ?in)\b/i },
  { href: "/authors-register", label: "Author application", description: "Apply to become a My Mentor author.", access: ["public", "member", "author", "admin"], terms: /\b(become an author|author application|apply.*author)\b/i },
  { href: "/authors-login", label: "Author sign in", description: "Sign in to the author workspace.", access: ["public", "author", "admin"], terms: /\b(author login|author sign in)\b/i },
  { href: "/today", label: "Today", description: "Open your daily member dashboard.", access: ["member", "author", "admin"], terms: /\b(today|dashboard|daily)\b/i },
  { href: "/course", label: "Courses", description: "Open your available learning material.", access: ["member", "author", "admin"], terms: /\b(courses?|learning material|learning path)\b/i },
  { href: "/journal", label: "Journal", description: "View your private journal entries.", access: ["member", "author", "admin"], terms: /\b(journal|reflections?)\b/i },
  { href: "/journal/new", label: "New journal entry", description: "Write a private journal entry.", access: ["member", "author", "admin"], terms: /\b(write|new|create|add).{0,28}\b(journal|reflection)\b|\b(journal|reflection).{0,28}\b(write|new|create|add)\b/i },
  { href: "/progress", label: "Progress", description: "View lesson and chapter progress.", access: ["member", "author", "admin"], terms: /\b(progress|completion|completed lessons?)\b/i },
  { href: "/resources", label: "Resources", description: "Open My Mentor tools and support resources.", access: ["member", "author", "admin"], terms: /\b(resources?|tools|support)\b/i },
  { href: "/settings", label: "Settings", description: "Manage your profile and preferences.", access: ["member", "author", "admin"], terms: /\b(settings?|preferences|profile)\b/i },
  { href: "/author", label: "Author workspace", description: "Manage articles and review status.", access: ["author", "admin"], terms: /\b(author workspace|my submissions?|article status|submitted articles?)\b/i },
  { href: "/author/articles/new", label: "New article", description: "Write a new article draft.", access: ["author", "admin"], terms: /\b(write|new|create|submit).{0,28}\barticle\b|\barticle.{0,28}\b(write|new|create|submit)\b/i },
  { href: "/admin", label: "Admin dashboard", description: "Open the admin control panel.", access: ["admin"], terms: /\b(admin|control panel)\b/i },
  { href: "/admin/articles", label: "Admin articles", description: "Review submitted articles.", access: ["admin"], terms: /\b(review|approve|reject).{0,28}\barticles?\b|\barticles?.{0,28}\b(review|approve|reject)\b/i },
  { href: "/admin/users", label: "Admin users", description: "Manage members and author applications.", access: ["admin"], terms: /\b(members?|users?|author applications?)\b/i },
];

function accessFor(role: string | null, signedIn: boolean): Access[] {
  if (role === "admin") return ["public", "member", "author", "admin"];
  if (role === "author") return ["public", "member", "author"];
  return signedIn ? ["public", "member"] : ["public"];
}

function directNavigationRequest(message: string) {
  return /\b(go to|take me to|open|navigate to|show me|bring me to)\b/i.test(message);
}

export function availableMentorRoutes(role: string | null, signedIn: boolean) {
  const permitted = new Set(accessFor(role, signedIn));
  return DESTINATIONS.filter((destination) => destination.access.some((access) => permitted.has(access)));
}

export function resolveMentorNavigation(message: string, role: string | null, signedIn: boolean): MentorNavigation | null {
  const destination = availableMentorRoutes(role, signedIn)
    .filter((item) => item.terms.test(message))
    .sort((left, right) => right.terms.source.length - left.terms.source.length)[0];
  if (!destination) return null;
  return { href: destination.href, label: destination.label, description: destination.description, auto: directNavigationRequest(message) };
}

export function mentorRouteInstructions(role: string | null, signedIn: boolean) {
  return availableMentorRoutes(role, signedIn).map((route) => `${route.label}: ${route.href}`).join("; ");
}
