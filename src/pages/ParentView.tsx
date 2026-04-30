import { useEffect, useMemo, useState } from "react";
import { Navigate, useParams, useSearchParams } from "react-router-dom";
import logo from "@/assets/worthscope-logo.png";
import { getParentInvite, hasAccessGranted, type ParentInvite } from "@/lib/parentInvite";

/* WorthScope — Parent View
   Read-only, calm, informational dashboard for parents/guardians. */

type CareerResult = {
  title: string;
  description?: string;
  match: number; // 0-100
  icon?: string;
};

type SkillLevel = "Beginner" | "Intermediate" | "Advanced";

type Profile = {
  firstName?: string;
  fullName?: string;
  age?: number | string;
  educationLevel?: string;
  classOrLevel?: string;
};

const PARENT = {
  bg: "#F8F9FA",
  card: "#FFFFFF",
  text: "#1A1A2A",
  text2: "#6B7280",
  text3: "#9CA3AF",
  border: "#E5E7EB",
  accent: "#3498DB",
  accentL: "#EBF5FB",
  green: "#22C55E",
  amber: "#F59E0B",
};

// Default skills (simulated)
const DEFAULT_SKILLS: { name: string; progress: number; level: SkillLevel }[] = [
  { name: "UI Design", progress: 40, level: "Intermediate" },
  { name: "Problem Solving", progress: 65, level: "Intermediate" },
  { name: "Communication", progress: 30, level: "Beginner" },
  { name: "Research", progress: 20, level: "Beginner" },
];

const DEFAULT_CAREERS: CareerResult[] = [
  { title: "UX/UI Designer", description: "Designs digital products people love to use.", match: 92 },
  { title: "Product Manager", description: "Leads teams to build great products.", match: 85 },
  { title: "Frontend Developer", description: "Brings designs to life on the web.", match: 78 },
  { title: "Brand Strategist", description: "Shapes how brands connect with people.", match: 71 },
];

