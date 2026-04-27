import { IconLayers, IconBulb, IconChat } from "../dashboard/icons";

const IconSearch = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <circle cx="11" cy="11" r="7" />
    <path d="m20 20-3.5-3.5" />
  </svg>
);

const IconWrench = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M14.7 6.3a4 4 0 0 0 5 5L21 12.6 12.6 21 4 12.4l8.4-8.4 1.3 1.3a4 4 0 0 0 1 1z" />
    <path d="m9 15 3 3" />
  </svg>
);

export const SkillIcon = ({ name, className }: { name: string; className?: string }) => {
  switch (name) {
    case "layers": return <IconLayers className={className} />;
    case "bulb": return <IconBulb className={className} />;
    case "chat": return <IconChat className={className} />;
    case "search": return <IconSearch className={className} />;
    case "wrench": return <IconWrench className={className} />;
    default: return <IconLayers className={className} />;
  }
};

export const IconArrowUp = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M12 19V5M5 12l7-7 7 7" />
  </svg>
);
