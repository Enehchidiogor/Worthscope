import { IconHome, IconMap, IconTarget, IconChart, IconSpark } from "./icons";

const items = [
  { Icon: IconHome, label: "Home", active: true },
  { Icon: IconMap, label: "Roadmap" },
  { Icon: IconTarget, label: "Missions" },
  { Icon: IconChart, label: "Skills" },
  { Icon: IconSpark, label: "Koko" },
];

export const MobileTabBar = () => (
  <nav className="fixed bottom-0 left-0 right-0 z-40 grid grid-cols-5 border-t border-border bg-card/95 backdrop-blur-xl md:hidden">
    {items.map(({ Icon, label, active }) => (
      <button
        key={label}
        className={[
          "flex flex-col items-center gap-1 py-2.5 text-[10px] font-medium transition-colors",
          active ? "text-accent" : "text-text2",
        ].join(" ")}
      >
        <Icon className="h-5 w-5" />
        {label}
      </button>
    ))}
  </nav>
);
