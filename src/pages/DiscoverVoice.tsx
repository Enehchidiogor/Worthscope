import { useEffect, useRef, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import KokoFace from "@/components/experience/KokoFace";
import { ExperienceProvider } from "@/components/experience/ExperienceContext";
import AmbientBackground from "@/components/landing/AmbientBackground";
import { KokoVoiceSession } from "@/lib/kokoVoice";
import { applyDiscoveryAnswers } from "@/lib/discoveryResults";
import { PAPER, PAPER_DIM, BLUE_BRIGHT, LINE, FONT } from "@/components/experience/theme";
import { SEO } from "@/components/SEO";

type Phase = "idle" | "connecting" | "active" | "wrapping-up" | "error" | "ended-early";

export default function DiscoverVoice() {
  return (
    <ExperienceProvider>
      <DiscoverVoiceInner />
    </ExperienceProvider>
  );
}

function DiscoverVoiceInner() {
  const navigate = useNavigate();
  const [phase, setPhase] = useState<Phase>("idle");
  const [errorMsg, setErrorMsg] = useState("");
  const [speaking, setSpeaking] = useState(false);
  const [muted, setMuted] = useState(false);
  const [captions, setCaptions] = useState<{ speaker: "koko" | "user"; text: string }[]>([]);
  const [supported, setSupported] = useState(true);
  const sessionRef = useRef<KokoVoiceSession | null>(null);
  const audioRef = useRef<HTMLAudioElement>(null);
  const toolFiredRef = useRef(false);

  useEffect(() => {
    setSupported(typeof window !== "undefined" && !!window.RTCPeerConnection && !!navigator.mediaDevices?.getUserMedia);
  }, []);

  useEffect(() => {
    return () => {
      sessionRef.current?.disconnect();
    };
  }, []);

  async function start() {
    setErrorMsg("");
    setPhase("connecting");
    const session = new KokoVoiceSession({
      onState: (state, detail) => {
        if (state === "active") setPhase("active");
        if (state === "error") {
          setErrorMsg(detail || "Something went wrong");
          setPhase("error");
        }
      },
      onTrack: (stream) => {
        if (audioRef.current) audioRef.current.srcObject = stream;
      },
      onSpeaking: setSpeaking,
      onTranscriptDelta: (text, speaker) => {
        setCaptions((prev) => {
          const last = prev[prev.length - 1];
          if (last && last.speaker === speaker) {
            return [...prev.slice(0, -1), { speaker, text: last.text + text }];
          }
          return [...prev, { speaker, text }];
        });
      },
      onToolCall: async (name, args, callId) => {
        if (name !== "submit_discovery_profile" || toolFiredRef.current) return;
        toolFiredRef.current = true;
        setPhase("wrapping-up");
        session.sendToolResult(callId, { ok: true });
        await applyDiscoveryAnswers(args, "voice");
        window.setTimeout(() => {
          session.disconnect();
          navigate("/career-results");
        }, 2200);
      },
    });
    sessionRef.current = session;
    try {
      await session.connect();
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Couldn't start the conversation";
      if (msg.toLowerCase().includes("permission") || msg.toLowerCase().includes("denied")) {
        setErrorMsg("Koko needs your microphone to talk with you. Check your browser's site permissions and try again.");
      } else if (msg.toLowerCase().includes("device") || msg.toLowerCase().includes("notfound")) {
        setErrorMsg("No microphone detected.");
      } else {
        setErrorMsg(msg);
      }
      setPhase("error");
      toast.error("Couldn't connect to Koko");
    }
  }

  function endCall(early: boolean) {
    sessionRef.current?.disconnect();
    if (early && !toolFiredRef.current) {
      setPhase("ended-early");
    }
  }

  function toggleMute() {
    const next = !muted;
    setMuted(next);
    sessionRef.current?.setMuted(next);
  }

  return (
    <div style={{ minHeight: "100vh", position: "relative", fontFamily: FONT, color: PAPER, overflowX: "clip" as "hidden", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "80px 24px" }}>
      <SEO title="Talk to Koko — WorthScope" description="Have a real-time voice conversation with Koko to discover your career direction." path="/discover/voice" />
      <AmbientBackground />
      <audio ref={audioRef} autoPlay style={{ display: "none" }} />

      <div style={{ position: "relative", zIndex: 1, width: "100%", maxWidth: 560, textAlign: "center", display: "flex", flexDirection: "column", alignItems: "center" }}>
        {!supported ? (
          <ErrorCard title="Voice isn't supported in this browser" message="Try Chrome, Edge, or Safari on a recent version — or switch to chat instead." />
        ) : phase === "error" ? (
          <ErrorCard title="Something went wrong" message={errorMsg} onRetry={start} />
        ) : phase === "ended-early" ? (
          <ErrorCard
            title="We didn't quite finish"
            message="Want to continue the conversation, or answer a few quick questions instead?"
            onRetry={() => {
              toolFiredRef.current = false;
              setCaptions([]);
              setPhase("idle");
            }}
            retryLabel="Continue talking"
          />
        ) : (
          <>
            <KokoFace expression={phase === "wrapping-up" ? "happy" : speaking ? "talking" : phase === "active" ? "listening" : "idle"} talking={speaking} size={150} />

            <div style={{ marginTop: 22, minHeight: 28 }}>
              {phase === "idle" && <p style={{ color: PAPER_DIM, fontFamily: FONT, fontSize: 15 }}>Koko's ready when you are.</p>}
              {phase === "connecting" && <p style={{ color: PAPER_DIM, fontFamily: FONT, fontSize: 15 }}>Connecting…</p>}
              {phase === "wrapping-up" && <p style={{ color: PAPER, fontFamily: FONT, fontWeight: 600, fontSize: 15 }}>Got it — building your results…</p>}
            </div>

            {phase === "active" && (
              <div style={{ marginTop: 18, width: "100%", maxHeight: 160, overflowY: "auto", padding: "14px 18px", borderRadius: 16, background: "rgba(255,255,255,.03)", border: `1px solid ${LINE}`, textAlign: "left" }}>
                <AnimatePresence initial={false}>
                  {captions.slice(-6).map((c, i) => (
                    <motion.p
                      key={captions.length - 6 + i}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      style={{ margin: "0 0 8px", fontSize: 13.5, lineHeight: 1.5, color: c.speaker === "koko" ? PAPER : BLUE_BRIGHT }}
                    >
                      <strong>{c.speaker === "koko" ? "Koko: " : "You: "}</strong>
                      {c.text}
                    </motion.p>
                  ))}
                </AnimatePresence>
              </div>
            )}

            <div style={{ display: "flex", gap: 12, marginTop: 26, flexWrap: "wrap", justifyContent: "center" }}>
              {phase === "idle" && (
                <button onClick={start} style={primaryBtn}>
                  Start the conversation
                </button>
              )}
              {(phase === "connecting" || phase === "active") && (
                <>
                  {phase === "active" && (
                    <button onClick={toggleMute} style={ghostBtn}>
                      {muted ? "Unmute" : "Mute"}
                    </button>
                  )}
                  <button onClick={() => endCall(true)} style={dangerBtn}>
                    End conversation
                  </button>
                </>
              )}
            </div>

            {phase === "idle" && (
              <Link to="/discover" style={{ marginTop: 20, fontFamily: FONT, fontSize: 12.5, color: PAPER_DIM, textDecoration: "underline" }}>
                Prefer to type instead?
              </Link>
            )}
          </>
        )}
      </div>
    </div>
  );
}

function ErrorCard({ title, message, onRetry, retryLabel = "Try again" }: { title: string; message: string; onRetry?: () => void; retryLabel?: string }) {
  return (
    <div style={{ padding: "34px 30px", borderRadius: 22, background: "rgba(255,255,255,.03)", border: `1px solid ${LINE}`, maxWidth: 440 }}>
      <h2 style={{ fontFamily: FONT, fontWeight: 700, fontSize: 20, color: PAPER, margin: 0 }}>{title}</h2>
      <p style={{ marginTop: 12, color: PAPER_DIM, fontFamily: FONT, fontSize: 14, lineHeight: 1.6 }}>{message}</p>
      <div style={{ display: "flex", gap: 10, marginTop: 22, justifyContent: "center", flexWrap: "wrap" }}>
        {onRetry && (
          <button onClick={onRetry} style={primaryBtn}>
            {retryLabel}
          </button>
        )}
        <Link to="/discover" style={{ ...ghostBtn, display: "inline-flex", alignItems: "center", textDecoration: "none" }}>
          Answer questions instead
        </Link>
      </div>
    </div>
  );
}

const primaryBtn: React.CSSProperties = {
  background: BLUE_BRIGHT,
  color: "#04070D",
  border: "none",
  borderRadius: 999,
  padding: "14px 26px",
  fontFamily: FONT,
  fontWeight: 700,
  fontSize: 14,
  cursor: "pointer",
  boxShadow: `0 0 24px ${BLUE_BRIGHT}55`,
};
const ghostBtn: React.CSSProperties = {
  background: "transparent",
  color: PAPER,
  border: `1.5px solid ${LINE}`,
  borderRadius: 999,
  padding: "14px 26px",
  fontFamily: FONT,
  fontWeight: 700,
  fontSize: 14,
  cursor: "pointer",
};
const dangerBtn: React.CSSProperties = {
  background: "transparent",
  color: "#F87171",
  border: "1.5px solid rgba(248,113,113,.4)",
  borderRadius: 999,
  padding: "14px 26px",
  fontFamily: FONT,
  fontWeight: 700,
  fontSize: 14,
  cursor: "pointer",
};
