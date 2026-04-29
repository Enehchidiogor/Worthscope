/* Inline SVG icon set used by Results + dashboard cards. */
type Props = { name: string; size?: number; color?: string; className?: string };

export const CareerIcon = ({ name, size = 22, color = "currentColor", className }: Props) => {
  const common = {
    width: size,
    height: size,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: color,
    strokeWidth: 1.8,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    className,
  };
  switch (name) {
    case "code":
      return (<svg {...common}><polyline points="16 18 22 12 16 6" /><polyline points="8 6 2 12 8 18" /></svg>);
    case "design":
      return (<svg {...common}><path d="M12 19l7-7 3 3-7 7-3-3z" /><path d="M18 13l-1.5-7.5L2 2l3.5 14.5L13 18l5-5z" /><path d="M2 2l7.586 7.586" /><circle cx="11" cy="11" r="2" /></svg>);
    case "chart":
      return (<svg {...common}><line x1="12" y1="20" x2="12" y2="10" /><line x1="18" y1="20" x2="18" y2="4" /><line x1="6" y1="20" x2="6" y2="14" /></svg>);
    case "shield":
      return (<svg {...common}><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /></svg>);
    case "mobile":
      return (<svg {...common}><rect x="7" y="2" width="10" height="20" rx="2" /><line x1="12" y1="18" x2="12" y2="18" /></svg>);
    case "cloud":
      return (<svg {...common}><path d="M18 10a4 4 0 0 0-7.5-2 5 5 0 1 0-2.5 9.5h9.5a4 4 0 0 0 .5-7.5z" /></svg>);
    case "palette":
      return (<svg {...common}><circle cx="13.5" cy="6.5" r="1.5" /><circle cx="17.5" cy="10.5" r="1.5" /><circle cx="8.5" cy="7.5" r="1.5" /><circle cx="6.5" cy="12.5" r="1.5" /><path d="M12 22a10 10 0 1 1 10-10c0 2.5-3 3-5 3-1.5 0-2 1-2 2 0 2.5-1.5 5-3 5z" /></svg>);
    case "video":
      return (<svg {...common}><polygon points="23 7 16 12 23 17 23 7" /><rect x="1" y="5" width="15" height="14" rx="2" /></svg>);
    case "play":
      return (<svg {...common}><polygon points="6 4 20 12 6 20 6 4" /></svg>);
    case "star":
      return (<svg {...common}><polygon points="12 2 15 9 22 9.5 17 14 18.5 21 12 17.5 5.5 21 7 14 2 9.5 9 9 12 2" /></svg>);
    case "film":
      return (<svg {...common}><rect x="2" y="2" width="20" height="20" rx="2" /><line x1="7" y1="2" x2="7" y2="22" /><line x1="17" y1="2" x2="17" y2="22" /><line x1="2" y1="12" x2="22" y2="12" /></svg>);
    case "briefcase":
      return (<svg {...common}><rect x="2" y="7" width="20" height="14" rx="2" /><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" /></svg>);
    case "rocket":
      return (<svg {...common}><path d="M5 13c-1 4-1 6-1 6s2 0 6-1m4-4a8 8 0 0 0-8 8m12-12a8 8 0 0 0-8-8 8 8 0 0 0 0 16 8 8 0 0 0 8-8z" /><circle cx="14" cy="10" r="2" /></svg>);
    case "target":
      return (<svg {...common}><circle cx="12" cy="12" r="10" /><circle cx="12" cy="12" r="6" /><circle cx="12" cy="12" r="2" /></svg>);
    case "money":
      return (<svg {...common}><line x1="12" y1="1" x2="12" y2="23" /><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" /></svg>);
    case "trend":
      return (<svg {...common}><polyline points="23 6 13.5 15.5 8.5 10.5 1 18" /><polyline points="17 6 23 6 23 12" /></svg>);
    case "health":
      return (<svg {...common}><path d="M20 12h-4l-3 9-6-18-3 9H0" /></svg>);
    case "lab":
      return (<svg {...common}><path d="M9 3v6l-5 9a3 3 0 0 0 3 4h10a3 3 0 0 0 3-4l-5-9V3" /><line x1="8" y1="3" x2="16" y2="3" /></svg>);
    case "leaf":
      return (<svg {...common}><path d="M11 20A7 7 0 0 1 4 13c0-6 9-9 16-9 0 7-3 16-9 16z" /><path d="M2 22 17 7" /></svg>);
    case "flask":
      return (<svg {...common}><path d="M9 2h6v6l5 11a2 2 0 0 1-2 3H6a2 2 0 0 1-2-3l5-11V2z" /></svg>);
    case "brain":
      return (<svg {...common}><path d="M9 3a3 3 0 0 0-3 3 3 3 0 0 0-3 3 3 3 0 0 0 1 2 3 3 0 0 0-1 2 3 3 0 0 0 3 3 3 3 0 0 0 3 3h6a3 3 0 0 0 3-3 3 3 0 0 0 3-3 3 3 0 0 0-1-2 3 3 0 0 0 1-2 3 3 0 0 0-3-3 3 3 0 0 0-3-3z" /></svg>);
    case "people":
      return (<svg {...common}><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></svg>);
    case "book":
      return (<svg {...common}><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" /><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" /></svg>);
    case "heart":
      return (<svg {...common}><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" /></svg>);
    case "hands":
      return (<svg {...common}><path d="M9 11V6a2 2 0 0 1 4 0v5" /><path d="M13 11V4a2 2 0 0 1 4 0v9" /><path d="M17 13V7a2 2 0 0 1 4 0v9a6 6 0 0 1-6 6h-2a6 6 0 0 1-6-6V9a2 2 0 0 1 4 0v4" /></svg>);
    case "megaphone":
      return (<svg {...common}><path d="M3 11l18-8v18L3 13z" /><path d="M11 13v5a2 2 0 0 1-4 0v-3" /></svg>);
    case "pen":
      return (<svg {...common}><path d="M12 19l7-7 3 3-7 7-3-3z" /><path d="M18 13L13 18" /><path d="M2 22l4-1 13-13-3-3L3 18l-1 4z" /></svg>);
    case "chat":
      return (<svg {...common}><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" /></svg>);
    case "news":
      return (<svg {...common}><path d="M4 22h16a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2H8a2 2 0 0 0-2 2v16a2 2 0 0 1-2 2zm0 0a2 2 0 0 1-2-2v-9c0-1.1.9-2 2-2h2" /><line x1="18" y1="14" x2="12" y2="14" /><line x1="18" y1="18" x2="12" y2="18" /><line x1="12" y1="6" x2="18" y2="6" /><line x1="12" y1="10" x2="18" y2="10" /></svg>);
    default:
      return (<svg {...common}><circle cx="12" cy="12" r="10" /></svg>);
  }
};
