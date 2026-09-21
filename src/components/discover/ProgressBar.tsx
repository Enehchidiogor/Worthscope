import { PAPER_FAINT, LINE, BLUE_BRIGHT, FONT } from "@/components/experience/theme";

export default function ProgressBar({ step, total = 6 }: { step: number; total?: number }) {
  const pct = Math.max(0, Math.min(1, step / total));
  return (
    <div style={{ width: "100%", maxWidth: 640, margin: "0 auto 40px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", fontFamily: FONT, fontSize: 11.5, fontWeight: 700, color: PAPER_FAINT, letterSpacing: 0.5, textTransform: "uppercase" }}>
        <span>Career Discovery</span>
        <span>{step} / {total}</span>
      </div>
      <div style={{ marginTop: 8, height: 4, borderRadius: 999, background: LINE, overflow: "hidden" }}>
        <div style={{ width: `${pct * 100}%`, height: "100%", background: BLUE_BRIGHT, borderRadius: 999, transition: "width 0.5s cubic-bezier(0.4,0,0.2,1)" }} />
      </div>
    </div>
  );
}
