import { DesktopSidebar } from "@/components/layout/DesktopSidebar";

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-sand lg:flex">
      <DesktopSidebar />

      <div className="flex min-w-0 flex-1 flex-col bg-[linear-gradient(180deg,rgba(251,249,245,0.98)_0%,rgba(246,243,237,0.98)_100%)]">
        <main className="flex-1 px-4 py-6 sm:px-6 lg:px-8">
          {children}
        </main>
      </div>
    </div>
  );
}
