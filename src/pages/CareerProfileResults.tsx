import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import KokoFace from "@/components/experience/KokoFace";
import { ExperienceProvider, useExperience } from "@/components/experience/ExperienceContext";
import { PAPER, PAPER_DIM, PAPER_FAINT, LINE, BLUE_BRIGHT, BLUE, FONT, EASE } from "@/components/experience/theme";
import AmbientBackground from "@/components/landing/AmbientBackground";
import MagneticButton from "@/components/landing/MagneticButton";
import { loadCachedPrediction, type CareerPrediction, type CareerDirection } from "@/lib/careerIntelligence";
import { getCareerMarket } from "@/lib/recommendationEngine";
import { opportunityLinks } from "@/lib/opportunityLinks";
import { submitFeedback, feedbackAlreadySent, loadCachedProfile, type Verdict } from "@/lib/feedback";
import { setChosenCareer } from "@/lib/userState";
import { persistCareerPath } from "@/lib/authClient";
import { notifyAssessmentComplete } from "@/lib/notifications";
import { SEO } from "@/components/SEO";

const LEVELS: CareerPrediction["readiness"]["category"][] = ["Exploring", "Building", "Developing", "Job-Ready"];

export default function CareerProfileResults() {
  return (
    <ExperienceProvider>
      <CareerProfileResultsInner />
    </ExperienceProvider>
  );
}

function useTypewriter(text: string, enabled: boolean, speed = 16) {
  const [n, setN] = useState(enabled ? 0 : text.length);
  useEffect(() => {
    if (!enabled) {
      setN(text.length);
      return;
    }
    setN(0);
    const id = window.setInterval(() => {
      setN((v) => {
        if (v >= text.length) {
          window.clearInterval(id);
          return v;
        }
        return v + 1;
      });
    }, speed);
    return () => window.clearInterval(id);
  }, [text, enabled, speed]);
  return { shown: text.slice(0, n), done: n >= text.length };
}

