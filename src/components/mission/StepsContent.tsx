import { IconCheck } from "@/components/dashboard/icons";

type Step = {
  title: string;
  description: string;
  status: "complete" | "active" | "incomplete";
  hint?: string;
};

const STEPS: Step[] = [
  {
    title: "Open Figma and create a new file",
    description: "Go to figma.com and start a new design file. Name it 'My First UI Screen'.",
    status: "complete",
  },
  {
    title: "Set up your frame",
    description: "Create a frame using the iPhone 14 preset (390 × 844px) from the toolbar.",
    status: "active",
    hint: "💡 Tip: Press F then click anywhere to create a frame.",
  },
  {
    title: "Add a header with title and subtitle",
    description: "Use the text tool (T) to add a page title. Set size to 24px, weight Bold.",
    status: "incomplete",
  },
  {
    title: "Add a button and apply spacing",
    description: "Draw a rectangle (R), round the corners to 12px, and add a label inside.",
    status: "incomplete",
  },
];

export const StepsContent = () => (
  <ol className="relative mt-2">
    {STEPS.map((step, i) => {
      const isLast = i === STEPS.length - 1;
      const complete = step.status === "complete";
      const active = step.status === "active";
      return (
        <li key={step.title} className={["flex items-start gap-4 py-4", !isLast ? "border-b border-border" : ""].join(" ")}>
          {/* Number column with connector */}
          <div className="relative flex flex-col items-center">
            <div
              className={[
                "z-10 grid h-8 w-8 place-items-center rounded-full text-[13px] font-bold",
                complete
                  ? "bg-accent text-white"
                  : active
                  ? "border-2 border-accent bg-accent/10 text-accent"
                  : "border-2 border-border bg-card text-text3",
              ].join(" ")}
            >
              {complete ? <IconCheck className="h-3 w-3" /> : String(i + 1).padStart(2, "0").slice(-2)}
            </div>
            {!isLast && (
              <div className="absolute left-1/2 top-8 h-[calc(100%+1rem)] w-[1.5px] -translate-x-1/2 origin-top">
                <div
                  className={[
                    "h-full w-full transition-transform duration-500",
                    complete ? "scale-y-100 bg-accent" : "scale-y-100 bg-border",
                  ].join(" ")}
                />
              </div>
            )}
          </div>

          {/* Body */}
          <div className="min-w-0 flex-1">
            <h3
              className={[
                "text-[15px] font-semibold",
                complete ? "text-text3 line-through" : "text-foreground",
              ].join(" ")}
            >
              {step.title}
            </h3>
            <p className="mt-1 text-[13px] leading-[1.6] text-text2">{step.description}</p>
            {step.hint && (
              <div className="mt-3 inline-block rounded-[10px] bg-accent/10 px-3.5 py-2.5 text-[12px] text-accent">
                {step.hint}
              </div>
            )}
          </div>
        </li>
      );
    })}
  </ol>
);
