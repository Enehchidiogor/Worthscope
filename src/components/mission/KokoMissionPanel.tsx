import { useState } from "react";
import { streamKokoChat, type KokoMission, type KokoMsg } from "@/lib/kokoClient";
import { KokoAvatar } from "@/components/koko/KokoAvatar";

type Props = {
  mission: KokoMission;
  onVerified: () => void;
  verified: boolean;
};

/* Koko's mission-side companion panel.
   Two roles:
   1. "I'm Stuck" — opens a Socratic hint conversation tied to the mission.
   2. Verification gate — asks one check-for-understanding question; the
      student's reply is judged by the model. ✅ unlocks Complete. */
export const KokoMissionPanel = ({ mission, onVerified, verified }: Props) => {
  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState<"stuck" | "verify">("stuck");
  const [messages, setMessages] = useState<KokoMsg[]>([]);
  const [input, setInput] = useState("");
  const [streaming, setStreaming] = useState(false);
  const [askedVerify, setAskedVerify] = useState(false);

  const startStuck = () => {
    setMode("stuck");
    setOpen(true);
    if (messages.length === 0) {
      // Auto-send initial stuck signal
      runTurn([], "stuck", "I'm stuck on this mission — can you help me figure out where I'm blocked?");
    }
  };

  const startVerify = () => {
    setMode("verify");
    setOpen(true);
    if (!askedVerify) {
      setAskedVerify(true);
      setMessages([]);
      runTurn([], "verify", "I think I'm ready to complete this mission. Can you check my understanding?");
    }
  };

  const runTurn = async (
    history: KokoMsg[],
    intent: "stuck" | "verify",
    userText: string
  ) => {
    const userMsg: KokoMsg = { role: "user", content: userText };
    const next = [...history, userMsg];
    setMessages([...next, { role: "assistant", content: "" }]);
    setStreaming(true);
    let acc = "";

    await streamKokoChat({
      messages: next,
      intent,
      mission,
      onDelta: (chunk) => {
        acc += chunk;
        setMessages((prev) => {
          const copy = [...prev];
          copy[copy.length - 1] = { role: "assistant", content: acc };
          return copy;
        });
      },
      onDone: () => {
        setStreaming(false);
        // Verification: if the assistant judged the answer correct, unlock.
        if (intent === "verify" && /^✅\s*correct/i.test(acc.trim())) {
          onVerified();
        }
      },
      onError: (err) => {
        setStreaming(false);
        setMessages((prev) => {
          const copy = [...prev];
          copy[copy.length - 1] = {
            role: "assistant",
            content: `Sorry — I hit an error: ${err.message}. Try again in a moment.`,
          };
          return copy;
        });
      },
    });
  };

  const send = () => {
    const text = input.trim();
    if (!text || streaming) return;
    setInput("");
    runTurn(messages, mode, text);
  };

  return (
    <>
      {/* Action buttons — always visible above the sticky bar */}
      <div className="my-6 flex flex-wrap items-center gap-3 rounded-[14px] border border-accent/20 bg-accent/5 p-4">
        <div className="flex-1 min-w-[200px]">
          <div className="text-[13px] font-semibold text-foreground">Need help with this mission?</div>
          <div className="text-[12px] text-text2">
            {verified
              ? "✅ Koko verified your understanding — you can complete this mission."
              : "Talk to Koko — she'll guide you without giving the answer."}
          </div>
        </div>
        <button
          type="button"
          onClick={startStuck}
          className="rounded-full border border-accent/30 bg-card px-4 py-2 text-[13px] font-medium text-accent transition-colors hover:bg-accent/10"
        >
          🧭 I'm Stuck
        </button>
        <button
          type="button"
          onClick={startVerify}
          disabled={verified}
          className="rounded-full bg-accent px-4 py-2 text-[13px] font-semibold text-white transition-all hover:bg-accent-dark disabled:cursor-not-allowed disabled:opacity-50"
        >
          {verified ? "✓ Verified" : "Check my understanding"}
        </button>
      </div>

      {open && (
        <>
          <div
            className="fixed inset-0 z-[450] bg-black/30"
            onClick={() => setOpen(false)}
          />
          <aside className="fixed right-0 top-0 z-[451] flex h-screen w-full flex-col bg-card sm:w-[400px]" style={{ boxShadow: "-8px 0 40px rgba(0,0,0,0.18)" }}>
            <header className="flex h-[64px] flex-shrink-0 items-center justify-between border-b border-border px-5">
              <div className="flex items-center gap-3">
                <KokoAvatar size={36} />
                <div>
                  <div className="text-[15px] font-bold text-foreground">Koko AI</div>
                  <div className="text-[11px] text-text2">{mode === "verify" ? "Verifying your understanding" : "Socratic hint mode"}</div>
                </div>
              </div>
              <button onClick={() => setOpen(false)} aria-label="Close" className="text-text2 hover:text-foreground">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M6 6l12 12M18 6 6 18" /></svg>
              </button>
            </header>

            <div className="flex-1 overflow-y-auto bg-bg-elevated/40 px-4 py-4">
              {messages.map((m, i) => (
                <div key={i} className={["mb-3 flex", m.role === "user" ? "justify-end" : "items-start gap-2"].join(" ")}>
                  {m.role === "assistant" && (
                    <KokoAvatar size={28} />
                  )}
                  <div
                    className={[
                      "max-w-[80%] rounded-[14px] px-3.5 py-2.5 text-[14px] leading-[1.55] whitespace-pre-wrap",
                      m.role === "user" ? "bg-accent text-white rounded-br-sm" : "bg-card border border-border text-foreground rounded-tl-sm",
                    ].join(" ")}
                  >
                    {m.content || (streaming && i === messages.length - 1 ? "…" : "")}
                  </div>
                </div>
              ))}
            </div>

            <div className="flex h-[68px] flex-shrink-0 items-center gap-2 border-t border-border px-4">
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && send()}
                placeholder={mode === "verify" ? "Type your answer…" : "Ask Koko anything…"}
                disabled={streaming}
                className="h-11 flex-1 rounded-xl border-[1.5px] border-border bg-bg-elevated px-3.5 text-[14px] outline-none focus:border-accent disabled:opacity-60"
              />
              <button
                onClick={send}
                disabled={streaming || !input.trim()}
                className="h-11 rounded-xl bg-accent px-4 text-[14px] font-semibold text-white disabled:opacity-50"
              >
                Send
              </button>
            </div>
          </aside>
        </>
      )}
    </>
  );
};
