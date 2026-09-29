import { forwardRef } from "react";
import type { Certificate as CertData } from "@/lib/certificates";
import { PAPER, PAPER_DIM, PAPER_FAINT, BLUE, BLUE_BRIGHT, FONT } from "@/components/experience/theme";

const DESIGN_WIDTH = 900;
const DESIGN_HEIGHT = 620;

function formatDate(iso: string): string {
  try {
    return new Date(iso).toLocaleDateString("en-US", { day: "numeric", month: "long", year: "numeric" });
  } catch {
    return iso.slice(0, 10);
  }
}

/** Short, non-cryptographic verification code — just makes the certificate feel concrete. */
function verificationCode(cert: CertData): string {
  const seed = `${cert.id}-${cert.recipientName}-${cert.issuedAt}`;
  let h = 0;
  for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) >>> 0;
  return `WS-${h.toString(36).toUpperCase().slice(0, 8)}`;
}

/** The certificate artwork itself, at a fixed pixel size so exports are always crisp.
    Wrap in <ScaledCertificate> to display responsively on screen. */
export const Certificate = forwardRef<HTMLDivElement, { cert: CertData }>(({ cert }, ref) => {
  const isCareer = cert.kind === "career";
  const headline = isCareer ? cert.careerPath : cert.phaseTitle;
  const eyebrow = isCareer ? "Certificate of Achievement" : "Certificate of Completion";
  const bodyLine = isCareer
    ? "has completed the WorthScope learning journey and been matched to a career path in"
    : "has successfully completed the course";
  const sub = isCareer ? "on WorthScope" : `part of the ${cert.careerPath} track`;

  return (
    <div
      ref={ref}
      style={{
        width: DESIGN_WIDTH,
        height: DESIGN_HEIGHT,
        position: "relative",
        background: "#05070C",
        fontFamily: FONT,
        color: PAPER,
        overflow: "hidden",
        flexShrink: 0,
      }}
    >
      {/* Background glow accents */}
      <div style={{ position: "absolute", top: -140, left: -140, width: 420, height: 420, borderRadius: "50%", background: `radial-gradient(circle, ${BLUE}55, transparent 70%)` }} />
      <div style={{ position: "absolute", bottom: -160, right: -120, width: 460, height: 460, borderRadius: "50%", background: `radial-gradient(circle, ${BLUE}33, transparent 70%)` }} />

      {/* Border frame */}
      <div style={{ position: "absolute", inset: 22, border: `1.5px solid ${BLUE_BRIGHT}66`, borderRadius: 16 }} />
      <div style={{ position: "absolute", inset: 30, border: `1px solid ${PAPER}1A`, borderRadius: 12 }} />

      <div style={{ position: "relative", height: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "0 90px", textAlign: "center" }}>
        {/* Koko mark */}
        <div
          style={{
            width: 64,
            height: 64,
            borderRadius: "50%",
            background: "#05070C",
            border: `1.5px solid ${BLUE_BRIGHT}88`,
            boxShadow: `0 0 24px ${BLUE}66`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            marginBottom: 18,
          }}
        >
          <svg width="30" height="30" viewBox="0 0 24 24" fill="none">
            <rect x="6.2" y="7.5" width="3.2" height="6" rx="1.6" fill={BLUE_BRIGHT} />
            <rect x="14.6" y="7.5" width="3.2" height="6" rx="1.6" fill={BLUE_BRIGHT} />
            <path d="M8 15c1 1.6 2.3 2.4 4 2.4S15 16.6 16 15" stroke={BLUE_BRIGHT} strokeWidth="1.6" strokeLinecap="round" fill="none" />
          </svg>
        </div>

        <div style={{ fontSize: 13, fontWeight: 700, letterSpacing: 4, textTransform: "uppercase", color: BLUE_BRIGHT }}>WorthScope</div>
        <div style={{ marginTop: 14, fontSize: 15, fontWeight: 700, letterSpacing: 3, textTransform: "uppercase", color: PAPER_FAINT }}>{eyebrow}</div>

        <div style={{ marginTop: 26, fontSize: 13, color: PAPER_DIM }}>This certifies that</div>
        <div style={{ marginTop: 10, fontSize: 40, fontWeight: 700, letterSpacing: -0.5, lineHeight: 1.15 }}>{cert.recipientName}</div>

        <div style={{ marginTop: 18, fontSize: 14, color: PAPER_DIM, maxWidth: 560, lineHeight: 1.6 }}>{bodyLine}</div>
        <div style={{ marginTop: 8, fontSize: 26, fontWeight: 700, color: BLUE_BRIGHT, letterSpacing: -0.3 }}>{headline}</div>
        {!isCareer && <div style={{ marginTop: 4, fontSize: 13, color: PAPER_FAINT }}>{sub}</div>}

        <div style={{ marginTop: 34, width: 220, height: 1, background: `${PAPER}22` }} />

        <div style={{ marginTop: 18, display: "flex", alignItems: "center", gap: 40, fontSize: 12, color: PAPER_FAINT }}>
          <div>
            <div style={{ fontWeight: 700, color: PAPER_DIM }}>{formatDate(cert.issuedAt)}</div>
            <div style={{ marginTop: 2 }}>Date issued</div>
          </div>
          <div>
            <div style={{ fontWeight: 700, color: PAPER_DIM, fontFamily: "monospace", letterSpacing: 1 }}>{verificationCode(cert)}</div>
            <div style={{ marginTop: 2 }}>Verification code</div>
          </div>
        </div>
      </div>
    </div>
  );
});
Certificate.displayName = "Certificate";

export { DESIGN_WIDTH, DESIGN_HEIGHT };
