import { useEffect, useRef, useState } from "react";
import { useLocation } from "react-router-dom";

/* WorthScope — Global Floating Koko Chat
   Lives on every product page. Floating button (bottom-right) opens a
   right-side slide-in panel with quick-action chips, message thread,
   typing indicator, and input row. Dispatches a global "koko:open" event
   so other parts of the app (e.g. notifications) can open it. */

type Msg = { id: number; role: "koko" | "user"; text: string; time: string };

const QUICK_CHIPS = [
  "What should I do next?",
  "Explain this task",
  "Recommend skills",
  "Help me choose a career",
];

const KOKO_REPLIES: Record<string, string> = {
  "What should I do next?":
    "You're on Phase 1, Mission 3. Open it and finish the 'Submit' section to unlock Phase 2, Udochukwu.",
  "Explain this task":
    "Mission 3 asks you to write a one-page project brief. Keep it tight — a real recruiter would read it in under a minute.",
  "Recommend skills":
    "Based on your roadmap, focus on UI Design next — it's your weakest skill and the one missions 4–6 lean on.",
  "Help me choose a career":
    "Tell me what energises you more: building products, designing them, or analysing how people use them — and I'll point you somewhere.",
};

const fallbackReply = (text: string) =>
  `Good question, Udochukwu. Here's the short version: ${text.replace(/\?$/, "").toLowerCase()} — finish your current mission first, and I'll guide you from there.`;

