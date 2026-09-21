import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { generateKokoRoadmap } from "@/lib/kokoRoadmap";
import { getChosenCareer } from "@/lib/userState";
import { notifyRoadmapReady } from "@/lib/notifications";
import KokoFace from "@/components/experience/KokoFace";
import { ExperienceProvider } from "@/components/experience/ExperienceContext";
import { PAPER, PAPER_FAINT, LINE, BLUE_BRIGHT, FONT } from "@/components/experience/theme";
import { CI_BG } from "@/components/discover/shared";
import { SEO } from "@/components/SEO";

const MESSAGES = [
  "Koko is getting things ready for you…",
  "Hang tight, Koko is putting your journey together…",
  "Almost there! Koko is preparing your next steps…",
  "Just a moment while Koko sets things up…",
];

export default function RoadmapLoading() {
  const navigate = useNavigate();
  const career = getChosenCareer();
  const [err, setErr] = useState<string | null>(null);
  const [working, setWorking] = useState(true);
  const started = useRef(false);
  // Pick one friendly message on mount so it varies between sessions.
  const [message] = useState(() => MESSAGES[Math.floor(Math.random() * MESSAGES.length)]);

  const run = async () => {
    setErr(null);
    setWorking(true);
    try {
      await generateKokoRoadmap({
        onDelta: () => {},
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
      navigate("/discover", { replace: true });
      return;
    }
    if (started.current) return;
    started.current = true;
    run();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <ExperienceProvider>
      <div
        style={{
          minHeight: "100vh",
          background: CI_BG,
          fontFamily: FONT,
          color: PAPER,
          display: "grid",
          placeItems: "center",
          padding: "32px 20px",
        }}
      >
        <SEO
          title="Getting things ready — WorthScope"
          description="Koko is preparing your next steps."
          path="/roadmap-loading"
        />

        {working && !err && (
          <div style={{ textAlign: "center", display: "grid", placeItems: "center", gap: 22 }}>
            <KokoFace expression="thinking" size={96} lookAtCursor={false} />
            {career?.title && (
              <div style={{ fontSize: 12, fontWeight: 700, letterSpacing: 1.2, textTransform: "uppercase", color: BLUE_BRIGHT }}>
                Building your {career.title} roadmap
              </div>
            )}
            <p style={{ margin: 0, maxWidth: 420, fontSize: 17, fontWeight: 600, color: PAPER, lineHeight: 1.5 }}>
              {message}
            </p>
            <p style={{ margin: 0, fontSize: 12.5, color: PAPER_FAINT }}>This can take up to a minute — please keep this page open.</p>
          </div>
        )}

        {err && (
          <div
            style={{
              background: "rgba(255,255,255,.03)",
              borderRadius: 20,
              maxWidth: 420,
              width: "100%",
              padding: 34,
              textAlign: "center",
              border: `1px solid ${LINE}`,
            }}
          >
            <div style={{ display: "grid", placeItems: "center", marginBottom: 16 }}>
              <KokoFace expression="concerned" size={72} lookAtCursor={false} />
            </div>
            <h1 style={{ margin: 0, fontSize: 20, fontWeight: 700, color: PAPER }}>
              Something didn't work — let's try again
            </h1>
            <p style={{ marginTop: 10, fontSize: 12, color: PAPER_FAINT, lineHeight: 1.5, wordBreak: "break-word" }}>
              {err}
            </p>
            <button
              onClick={run}
              style={{
                marginTop: 22,
                background: BLUE_BRIGHT,
                color: "#04070D",
                fontWeight: 700,
                fontSize: 14,
                border: "none",
                borderRadius: 12,
                padding: "12px 26px",
                cursor: "pointer",
              }}
            >
              Try again
            </button>
          </div>
        )}
      </div>
    </ExperienceProvider>
  );
}