const ParentView = () => {
  const { token } = useParams<{ token?: string }>();
  const [params] = useSearchParams();
  const isDemo = params.get("student") === "demo";

  const invite: ParentInvite | null = token ? getParentInvite(token) : null;

  const [profile, setProfile] = useState<Profile>({});
  const [careers, setCareers] = useState<CareerResult[]>([]);
  const [animBars, setAnimBars] = useState(false);

  // Gate: if a token is in the URL, parent must have passed the access screen this session.
  const gateBlocked = !!token && (!invite || !hasAccessGranted(token));

  useEffect(() => {
    // Prefer invite-bound profile (for token links) so the parent always sees the right child
    if (invite) {
      setProfile({
        firstName: invite.studentFirstName,
        fullName: invite.studentFullName,
        educationLevel: invite.educationLevel,
        classOrLevel: invite.classOrLevel,
      });
    } else {
      try {
        const rawProfile = localStorage.getItem("worthscope_user_profile");
        if (rawProfile) setProfile(JSON.parse(rawProfile));
      } catch {/* noop */}
    }

    try {
      const rawResults = localStorage.getItem("worthscope_results");
      if (rawResults) {
        const parsed = JSON.parse(rawResults);
        const arr = Array.isArray(parsed) ? parsed : parsed?.careers || parsed?.results;
        if (Array.isArray(arr) && arr.length > 0) {
          setCareers(
            arr.slice(0, 4).map((c: any) => ({
              title: c.title || c.name || "Career",
              description: c.description || c.summary || "A great career match based on your strengths.",
              match: typeof c.match === "number" ? c.match : typeof c.percentage === "number" ? c.percentage : c.score || 75,
            })),
          );
        }
      }
    } catch {/* noop */}

    const t = setTimeout(() => setAnimBars(true), 150);
    return () => clearTimeout(t);
  }, [invite?.token]);

  const careersList = careers.length ? careers : DEFAULT_CAREERS;
  const top = careersList[0];
  const others = careersList.slice(1, 4);

  const firstName = profile.firstName || profile.fullName?.split(" ")[0] || (isDemo ? "Alex" : "your child");
  const fullName = profile.fullName || (isDemo ? "Alex Johnson" : firstName);
  const age = profile.age || (isDemo ? 18 : "—");
  const eduLevel = profile.educationLevel || (isDemo ? "University" : "Student");
  const classLevel = profile.classOrLevel || (isDemo ? "300 Level" : "");

  // Hardcoded simulated data
  const data = useMemo(
    () => ({
      currentPhase: "Phase 1 — Foundation",
      roadmapProgress: 30,
      missionsCompleted: 1,
      totalMissions: 9,
      streak: 5,
      lastActive: "Today",
      skills: DEFAULT_SKILLS,
    }),
    [],
  );

  if (gateBlocked) {
    return <Navigate to={`/parent/${token}`} replace />;
  }

  return (
    <div className="min-h-screen font-poppins" style={{ background: PARENT.bg, color: PARENT.text }}>
      {/* ───── TOP BAR ───── */}
      <header
        className="absolute top-0 left-0 right-0 z-[100] flex items-center justify-between"
        style={{
          height: 80,
          background: "transparent",
          padding: "0 32px",
          animation: "ws-fade 0.4s ease both",
        }}
      >
        <div className="flex items-center gap-2">
          <img src={logo} alt="WorthScope" style={{ height: 72, width: "auto", objectFit: "contain" }} />
        </div>

        <div
          className="hidden items-center gap-1.5 sm:flex"
          style={{
            background: PARENT.accentL,
            border: "1px solid rgba(52,152,219,0.2)",
            borderRadius: 100,
            padding: "5px 16px",
          }}
        >
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke={PARENT.accent} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7S2 12 2 12z" />
            <circle cx="12" cy="12" r="3" />
          </svg>
          <span style={{ color: PARENT.accent, fontSize: 12, fontWeight: 600 }}>Parent View</span>
        </div>

        <div
          className="flex items-center gap-1.5"
          style={{
            background: "#F3F4F6",
            border: `1px solid ${PARENT.border}`,
            borderRadius: 100,
            padding: "5px 14px",
          }}
        >
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke={PARENT.text3} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <rect x="4" y="11" width="16" height="10" rx="2" />
            <path d="M8 11V8a4 4 0 0 1 8 0v3" />
          </svg>
          <span style={{ color: PARENT.text3, fontSize: 11, fontWeight: 500 }}>Read Only</span>
        </div>
      </header>

      <main
        className="mx-auto"
        style={{ maxWidth: 900, padding: "120px 32px 40px" }}
      >
        {/* ───── SECTION 1 — WELCOME ───── */}
        <section className="ws-fade-up" style={{ animationDelay: "0.1s", marginBottom: 32 }}>
          <h1 style={{ fontSize: 26, fontWeight: 700, color: PARENT.text, letterSpacing: "-0.5px" }}>
            Viewing {firstName}'s Career Journey
          </h1>
          <p style={{ fontSize: 15, color: PARENT.text2, lineHeight: 1.7, marginTop: 8, maxWidth: 560 }}>
            {firstName} is building their career foundation with WorthScope. Here's an overview of their progress.
          </p>

          <div className="flex flex-wrap" style={{ gap: 10, marginTop: 16 }}>
            {[
              { e: "👤", t: fullName },
              { e: "🎓", t: classLevel ? `${eduLevel} — ${classLevel}` : eduLevel },
              { e: "📅", t: `Age ${age}` },
              { e: "🕐", t: "Last active: Today" },
            ].map((c, i) => (
              <span
                key={i}
                className="inline-flex items-center"
                style={{
                  background: PARENT.card,
                  border: `1px solid ${PARENT.border}`,
                  borderRadius: 100,
                  padding: "6px 14px",
                  fontSize: 12,
                  fontWeight: 500,
                  color: PARENT.text2,
                  gap: 6,
                }}
              >
                <span>{c.e}</span>
                <span>{c.t}</span>
              </span>
            ))}
          </div>

          <div
            style={{
              height: 1,
              background: "linear-gradient(90deg, transparent, rgba(52,152,219,0.15), transparent)",
              margin: "24px 0",
            }}
          />
        </section>

        {/* ───── SECTION 2 — CAREER MATCHES ───── */}
        <section
          className="ws-fade-up"
          style={{
            animationDelay: "0.2s",
            background: PARENT.card,
            border: `1px solid ${PARENT.border}`,
            borderRadius: 20,
            padding: "28px 32px",
            boxShadow: "0 4px 20px rgba(0,0,0,0.05)",
            marginBottom: 24,
          }}
        >
          <div className="flex items-center justify-between">
            <h2 style={{ fontSize: 18, fontWeight: 700, color: PARENT.text }}>Career Matches</h2>
            <span
              style={{
                background: PARENT.accentL,
                color: PARENT.accent,
                border: "1px solid rgba(52,152,219,0.2)",
                fontSize: 11,
                fontWeight: 500,
                borderRadius: 100,
                padding: "4px 12px",
              }}
            >
              AI-Generated · Personalised
            </span>
          </div>

          <p style={{ fontSize: 13, color: PARENT.text2, lineHeight: 1.65, marginTop: 10, marginBottom: 20 }}>
            These are the career paths that best match {firstName}'s strengths, interests, and personality based on their assessment.
          </p>

          {/* TOP MATCH */}
          <div
            style={{
              background: "linear-gradient(135deg, #EBF5FB 0%, #F0F8FF 100%)",
              border: "1px solid rgba(52,152,219,0.2)",
              borderLeft: `4px solid ${PARENT.accent}`,
              borderRadius: 14,
              padding: "20px 24px",
              marginBottom: 16,
            }}
          >
            <div className="flex items-center" style={{ gap: 20 }}>
              <div
                className="grid place-items-center flex-shrink-0"
                style={{ width: 48, height: 48, borderRadius: "50%", background: PARENT.accent }}
              >
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 2 4 7v6c0 5 4 9 8 9s8-4 8-9V7l-8-5z" />
                </svg>
              </div>
              <div className="min-w-0 flex-1">
                <div style={{ color: PARENT.accent, fontSize: 10, fontWeight: 600, letterSpacing: "1.5px", textTransform: "uppercase" }}>
                  Top Match
                </div>
                <div style={{ fontSize: 20, fontWeight: 700, color: PARENT.text, marginTop: 4 }}>{top.title}</div>
                <div style={{ fontSize: 13, color: PARENT.text2, marginTop: 4 }}>{top.description}</div>
              </div>
              <div className="text-right" style={{ flexShrink: 0 }}>
                <div style={{ fontSize: 32, fontWeight: 800, color: PARENT.accent, lineHeight: 1 }}>{top.match}%</div>
                <div style={{ fontSize: 12, color: PARENT.text3, marginTop: 4 }}>match</div>
              </div>
            </div>
            <div style={{ marginTop: 14 }}>
              <div className="flex justify-between" style={{ fontSize: 12, fontWeight: 500, color: PARENT.text2, marginBottom: 6 }}>
                <span>Match Strength</span>
                <span>{top.match}%</span>
              </div>
              <div style={{ height: 6, background: PARENT.border, borderRadius: 100, overflow: "hidden" }}>
                <div
                  style={{
                    height: "100%",
                    background: PARENT.accent,
                    borderRadius: 100,
                    width: animBars ? `${top.match}%` : "0%",
                    transition: "width 1.2s ease",
                  }}
                />
              </div>
            </div>
          </div>

          {/* OTHER MATCHES */}
          {others.map((c, idx) => (
            <div
              key={idx}
              className="flex items-center"
              style={{
                gap: 14,
                padding: "14px 0",
                borderBottom: idx === others.length - 1 ? "none" : `1px solid ${PARENT.border}`,
              }}
            >
              <div
                className="grid place-items-center flex-shrink-0"
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: "50%",
                  background: "#F4F9FE",
                  border: `1px solid ${PARENT.border}`,
                  color: PARENT.text2,
                  fontSize: 12,
                  fontWeight: 700,
                }}
              >
                #{idx + 2}
              </div>
              <div className="min-w-0 flex-1">
                <div style={{ fontSize: 15, fontWeight: 600, color: PARENT.text }}>{c.title}</div>
                <div style={{ fontSize: 12, color: PARENT.text2 }}>{c.description}</div>
                <div style={{ marginTop: 8, height: 4, background: PARENT.border, borderRadius: 100, overflow: "hidden" }}>
                  <div
                    style={{
                      height: "100%",
                      background: "linear-gradient(90deg, #3498DB, #5DADE2)",
                      borderRadius: 100,
                      width: animBars ? `${c.match}%` : "0%",
                      transition: "width 0.9s ease",
                      transitionDelay: `${0.1 + idx * 0.1}s`,
                    }}
                  />
                </div>
              </div>
              <div style={{ fontSize: 18, fontWeight: 700, color: PARENT.accent, flexShrink: 0 }}>{c.match}%</div>
            </div>
          ))}

          <p style={{ fontSize: 12, color: PARENT.text3, marginTop: 16 }}>
            ℹ️ These results are based on {firstName}'s answers to the career assessment. Results improve as they complete more missions.
          </p>
        </section>

        {/* ───── SECTION 3 — Roadmap + Activity ───── */}
        <section
          className="ws-fade-up grid grid-cols-1 md:grid-cols-2"
          style={{ animationDelay: "0.4s", gap: 20, marginBottom: 24 }}
        >
          {/* Roadmap */}
          <div
            style={{
              background: PARENT.card,
              border: `1px solid ${PARENT.border}`,
              borderRadius: 20,
              padding: 24,
            }}
          >
            <div style={{ fontSize: 16, fontWeight: 700, color: PARENT.text }}>Roadmap Progress</div>
            <div style={{ fontSize: 13, color: PARENT.text3 }}>Career journey phases</div>

            <div style={{ marginTop: 20 }}>
              <div style={{ fontSize: 22, fontWeight: 700, color: PARENT.accent }}>{data.roadmapProgress}% Complete</div>
              <div style={{ marginTop: 8, height: 8, background: PARENT.border, borderRadius: 100, overflow: "hidden" }}>
                <div
                  style={{
                    height: "100%",
                    background: PARENT.accent,
                    borderRadius: 100,
                    width: animBars ? `${data.roadmapProgress}%` : "0%",
                    transition: "width 1.2s ease",
                  }}
                />
              </div>
            </div>

            <div className="flex flex-col" style={{ gap: 12, marginTop: 20 }}>
              {/* Phase 1 */}
              <div className="flex items-center" style={{ gap: 12 }}>
                <span
                  style={{
                    width: 10,
                    height: 10,
                    borderRadius: "50%",
                    background: PARENT.accent,
                    animation: "ws-pulse-glow 2s ease-in-out infinite",
                    flexShrink: 0,
                  }}
                />
                <span style={{ fontSize: 14, fontWeight: 600, color: PARENT.text, flex: 1 }}>Phase 1 — Foundation</span>
                <span
                  style={{
                    fontSize: 11,
                    fontWeight: 500,
                    color: PARENT.accent,
                    background: PARENT.accentL,
                    borderRadius: 100,
                    padding: "3px 10px",
                  }}
                >
                  In Progress
                </span>
              </div>

              {/* Phase 2 */}
              <div className="flex items-center" style={{ gap: 12 }}>
                <span style={{ width: 10, height: 10, borderRadius: "50%", background: PARENT.border, flexShrink: 0 }} />
                <span style={{ fontSize: 14, fontWeight: 600, color: PARENT.text3, flex: 1 }}>Phase 2 — Exploration</span>
                <span
                  style={{
                    fontSize: 11,
                    fontWeight: 500,
                    color: PARENT.text3,
                    background: "#F3F4F6",
                    borderRadius: 100,
                    padding: "3px 10px",
                  }}
                >
                  Locked 🔒
                </span>
              </div>

              {/* Phase 3 */}
              <div className="flex items-center" style={{ gap: 12, opacity: 0.7 }}>
                <span style={{ width: 10, height: 10, borderRadius: "50%", background: PARENT.border, flexShrink: 0 }} />
                <span style={{ fontSize: 14, fontWeight: 600, color: PARENT.text3, flex: 1 }}>Phase 3 — Mastery</span>
                <span
                  style={{
                    fontSize: 11,
                    fontWeight: 500,
                    color: PARENT.text3,
                    background: "#F3F4F6",
                    borderRadius: 100,
                    padding: "3px 10px",
                  }}
                >
                  Locked 🔒
                </span>
              </div>
            </div>

            <div style={{ borderTop: `1px solid ${PARENT.border}`, marginTop: 16, paddingTop: 16 }}>
              <div style={{ fontSize: 13, fontWeight: 500, color: PARENT.text2 }}>
                {data.missionsCompleted} of {data.totalMissions} missions completed
              </div>
              <div style={{ marginTop: 8, height: 4, background: PARENT.border, borderRadius: 100, overflow: "hidden" }}>
                <div
                  style={{
                    height: "100%",
                    background: PARENT.green,
                    width: animBars ? `${(data.missionsCompleted / data.totalMissions) * 100}%` : "0%",
                    transition: "width 1s ease",
                  }}
                />
              </div>
            </div>
          </div>

          {/* Activity */}
          <div
            style={{
              background: PARENT.card,
              border: `1px solid ${PARENT.border}`,
              borderRadius: 20,
              padding: 24,
            }}
          >
            <div style={{ fontSize: 16, fontWeight: 700, color: PARENT.text }}>Recent Activity</div>

            <div style={{ marginTop: 16 }}>
              {[
                { l: "🔥 Current Streak", r: `${data.streak} Days`, c: "#FB923C" },
                { l: "✅ Missions Completed", r: `${data.missionsCompleted} / ${data.totalMissions}`, c: PARENT.accent },
                { l: "🕐 Last Active", r: data.lastActive, c: PARENT.green },
                { l: "📊 Overall Progress", r: `${data.roadmapProgress}%`, c: PARENT.accent },
              ].map((row, i, arr) => (
                <div
                  key={i}
                  className="flex items-center justify-between"
                  style={{
                    height: 48,
                    borderBottom: i === arr.length - 1 ? "none" : `1px solid ${PARENT.border}`,
                  }}
                >
                  <span style={{ fontSize: 14, fontWeight: 500, color: PARENT.text }}>{row.l}</span>
                  <span style={{ fontSize: 14, fontWeight: 700, color: row.c }}>{row.r}</span>
                </div>
              ))}
            </div>

            <div
              style={{
                background: "rgba(34,197,94,0.06)",
                borderRadius: 10,
                padding: "10px 14px",
                marginTop: 16,
                fontSize: 12,
                color: PARENT.green,
                lineHeight: 1.6,
              }}
            >
              ✨ {firstName} has been consistently active. That's a great sign.
            </div>
          </div>
        </section>

        {/* ───── SECTION 4 — Skills ───── */}
        <section
          className="ws-fade-up"
          style={{
            animationDelay: "0.6s",
            background: PARENT.card,
            border: `1px solid ${PARENT.border}`,
            borderRadius: 20,
            padding: "28px 32px",
            marginBottom: 24,
          }}
        >
          <div className="flex items-center justify-between">
            <div style={{ fontSize: 16, fontWeight: 700, color: PARENT.text }}>Skills Being Developed</div>
            <div style={{ fontSize: 13, color: PARENT.text3 }}>{data.skills.length} skills tracked</div>
          </div>
          <p style={{ fontSize: 13, color: PARENT.text2, lineHeight: 1.6, marginTop: 8, marginBottom: 20 }}>
            These are the skills {firstName} is actively building as part of their career roadmap.
          </p>

          {data.skills.map((s, i, arr) => {
            const levelColors =
              s.level === "Advanced"
                ? { bg: "rgba(34,197,94,0.08)", c: "#22C55E" }
                : s.level === "Intermediate"
                  ? { bg: "rgba(245,158,11,0.08)", c: "#F59E0B" }
                  : { bg: "rgba(239,68,68,0.08)", c: "#EF4444" };
            return (
              <div
                key={s.name}
                className="flex flex-col items-stretch md:flex-row md:items-center"
                style={{
                  padding: "16px 0",
                  borderBottom: i === arr.length - 1 ? "none" : `1px solid ${PARENT.border}`,
                  gap: 12,
                }}
              >
                <div className="md:flex-shrink-0" style={{ width: 180 }}>
                  <div style={{ fontSize: 14, fontWeight: 600, color: PARENT.text }}>{s.name}</div>
                  <span
                    style={{
                      display: "inline-block",
                      marginTop: 4,
                      fontSize: 11,
                      fontWeight: 500,
                      borderRadius: 100,
                      padding: "2px 10px",
                      background: levelColors.bg,
                      color: levelColors.c,
                    }}
                  >
                    {s.level}
                  </span>
                </div>
                <div style={{ flex: 1, padding: "0 20px" }}>
                  <div style={{ height: 6, background: PARENT.border, borderRadius: 100, overflow: "hidden" }}>
                    <div
                      style={{
                        height: "100%",
                        background: "linear-gradient(90deg, #3498DB, #5DADE2)",
                        width: animBars ? `${s.progress}%` : "0%",
                        transition: "width 1.1s ease",
                        transitionDelay: `${i * 0.1}s`,
                      }}
                    />
                  </div>
                </div>
                <div className="text-right md:flex-shrink-0" style={{ width: 60 }}>
                  <span style={{ fontSize: 15, fontWeight: 700, color: PARENT.accent }}>{s.progress}%</span>
                </div>
              </div>
            );
          })}

          <p style={{ fontSize: 12, color: PARENT.text3, marginTop: 12 }}>
            Skill levels update as {firstName} completes missions and activities on WorthScope.
          </p>
        </section>

        {/* ───── SECTION 5 — How to Support ───── */}
        <section
          className="ws-fade-up"
          style={{
            animationDelay: "0.8s",
            background: "linear-gradient(135deg, #F0FFF4, #EBF5FB)",
            border: "1px solid rgba(34,197,94,0.15)",
            borderRadius: 20,
            padding: "28px 32px",
            marginBottom: 24,
          }}
        >
          <div style={{ fontSize: 18, fontWeight: 700, color: PARENT.text }}>How to Support {firstName}</div>
          <p style={{ fontSize: 14, color: PARENT.text2, marginTop: 6, lineHeight: 1.65 }}>
            The way you engage with their journey matters more than the results.
          </p>

          <div className="flex flex-col" style={{ gap: 14, marginTop: 24 }}>
            {[
              { t: "Encourage exploration, not pressure", s: `Ask "what did you learn today?" instead of "what career will you choose?"` },
              { t: "Celebrate small wins", s: "Every mission completed is real progress. Acknowledge it." },
              { t: "Avoid forcing a specific career", s: `The assessment is a guide, not a verdict. Let ${firstName} explore.` },
              { t: "Support skill-building", s: "Help them find time, resources, or tools to practice what they're learning." },
              { t: "Ask questions, not demands", s: "Show curiosity about their roadmap. It builds confidence and trust." },
            ].map((it, i) => (
              <div key={i} className="flex items-start" style={{ gap: 14 }}>
                <div
                  className="grid place-items-center flex-shrink-0 text-white"
                  style={{
                    width: 28,
                    height: 28,
                    borderRadius: "50%",
                    background: PARENT.accent,
                    fontSize: 13,
                    fontWeight: 700,
                  }}
                >
                  {i + 1}
                </div>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 600, color: PARENT.text }}>{it.t}</div>
                  <div style={{ fontSize: 13, color: PARENT.text2, lineHeight: 1.6, marginTop: 3 }}>{it.s}</div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ───── SECTION 6 — What Happens Next ───── */}
        <section
          className="ws-fade-up"
          style={{
            animationDelay: "1s",
            background: PARENT.card,
            border: `1px solid ${PARENT.border}`,
            borderRadius: 20,
            padding: "24px 28px",
            marginBottom: 32,
          }}
        >
          <div style={{ fontSize: 16, fontWeight: 700, color: PARENT.text }}>
            What Happens Next on {firstName}'s Journey
          </div>

          <div className="mt-4 flex flex-col md:flex-row">
            {[
              {
                icon: (
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={PARENT.accent} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polygon points="1 6 1 22 8 18 16 22 23 18 23 2 16 6 8 2 1 6" />
                    <line x1="8" y1="2" x2="8" y2="18" />
                    <line x1="16" y1="6" x2="16" y2="22" />
                  </svg>
                ),
                t: "Complete Phase 1",
                s: "9 missions total. 1 done so far.",
              },
              {
                icon: (
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={PARENT.accent} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="11" width="18" height="11" rx="2" />
                    <path d="M7 11V7a5 5 0 0 1 9.9-1" />
                  </svg>
                ),
                t: "Unlock Phase 2",
                s: "Career Exploration starts here.",
              },
              {
                icon: (
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={PARENT.accent} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10" />
                    <circle cx="12" cy="12" r="6" />
                    <circle cx="12" cy="12" r="2" />
                  </svg>
                ),
                t: "Career Blueprint Ready",
                s: "Full roadmap, skills, and job opportunities.",
              },
            ].map((it, i) => (
              <div
                key={i}
                className="flex flex-col"
                style={{
                  flex: 1,
                  padding: "16px 20px",
                  borderTop: i === 0 ? "none" : `1px solid ${PARENT.border}`,
                }}
              >
                <div className="hidden md:block" style={{ height: 0 }} />
                {it.icon}
                <div style={{ fontSize: 14, fontWeight: 600, color: PARENT.text, marginTop: 10 }}>{it.t}</div>
                <div style={{ fontSize: 13, color: PARENT.text2, marginTop: 4 }}>{it.s}</div>
              </div>
            ))}
          </div>
        </section>
      </main>

      {/* ───── FOOTER ───── */}
      <footer
        className="flex flex-wrap items-center justify-between"
        style={{
          background: PARENT.card,
          borderTop: `1px solid ${PARENT.border}`,
          padding: "20px 32px",
          gap: 12,
        }}
      >
        <div>
          <div style={{ fontSize: 15, fontWeight: 700, color: PARENT.accent }}>WorthScope</div>
          <div style={{ fontSize: 12, color: PARENT.text3 }}>Parent View — Read Only</div>
        </div>
        <div className="flex items-center" style={{ gap: 6, fontSize: 12, color: PARENT.text3 }}>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="4" y="11" width="16" height="10" rx="2" />
            <path d="M8 11V8a4 4 0 0 1 8 0v3" />
          </svg>
          <span>This view is secure and read-only.</span>
        </div>
      </footer>

      {/* desktop column dividers for "What's next" */}
      <style>{`
        @media (min-width: 768px) {
          section [style*="What Happens Next"] ~ * { }
        }
      `}</style>
    </div>
  );
};

export default ParentView;
