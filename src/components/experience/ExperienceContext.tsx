import { createContext, useContext, useEffect, useRef, useState, type MutableRefObject, type ReactNode } from "react";

export type CursorRef = MutableRefObject<{ x: number; y: number; nx: number; ny: number }>;

type ExperienceState = {
  isMobile: boolean;
  prefersReducedMotion: boolean;
  cursor: CursorRef;
};

const ExperienceCtx = createContext<ExperienceState | null>(null);

export function ExperienceProvider({ children }: { children: ReactNode }) {
  const [isMobile, setIsMobile] = useState(false);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  const cursor: CursorRef = useRef({ x: 0, y: 0, nx: 0, ny: 0 });

  useEffect(() => {
    if (typeof window === "undefined") return;
    const mq = window.matchMedia("(max-width: 860px), (pointer: coarse)");
    const update = () => setIsMobile(mq.matches);
    update();
    mq.addEventListener("change", update);
    const rmq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const updateR = () => setPrefersReducedMotion(rmq.matches);
    updateR();
    rmq.addEventListener("change", updateR);
    return () => {
      mq.removeEventListener("change", update);
      rmq.removeEventListener("change", updateR);
    };
  }, []);

  useEffect(() => {
    if (isMobile) return;
    const onMove = (e: PointerEvent) => {
      cursor.current.x = e.clientX;
      cursor.current.y = e.clientY;
      cursor.current.nx = (e.clientX / window.innerWidth) * 2 - 1;
      cursor.current.ny = (e.clientY / window.innerHeight) * 2 - 1;
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    return () => window.removeEventListener("pointermove", onMove);
  }, [isMobile]);

  return <ExperienceCtx.Provider value={{ isMobile, prefersReducedMotion, cursor }}>{children}</ExperienceCtx.Provider>;
}

export function useExperience() {
  const ctx = useContext(ExperienceCtx);
  if (!ctx) throw new Error("useExperience must be used within ExperienceProvider");
  return ctx;
}