function CareerProfileResultsInner() {
  const navigate = useNavigate();
  const { prefersReducedMotion } = useExperience();
  const [prediction, setPrediction] = useState<CareerPrediction | null>(null);
  const [selected, setSelected] = useState(0);
  const [launching, setLaunching] = useState(false);
  const [showBar, setShowBar] = useState(false);

  useEffect(() => {
    const p = loadCachedPrediction();
    if (!p) {
      navigate("/discover");
      return;
    }
    setPrediction(p);
  }, [navigate]);

  useEffect(() => {
    const onScroll = () => setShowBar(window.scrollY > 520);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const summary = useTypewriter(prediction?.profileSummary ?? "", !prefersReducedMotion && !!prediction);

  if (!prediction) return null;

  const chosen = prediction.careerDirections[selected] ?? prediction.careerDirections[0];

  function launch(d: CareerDirection) {
    if (launching) return;
    setLaunching(true);
    setChosenCareer({ title: d.title, description: d.whyItFits, icon: "briefcase" });
    persistCareerPath(d.title).catch(() => {});
    notifyAssessmentComplete(d.title).catch(() => {});
    window.setTimeout(() => navigate("/roadmap-loading"), 700);
  }

  const levelIndex = Math.max(0, LEVELS.indexOf(prediction.readiness.category));

  return (
    <div style={{ minHeight: "100vh", position: "relative", fontFamily: FONT, color: PAPER, overflowX: "clip" as "hidden" }}>
      <SEO title="Your Career Direction — WorthScope" description="Koko's read on where your career direction could go." path="/career-profile" />
      <AmbientBackground />

      <main style={{ position: "relative", zIndex: 1, maxWidth: 780, margin: "0 auto", padding: "64px 24px 140px" }}>
        {/* Hero */}
        <div style={{ textAlign: "center" }}>
          <KokoFace expression={summary.done ? "happy" : "talking"} talking={!summary.done} size={96} />
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: EASE }}
            style={{ marginTop: 20, fontSize: 12, fontWeight: 700, letterSpacing: 1.6, textTransform: "uppercase", color: BLUE_BRIGHT }}
          >
            Your career direction is ready
          </motion.div>
          <h1 style={{ fontFamily: FONT, fontWeight: 700, fontSize: "clamp(26px,4.4vw,38px)", letterSpacing: -0.9, margin: "10px 0 0", lineHeight: 1.2 }}>
            Here's what Koko's picking up on.
          </h1>
          <p style={{ margin: "16px auto 0", maxWidth: 560, minHeight: 84, fontSize: 15.5, color: PAPER_DIM, lineHeight: 1.7 }}>
            {summary.shown}
            {!summary.done && <span style={{ color: BLUE_BRIGHT }}>▍</span>}
          </p>
          {prediction.confidence && summary.done && (
            <motion.div
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              style={{ margin: "6px auto 0", maxWidth: 520, fontSize: 13, color: PAPER_FAINT, lineHeight: 1.6 }}
            >
              <span
                style={{
                  display: "inline-block",
                  marginRight: 8,
                  padding: "2px 10px",
                  borderRadius: 999,
                  fontSize: 11,
                  fontWeight: 700,
                  letterSpacing: 0.8,
                  textTransform: "uppercase",
                  color: prediction.confidence.level === "strong" ? "#4ADE80" : prediction.confidence.level === "moderate" ? BLUE_BRIGHT : "#FCD34D",
                  border: "1px solid currentColor",
                }}
              >
                {prediction.confidence.level === "strong" ? "Clear lean" : prediction.confidence.level === "moderate" ? "Moderate lean" : "Exploratory"}
              </span>
              {prediction.confidence.note}
            </motion.div>
          )}
        </div>

        {/* Signals */}
        <Reveal>
          <SectionTitle>What stood out</SectionTitle>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
            {prediction.strongestSignals.map((s, i) => (
              <SignalChip key={s.title} title={s.title} explanation={s.explanation} index={i} />
            ))}
          </div>
        </Reveal>

        {/* Directions */}
        <Reveal>
          <SectionTitle>Directions worth exploring — tap one to explore it</SectionTitle>
          <div style={{ display: "grid", gap: 14 }}>
            {prediction.careerDirections.map((d, i) => (
              <DirectionCard key={d.title} d={d} rank={i + 1} active={selected === i} onSelect={() => setSelected(i)} onStart={() => launch(d)} launching={launching && selected === i} />
            ))}
          </div>
        </Reveal>

        {/* Readiness */}
        <Reveal>
          <SectionTitle>Where you're starting from</SectionTitle>
          <div style={{ padding: "24px 24px 22px", borderRadius: 20, background: "rgba(255,255,255,.03)", border: `1px solid ${LINE}` }}>
            <div style={{ position: "relative", height: 8, borderRadius: 999, background: LINE }}>
              <motion.div
                initial={{ width: 0 }}
                whileInView={{ width: `${((levelIndex + 0.5) / LEVELS.length) * 100}%` }}
                viewport={{ once: true }}
                transition={{ duration: 1.2, ease: EASE, delay: 0.2 }}
                style={{ height: "100%", borderRadius: 999, background: `linear-gradient(90deg, ${BLUE}, ${BLUE_BRIGHT})`, boxShadow: `0 0 18px ${BLUE}88` }}
              />
              <motion.span
                initial={{ left: 0, opacity: 0 }}
                whileInView={{ left: `${((levelIndex + 0.5) / LEVELS.length) * 100}%`, opacity: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 1.2, ease: EASE, delay: 0.2 }}
                style={{ position: "absolute", top: -6, width: 20, height: 20, marginLeft: -10, borderRadius: "50%", background: PAPER, boxShadow: `0 0 0 5px ${BLUE}55` }}
              />
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", marginTop: 14 }}>
              {LEVELS.map((l, i) => (
                <span key={l} style={{ flex: 1, textAlign: "center", fontSize: 12, fontWeight: i === levelIndex ? 700 : 500, color: i === levelIndex ? BLUE_BRIGHT : PAPER_FAINT }}>
                  {l}
                </span>
              ))}
            </div>
            <p style={{ margin: "16px 0 0", fontSize: 13.5, color: PAPER_DIM, lineHeight: 1.6, textAlign: "center" }}>{prediction.readiness.reasoning}</p>
          </div>
        </Reveal>

        {/* Tester feedback */}
        <Reveal>
          <FeedbackCard prediction={prediction} />
        </Reveal>

        {/* Next step */}
        <Reveal>
          <div style={{ marginTop: 56, textAlign: "center", padding: "40px 24px", borderRadius: 24, border: `1px solid ${BLUE_BRIGHT}55`, background: "rgba(59,130,246,.07)", boxShadow: `0 0 60px ${BLUE}22` }}>
            <div style={{ fontSize: 12, fontWeight: 700, letterSpacing: 1.4, textTransform: "uppercase", color: BLUE_BRIGHT }}>Your next step</div>
            <div style={{ marginTop: 10, fontWeight: 700, fontSize: 22 }}>{prediction.nextStep.label}</div>
            <p style={{ margin: "10px auto 0", maxWidth: 460, fontSize: 14, color: PAPER_DIM, lineHeight: 1.65 }}>{prediction.nextStep.cta}</p>
            <div style={{ marginTop: 26 }}>
              <NextStepButton label={`Build my ${chosen.title} roadmap`} launching={launching} onClick={() => launch(chosen)} />
            </div>
            <button
              onClick={() => navigate("/discover")}
              style={{ display: "block", margin: "18px auto 0", background: "transparent", border: "none", color: PAPER_FAINT, fontFamily: FONT, fontSize: 12.5, cursor: "pointer", textDecoration: "underline" }}
            >
              Retake the questions
            </button>
          </div>
        </Reveal>
      </main>

      {/* Sticky action bar */}
      <AnimatePresence>
        {showBar && !launching && (
          <motion.div
            initial={{ y: 90, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 90, opacity: 0 }}
            transition={{ duration: 0.4, ease: EASE }}
            style={{ position: "fixed", left: 0, right: 0, bottom: 0, zIndex: 20, padding: "12px 20px", background: "rgba(5,7,12,.85)", backdropFilter: "blur(14px)", borderTop: `1px solid ${LINE}` }}
          >
            <div style={{ maxWidth: 780, margin: "0 auto", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 14 }}>
              <div style={{ minWidth: 0 }}>
                <div style={{ fontSize: 11, color: PAPER_FAINT, letterSpacing: 1, textTransform: "uppercase", fontWeight: 700 }}>Selected direction</div>
                <div style={{ fontWeight: 700, fontSize: 15, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{chosen.title}</div>
              </div>
              <NextStepButton label="Build my roadmap" launching={launching} onClick={() => launch(chosen)} compact />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

const VERDICTS: { id: Verdict; emoji: string; label: string; hint: string }[] = [
  { id: "spot-on", emoji: "🎯", label: "Spot on", hint: "This feels like me" },
  { id: "partly", emoji: "🤔", label: "Partly", hint: "Some of it fits" },
  { id: "not-really", emoji: "🙅", label: "Not really", hint: "This isn't me" },
];

function FeedbackCard({ prediction }: { prediction: CareerPrediction }) {
  const [verdict, setVerdict] = useState<Verdict | null>(null);
  const [expected, setExpected] = useState("");
  const [comment, setComment] = useState("");
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(() => feedbackAlreadySent(prediction));

  async function send() {
    if (!verdict || sending) return;
    setSending(true);
    await submitFeedback({ verdict, expectedCareer: expected.trim(), comment: comment.trim(), prediction, profile: loadCachedProfile() });
    setSending(false);
    setSent(true);
  }

  const fieldStyle: React.CSSProperties = {
    width: "100%",
    background: "rgba(255,255,255,.03)",
    border: `1.5px solid ${LINE}`,
    borderRadius: 12,
    padding: "12px 14px",
    color: PAPER,
    fontFamily: FONT,
    fontSize: 13.5,
    outline: "none",
  };

  return (
    <div style={{ marginTop: 52, padding: "26px 24px", borderRadius: 20, background: "rgba(255,255,255,.03)", border: `1px solid ${LINE}` }}>
      {sent ? (
        <div style={{ textAlign: "center", padding: "6px 0" }}>
          <div style={{ fontSize: 26 }}>💙</div>
          <div style={{ marginTop: 6, fontWeight: 700, fontSize: 16 }}>Thank you — that really helps.</div>
          <p style={{ margin: "6px auto 0", maxWidth: 420, fontSize: 13, color: PAPER_DIM, lineHeight: 1.6 }}>
            Your feedback helps Koko get better at reading people's strengths.
          </p>
        </div>
      ) : (
        <>
          <div style={{ fontSize: 12, fontWeight: 700, letterSpacing: 1.2, textTransform: "uppercase", color: BLUE_BRIGHT }}>Help us improve</div>
          <div style={{ marginTop: 6, fontWeight: 700, fontSize: 18 }}>Was Koko's read right?</div>
          <p style={{ margin: "6px 0 0", fontSize: 13, color: PAPER_DIM, lineHeight: 1.6 }}>
            Be honest — a "not really" is just as useful. It takes 10 seconds.
          </p>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: 10, marginTop: 16 }}>
            {VERDICTS.map((v) => (
              <button
                key={v.id}
                type="button"
                onClick={() => setVerdict(v.id)}
                aria-pressed={verdict === v.id}
                style={{
                  padding: "14px 12px",
                  borderRadius: 14,
                  cursor: "pointer",
                  fontFamily: FONT,
                  textAlign: "center",
                  color: PAPER,
                  background: verdict === v.id ? "rgba(96,165,250,.14)" : "rgba(255,255,255,.03)",
                  border: `1.5px solid ${verdict === v.id ? BLUE_BRIGHT : LINE}`,
                }}
              >
                <div style={{ fontSize: 22 }}>{v.emoji}</div>
                <div style={{ fontWeight: 700, fontSize: 14, marginTop: 4 }}>{v.label}</div>
                <div style={{ fontSize: 11.5, color: PAPER_FAINT, marginTop: 2 }}>{v.hint}</div>
              </button>
            ))}
          </div>

          <AnimatePresence initial={false}>
            {verdict && (
              <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} style={{ overflow: "hidden" }}>
                <div style={{ display: "grid", gap: 10, marginTop: 16 }}>
                  <input
                    value={expected}
                    onChange={(e) => setExpected(e.target.value)}
                    placeholder={verdict === "spot-on" ? "Any career you're also curious about? (optional)" : "What career did you expect or want? (optional)"}
                    style={fieldStyle}
                  />
                  <textarea
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    placeholder="Anything that felt off, or that Koko got right? (optional)"
                    rows={3}
                    style={{ ...fieldStyle, resize: "vertical" }}
                  />
                  <div style={{ fontSize: 11.5, color: PAPER_FAINT }}>Your answers to the questions are shared with the WorthScope team to improve recommendations.</div>
                  <div style={{ display: "flex", justifyContent: "flex-end" }}>
                    <button
                      type="button"
                      onClick={send}
                      disabled={sending}
                      style={{ background: BLUE_BRIGHT, color: "#04070D", border: "none", borderRadius: 10, padding: "11px 24px", fontFamily: FONT, fontWeight: 700, fontSize: 13.5, cursor: sending ? "wait" : "pointer" }}
                    >
                      {sending ? "Sending…" : "Send feedback"}
                    </button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </>
      )}
    </div>
  );
}

function NextStepButton({ label, onClick, launching, compact }: { label: string; onClick: () => void; launching: boolean; compact?: boolean }) {
  return (
    <MagneticButton
      onClick={onClick}
      strength={compact ? 8 : 20}
      style={{
        position: "relative",
        overflow: "hidden",
        background: BLUE_BRIGHT,
        color: "#04070D",
        border: "none",
        borderRadius: 14,
        padding: compact ? "12px 22px" : "16px 38px",
        fontFamily: FONT,
        fontWeight: 700,
        fontSize: compact ? 14 : 16,
        cursor: "pointer",
        boxShadow: `0 0 34px ${BLUE}88`,
        whiteSpace: "nowrap",
      }}
    >
      <span className="ci-shimmer" />
      <span style={{ position: "relative", display: "inline-flex", alignItems: "center", gap: 10 }}>
        {launching ? "Launching…" : label}
        {!launching && <span className="ci-arrow">→</span>}
      </span>
      <style>{`
        .ci-shimmer { position:absolute; top:0; left:-60%; width:40%; height:100%; background:linear-gradient(100deg,transparent,rgba(255,255,255,.55),transparent); animation: ci-shimmer 2.6s ease-in-out infinite; }
        .ci-arrow { display:inline-block; animation: ci-nudge 1.4s ease-in-out infinite; }
        @keyframes ci-shimmer { 0% { left:-60%; } 60%,100% { left:130%; } }
        @keyframes ci-nudge { 0%,100% { transform: translateX(0); } 50% { transform: translateX(5px); } }
        @media (prefers-reduced-motion: reduce) { .ci-shimmer, .ci-arrow { animation: none; } }
      `}</style>
    </MagneticButton>
  );
}

function DirectionCard({ d, rank, active, onSelect, onStart, launching }: { d: CareerDirection; rank: number; active: boolean; onSelect: () => void; onStart: () => void; launching: boolean }) {
  const ref = useRef<HTMLDivElement>(null);
  const [pos, setPos] = useState({ x: 50, y: 50 });

  function onMove(e: React.MouseEvent) {
    const r = ref.current?.getBoundingClientRect();
    if (!r) return;
    setPos({ x: ((e.clientX - r.left) / r.width) * 100, y: ((e.clientY - r.top) / r.height) * 100 });
  }

  return (
    <motion.div
      ref={ref}
      onMouseMove={onMove}
      onClick={onSelect}
      whileHover={{ y: -3 }}
      layout
      transition={{ duration: 0.35, ease: EASE }}
      style={{
        position: "relative",
        cursor: "pointer",
        padding: "22px 24px",
        borderRadius: 20,
        overflow: "hidden",
        border: `1.5px solid ${active ? BLUE_BRIGHT : LINE}`,
        background: `radial-gradient(420px circle at ${pos.x}% ${pos.y}%, rgba(96,165,250,${active ? 0.16 : 0.09}), rgba(255,255,255,.02) 60%)`,
        boxShadow: active ? `0 0 36px ${BLUE}44` : "none",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
        <span style={{ width: 30, height: 30, borderRadius: "50%", flexShrink: 0, display: "grid", placeItems: "center", fontSize: 13, fontWeight: 800, background: active ? BLUE_BRIGHT : "rgba(255,255,255,.08)", color: active ? "#04070D" : PAPER_DIM }}>
          {rank}
        </span>
        <div style={{ flex: 1, minWidth: 0 }}>
          {rank === 1 && <div style={{ fontSize: 10.5, fontWeight: 800, letterSpacing: 1, textTransform: "uppercase", color: BLUE_BRIGHT }}>Strongest fit</div>}
          <div style={{ fontWeight: 700, fontSize: 19 }}>{d.title}</div>
        </div>
        <motion.span animate={{ rotate: active ? 180 : 0 }} style={{ color: PAPER_FAINT, fontSize: 18 }}>⌄</motion.span>
      </div>

      <AnimatePresence initial={false}>
        {active && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.35, ease: EASE }}
            style={{ overflow: "hidden" }}
          >
            <p style={{ margin: "14px 0 0", fontSize: 14, color: PAPER_DIM, lineHeight: 1.65 }}>{d.whyItFits}</p>
            <div style={{ display: "grid", gap: 10, marginTop: 14, gridTemplateColumns: "repeat(auto-fit, minmax(230px, 1fr))" }}>
              <Detail label="What you'd need" text={d.whatYoullNeed} />
              <Detail label="Worth knowing" text={d.potentialChallenge} />
            </div>
            <div onClick={(e) => e.stopPropagation()}>
              <Opportunities title={d.title} />
            </div>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onStart();
              }}
              style={{ marginTop: 18, background: BLUE_BRIGHT, color: "#04070D", border: "none", borderRadius: 10, padding: "11px 22px", fontFamily: FONT, fontWeight: 700, fontSize: 13.5, cursor: "pointer" }}
            >
              {launching ? "Launching…" : "Choose this path →"}
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

function Opportunities({ title }: { title: string }) {
  const market = getCareerMarket(title);
  const links = opportunityLinks(title);
  const groups: { heading: string; kind: "job" | "freelance" }[] = [
    { heading: "Jobs & internships", kind: "job" },
    { heading: "Earn while you learn", kind: "freelance" },
  ];
  return (
    <div style={{ marginTop: 18 }}>
      {market && (
        <div style={{ padding: "12px 14px", borderRadius: 12, background: "rgba(255,255,255,.04)", border: `1px solid ${LINE}` }}>
          <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: 0.8, textTransform: "uppercase", color: PAPER_FAINT }}>Typical pay in Nigeria (rough estimate)</div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "6px 18px", marginTop: 8, fontSize: 13, color: PAPER_DIM }}>
            <span><strong style={{ color: PAPER }}>{market.salaryEntryNGN}</strong> starting</span>
            <span><strong style={{ color: PAPER }}>{market.salarySeniorNGN}</strong> experienced</span>
            <span>{market.heatLabel} demand</span>
            <span>+{market.growthPct}% growth / yr</span>
          </div>
        </div>
      )}

      <div style={{ marginTop: 14, fontSize: 11, fontWeight: 700, letterSpacing: 0.8, textTransform: "uppercase", color: BLUE_BRIGHT }}>See real opportunities</div>
      {groups.map((g) => (
        <div key={g.kind} style={{ marginTop: 10 }}>
          <div style={{ fontSize: 12, color: PAPER_FAINT, marginBottom: 6 }}>{g.heading}</div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(170px, 1fr))", gap: 8 }}>
            {links
              .filter((l) => l.kind === g.kind)
              .map((l) => (
                <a
                  key={l.label}
                  href={l.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="ci-opp-link"
                  style={{ display: "block", padding: "10px 12px", borderRadius: 12, textDecoration: "none", background: "rgba(96,165,250,.07)", border: `1px solid ${BLUE_BRIGHT}55`, color: PAPER }}
                >
                  <div style={{ fontWeight: 700, fontSize: 13.5 }}>
                    {l.label} <span style={{ color: BLUE_BRIGHT }}>↗</span>
                  </div>
                  <div style={{ fontSize: 11.5, color: PAPER_FAINT, marginTop: 2 }}>{l.blurb}</div>
                </a>
              ))}
          </div>
        </div>
      ))}
      <div style={{ marginTop: 10, fontSize: 11.5, color: PAPER_FAINT, lineHeight: 1.5 }}>
        These open a search on each site in a new tab. Pay figures are rough estimates, not guarantees — check real listings for current numbers.
      </div>
      <style>{`.ci-opp-link{transition:transform .15s ease,background .15s ease,border-color .15s ease}.ci-opp-link:hover{transform:translateY(-2px);background:rgba(96,165,250,.14)!important;border-color:#60A5FA!important}`}</style>
    </div>
  );
}

function Detail({ label, text }: { label: string; text: string }) {
  return (
    <div style={{ padding: "12px 14px", borderRadius: 12, background: "rgba(255,255,255,.04)", border: `1px solid ${LINE}` }}>
      <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: 0.8, textTransform: "uppercase", color: PAPER_FAINT }}>{label}</div>
      <div style={{ marginTop: 4, fontSize: 13, color: PAPER_DIM, lineHeight: 1.55 }}>{text}</div>
    </div>
  );
}

