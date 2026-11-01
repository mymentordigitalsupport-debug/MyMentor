import { DesktopSidebar } from "@/components/layout/DesktopSidebar";
import "@/components/today/member-dashboard.css";
import "@/components/course/course-dashboard.css";

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="member-shell">
      <a className="member-skip-link" href="#member-content">Skip to content</a>
      <DesktopSidebar />

      <div className="member-workspace">
        <main id="member-content" className="member-main" tabIndex={-1}>
          {children}
        </main>
      </div>
    </div>
  );
}