export const KokoFloatingChat = () => {
  const { pathname } = useLocation();
  // Hide on onboarding/assessment routes (none right now, but future-proof)
  const hidden = pathname.startsWith("/onboarding") || pathname.startsWith("/assessment");

  const [open, setOpen] = useState(false);
  const [unread, setUnread] = useState(true);
  const [input, setInput] = useState("");
  const [typing, setTyping] = useState(false);
  const [messages, setMessages] = useState<Msg[]>([
    { id: 1, role: "koko", text: "Hey Udochukwu 👋 I'm Koko — your career guide.", time: "just now" },
  ]);
  const scrollRef = useRef<HTMLDivElement>(null);
  const introSentRef = useRef(false);

  // Listen to global open events (e.g. notifications "Koko has a suggestion")
  useEffect(() => {
    const handler = () => {
      setOpen(true);
      setUnread(false);
    };
    window.addEventListener("koko:open", handler);
    return () => window.removeEventListener("koko:open", handler);
  }, []);

  // Send the second intro message ~1s after first open
  useEffect(() => {
    if (open && !introSentRef.current) {
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
  }, [open]);

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

  if (hidden) return null;

  return (
    <>
      {/* ───────── Floating button ───────── */}
      <div className="fixed bottom-7 right-7 z-[500] group">
        {/* Tooltip (left of button) */}
        {!open && (
          <span className="pointer-events-none absolute right-[68px] top-1/2 -translate-y-1/2 whitespace-nowrap rounded-lg bg-[#111] px-3 py-1.5 text-[12px] font-medium text-white opacity-0 transition-opacity duration-200 group-hover:opacity-100">
            Chat with Koko
          </span>
        )}

        <button
          onClick={() => {
            setOpen((o) => !o);
            setUnread(false);
          }}
          aria-label={open ? "Close Koko chat" : "Open Koko chat"}
          className="relative grid h-14 w-14 place-items-center rounded-full text-white transition-transform duration-200 active:scale-95"
          style={{
            background: "linear-gradient(135deg,#3498DB,#5DADE2)",
            boxShadow: "0 8px 24px rgba(52,152,219,0.4)",
            animation: open ? "none" : "ws-koko-pulse 3s ease-in-out infinite",
            transform: open ? "rotate(10deg)" : "rotate(0deg)",
          }}
        >
          {open ? (
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <path d="M6 6l12 12M18 6 6 18" />
            </svg>
          ) : (
            // Friendly robot/sparkle icon
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="4" y="7" width="16" height="12" rx="3" />
              <path d="M12 3v4M9 12h.01M15 12h.01" />
              <path d="M9 16c.8.6 1.8 1 3 1s2.2-.4 3-1" />
            </svg>
          )}

          {/* Unread dot */}
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
          onClick={() => setOpen(false)}
        />
      )}

      {/* ───────── Slide-in Panel ───────── */}
      {open && (
        <aside
          className="fixed right-0 top-0 z-[499] flex h-screen w-full flex-col bg-white sm:w-[380px]"
          style={{
            boxShadow: "-8px 0 40px rgba(0,0,0,0.12)",
            animation: "ws-koko-slide-in 0.3s cubic-bezier(0.4,0,0.2,1) both",
          }}
        >
          {/* Header */}
          <header className="flex h-[70px] flex-shrink-0 items-center justify-between border-b border-[#E5E7EB] px-5">
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
                <div className="text-[16px] font-bold leading-tight text-[#111]">Koko AI</div>
                <div className="mt-0.5 flex items-center text-[12px] text-[#22C55E]">
                  <span className="mr-1.5 inline-block h-1.5 w-1.5 rounded-full bg-[#22C55E]" />
                  Online · Ready to help
                </div>
              </div>
            </div>
            <button
              onClick={() => setOpen(false)}
              aria-label="Close"
              className="text-[#9CA3AF] transition-colors hover:text-[#111]"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <path d="M6 6l12 12M18 6 6 18" />
              </svg>
            </button>
          </header>

          {/* Quick action chips */}
          <div className="flex flex-wrap gap-2 border-b border-[#E5E7EB] px-4 py-3.5">
            {QUICK_CHIPS.map((chip) => (
              <button
                key={chip}
                onClick={() => handleChipClick(chip)}
                className="rounded-full border px-3.5 py-1.5 text-[12px] font-medium transition-colors"
                style={{
                  background: "#EBF5FB",
                  borderColor: "rgba(52,152,219,0.2)",
                  color: "#3498DB",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = "rgba(52,152,219,0.15)";
                  e.currentTarget.style.borderColor = "#3498DB";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = "#EBF5FB";
                  e.currentTarget.style.borderColor = "rgba(52,152,219,0.2)";
                }}
              >
                {chip}
              </button>
            ))}
          </div>

          {/* Chat area */}
          <div ref={scrollRef} className="flex-1 overflow-y-auto bg-[#F4F9FE] px-4 py-5">
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
                      className="rounded-[0_14px_14px_14px] border border-[#E5E7EB] bg-white px-4 py-3 text-[14px] leading-[1.65] text-[#111]"
                      style={{ boxShadow: "0 2px 8px rgba(0,0,0,0.05)" }}
                    >
                      {m.text}
                    </div>
                    <span className="ml-0 mt-1 text-[11px] text-[#9CA3AF]">{m.time}</span>
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
                  <span className="mt-1 text-[11px] text-[#9CA3AF]">{m.time}</span>
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
                  className="flex items-center gap-1 rounded-[0_14px_14px_14px] border border-[#E5E7EB] bg-white px-4 py-3.5"
                  style={{ boxShadow: "0 2px 8px rgba(0,0,0,0.05)" }}
                >
                  {[0, 0.15, 0.3].map((d) => (
                    <span
                      key={d}
                      className="inline-block h-2 w-2 rounded-full bg-[#9CA3AF]"
                      style={{ animation: `ws-koko-bounce 0.8s ease-in-out ${d}s infinite` }}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Input row */}
          <div className="flex h-[72px] flex-shrink-0 items-center gap-2.5 border-t border-[#E5E7EB] bg-white px-4 py-3">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && sendMessage(input)}
              placeholder="Ask Koko anything about your journey…"
              className="h-11 flex-1 rounded-xl bg-[#F4F9FE] px-3.5 text-[14px] text-[#111] outline-none transition-all placeholder:text-[#9CA3AF]"
              style={{ border: "1.5px solid #E5E7EB" }}
              onFocus={(e) => {
                e.currentTarget.style.borderColor = "#3498DB";
                e.currentTarget.style.boxShadow = "0 0 0 4px rgba(52,152,219,0.1)";
              }}
              onBlur={(e) => {
                e.currentTarget.style.borderColor = "#E5E7EB";
                e.currentTarget.style.boxShadow = "none";
              }}
            />
            <button
              onClick={() => sendMessage(input)}
              disabled={!input.trim()}
              aria-label="Send"
              className="grid h-11 w-11 place-items-center rounded-xl text-white transition-all disabled:cursor-not-allowed"
              style={{
                background: input.trim() ? "#3498DB" : "#E5E7EB",
              }}
              onMouseEnter={(e) => {
                if (input.trim()) {
                  e.currentTarget.style.background = "#217DBB";
                  e.currentTarget.style.boxShadow = "0 4px 12px rgba(52,152,219,0.3)";
                }
              }}
              onMouseLeave={(e) => {
                if (input.trim()) {
                  e.currentTarget.style.background = "#3498DB";
                  e.currentTarget.style.boxShadow = "none";
                }
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
