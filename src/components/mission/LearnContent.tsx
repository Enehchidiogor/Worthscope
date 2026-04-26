import { IconPlay } from "@/components/dashboard/icons";

export const LearnContent = () => (
  <>
    {/* Video block */}
    <div className="relative aspect-video overflow-hidden rounded-[14px] border border-border bg-bg-elevated">
      {/* Play button */}
      <button
        type="button"
        className="absolute left-1/2 top-1/2 grid h-16 w-16 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full bg-accent text-white shadow-[0_8px_24px_hsl(var(--accent)/0.35)] transition-all duration-200 hover:scale-[1.08] hover:bg-accent-dark"
        aria-label="Play video"
      >
        <IconPlay className="ml-1 h-[22px] w-[22px]" />
      </button>

      {/* Bottom-left title overlay */}
      <div className="absolute bottom-0 left-0 rounded-tr-[14px] bg-black/50 px-3 py-2 text-[13px] font-semibold text-white">
        Intro to UI Design — Understanding Layouts
      </div>
      {/* Bottom-right duration */}
      <div className="absolute bottom-0 right-0 rounded-tl-[14px] bg-black/50 px-3 py-2 text-[12px] font-medium text-white/85">
        12 min
      </div>
    </div>

    {/* Key points */}
    <div className="mt-6">
      <div className="text-[13px] font-semibold text-foreground">What you'll learn</div>
      <ul className="mt-3 flex flex-col gap-2.5">
        {[
          "How to structure a UI layout using spacing and hierarchy",
          "The core principles of alignment and visual balance",
          "How to create simple, clean screens that communicate clearly",
        ].map((point) => (
          <li key={point} className="flex items-start gap-2.5">
            <span className="mt-[7px] h-2 w-2 flex-shrink-0 rounded-full bg-accent" />
            <span className="text-[14px] leading-[1.6] text-text2">{point}</span>
          </li>
        ))}
      </ul>
    </div>
  </>
);
