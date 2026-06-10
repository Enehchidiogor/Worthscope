import { useEffect, useState } from "react";
import { IconHome, IconMap, IconTarget, IconChart, IconBriefcase, IconSettings } from "./icons";
import type { ComponentType } from "react";
import { Link } from "react-router-dom";
import logo from "@/assets/worthscope-logo.png";
import { getProfile } from "@/lib/userState";
import { UserAvatar } from "@/components/UserAvatar";

type Item = { label: string; Icon: ComponentType<{ className?: string }>; to: string };

const items: Item[] = [
  { label: "Dashboard", Icon: IconHome, to: "/dashboard" },
  { label: "My Roadmap", Icon: IconMap, to: "/roadmap" },
  { label: "Missions", Icon: IconTarget, to: "/missions" },
  { label: "Skill Progress", Icon: IconChart, to: "/skills" },
  { label: "Career Opportunities", Icon: IconBriefcase, to: "/career" },
  { label: "Settings", Icon: IconSettings, to: "/settings" },
];

export const Sidebar = ({ activePath = "/" }: { activePath?: string }) => {
  const [name, setName] = useState("Welcome");
  const [initial, setInitial] = useState("U");
  useEffect(() => {
    const p = getProfile();
    if (p?.firstName) {
      setName(p.firstName);
      setInitial(p.firstName[0].toUpperCase());
    }
  }, []);

  return (
    <aside className="hidden md:flex fixed left-0 top-0 z-40 h-screen w-[220px] flex-col border-r border-border bg-card px-4 py-6">
      <div className="mb-9 px-1">
        <img src={logo} alt="WorthScope — See Your Worth. Build Your Future." className="h-16 w-auto object-contain" />
      </div>

      <nav className="flex flex-col gap-1">
        {items.map(({ label, Icon, to }) => {
          const active = activePath === to;
          return (
            <Link
              key={label}
              to={to}
              className={[
                "group relative flex items-center gap-3 rounded-[10px] px-4 py-[11px] text-[14px] font-medium transition-colors",
                active
                  ? "bg-accent/10 text-accent before:absolute before:left-0 before:top-1/2 before:h-5 before:w-[3px] before:-translate-y-1/2 before:rounded-r-full before:bg-accent"
                  : "text-text2 hover:bg-bg-elevated hover:text-foreground",
              ].join(" ")}
            >
              <Icon className="h-[18px] w-[18px]" />
              <span>{label}</span>
            </Link>
          );
        })}
      </nav>

      <Link to="/profile" className="mt-auto flex items-center gap-3 rounded-xl border border-border p-3 transition-colors hover:bg-bg-elevated">
        <UserAvatar size={36} fallbackInitial={initial} fallbackName={name} />
        <div className="min-w-0">
          <div className="truncate text-[13px] font-medium text-foreground">{name}</div>
          <span className="text-[11px] text-text2 hover:text-accent">View Profile</span>
        </div>
      </Link>
    </aside>
  );
};
