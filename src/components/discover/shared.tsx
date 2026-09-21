/* WorthScope — Career Intelligence onboarding shared primitives.
   Deliberately calmer than the landing/auth pages: flat dark background,
   no AmbientBackground glow, minimal shadows, generous whitespace. */

import { motion } from "framer-motion";
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
  selected,
  onClick,
  badge,
}: {
  label: string;
  description?: string;
  selected: boolean;
  onClick: () => void;
  badge?: string | number;
}) {
  return (
    <motion.button
      onClick={onClick}
      whileTap={{ scale: 0.98 }}
      style={{
        position: "relative",
        textAlign: "left",
        width: "100%",
        padding: "16px 18px",
        borderRadius: 14,
        cursor: "pointer",
        background: selected ? "rgba(96,165,250,.10)" : "rgba(255,255,255,.025)",
        border: `1.5px solid ${selected ? BLUE_BRIGHT : LINE}`,
        transition: "background 0.15s ease, border-color 0.15s ease",
      }}
    >
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
      <div style={{ fontFamily: FONT, fontWeight: 600, fontSize: 14.5, color: PAPER }}>{label}</div>
      {description && <div style={{ fontFamily: FONT, fontSize: 12.5, color: PAPER_DIM, marginTop: 4, lineHeight: 1.5 }}>{description}</div>}
    </motion.button>
  );
}

export function CardGrid({ children, columns = 2 }: { children: React.ReactNode; columns?: number }) {
  return (
    <div style={{ display: "grid", gridTemplateColumns: `repeat(auto-fit, minmax(${columns > 1 ? 250 : 500}px, 1fr))`, gap: 14, alignItems: "stretch" }}>
      {children}
    </div>
  );
}
