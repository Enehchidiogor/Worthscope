import { KokoAvatar } from "@/components/koko/KokoAvatar";

export const KokoBanner = ({ message }: { message: string }) => (
  <div
    className="ws-fade-up mb-7 flex items-start gap-3.5 rounded-[14px] border border-accent/25 border-l-[4px] border-l-accent bg-accent/10 p-4 md:p-5"
    style={{ animationDelay: "0.2s" }}
  >
    <KokoAvatar size={36} />
    <div className="min-w-0">
      <div className="text-[11px] font-semibold uppercase tracking-[0.12em] text-accent">Koko says:</div>
      <p className="mt-1 text-[14px] leading-[1.65] text-foreground">{message}</p>
    </div>
  </div>
);
