export const TaskContent = () => (
  <>
    <div className="rounded-[14px] border border-accent/20 bg-bg-elevated p-5 md:p-6">
      <h3 className="text-[17px] font-bold text-foreground">Design a mobile onboarding screen</h3>
      <p className="mt-2.5 text-[14px] leading-[1.7] text-text2">
        Create a single mobile screen for a fictional app's onboarding flow. It should include: a hero image area, a
        short headline, a subtext line, and a primary CTA button. Keep it clean and simple.
      </p>

      <div className="mt-4">
        <div className="text-[13px] font-semibold text-foreground">Requirements:</div>
        <ul className="mt-2.5 flex flex-col gap-2">
          {[
            "Use the 390 × 844px frame size",
            "Include at least 3 distinct elements (image, text, button)",
            "Apply consistent spacing — 16px minimum between elements",
          ].map((req) => (
            <li key={req} className="flex items-start gap-2.5">
              <span className="mt-[7px] h-1.5 w-1.5 flex-shrink-0 bg-accent" />
              <span className="text-[13px] text-text2">{req}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>

    <div className="mt-3 inline-flex items-center gap-1.5 rounded-full border border-success/20 bg-success/10 px-3 py-[5px] text-[12px] font-medium text-success">
      <span>✦</span>
      <span>This task builds your portfolio</span>
    </div>
  </>
);
