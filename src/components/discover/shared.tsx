/* WorthScope — Career Intelligence onboarding shared primitives.
   Deliberately calmer than the landing/auth pages: flat dark background,
   no AmbientBackground glow, minimal shadows, generous whitespace. */

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { PAPER, PAPER_DIM, PAPER_FAINT, LINE, BLUE_BRIGHT, FONT, EASE } from "@/components/experience/theme";

export const CI_BG = "#050608";

export function StepFrame({
  eyebrow,
  title,
  subtitle,
  children,
  wide,
}: {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  wide?: boolean;
}) {
  return (
    <motion.div
      key={title}
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -14 }}
      transition={{ duration: 0.45, ease: EASE }}
      style={{ width: "100%", maxWidth: 640, margin: "0 auto" }}
    >
      {eyebrow && (
        <div style={{ fontFamily: FONT, fontSize: 12, fontWeight: 700, letterSpacing: 1.5, textTransform: "uppercase", color: BLUE_BRIGHT, marginBottom: 10 }}>
          {eyebrow}
        </div>
      )}
      <h1 style={{ fontFamily: FONT, fontWeight: 700, fontSize: "clamp(22px,3.4vw,30px)", color: PAPER, letterSpacing: -0.6, margin: 0, lineHeight: 1.25 }}>
        {title}
      </h1>
      {subtitle && (
        <p style={{ fontFamily: FONT, fontSize: 14.5, color: PAPER_DIM, marginTop: 10, lineHeight: 1.6, maxWidth: 480 }}>
          {subtitle}
        </p>
      )}
      <div style={{ marginTop: 30 }}>{children}</div>
    </motion.div>
  );
}

export function NavRow({
  onBack,
  onContinue,
  continueDisabled,
  continueLabel = "Continue",
  continueBusy,
}: {
  onBack?: () => void;
  onContinue: () => void;
  continueDisabled?: boolean;
  continueLabel?: string;
  continueBusy?: boolean;
}) {
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 38 }}>
      {onBack ? (
        <button onClick={onBack} style={navGhostBtn}>
          ← Back
        </button>
      ) : (
        <span />
      )}
      <button onClick={onContinue} disabled={continueDisabled} style={navPrimaryBtn(!!continueDisabled)}>
        {continueBusy ? "One sec…" : continueLabel}
      </button>
    </div>
  );
}

const navGhostBtn: React.CSSProperties = {
  background: "transparent",
  border: "none",
  color: PAPER_FAINT,
  fontFamily: FONT,
  fontSize: 13.5,
  fontWeight: 600,
  cursor: "pointer",
  padding: "10px 4px",
};

export function navPrimaryBtn(disabled: boolean): React.CSSProperties {
  return {
    background: disabled ? "rgba(255,255,255,.06)" : BLUE_BRIGHT,
    color: disabled ? PAPER_FAINT : "#04070D",
    border: "none",
    borderRadius: 12,
    padding: "13px 30px",
    fontFamily: FONT,
    fontWeight: 700,
    fontSize: 14.5,
    cursor: disabled ? "not-allowed" : "pointer",
    transition: "transform 0.15s ease, opacity 0.15s ease",
  };
}

export function OptionCard({
  label,
  description,
  info,
  selected,
  onClick,
  badge,
}: {
  label: string;
  description?: string;
  /** Plain-language explanation shown when the "i" button is tapped. */
  info?: string;
  selected: boolean;
  onClick: () => void;
  badge?: string | number;
}) {
  const [open, setOpen] = useState(false);
  return (
    <div
      style={{
        position: "relative",
        width: "100%",
        borderRadius: 14,
        background: selected ? "rgba(96,165,250,.10)" : "rgba(255,255,255,.025)",
        border: `1.5px solid ${selected ? BLUE_BRIGHT : LINE}`,
        transition: "background 0.15s ease, border-color 0.15s ease",
      }}
    >
      <motion.button
        type="button"
        onClick={onClick}
        whileTap={{ scale: 0.98 }}
        aria-pressed={selected}
        style={{
          display: "block",
          textAlign: "left",
          width: "100%",
          padding: info ? "16px 46px 16px 18px" : "16px 18px",
          background: "transparent",
          border: "none",
          borderRadius: 14,
          cursor: "pointer",
        }}
      >
        <div style={{ fontFamily: FONT, fontWeight: 600, fontSize: 14.5, color: PAPER }}>{label}</div>
        {description && <div style={{ fontFamily: FONT, fontSize: 12.5, color: PAPER_DIM, marginTop: 4, lineHeight: 1.5 }}>{description}</div>}
      </motion.button>

      {badge !== undefined && (
        <span
          style={{
            position: "absolute",
            top: -9,
            right: 14,
            background: BLUE_BRIGHT,
            color: "#04070D",
            fontSize: 11,
            fontWeight: 800,
            width: 20,
            height: 20,
            borderRadius: "50%",
            display: "grid",
            placeItems: "center",
          }}
        >
          {badge}
        </span>
      )}

      {info && (
        <>
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            aria-label={`What does "${label}" mean?`}
            aria-expanded={open}
            style={{
              position: "absolute",
              top: 12,
              right: 12,
              width: 26,
              height: 26,
              borderRadius: "50%",
              cursor: "pointer",
              fontFamily: "Georgia, serif",
              fontStyle: "italic",
              fontWeight: 700,
              fontSize: 14,
              lineHeight: 1,
              color: open ? "#04070D" : BLUE_BRIGHT,
              background: open ? BLUE_BRIGHT : "transparent",
              border: `1.5px solid ${BLUE_BRIGHT}`,
            }}
          >
            i
          </button>
          <AnimatePresence initial={false}>
            {open && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.25, ease: EASE }}
                style={{ overflow: "hidden" }}
              >
                <div
                  style={{
                    margin: "0 14px 14px",
                    padding: "10px 12px",
                    borderRadius: 10,
                    background: "rgba(96,165,250,.08)",
                    borderLeft: `3px solid ${BLUE_BRIGHT}`,
                    fontFamily: FONT,
                    fontSize: 12.5,
                    lineHeight: 1.55,
                    color: PAPER_DIM,
                  }}
                >
                  {info}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </>
      )}
    </div>
  );
}
export function CardGrid({ children, columns = 2, align = "stretch" }: { children: React.ReactNode; columns?: number; align?: "stretch" | "start" }) {
  return (
    <div style={{ display: "grid", gridTemplateColumns: `repeat(auto-fit, minmax(${columns > 1 ? 250 : 500}px, 1fr))`, gap: 14, alignItems: align }}>
      {children}
    </div>
  );
}
