import { useRef, useState } from "react";
import { motion } from "framer-motion";
import type { Commitment } from "@/lib/careerIntelligence";
import { PAPER, PAPER_DIM, PAPER_FAINT, LINE, BLUE_BRIGHT, FONT } from "@/components/experience/theme";
import { useDictationField } from "@/lib/useDictationField";
import { StepFrame, NavRow } from "./shared";

const OPTIONS: { key: keyof Commitment; label: string }[] = [
  { key: "furtherEducation", label: "I'm open to pursuing another degree" },
  { key: "certifications", label: "I'd prefer professional courses or certifications" },
  { key: "practicalLearning", label: "I learn best through projects and practice" },
  { key: "entryLevel", label: "I'm willing to start at entry level" },
  { key: "speedToIncome", label: "I need to start earning relatively quickly" },
  { key: "careerChange", label: "I'm open to changing my current field entirely" },
  { key: "relocation", label: "I'm open to relocating for the right opportunity" },
  { key: "hasConstraints", label: "I have financial, family, or time constraints to consider" },
];

export default function Q6Commitment({
  commitment,
  additionalContext,
  onBack,
  onContinue,
}: {
  commitment: Commitment;
  additionalContext: string;
  onBack: () => void;
  onContinue: (commitment: Commitment, additionalContext: string) => void;
}) {
  const [state, setState] = useState<Commitment>(commitment);
  const [notes, setNotes] = useState(additionalContext);

  function toggle(key: keyof Commitment) {
    setState({ ...state, [key]: !state[key] });
  }

  const notesRef = useRef(notes);
  notesRef.current = notes;
  const { listening, error: micError, toggle: toggleDictation, supported: micSupported } = useDictationField(() => notesRef.current, setNotes);

  return (
    <StepFrame eyebrow="Question 6 of 6" title="What's your real-world commitment?" subtitle="Select whatever's true for you — there's no wrong combination.">
      <div style={{ display: "grid", gap: 10 }}>
        {OPTIONS.map((o) => (
          <label
            key={o.key}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 12,
              padding: "14px 16px",
              borderRadius: 12,
              cursor: "pointer",
              background: state[o.key] ? "rgba(96,165,250,.10)" : "rgba(255,255,255,.025)",
              border: `1.5px solid ${state[o.key] ? BLUE_BRIGHT : LINE}`,
            }}
          >
            <span
              style={{
                width: 18,
                height: 18,
                borderRadius: 5,
                border: `1.5px solid ${state[o.key] ? BLUE_BRIGHT : LINE}`,
                background: state[o.key] ? BLUE_BRIGHT : "transparent",
                display: "grid",
                placeItems: "center",
                flexShrink: 0,
              }}
            >
              {state[o.key] && (
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#04070D" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              )}
            </span>
            <span style={{ fontFamily: FONT, fontSize: 14, color: PAPER }}>{o.label}</span>
            <input type="checkbox" checked={state[o.key]} onChange={() => toggle(o.key)} style={{ display: "none" }} />
          </label>
        ))}
      </div>

      <div style={{ marginTop: 26 }}>
        <div style={{ fontFamily: FONT, fontSize: 12, fontWeight: 700, letterSpacing: 1, textTransform: "uppercase", color: PAPER_FAINT, marginBottom: 10 }}>
          Anything else Koko should know? (optional)
        </div>
        <div style={{ position: "relative" }}>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Anything you'd like considered…"
            rows={4}
            style={{
              width: "100%",
              background: "rgba(255,255,255,.03)",
              border: `1.5px solid ${LINE}`,
              borderRadius: 14,
              padding: "14px 16px",
              color: PAPER,
              fontFamily: FONT,
              fontSize: 14,
              lineHeight: 1.6,
              resize: "vertical",
              outline: "none",
            }}
          />
          {micSupported && (
            <motion.button
              onClick={toggleDictation}
              whileTap={{ scale: 0.92 }}
              style={{
                position: "absolute",
                right: 10,
                bottom: 10,
                width: 34,
                height: 34,
                borderRadius: "50%",
                border: `1.5px solid ${listening ? BLUE_BRIGHT : LINE}`,
                background: listening ? "rgba(96,165,250,.15)" : "rgba(255,255,255,.04)",
                display: "grid",
                placeItems: "center",
                cursor: "pointer",
              }}
              aria-label={listening ? "Stop dictation" : "Start dictation"}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={listening ? BLUE_BRIGHT : PAPER_DIM} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="9" y="2" width="6" height="12" rx="3" />
                <path d="M5 10a7 7 0 0 0 14 0" />
                <line x1="12" y1="19" x2="12" y2="22" />
              </svg>
            </motion.button>
          )}
        </div>
        {micSupported && (
          <div style={{ marginTop: 8, fontFamily: FONT, fontSize: 12.5, color: micError ? "#FCA5A5" : listening ? BLUE_BRIGHT : PAPER_FAINT }}>
            {micError ?? (listening ? "Listening… speak now, tap the mic again when you're done" : "Tap the mic to speak instead of typing")}
          </div>
        )}
      </div>

      <NavRow onBack={onBack} onContinue={() => onContinue(state, notes)} continueLabel="See my direction" />
    </StepFrame>
  );
}
