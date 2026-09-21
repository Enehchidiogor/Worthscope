import { useEffect, useRef, useState } from "react";
import { motion, useMotionValue, useAnimationFrame, useTransform, animate } from "framer-motion";
import { useExperience } from "./ExperienceContext";
import { BLUE_BRIGHT } from "./theme";

export type KokoExpression =
  | "idle"
  | "listening"
  | "talking"
  | "thinking"
  | "curious"
  | "happy"
  | "concerned"
  | "celebrating";

const CURVE: Record<KokoExpression, number> = {
  idle: 10,
  listening: 6,
  talking: 14,
  thinking: -4,
  curious: 18,
  happy: 34,
  concerned: -26,
  celebrating: 42,
};

const GLOW: Record<KokoExpression, number> = {
  idle: 1,
  listening: 1.05,
  talking: 1.1,
  thinking: 0.9,
  curious: 1.15,
  happy: 1.3,
  concerned: 0.8,
  celebrating: 1.5,
};

export default function KokoFace({
  expression = "idle",
  talking = false,
  size = 220,
  lookAtCursor = true,
  className,
}: {
  expression?: KokoExpression;
  talking?: boolean;
  size?: number;
  lookAtCursor?: boolean;
  className?: string;
}) {
  const { cursor, isMobile } = useExperience();
  const curve = useMotionValue(CURVE[expression]);
  const glow = useMotionValue(GLOW[expression]);
  const eyeX = useMotionValue(0);
  const eyeY = useMotionValue(0);
  const [blink, setBlink] = useState(1);
  const talkPhase = useRef(0);
  const [talkWobble, setTalkWobble] = useState(0);

  useEffect(() => {
    const c1 = animate(curve, CURVE[expression], { duration: 0.55, ease: [0.16, 1, 0.3, 1] });
    const c2 = animate(glow, GLOW[expression], { duration: 0.6, ease: [0.16, 1, 0.3, 1] });
    return () => {
      c1.stop();
      c2.stop();
    };
  }, [expression, curve, glow]);

  useEffect(() => {
    let cancelled = false;
    let timer = 0;
    function scheduleBlink() {
      const delay = 2600 + Math.random() * 3200;
      timer = window.setTimeout(() => {
        if (cancelled) return;
        setBlink(0.06);
        window.setTimeout(() => {
          if (!cancelled) setBlink(1);
        }, 120);
        scheduleBlink();
      }, delay);
    }
    scheduleBlink();
    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
  }, []);

  useAnimationFrame((t) => {
    if (lookAtCursor && !isMobile) {
      const targetX = cursor.current.nx * 10;
      const targetY = cursor.current.ny * 6;
      eyeX.set(eyeX.get() + (targetX - eyeX.get()) * 0.08);
      eyeY.set(eyeY.get() + (targetY - eyeY.get()) * 0.08);
    }
    if (talking) {
      talkPhase.current = t / 1000;
      setTalkWobble(0.55 + Math.abs(Math.sin(talkPhase.current * 9)) * 0.45);
    } else if (talkWobble !== 0) {
      setTalkWobble(0);
    }
  });

  const pathD = useTransform(curve, (c) => {
    const w = size * 0.34;
    const cy = size * 0.62;
    const x1 = size / 2 - w / 2;
    const x2 = size / 2 + w / 2;
    return `M ${x1} ${cy} Q ${size / 2} ${cy + c} ${x2} ${cy}`;
  });

  const glowShadow = useTransform(glow, (g) => `0 0 ${70 * g}px ${18 * g}px rgba(59,130,246,${0.35 * g})`);

  return (
    <div className={className} style={{ width: size, height: size, position: "relative" }}>
      <motion.div
        aria-hidden
        style={{
          position: "absolute",
          inset: 0,
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(59,130,246,.5), rgba(59,130,246,.08) 55%, transparent 75%)",
          filter: "blur(18px)",
          boxShadow: glowShadow,
        }}
      />
      <svg viewBox={`0 0 ${size} ${size}`} width={size} height={size} style={{ position: "relative", zIndex: 1 }}>
        <motion.g style={{ x: eyeX, y: eyeY }}>
          <motion.rect
            x={size * 0.34}
            y={size * 0.36}
            width={size * 0.075}
            height={size * 0.16}
            rx={size * 0.04}
            fill={BLUE_BRIGHT}
            animate={{ scaleY: blink }}
            transition={{ duration: 0.09, ease: "easeInOut" }}
            style={{ originY: 0.5, transformBox: "fill-box" as any }}
          />
          <motion.rect
            x={size * 0.585}
            y={size * 0.36}
            width={size * 0.075}
            height={size * 0.16}
            rx={size * 0.04}
            fill={BLUE_BRIGHT}
            animate={{ scaleY: blink }}
            transition={{ duration: 0.09, ease: "easeInOut" }}
            style={{ originY: 0.5, transformBox: "fill-box" as any }}
          />
        </motion.g>
        <motion.path d={pathD} fill="none" stroke={BLUE_BRIGHT} strokeWidth={size * 0.024 * (1 + talkWobble * 0.5)} strokeLinecap="round" />
      </svg>
    </div>
  );
}
