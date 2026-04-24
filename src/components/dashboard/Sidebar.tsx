import { IconHome, IconMap, IconTarget, IconChart, IconSpark, IconSettings } from "./icons";
import type { ComponentType } from "react";
import logo from "@/assets/worthscope-logo.png";

type Item = { label: string; Icon: ComponentType<{ className?: string }>; active?: boolean };

const items: Item[] = [
  { label: "Dashboard", Icon: IconHome, active: true },
  { label: "My Roadmap", Icon: IconMap },
  { label: "Missions", Icon: IconTarget },
  { label: "Skill Progress", Icon: IconChart },
  { label: "Koko AI", Icon: IconSpark },
  { label: "Settings", Icon: IconSettings },
];

export const Sidebar = () => {
  return (
    <aside className="hidden md:flex fixed left-0 top-0 z-40 h-screen w-[220px] flex-col border-r border-border bg-card px-4 py-6">
      <div className="mb-9 px-1">
        <img src={logo} alt="WorthScope — See Your Worth. Build Your Future." className="h-10 w-auto object-contain" />
      </div>

      <nav className="flex flex-col gap-1">
        {items.map(({ label, Icon, active }) => (
          <a
            key={label}
            href="#"
            className={[
              "group relative flex items-center gap-3 rounded-[10px] px-4 py-[11px] text-[14px] font-medium transition-colors",
              active
                ? "bg-accent/10 text-accent before:absolute before:left-0 before:top-1/2 before:h-5 before:w-[3px] before:-translate-y-1/2 before:rounded-r-full before:bg-accent"
                : "text-text2 hover:bg-bg-elevated hover:text-foreground",
            ].join(" ")}
          >
            <Icon className="h-[18px] w-[18px]" />
            <span>{label}</span>
          </a>
        ))}
      </nav>

      <div className="mt-auto flex items-center gap-3 rounded-xl border border-border p-3">
        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-accent text-white font-semibold text-[13px]">U</div>
        <div className="min-w-0">
          <div className="truncate text-[13px] font-medium text-foreground">Udochukwu</div>
          <a href="#" className="text-[11px] text-text2 hover:text-accent">View Profile</a>
        </div>
      </div>
    </aside>
  );
};
