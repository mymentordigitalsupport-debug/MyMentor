export const ADMIN_OVERRIDE_COOKIE = "my_mentor_admin_override";

export const HARDCODED_ADMIN_CREDENTIALS = {
  email: "mymentor@admin.com",
  password: "admin@out.com",
} as const;

export function matchesHardcodedAdminCredentials(email: string, password: string) {
  return (
    email.trim().toLowerCase() === HARDCODED_ADMIN_CREDENTIALS.email &&
    password === HARDCODED_ADMIN_CREDENTIALS.password
  );
}
