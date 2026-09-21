import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { PAPER, BLUE_BRIGHT, FONT, EASE } from "./theme";

export interface DialogueLine {
  text: string;
  holdMs?: number;
}

export default function KokoDialogue({
  lines,
  active,
  onLineChange,
  onComplete,
  align = "center",
  size = 26,
  className,
}: {
  lines: DialogueLine[];
  active: boolean;
  onLineChange?: (index: number, talking: boolean) => void;
  onComplete?: () => void;
  align?: "left" | "center";
  size?: number;
  className?: string;
}) {
  const [index, setIndex] = useState(-1);
  const startedRef = useRef(false);
  const timers = useRef<number[]>([]);

  useEffect(() => {
    if (!active || startedRef.current) return;
    startedRef.current = true;
    let i = 0;
    const runLine = () => {
      if (i >= lines.length) {
        onComplete?.();
        return;
      }
      setIndex(i);
      const line = lines[i];
      const speakMs = Math.min(2200, Math.max(500, line.text.length * 42));
      onLineChange?.(i, true);
      const t1 = window.setTimeout(() => {
        onLineChange?.(i, false);
        const t2 = window.setTimeout(() => {
          i += 1;
          runLine();
        }, line.holdMs ?? 550);
        timers.current.push(t2);
      }, speakMs);
      timers.current.push(t1);
    };
    runLine();
    return () => {
      timers.current.forEach((t) => window.clearTimeout(t));
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active]);

  const current = index >= 0 ? lines[index] : null;

  return (
    <div className={className} style={{ textAlign: align, minHeight: size * 1.6 }}>
      <AnimatePresence mode="wait">
        {current && (
          <motion.p
            key={index}
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.5, ease: EASE }}
            style={{
              margin: 0,
              color: PAPER,
              fontFamily: FONT,
              fontWeight: 700,
              fontSize: size,
              lineHeight: 1.3,
              letterSpacing: -0.3,
              textShadow: `0 0 24px ${BLUE_BRIGHT}55`,
            }}
          >
            {current.text}
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  );
}
