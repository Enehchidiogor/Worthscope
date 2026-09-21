import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import KokoFace from "@/components/experience/KokoFace";
import { PAPER, PAPER_DIM, FONT } from "@/components/experience/theme";
import type { CareerIntelligenceProfile, CareerPrediction } from "@/lib/careerIntelligence";
import { submitForPrediction } from "@/lib/careerIntelligence";

const STAGES = [
  "Reading through everything you shared…",
  "Weighing how your answers connect…",
  "Matching signals to real career directions…",
  "Putting your results together…",
];

export default function AnalyzingStep({
  profile,
  onDone,
  onError,
}: {
  profile: CareerIntelligenceProfile;
  onDone: (prediction: CareerPrediction) => void;
  onError: (message: string) => void;
}) {
  const [stage, setStage] = useState(0);
  const startedRef = useRef(false);

  useEffect(() => {
    const interval = window.setInterval(() => {
      setStage((s) => Math.min(s + 1, STAGES.length - 1));
    }, 1800);

    if (!startedRef.current) {
      startedRef.current = true;
      submitForPrediction(profile)
        .then((prediction) => onDone(prediction))
        .catch((e) => onError(e instanceof Error ? e.message : "Something went wrong building your results."));
    }

    return () => window.clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div style={{ textAlign: "center", maxWidth: 460, margin: "0 auto" }}>
      <KokoFace expression="thinking" size={92} />
      <div style={{ marginTop: 30, minHeight: 28 }}>
        <AnimatePresence mode="wait">
          <motion.p
            key={stage}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.35 }}
            style={{ fontFamily: FONT, fontSize: 15, color: PAPER, margin: 0 }}
          >
            {STAGES[stage]}
          </motion.p>
        </AnimatePresence>
        <p style={{ marginTop: 8, fontFamily: FONT, fontSize: 12.5, color: PAPER_DIM }}>This usually takes a few seconds.</p>
      </div>
    </div>
  );
}
