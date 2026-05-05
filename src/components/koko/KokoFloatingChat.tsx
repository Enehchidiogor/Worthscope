import { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { streamKokoChat, type KokoMsg } from "@/lib/kokoClient";
import { getChosenCareer } from "@/lib/userState";

/* WorthScope — Global Floating Koko Chat
   Lives on every product page. Floating button (bottom-right) opens a
   right-side slide-in panel with quick-action chips, message thread,
   typing indicator, and input row.

   Global events:
     - "koko:open"         → open panel (no auto-messages)
     - "koko:login-pulse"  → strong pulse + auto-show tooltip for 6s
     - "koko:intro"        → open panel and play first-login intro sequence
*/

type Msg = { id: number; role: "koko" | "user"; text: string; time: string };

const QUICK_CHIPS = [
  "What should I do next?",
  "Explain this task",
  "Recommend skills",
  "Help me choose a career",
];

const KOKO_REPLIES: Record<string, string> = {
  "What should I do next?":
    "Head to your roadmap and complete Mission 3. It's the step that unlocks Phase 2 — you're close!",
  "Explain this task":
    "Mission 3 asks you to write a one-page project brief. Keep it tight — a real recruiter would read it in under a minute.",
  "Recommend skills":
    "Based on your roadmap, focus on UI Design next — it's your weakest skill and the one missions 4–6 lean on.",
  "Help me choose a career":
    "Tell me what energises you more: building products, designing them, or analysing how people use them — and I'll point you somewhere.",
};

const fallbackReply = (text: string) =>
  `Good question. Here's the short version: ${text.replace(/\?$/, "").toLowerCase()} — finish your current mission first, and I'll guide you from there.`;

export const KokoFloatingChat = () => {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const hidden =
    pathname === "/" ||
    pathname.startsWith("/signin") ||
    pathname.startsWith("/signup") ||
    pathname.startsWith("/onboarding") ||
    pathname.startsWith("/assessment") ||
    pathname.startsWith("/parent-view") ||
    pathname.startsWith("/parent-dashboard") ||
    pathname.startsWith("/parent/");

  const [open, setOpen] = useState(false);
  const [unread, setUnread] = useState(true);
  const [input, setInput] = useState("");
  const [typing, setTyping] = useState(false);
  const [messages, setMessages] = useState<Msg[]>([
    { id: 1, role: "koko", text: "Hey 👋 I'm Koko — your career guide.", time: "just now" },
  ]);
  const [introMode, setIntroMode] = useState(false);
  const [introChips, setIntroChips] = useState(false);

  // Login signals
  const [strongPulse, setStrongPulse] = useState(false);
  const [tooltipOpen, setTooltipOpen] = useState(false);

  const scrollRef = useRef<HTMLDivElement>(null);
  const introSentRef = useRef(false);
  const introPlayedRef = useRef(false);

  /* ───── Global event listeners ───── */
  useEffect(() => {
    const onOpen = () => {
      setOpen(true);
      setUnread(false);
      setTooltipOpen(false);
    };
    const onLoginPulse = () => {
      setStrongPulse(true);
      // Auto-tooltip after 0.5s, hide after 6s total
      const tShow = window.setTimeout(() => setTooltipOpen(true), 500);
      const tHide = window.setTimeout(() => {
        setTooltipOpen(false);
        setStrongPulse(false);
      }, 6500);
      return () => {
        clearTimeout(tShow);
        clearTimeout(tHide);
      };
    };
    const onIntro = () => {
      if (introPlayedRef.current) return;
      introPlayedRef.current = true;
      setOpen(true);
      setUnread(false);
      setIntroMode(true);
      // Replace messages with the guided intro sequence
      setMessages([
        { id: 1, role: "koko", text: "Welcome to WorthScope 👋", time: "just now" },
      ]);
      // Message 2 after 1.2s typing
      setTyping(true);
      window.setTimeout(() => {
        setMessages((m) => [
          ...m,
          {
            id: 2,
            role: "koko",
            text:
              "I'm Koko — your personal career guide. I'll be with you every step of the way as you build your path.",
            time: "just now",
          },
        ]);
        setTyping(false);
        // Message 3 after another 1.5s typing
        window.setTimeout(() => {
          setTyping(true);
          window.setTimeout(() => {
            setMessages((m) => [
              ...m,
              {
                id: 3,
                role: "koko",
                text:
                  "Let's start by continuing your roadmap. You've already made progress — let's keep it going.",
                time: "just now",
              },
            ]);
            setTyping(false);
            // Show intro chips
            window.setTimeout(() => setIntroChips(true), 250);
          }, 1500);
        }, 200);
      }, 1200);
    };

    window.addEventListener("koko:open", onOpen);
    window.addEventListener("koko:login-pulse", onLoginPulse);
    window.addEventListener("koko:intro", onIntro);
    return () => {
      window.removeEventListener("koko:open", onOpen);
      window.removeEventListener("koko:login-pulse", onLoginPulse);
      window.removeEventListener("koko:intro", onIntro);
    };
  }, []);

  // Send the second intro message ~1s after first MANUAL open (only when not in intro mode)
  useEffect(() => {
    if (open && !introSentRef.current && !introMode) {
      introSentRef.current = true;
      setUnread(false);
      const t = setTimeout(() => {
        setMessages((m) => [
          ...m,
          {
            id: Date.now(),
            role: "koko",
            text:
              "You're currently on Phase 1, Mission 3. You're close — finish this step to unlock the next phase. Want me to help?",
            time: "just now",
          },
        ]);
      }, 1000);
      return () => clearTimeout(t);
    }
  }, [open, introMode]);

  // Auto-scroll on new messages / typing
  useEffect(() => {
    const el = scrollRef.current;
    if (el) el.scrollTo({ top: el.scrollHeight, behavior: "smooth" });
  }, [messages, typing]);

  const sendMessage = (raw: string) => {
    const text = raw.trim();
    if (!text) return;
    const userMsg: Msg = { id: Date.now(), role: "user", text, time: "just now" };
    setMessages((m) => [...m, userMsg]);
    setInput("");
    setTyping(true);

    const reply = KOKO_REPLIES[text] ?? fallbackReply(text);
    window.setTimeout(() => {
      setTyping(false);
      setMessages((m) => [
        ...m,
        { id: Date.now() + 1, role: "koko", text: reply, time: "just now" },
      ]);
    }, 1100);
  };

  const handleChipClick = (chip: string) => {
    setInput(chip);
    setTimeout(() => sendMessage(chip), 300);
  };

  const handleIntroChipContinue = () => {
    setIntroChips(false);
    setIntroMode(false);
    setOpen(false);
    setTimeout(() => navigate("/roadmap"), 250);
  };

  const handleIntroChipNext = () => {
    setIntroChips(false);
    setIntroMode(false);
    sendMessage("What should I do next?");
  };

  // Click handler: also dismiss the auto-tooltip / strong pulse
  const handleButtonClick = () => {
    setOpen((o) => !o);
    setUnread(false);
    setTooltipOpen(false);
    setStrongPulse(false);
  };

  if (hidden) return null;

  // Pulse animation chain: when open, none. When strongPulse on, faster/stronger. Else idle.
  const pulseAnim = open
    ? "none"
    : strongPulse
    ? "ws-koko-pulse-strong 1.5s ease-in-out infinite"
    : "ws-koko-pulse 3s ease-in-out infinite";

  return (
    <>
      {/* ───────── Floating button ───────── */}
      <div className="fixed bottom-7 right-7 z-[500] group">
        {/* Auto / hover tooltip (left of button) */}
        {!open && (
          <span
            className={[
              "pointer-events-none absolute right-[68px] top-1/2 max-w-[200px] whitespace-normal rounded-[10px] px-3.5 py-2 text-center text-[12px] font-medium text-white shadow-lg",
              "transition-opacity duration-200",
              tooltipOpen ? "opacity-100" : "opacity-0 group-hover:opacity-100",
            ].join(" ")}
            style={{
              background: "#111111",
              transform: "translateY(-50%)",
              animation: tooltipOpen ? "ws-tooltip-in 0.3s ease-out both" : undefined,
            }}
          >
            {tooltipOpen
              ? "Hi, I'm Koko. Need help? Click me anytime. 👋"
              : "Chat with Koko"}
            {/* Right-pointing arrow */}
            <span
              aria-hidden
              className="absolute right-[-5px] top-1/2 -translate-y-1/2"
              style={{
                width: 0,
                height: 0,
                borderTop: "5px solid transparent",
                borderBottom: "5px solid transparent",
                borderLeft: "5px solid #111111",
              }}
            />
          </span>
        )}

        <button
          onClick={handleButtonClick}
          aria-label={open ? "Close Koko chat" : "Open Koko chat"}
          className="relative grid h-14 w-14 place-items-center rounded-full text-white transition-transform duration-200 active:scale-95"
          style={{
            background: "linear-gradient(135deg,#3498DB,#5DADE2)",
            boxShadow: strongPulse
              ? "0 8px 32px rgba(52,152,219,0.6)"
              : "0 8px 24px rgba(52,152,219,0.4)",
            animation: pulseAnim,
            transform: open ? "rotate(10deg)" : "rotate(0deg)",
          }}
        >
          {open ? (
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <path d="M6 6l12 12M18 6 6 18" />
            </svg>
          ) : (
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="4" y="7" width="16" height="12" rx="3" />
              <path d="M12 3v4M9 12h.01M15 12h.01" />
              <path d="M9 16c.8.6 1.8 1 3 1s2.2-.4 3-1" />
            </svg>
          )}

          {unread && !open && (
            <span
              className="absolute right-0.5 top-0.5 h-2 w-2 rounded-full bg-[#EF4444]"
              style={{ animation: "ws-koko-pop 0.2s ease-out both" }}
            />
          )}
        </button>
      </div>

      {/* ───────── Overlay ───────── */}
      {open && (
        <div
          className="fixed inset-0 z-[499] bg-black/25"
          style={{ animation: "ws-koko-fade 0.25s ease both" }}
          onClick={() => {
            setOpen(false);
            setIntroMode(false);
            setIntroChips(false);
          }}
        />
      )}

      {/* ───────── Slide-in Panel ───────── */}
      {open && (
        <aside
          className="fixed right-0 top-0 z-[499] flex h-screen w-full flex-col bg-card sm:w-[380px]"
          style={{
            boxShadow: "-8px 0 40px rgba(0,0,0,0.18)",
            animation: "ws-koko-slide-in 0.3s cubic-bezier(0.4,0,0.2,1) both",
          }}
        >
          {/* Header */}
          <header className="flex h-[70px] flex-shrink-0 items-center justify-between border-b border-border px-5">
            <div className="flex items-center">
              <div
                className="grid h-10 w-10 place-items-center rounded-full text-[16px] font-bold text-white"
                style={{
                  background: "linear-gradient(135deg,#3498DB,#5DADE2)",
                  boxShadow: "0 0 12px rgba(52,152,219,0.3)",
                  animation: "ws-koko-pulse-soft 3s ease-in-out infinite",
                }}
              >
                K
              </div>
              <div className="ml-3">
                <div className="text-[16px] font-bold leading-tight text-foreground">Koko AI</div>
                <div className="mt-0.5 flex items-center text-[12px] text-[#22C55E]">
                  <span className="mr-1.5 inline-block h-1.5 w-1.5 rounded-full bg-[#22C55E]" />
                  Online · Ready to help
                </div>
              </div>
            </div>
            <button
              onClick={() => {
                setOpen(false);
                setIntroMode(false);
                setIntroChips(false);
              }}
              aria-label="Close"
              className="text-text2 transition-colors hover:text-foreground"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <path d="M6 6l12 12M18 6 6 18" />
              </svg>
            </button>
          </header>

          {/* Quick action chips (general) */}
          {!introMode && (
            <div className="flex flex-wrap gap-2 border-b border-border px-4 py-3.5">
              {QUICK_CHIPS.map((chip) => (
                <button
                  key={chip}
                  onClick={() => handleChipClick(chip)}
                  className="rounded-full border border-accent/20 bg-accent/10 px-3.5 py-1.5 text-[12px] font-medium text-accent transition-colors hover:border-accent hover:bg-accent/20"
                >
                  {chip}
                </button>
              ))}
            </div>
          )}

          {/* Chat area */}
          <div ref={scrollRef} className="flex-1 overflow-y-auto bg-bg-elevated/40 px-4 py-5">
            {messages.map((m) =>
              m.role === "koko" ? (
                <div key={m.id} className="mb-4 flex items-start gap-2.5">
                  <div
                    className="grid h-7 w-7 flex-shrink-0 place-items-center rounded-full text-[11px] font-bold text-white"
                    style={{ background: "linear-gradient(135deg,#3498DB,#5DADE2)" }}
                  >
                    K
                  </div>
                  <div className="flex max-w-[80%] flex-col">
                    <div
                      className="rounded-[0_14px_14px_14px] border border-border bg-card px-4 py-3 text-[14px] leading-[1.65] text-foreground"
                      style={{ boxShadow: "0 2px 8px rgba(0,0,0,0.05)" }}
                    >
                      {m.text}
                    </div>
                    <span className="ml-0 mt-1 text-[11px] text-text3">{m.time}</span>
                  </div>
                </div>
              ) : (
                <div key={m.id} className="mb-4 flex flex-col items-end">
                  <div
                    className="max-w-[80%] rounded-[14px_0_14px_14px] px-4 py-3 text-[14px] leading-[1.65] text-white"
                    style={{ background: "#3498DB" }}
                  >
                    {m.text}
                  </div>
                  <span className="mt-1 text-[11px] text-text3">{m.time}</span>
                </div>
              ),
            )}

            {/* Typing indicator */}
            {typing && (
              <div className="mb-4 flex items-start gap-2.5">
                <div
                  className="grid h-7 w-7 flex-shrink-0 place-items-center rounded-full text-[11px] font-bold text-white"
                  style={{ background: "linear-gradient(135deg,#3498DB,#5DADE2)" }}
                >
                  K
                </div>
                <div
                  className="flex items-center gap-1 rounded-[0_14px_14px_14px] border border-border bg-card px-4 py-3.5"
                  style={{ boxShadow: "0 2px 8px rgba(0,0,0,0.05)" }}
                >
                  {[0, 0.15, 0.3].map((d) => (
                    <span
                      key={d}
                      className="inline-block h-2 w-2 rounded-full bg-text3"
                      style={{ animation: `ws-koko-bounce 0.8s ease-in-out ${d}s infinite` }}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Intro quick action chips (first-login only) */}
            {introMode && introChips && (
              <div
                className="mt-2 flex flex-wrap gap-2 pl-9"
                style={{ animation: "ws-koko-fade 0.4s ease both" }}
              >
                <button
                  onClick={handleIntroChipContinue}
                  className="rounded-full bg-accent px-4 py-2 text-[13px] font-semibold text-white transition-all hover:shadow-[0_4px_14px_hsl(var(--accent)/0.4)]"
                >
                  Continue my roadmap →
                </button>
                <button
                  onClick={handleIntroChipNext}
                  className="rounded-full border border-accent/25 bg-accent/10 px-4 py-2 text-[13px] font-medium text-accent transition-colors hover:bg-accent/20"
                >
                  What should I do next?
                </button>
              </div>
            )}
          </div>

          {/* Input row */}
          <div className="flex h-[72px] flex-shrink-0 items-center gap-2.5 border-t border-border bg-card px-4 py-3">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && sendMessage(input)}
              placeholder="Ask Koko anything about your journey…"
              className="h-11 flex-1 rounded-xl bg-bg-elevated px-3.5 text-[14px] text-foreground outline-none transition-all placeholder:text-text3"
              style={{ border: "1.5px solid hsl(var(--border))" }}
              onFocus={(e) => {
                e.currentTarget.style.borderColor = "hsl(var(--accent))";
                e.currentTarget.style.boxShadow = "0 0 0 4px hsl(var(--accent) / 0.15)";
              }}
              onBlur={(e) => {
                e.currentTarget.style.borderColor = "hsl(var(--border))";
                e.currentTarget.style.boxShadow = "none";
              }}
            />
            <button
              onClick={() => sendMessage(input)}
              disabled={!input.trim()}
              aria-label="Send"
              className="grid h-11 w-11 place-items-center rounded-xl text-white transition-all disabled:cursor-not-allowed"
              style={{
                background: input.trim() ? "#3498DB" : "hsl(var(--bg-elevated))",
              }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 2 11 13" />
                <path d="m22 2-7 20-4-9-9-4z" />
              </svg>
            </button>
          </div>
        </aside>
      )}
    </>
  );
};
