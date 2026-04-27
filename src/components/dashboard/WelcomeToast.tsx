import { useEffect, useState } from "react";

/* WorthScope — Welcome Toast
   Slides in from top-right on dashboard mount, auto-dismisses after 4s.
   Includes a 4s progress bar and a manual × dismiss. */

export const WelcomeToast = () => {
  const [show, setShow] = useState(false);
  const [closing, setClosing] = useState(false);

  useEffect(() => {
    // small delay so it slides in after content fades up
    const inT = window.setTimeout(() => setShow(true), 300);
    const outT = window.setTimeout(() => setClosing(true), 4000);
    const removeT = window.setTimeout(() => setShow(false), 4300);
    return () => {
      clearTimeout(inT);
      clearTimeout(outT);
      clearTimeout(removeT);
    };
  }, []);

  if (!show) return null;

  const dismiss = () => {
    setClosing(true);
    setTimeout(() => setShow(false), 260);
  };

  return (
    <div
      className="fixed right-6 top-20 z-[600] flex max-w-[320px] items-center gap-3 overflow-hidden rounded-[14px] border bg-card pl-4 pr-9 py-3.5 shadow-[0_8px_32px_rgba(0,0,0,0.10)]"
      style={{
        borderColor: "hsl(var(--border))",
        borderLeft: "4px solid hsl(var(--accent))",
        animation: closing
          ? "ws-toast-out 0.25s ease-in forwards"
          : "ws-toast-in 0.35s ease-out both",
      }}
      role="status"
      aria-live="polite"
    >
      {/* Avatar */}
      <div
        className="grid h-8 w-8 flex-shrink-0 place-items-center rounded-full text-[12px] font-bold text-white"
        style={{ background: "linear-gradient(135deg,#3498DB,#5DADE2)" }}
      >
        K
      </div>

      <div className="min-w-0">
        <div className="text-[14px] font-semibold text-foreground">Welcome back 👋</div>
        <div className="text-[13px] text-text2">Koko is here to guide you.</div>
      </div>

      {/* Dismiss */}
      <button
        onClick={dismiss}
        aria-label="Dismiss"
        className="absolute right-2.5 top-2.5 text-text3 transition-colors hover:text-foreground"
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
          <path d="M6 6l12 12M18 6 6 18" />
        </svg>
      </button>

      {/* Progress bar */}
      <span
        aria-hidden
        className="absolute bottom-0 left-0 h-[3px] bg-accent"
        style={{
          width: "100%",
          transformOrigin: "left center",
          animation: "ws-toast-progress 4s linear forwards",
          borderBottomLeftRadius: 14,
        }}
      />
    </div>
  );
};
