export const KokoBanner = ({ message }: { message: string }) => (
  <div
    className="ws-fade-up mb-7 flex items-start gap-3.5 rounded-[14px] border border-accent/25 border-l-[4px] border-l-accent bg-accent/10 p-4 md:p-5"
    style={{ animationDelay: "0.2s" }}
  >
    <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-gradient-accent text-[14px] font-bold text-white">
      K
    </div>
    <div className="min-w-0">
      <div className="text-[11px] font-semibold uppercase tracking-[0.12em] text-accent">Koko says:</div>
      <p className="mt-1 text-[14px] leading-[1.65] text-foreground">{message}</p>
    </div>
  </div>
);