function SignalChip({ title, explanation, index }: { title: string; explanation: string; index: number }) {
  const [open, setOpen] = useState(false);
  return (
    <motion.button
      initial={{ opacity: 0, scale: 0.9 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true }}
      transition={{ duration: 0.4, ease: EASE, delay: index * 0.08 }}
      whileHover={{ y: -2 }}
      onClick={() => setOpen((v) => !v)}
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
      style={{ textAlign: "left", padding: "10px 16px", borderRadius: 14, cursor: "pointer", fontFamily: FONT, background: open ? "rgba(96,165,250,.12)" : "rgba(255,255,255,.04)", border: `1px solid ${open ? BLUE_BRIGHT : LINE}`, color: PAPER, transition: "background .2s, border-color .2s", maxWidth: 360 }}
    >
      <div style={{ fontWeight: 700, fontSize: 13.5 }}>{title}</div>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} style={{ overflow: "hidden", fontSize: 12.5, color: PAPER_DIM, lineHeight: 1.5, marginTop: 4 }}>
            {explanation}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.button>
  );
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return <div style={{ fontSize: 12, fontWeight: 700, letterSpacing: 1.2, textTransform: "uppercase", color: PAPER_FAINT, margin: "52px 0 14px" }}>{children}</div>;
}

function Reveal({ children }: { children: React.ReactNode }) {
  return (
    <motion.div initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-60px" }} transition={{ duration: 0.6, ease: EASE }}>
      {children}
    </motion.div>
  );
}
