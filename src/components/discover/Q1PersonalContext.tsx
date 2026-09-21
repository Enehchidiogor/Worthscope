import { useRef, useState } from "react";
import { motion } from "framer-motion";
import { PAPER, PAPER_DIM, PAPER_FAINT, LINE, BLUE_BRIGHT, FONT } from "@/components/experience/theme";
import { streamKokoChat, type KokoMission } from "@/lib/kokoClient";
import { useDictationField } from "@/lib/useDictationField";
import { StepFrame, NavRow } from "./shared";
import { eyebrowFor } from "./flow";

export default function Q1PersonalContext({
  value,
  mission,
  onBack,
  onContinue,
}: {
  value: string;
  mission: KokoMission;
  onBack: () => void;
  onContinue: (text: string) => void;
}) {
  const [text, setText] = useState(value);
 const [checking, setChecking] = useState(false);
  const [followup, setFollowup] = useState<string | null>(null);
  const [followupAnswer, setFollowupAnswer] = useState("");
  const textRef = useRef(text);
  textRef.current = text;
  const { listening, error: micError, toggle: toggleDictation, supported: micSupported } = useDictationField(() => textRef.current, setText);

  function runFollowupCheck() {
    const trimmed = text.trim();
    if (!trimmed || checking) return;
    setChecking(true);
    let acc = "";
    streamKokoChat({
      messages: [{ role: "user", content: trimmed }],
      intent: "career-followup",
      mission,
      onDelta: (chunk) => {
        acc += chunk;
      },
      onDone: () => {
        setChecking(false);
        const reply = acc.trim();
        // Only accept a real clarifying question: short, one line, ends in "?".
        // Anything longer is a generic chat reply (e.g. old function version) — skip it.
        const isShortQuestion = reply.length <= 160 && reply.endsWith("?") && !reply.includes("\n") && !reply.includes("**");
        if (isShortQuestion) {
          setFollowup(reply);
        } else {
          onContinue(trimmed);
        }
      },
      onError: () => {
        setChecking(false);
        onContinue(trimmed);
      },
    });
  }

  function finishWithFollowup() {
    const merged = followupAnswer.trim() ? `${text.trim()}\n\n${followupAnswer.trim()}` : text.trim();
    onContinue(merged);
  }

  if (followup) {
    return (
      <StepFrame eyebrow={eyebrowFor("q1")} title="One more thing" subtitle={followup}>
        <textarea
          value={followupAnswer}
          onChange={(e) => setFollowupAnswer(e.target.value)}
          placeholder="Type your answer…"
          rows={4}
          style={textareaStyle}
        />
        <NavRow onBack={() => setFollowup(null)} onContinue={finishWithFollowup} continueLabel="Continue" />
      </StepFrame>
    );
  }

  return (
    <StepFrame eyebrow={eyebrowFor("q1")} title="Tell Koko about yourself." subtitle="Interests, what you're good at, what pulls your attention — write however much feels natural.">
      <div style={{ position: "relative" }}>
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="I've always been drawn to…"
          rows={7}
          style={textareaStyle}
        />
        {micSupported && (
          <motion.button
            onClick={toggleDictation}
            whileTap={{ scale: 0.92 }}
            style={{
              position: "absolute",
              right: 12,
              bottom: 12,
              width: 38,
              height: 38,
              borderRadius: "50%",
              border: `1.5px solid ${listening ? BLUE_BRIGHT : LINE}`,
              background: listening ? "rgba(96,165,250,.15)" : "rgba(255,255,255,.04)",
              display: "grid",
              placeItems: "center",
              cursor: "pointer",
            }}
            aria-label={listening ? "Stop dictation" : "Start dictation"}
          >
            <MicIcon color={listening ? BLUE_BRIGHT : PAPER_FAINT} />
          </motion.button>
        )}
      </div>
      {micSupported && (
        <div style={{ marginTop: 8, fontFamily: FONT, fontSize: 12.5, color: micError ? "#FCA5A5" : listening ? BLUE_BRIGHT : PAPER_FAINT }}>
          {micError ?? (listening ? "Listening… speak now, tap the mic again when you're done" : "Tap the mic to speak your answer instead of typing")}
        </div>
      )}
      <NavRow onBack={onBack} onContinue={runFollowupCheck} continueDisabled={!text.trim()} continueBusy={checking} />
    </StepFrame>
  );
}

const textareaStyle: React.CSSProperties = {
  width: "100%",
  background: "rgba(255,255,255,.03)",
  border: `1.5px solid ${LINE}`,
  borderRadius: 14,
  padding: "16px 18px",
  color: PAPER,
  fontFamily: FONT,
  fontSize: 14.5,
  lineHeight: 1.6,
  resize: "vertical",
  outline: "none",
};

function MicIcon({ color }: { color: string }) {
  return (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="9" y="2" width="6" height="12" rx="3" />
      <path d="M5 10a7 7 0 0 0 14 0" />
      <line x1="12" y1="19" x2="12" y2="22" />
    </svg>
  );
}
