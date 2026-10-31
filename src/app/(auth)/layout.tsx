// Auth pages use the root layout directly — no extra shell needed.
// This file exists to define the (auth) route group.
export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
