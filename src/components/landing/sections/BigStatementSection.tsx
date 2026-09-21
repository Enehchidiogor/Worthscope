import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useInView } from "framer-motion";
import { PAPER, BLUE_BRIGHT, FONT } from "../../experience/theme";

const LINES = ["YOUR DEGREE IS INFORMATION.", "YOUR SKILLS ARE LEVERAGE.", "YOUR DIRECTION CHANGES EVERYTHING."];

export default function BigStatementSection() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.6 });
  const [index, setIndex] = useState(-1);
  const [showBrand, setShowBrand] = useState(false);
  const started = useRef(false);

  useEffect(() => {
    if (!inView || started.current) return;
    started.current = true;
    let i = 0;
    const timers: number[] = [];
    const step = () => {
      if (i >= LINES.length) {
        timers.push(window.setTimeout(() => setShowBrand(true), 500));
        return;
      }
      setIndex(i);
      timers.push(
        window.setTimeout(() => {
          i += 1;
          step();
        }, 1500)
      );
    };
    step();
    return () => timers.forEach((t) => window.clearTimeout(t));
  }, [inView]);

  return (
    <section
      ref={ref}
      style={{ minHeight: "90vh", background: "#000", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "100px 24px", textAlign: "center" }}
    >
      <div style={{ minHeight: 140 }}>
        <AnimatePresence mode="wait">
          {!showBrand && index >= 0 && (
            <motion.h2
              key={index}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.6 }}
              style={{ fontFamily: FONT, fontWeight: 700, fontSize: "clamp(28px,5.5vw,54px)", color: PAPER, letterSpacing: -1, margin: 0, lineHeight: 1.2 }}
            >
              {LINES[index]}
            </motion.h2>
          )}
        </AnimatePresence>
      </div>

      <AnimatePresence>
        {showBrand && (
          <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1 }} style={{ marginTop: -40 }}>
            <h2 style={{ fontFamily: FONT, fontWeight: 700, fontSize: "clamp(36px,7vw,80px)", color: PAPER, letterSpacing: -1.4, margin: 0 }}>
              WORTH<span style={{ color: BLUE_BRIGHT }}>SCOPE</span>
            </h2>
            <p style={{ marginTop: 14, fontFamily: FONT, fontWeight: 600, fontSize: 13.5, letterSpacing: 2, color: "rgba(255,255,255,.6)", textTransform: "uppercase" }}>
              Know Your Worth. Build Your Direction.
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
