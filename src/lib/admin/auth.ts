export const ADMIN_OVERRIDE_COOKIE = "my_mentor_admin_override";

export const HARDCODED_ADMIN_CREDENTIALS = {
  email: "admin@out.com",
  password: "admin123",
} as const;

export function matchesHardcodedAdminCredentials(email: string, password: string) {
  return email.trim().toLowerCase() === HARDCODED_ADMIN_CREDENTIALS.email && password === HARDCODED_ADMIN_CREDENTIALS.password;
}
