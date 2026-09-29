import { Link, useLocation } from "react-router-dom";
import { SEO } from "@/components/SEO";

const NAV = [
  { label: "Overview", to: "/admin" },
  { label: "Users", to: "/admin/users" },
  { label: "Live Classes", to: "/admin/classes" },
  { label: "Applications", to: "/admin/applications" },
  { label: "Feedback", to: "/admin/feedback" },
];

export function AdminLayout({ title, children }: { title: string; children: React.ReactNode }) {
  const { pathname } = useLocation();

  return (
    <div className="min-h-screen bg-background font-poppins text-foreground">
      <SEO title={`${title} — Admin — WorthScope`} description="WorthScope admin dashboard." path={pathname} />

      <div className="flex">
        <aside className="hidden w-[220px] shrink-0 border-r border-border px-4 py-6 md:block">
          <Link to="/dashboard" className="mb-1 block text-[12px] font-semibold text-text3 hover:text-accent">
            ← Back to app
          </Link>
          <div className="mb-6 mt-3 text-[11px] font-bold uppercase tracking-[1.5px] text-accent">Admin</div>
          <nav className="flex flex-col gap-1">
            {NAV.map((item) => {
              const active = pathname === item.to;
              return (
                <Link
                  key={item.to}
                  to={item.to}
                  className={[
                    "rounded-[10px] px-4 py-[11px] text-[14px] font-medium transition-colors",
                    active ? "bg-accent/10 text-accent" : "text-text2 hover:bg-bg-elevated hover:text-foreground",
                  ].join(" ")}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </aside>

        <main className="min-w-0 flex-1 px-4 py-8 md:px-10 md:py-10">
          <div className="mx-auto w-full max-w-[1040px]">
            <h1 className="text-[22px] font-bold text-foreground">{title}</h1>
            <div className="mt-6">{children}</div>
          </div>
        </main>
      </div>
    </div>
  );
}
