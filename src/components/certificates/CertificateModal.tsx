import { useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { Certificate as CertData } from "@/lib/certificates";
import { ScaledCertificate } from "./ScaledCertificate";
import { PAPER, PAPER_DIM, BLUE_BRIGHT, LINE, FONT, EASE } from "@/components/experience/theme";

export function CertificateModal({ cert, onClose }: { cert: CertData | null; onClose: () => void }) {
  const captureRef = useRef<HTMLDivElement>(null);
  const [downloading, setDownloading] = useState(false);

  async function download() {
    if (!captureRef.current || downloading) return;
    setDownloading(true);
    try {
      const { default: html2canvas } = await import("html2canvas");
      const canvas = await html2canvas(captureRef.current, { backgroundColor: "#05070C", scale: 2, useCORS: true });
      const url = canvas.toDataURL("image/png");
      const a = document.createElement("a");
      const slug = cert?.kind === "career" ? cert.careerPath : cert?.kind === "phase" ? cert.phaseTitle : "certificate";
      a.href = url;
      a.download = `WorthScope Certificate - ${slug}.png`;
      a.click();
    } catch {
      // Best-effort — the on-screen certificate is still visible either way.
    } finally {
      setDownloading(false);
    }
  }

  return (
    <AnimatePresence>
      {cert && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          style={{ position: "fixed", inset: 0, zIndex: 2000, background: "rgba(0,0,0,.72)", backdropFilter: "blur(4px)", display: "grid", placeItems: "center", padding: 20 }}
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, y: 24, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 12, scale: 0.98 }}
            transition={{ duration: 0.4, ease: EASE }}
            onClick={(e) => e.stopPropagation()}
            style={{ width: "100%", maxWidth: 720, fontFamily: FONT }}
          >
            <div style={{ textAlign: "center", marginBottom: 18 }}>
              <div style={{ fontSize: 12, fontWeight: 700, letterSpacing: 1.6, textTransform: "uppercase", color: BLUE_BRIGHT }}>
                {cert.kind === "career" ? "🎉 Career journey complete" : "🎉 Course complete"}
              </div>
              <div style={{ marginTop: 6, fontSize: 20, fontWeight: 700, color: PAPER }}>You've earned a certificate</div>
            </div>

            <div style={{ borderRadius: 16, overflow: "hidden", border: `1px solid ${LINE}`, boxShadow: "0 20px 60px rgba(0,0,0,.5)" }}>
              <ScaledCertificate cert={cert} captureRef={captureRef} />
            </div>

            <div style={{ display: "flex", justifyContent: "center", gap: 12, marginTop: 22 }}>
              <button
                onClick={onClose}
                style={{ background: "transparent", border: `1.5px solid ${LINE}`, color: PAPER_DIM, borderRadius: 12, padding: "12px 24px", fontFamily: FONT, fontWeight: 600, fontSize: 14, cursor: "pointer" }}
              >
                Close
              </button>
              <button
                onClick={download}
                disabled={downloading}
                style={{ background: BLUE_BRIGHT, border: "none", color: "#04070D", borderRadius: 12, padding: "12px 26px", fontFamily: FONT, fontWeight: 700, fontSize: 14, cursor: downloading ? "wait" : "pointer" }}
              >
                {downloading ? "Preparing…" : "Download certificate ↓"}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
