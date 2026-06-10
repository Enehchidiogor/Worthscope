import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { generateKokoRoadmap } from "@/lib/kokoRoadmap";
import { getChosenCareer } from "@/lib/userState";
import { notifyRoadmapReady } from "@/lib/notifications";
import { SEO } from "@/components/SEO";

const ACCENT = "#3498DB";
const KOKO = "#895AF6";

export default function RoadmapLoading() {
  const navigate = useNavigate();
  const career = getChosenCareer();
  const [err, setErr] = useState<string | null>(null);
  const [streaming, setStreaming] = useState("");
  const [working, setWorking] = useState(true);
  const started = useRef(false);

  const run = async () => {
    setErr(null);
    setStreaming("");
    setWorking(true);
    try {
      await generateKokoRoadmap({
        onDelta: (raw) => setStreaming(raw),
        resetProgress: true,
      });
      if (career?.title) notifyRoadmapReady(career.title).catch(() => {});
      navigate("/dashboard", { replace: true });
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Something went wrong.");
      setWorking(false);
    }
  };

  useEffect(() => {
    if (!career?.title) {
      navigate("/career-results", { replace: true });
      return;
    }
    if (started.current) return;
    started.current = true;
    run();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#F4F9FE",
        fontFamily: "'Poppins', sans-serif",
        display: "grid",
        placeItems: "center",
        padding: "32px 20px",
      }}
    >
      <SEO
        title="Building your roadmap — WorthScope"
        description="Koko is generating your personalised 2026 career roadmap."
        path="/roadmap-loading"
      />
      <div
        style={{
          background: "#fff",
          borderRadius: 24,
          maxWidth: 520,
          width: "100%",
          padding: 36,
          boxShadow: "0 16px 60px rgba(52,152,219,0.18)",
          textAlign: "center",
          border: "1px solid #E5E7EB",
        }}
      >
        {working && !err && (
          <>
            <div
              style={{
                width: 64,
                height: 64,
                margin: "0 auto",
                borderRadius: "50%",
                background: `linear-gradient(135deg, ${KOKO}, #a87bff)`,
                color: "#fff",
                display: "grid",
                placeItems: "center",
                fontWeight: 700,
                fontSize: 24,
                boxShadow: `0 12px 32px ${KOKO}55`,
                animation: "ws-pulse 1.5s ease-in-out infinite",
              }}
            >
              K
            </div>
            <h1
              style={{
                marginTop: 22,
                fontSize: 22,
                fontWeight: 700,
                color: "#111",
                letterSpacing: -0.3,
              }}
            >
              Koko is building your personalised roadmap…
            </h1>
            <p style={{ marginTop: 10, fontSize: 14, color: "#6B7280", lineHeight: 1.6 }}>
              Designing every phase, mission, and AI tool you'll need to become outstanding as a{" "}
              <strong style={{ color: "#111" }}>{career?.title}</strong> in 2026.
            </p>
            <div
              style={{
                marginTop: 22,
                background: "#F9FAFB",
                border: "1px solid #E5E7EB",
                borderRadius: 12,
                padding: 12,
                textAlign: "left",
                maxHeight: 160,
                overflow: "auto",
              }}
            >
              <pre
                style={{
                  margin: 0,
                  fontSize: 11,
                  lineHeight: 1.55,
                  color: "#6B7280",
                  whiteSpace: "pre-wrap",
                  fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace",
                }}
              >
                {streaming.slice(-800) || "Connecting to Koko…"}
              </pre>
            </div>
            <div style={{ marginTop: 18, fontSize: 12, color: "#9CA3AF" }}>
              This usually takes 20–40 seconds.
            </div>
          </>
        )}

        {err && (
          <>
            <div style={{ fontSize: 40 }}>😅</div>
            <h1 style={{ marginTop: 12, fontSize: 20, fontWeight: 700, color: "#111" }}>
              Koko is having a moment — let's try that again.
            </h1>
            <p style={{ marginTop: 8, fontSize: 13, color: "#6B7280", lineHeight: 1.6 }}>
              {err}
            </p>
            <button
              onClick={run}
              style={{
                marginTop: 22,
                background: ACCENT,
                color: "#fff",
                fontWeight: 600,
                fontSize: 14,
                border: "none",
                borderRadius: 12,
                padding: "12px 22px",
                cursor: "pointer",
              }}
            >
              Try again
            </button>
          </>
        )}
      </div>
      <style>{`
        @keyframes ws-pulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.06); }
        }
      `}</style>
    </div>
  );
}
