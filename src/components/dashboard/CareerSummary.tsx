export const CareerSummary = () => (
  <div className="rounded-[20px] border border-border bg-card p-6 shadow-card">
    {/* Top — Career match */}
    <div>
      <div className="text-[10px] font-semibold uppercase tracking-[1.5px] text-accent">Your Top Match</div>
      <h4 className="mt-2 text-[18px] font-bold text-foreground">Product Designer</h4>

      <div className="mt-3 flex items-center gap-3">
        <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-foreground/5">
          <div
            className="h-full rounded-full bg-accent"
            style={{ width: "92%", animation: "ws-bar-fill 1.2s ease-out both" }}
          />
        </div>
        <span className="shrink-0 text-[13px] font-semibold text-accent">92% Match</span>
      </div>
    </div>

    <div className="my-4 h-px bg-foreground/5" />

    {/* Bottom — Insight */}
    <div>
      <div className="text-[10px] font-semibold uppercase tracking-[1.5px] text-accent">
        💡 Koko Tip
      </div>
      <p className="mt-2 text-[13px] leading-[1.65] text-text2">
        Students who complete projects early gain real-world confidence faster. Try finishing Mission 2 today.
      </p>
    </div>
  </div>
);
