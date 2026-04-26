import type { ReactNode } from "react";
import { IconCheck } from "@/components/dashboard/icons";

type Props = {
  number: string; // "01"
  label: string; // "LEARN"
  title: string;
  subtitle?: string;
  done: boolean;
  onToggle: () => void;
  children: ReactNode;
  emphasized?: boolean; // section 3 (task) gets stronger left border
  delay?: string;
};

export const SectionShell = ({
  number,
  label,
  title,
  subtitle,
  done,
  onToggle,
  children,
  emphasized,
  delay,
}: Props) => {
  return (
    <section
      className={[
        "ws-fade-up relative mb-5 rounded-[20px] border bg-card p-6 shadow-card md:p-7",
        done ? "border-l-[3px] border-l-success" : emphasized ? "border-l-[4px] border-l-accent" : "",
        "border-border",
      ].join(" ")}
      style={{ animationDelay: delay }}
    >
      <div className="inline-flex items-center gap-2 rounded-md bg-accent/10 px-2.5 py-[3px] text-[11px] font-bold uppercase tracking-[0.12em] text-accent">
        <span>{number}</span>
        <span>{label}</span>
      </div>

      <h2 className="mt-3 text-[20px] font-bold text-foreground">{title}</h2>
      {subtitle && <p className="mt-1.5 text-[14px] leading-[1.6] text-text2">{subtitle}</p>}

      <div className="mt-5">{children}</div>

      <div className="mt-6 flex items-center justify-end gap-2">
        <button
          type="button"
          onClick={onToggle}
          aria-pressed={done}
          className={[
            "group flex h-[22px] w-[22px] items-center justify-center rounded-full border-2 transition-all",
            done
              ? "border-success bg-success text-white"
              : "border-border bg-transparent hover:border-accent",
          ].join(" ")}
        >
          {done && <IconCheck className="h-3 w-3" />}
        </button>
        <span
          className={[
            "text-[13px] font-medium transition-colors",
            done ? "text-success" : "text-text3",
          ].join(" ")}
        >
          {done ? "Section complete" : "Mark section as done"}
        </span>
      </div>
    </section>
  );
};
