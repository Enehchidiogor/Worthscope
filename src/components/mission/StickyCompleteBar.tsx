import { useEffect, useState } from "react";

type Props = {
  sectionsDone: boolean[]; // 4 booleans
  verified?: boolean;       // Koko verification gate
  onComplete: () => void;
};

const CONFETTI_COLORS = [
  "hsl(var(--accent))",
  "hsl(var(--success))",
  "hsl(var(--streak))",
  "hsl(0 0% 100%)",
];

export const StickyCompleteBar = ({ sectionsDone, verified = false, onComplete }: Props) => {
  const [completing, setCompleting] = useState(false);
  const [done, setDone] = useState(false);

  const total = sectionsDone.length;
  const doneCount = sectionsDone.filter(Boolean).length;
  const allSectionsDone = doneCount === total;
  const allDone = allSectionsDone && verified;

  const handleClick = () => {
    if (!allDone || completing) return;
    setCompleting(true);
    setDone(true);
    // brief celebration then upstream
    setTimeout(() => onComplete(), 1500);
  };

  return (
    <>
      {/* Page-wide flash overlay on completion */}
      {done && (
        <div
          aria-hidden
          className="pointer-events-none fixed inset-0 z-[80] bg-accent/[0.04] animate-[ws-fade_0.5s_ease-out_both]"
        />
      )}

      <div className="pointer-events-none fixed bottom-0 left-0 right-0 z-[90] md:left-[220px]">
        <div className="pointer-events-auto flex h-20 items-center justify-between gap-3 border-t border-border bg-background/95 px-4 backdrop-blur-md md:px-8">
          {/* Left: section dots + counter */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5">
              {sectionsDone.map((d, i) => {
                const isCurrent = !d && i === sectionsDone.findIndex((x) => !x);
                return (
                  <span
                    key={i}
                    className={[
                      "h-2.5 w-2.5 rounded-full transition-colors",
                      d ? "bg-success" : isCurrent ? "bg-accent shadow-[0_0_0_3px_hsl(var(--accent)/0.2)]" : "bg-border",
                    ].join(" ")}
                  />
                );
              })}
            </div>
            <span className="hidden text-[13px] font-medium text-text2 sm:inline">
              {doneCount} of {total} sections complete
            </span>
          </div>

          {/* Right: button */}
          <div className="flex flex-col items-end gap-1">
            <button
              type="button"
              disabled={!allDone || completing}
              onClick={handleClick}
              className={[
                "relative h-12 w-[180px] overflow-hidden rounded-[14px] text-[15px] font-semibold transition-all md:w-[220px]",
                done
                  ? "bg-success text-white"
                  : allDone
                  ? "bg-accent text-white hover:-translate-y-[1px] hover:bg-accent-dark hover:shadow-[0_8px_24px_hsl(var(--accent)/0.35)]"
                  : "cursor-not-allowed bg-locked text-text3",
              ].join(" ")}
            >
              {done ? "✓ Mission Complete!" : allDone ? "Mark as Complete ✓" : "Mark as Complete"}

              {/* Confetti burst on completion */}
              {done && (
                <span aria-hidden className="pointer-events-none absolute inset-0">
                  {Array.from({ length: 14 }).map((_, i) => {
                    const left = 10 + (i * 80) / 14;
                    const color = CONFETTI_COLORS[i % CONFETTI_COLORS.length];
                    const dx = (i % 2 === 0 ? -1 : 1) * (10 + (i % 5) * 6);
                    return (
                      <span
                        key={i}
                        className="absolute bottom-3 h-2 w-2 rounded-[2px] opacity-0"
                        style={{
                          left: `${left}%`,
                          background: color,
                          animation: `ws-confetti 0.9s ease-out ${i * 0.02}s both`,
                          ["--confetti-x" as string]: `${dx}px`,
                        }}
                      />
                    );
                  })}
                </span>
              )}
            </button>
            {!allDone && (
              <span className="text-[11px] text-text3">Complete all sections to unlock</span>
            )}
          </div>
        </div>
      </div>
    </>
  );
};
