import { useEffect, useRef, useState, type RefObject } from "react";
import { Certificate, DESIGN_WIDTH, DESIGN_HEIGHT } from "./Certificate";
import type { Certificate as CertData } from "@/lib/certificates";

/** Displays the fixed-size certificate scaled to fit its container, while
    `captureRef` always points at the full-resolution, unscaled node — so
    on-screen it fits any width, but exports/downloads stay crisp. */
export function ScaledCertificate({ cert, captureRef }: { cert: CertData; captureRef: RefObject<HTMLDivElement> }) {
  const outerRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);

  useEffect(() => {
    const el = outerRef.current;
    if (!el) return;
    const update = () => setScale(Math.min(1, el.clientWidth / DESIGN_WIDTH));
    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  return (
    <div ref={outerRef} style={{ width: "100%", height: DESIGN_HEIGHT * scale, overflow: "hidden" }}>
      <div style={{ width: DESIGN_WIDTH, height: DESIGN_HEIGHT, transform: `scale(${scale})`, transformOrigin: "top left" }}>
        <Certificate ref={captureRef} cert={cert} />
      </div>
    </div>
  );
}
