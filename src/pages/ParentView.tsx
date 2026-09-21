import { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import logo from "@/assets/worthscope-logo.png";
import {
  fetchParentDashboard,
  hasAccessGranted,
  type ParentDashboardPayload,
} from "@/lib/parentInvite";

/* WorthScope — Parent View
   Read-only, calm, informational dashboard for parents/guardians.
   Loads its data server-side via the parent-dashboard edge function. */

const PARENT = {
  bg: "#F8F9FA",
  card: "#FFFFFF",
  text: "#1A1A2A",
  text2: "#6B7280",
  text3: "#9CA3AF",
  border: "#E5E7EB",
  brand: "#3498DB",
  brandSoft: "#F1ECFE",
  accent: "#3498DB",
  accentL: "#EBF5FB",
  green: "#22C55E",
  amber: "#F59E0B",
  red: "#EF4444",
  orange: "#FB923C",
};

const FONT = "'Poppins', sans-serif";

const dayLabels = ["M", "T", "W", "T", "F", "S", "S"];

function fmtDate(iso?: string): string {
  if (!iso) return "Recently";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "Recently";
  return d.toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
}

function CircularProgress({ value, size = 140 }: { value: number; size?: number }) {
  const r = (size - 16) / 2;
  const c = 2 * Math.PI * r;
  const offset = c - (Math.min(100, Math.max(0, value)) / 100) * c;
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      <circle cx={size / 2} cy={size / 2} r={r} stroke={PARENT.border} strokeWidth="10" fill="none" />
      <circle
        cx={size / 2}
        cy={size / 2}
        r={r}
        stroke={PARENT.brand}
        strokeWidth="10"
        fill="none"
        strokeDasharray={c}
        strokeDashoffset={offset}
        strokeLinecap="round"
        transform={`rotate(-90 ${size / 2} ${size / 2})`}
        style={{ transition: "stroke-dashoffset 1.2s ease" }}
      />
      <text
        x="50%" y="50%" dominantBaseline="middle" textAnchor="middle"
        fontFamily={FONT} fontSize="28" fontWeight="700" fill={PARENT.text}
      >
        {Math.round(value)}%
      </text>
    </svg>
  );
}

const Section: React.FC<React.PropsWithChildren<{ title: string; sub?: string }>> = ({ title, sub, children }) => (
  <section
    style={{
      background: PARENT.card, border: `1px solid ${PARENT.border}`,
      borderRadius: 20, padding: "28px 32px", marginBottom: 24,
      boxShadow: "0 2px 16px rgba(0,0,0,0.03)",
    }}
  >
    <h2 style={{ fontSize: 18, fontWeight: 700, color: PARENT.text, letterSpacing: "-0.2px" }}>{title}</h2>
    {sub && <p style={{ fontSize: 14, color: PARENT.text2, lineHeight: 1.6, marginTop: 8 }}>{sub}</p>}
    <div style={{ marginTop: 18 }}>{children}</div>
  </section>
);

function Avatar({ url, name, size = 72 }: { url: string | null; name: string; size?: number }) {
  const initials = name
    .split(/\s+/)
    .map((p) => p[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();
  return url ? (
    <img src={url} alt={name} style={{ width: size, height: size, borderRadius: "50%", objectFit: "cover" }} />
  ) : (
    <div
      style={{
        width: size, height: size, borderRadius: "50%",
        background: PARENT.brandSoft, color: PARENT.brand,
        display: "grid", placeItems: "center",
        fontSize: size * 0.36, fontWeight: 700,
      }}
    >
      {initials || "👤"}
    </div>
  );
}

const ParentView = () => {
  const { token = "" } = useParams<{ token?: string }>();
  const [loading, setLoading] = useState(true);
  const [errorKind, setErrorKind] = useState<"invalid" | "expired" | "revoked" | "gate" | null>(null);
  const [data, setData] = useState<ParentDashboardPayload | null>(null);

  useEffect(() => {
    if (!token) { setErrorKind("invalid"); setLoading(false); return; }
    if (!hasAccessGranted(token)) {
      // Soft gate not yet passed — redirect back to the access screen.
      window.location.replace(`/parent/${token}`);
      return;
    }
    let cancelled = false;
    (async () => {
      const r: any = await fetchParentDashboard(token);
      if (cancelled) return;
      if (r?.ok && r.student) {
        setData(r.student as ParentDashboardPayload);
      } else {
        const err = r?.error;
        setErrorKind(err === "expired" || err === "revoked" ? err : "invalid");
      }
      setLoading(false);
    })();
    return () => { cancelled = true; };
  }, [token]);

  const firstName = data?.firstName || "your child";

  const errorMessage = useMemo(() => {
    if (!errorKind) return "";
    if (errorKind === "expired") return "This invitation link has expired.";
    if (errorKind === "revoked") return "This invitation link is no longer valid. Please ask the student to send a new invitation.";
    return "This invitation link is no longer valid. Please ask the student to send a new invitation.";
  }, [errorKind]);

  if (loading) {
    return (
      <div style={{ minHeight: "100vh", background: PARENT.bg, fontFamily: FONT, display: "grid", placeItems: "center" }}>
        <div style={{ color: PARENT.text2, fontSize: 14 }}>Loading dashboard…</div>
      </div>
    );
  }

  if (errorKind || !data) {
    return (
      <div style={{ minHeight: "100vh", background: PARENT.bg, fontFamily: FONT, display: "grid", placeItems: "center", padding: 24 }}>
        <div style={{ maxWidth: 480, textAlign: "center" }}>
          <div style={{ fontSize: 42 }}>🔗</div>
          <h1 style={{ fontWeight: 700, fontSize: 24, color: PARENT.text, marginTop: 8 }}>{errorMessage}</h1>
        </div>
      </div>
    );
  }

  const phaseTotal = Math.max(data.currentPhase.total || 1, data.currentPhase.number || 1);

  return (
    <div style={{ minHeight: "100vh", background: PARENT.bg, fontFamily: FONT, color: PARENT.text }}>
      {/* HEADER */}
      <header
        style={{
          height: 80, padding: "0 32px", display: "flex", alignItems: "center", justifyContent: "space-between",
          background: PARENT.card, borderBottom: `1px solid ${PARENT.border}`, position: "sticky", top: 0, zIndex: 10,
        }}
      >
        <img src={logo} alt="WorthScope" style={{ height: 64, width: "auto", objectFit: "contain" }} />
        <div
          style={{
            display: "inline-flex", alignItems: "center", gap: 8,
            background: PARENT.brandSoft, border: `1px solid ${PARENT.brand}33`,
            borderRadius: 100, padding: "6px 14px",
            color: PARENT.brand, fontSize: 12, fontWeight: 600,
          }}
        >
          <span>👁️</span> Parent View — Read Only
        </div>
      </header>

      <main className="mx-auto" style={{ maxWidth: 880, padding: "32px 24px 24px" }}>
        {/* TOP — Student summary */}
        <section
          style={{
            background: PARENT.card, border: `1px solid ${PARENT.border}`,
            borderRadius: 24, padding: "28px 32px",
            boxShadow: "0 4px 24px rgba(0,0,0,0.04)", marginBottom: 24,
          }}
        >
          <div className="flex flex-col items-start gap-5 md:flex-row md:items-center">
            <Avatar url={data.avatarUrl} name={data.fullName} size={84} />
            <div style={{ flex: 1, minWidth: 0 }}>
              <h1 style={{ fontSize: 28, fontWeight: 700, color: PARENT.text, letterSpacing: "-0.5px", lineHeight: 1.2 }}>
                {data.fullName}
              </h1>
              <p style={{ fontSize: 15, color: PARENT.text2, lineHeight: 1.6, marginTop: 6 }}>
                Following their journey to become a <strong style={{ color: PARENT.brand }}>{data.careerTitle}</strong>
              </p>
              <div className="mt-3 flex flex-wrap" style={{ gap: 10 }}>
                <span
                  style={{
                    background: PARENT.brandSoft, color: PARENT.brand,
                    border: `1px solid ${PARENT.brand}33`,
                    borderRadius: 100, padding: "5px 14px", fontSize: 13, fontWeight: 600,
                  }}
                >
                  Currently in Phase {data.currentPhase.number} of {phaseTotal} — {data.currentPhase.title}
                </span>
                <span
                  style={{
                    background: "#F3F4F6", color: PARENT.text2,
                    borderRadius: 100, padding: "5px 14px", fontSize: 13, fontWeight: 500,
                  }}
                >
                  🕐 Last active {data.lastActive.toLowerCase()}
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* SECTION 1 — Overall progress */}
        <Section title="Overall progress">
          {data.roadmap.totalMissions === 0 ? (
            <p style={{ fontSize: 15, color: PARENT.text2, lineHeight: 1.7 }}>
              {firstName} is just getting started. Check back soon to see their progress.
            </p>
          ) : (
            <div className="flex flex-col items-center gap-6 md:flex-row md:items-center md:gap-10">
              <CircularProgress value={data.roadmap.pct} size={150} />
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 22, fontWeight: 700, color: PARENT.text }}>
                  {data.roadmap.missionsCompleted} of {data.roadmap.totalMissions} missions completed
                </div>
                <div style={{ fontSize: 14, color: PARENT.text2, marginTop: 6 }}>
                  Estimated {data.roadmap.estMonthsLeft} month{data.roadmap.estMonthsLeft === 1 ? "" : "s"} until completion at current pace
                </div>
                <p style={{ fontSize: 15, color: PARENT.text, marginTop: 14, lineHeight: 1.65 }}>
                  {firstName} is making steady progress on their journey to become a <strong>{data.careerTitle}</strong>.
                </p>
              </div>
            </div>
          )}
        </Section>

        {/* SECTION 2 — Streak (only if there is one) */}
        {data.streak.show && (
          <Section title="Streak & consistency">
            <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
              <div>
                <div style={{ fontSize: 30, fontWeight: 700, color: PARENT.orange, display: "flex", alignItems: "center", gap: 8 }}>
                  <span>🔥</span> {data.streak.count} day streak
                </div>
                <div style={{ fontSize: 14, color: PARENT.text2, marginTop: 6 }}>
                  Active {data.streak.weekActive} of the last 7 days · Completed {data.streak.monthlyCompleted} mission{data.streak.monthlyCompleted === 1 ? "" : "s"} this month
                </div>
              </div>
              <div className="flex items-center" style={{ gap: 8 }}>
                {data.streak.weekDays.map((active, i) => (
                  <div key={i} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
                    <div
                      style={{
                        width: 30, height: 30, borderRadius: "50%",
                        background: active ? PARENT.orange : "#F3F4F6",
                        border: active ? "none" : `1px solid ${PARENT.border}`,
                        boxShadow: active ? "0 0 10px rgba(251,146,60,0.35)" : "none",
                      }}
                    />
                    <span style={{ fontSize: 11, color: PARENT.text3, fontWeight: 500 }}>{dayLabels[i]}</span>
                  </div>
                ))}
              </div>
            </div>
          </Section>
        )}

        {/* SECTION 3 — Skills */}
        <Section title={`Skills ${firstName} is building`}>
          {data.skills.length === 0 ? (
            <p style={{ fontSize: 14, color: PARENT.text2 }}>
              Skills will appear here as {firstName} completes missions.
            </p>
          ) : (
            <div className="flex flex-col" style={{ gap: 18 }}>
              {data.skills.map((s) => {
                const lvl =
                  s.level === "Advanced" ? { bg: "rgba(34,197,94,0.1)", c: PARENT.green } :
                  s.level === "Intermediate" ? { bg: "rgba(245,158,11,0.1)", c: PARENT.amber } :
                  { bg: "rgba(59,130,246,0.1)", c: "#3B82F6" };
                return (
                  <div key={s.name}>
                    <div className="flex items-center justify-between" style={{ marginBottom: 8 }}>
                      <div className="flex items-center" style={{ gap: 10 }}>
                        <span style={{ fontSize: 15, fontWeight: 600, color: PARENT.text }}>{s.name}</span>
                        <span style={{
                          background: lvl.bg, color: lvl.c,
                          borderRadius: 100, padding: "2px 10px", fontSize: 11, fontWeight: 600,
                        }}>
                          {s.level}
                        </span>
                      </div>
                      <span style={{ fontSize: 14, fontWeight: 700, color: PARENT.brand }}>{s.value}%</span>
                    </div>
                    <div style={{ height: 8, background: "#F3F4F6", borderRadius: 100, overflow: "hidden" }}>
                      <div
                        style={{
                          height: "100%",
                          width: `${Math.min(100, s.value)}%`,
                          background: `linear-gradient(90deg, ${PARENT.brand}, #B392F8)`,
                          borderRadius: 100,
                          transition: "width 1s ease",
                        }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </Section>

        {/* SECTION 4 — Recent achievements */}
        <Section title="Recent achievements">
          {data.recentMissions.length === 0 ? (
            <p style={{ fontSize: 14, color: PARENT.text2 }}>
              {firstName} is just getting started. Check back soon to see their progress.
            </p>
          ) : (
            <ol className="flex flex-col" style={{ gap: 16, listStyle: "none", padding: 0, margin: 0 }}>
              {data.recentMissions.map((m, i) => (
                <li
                  key={i}
                  style={{
                    background: "#FAFAFB", border: `1px solid ${PARENT.border}`,
                    borderRadius: 14, padding: "16px 18px",
                  }}
                >
                  <div className="flex items-start justify-between" style={{ gap: 12 }}>
                    <div>
                      <div style={{ fontSize: 15, fontWeight: 600, color: PARENT.text }}>{m.title}</div>
                      <div style={{ fontSize: 12, color: PARENT.text3, marginTop: 3 }}>{m.phase}</div>
                    </div>
                    <span style={{
                      flexShrink: 0, fontSize: 12, color: PARENT.green, fontWeight: 600,
                      background: "rgba(34,197,94,0.1)", borderRadius: 100, padding: "4px 10px",
                    }}>
                      ✓ {fmtDate(m.completedAt)}
                    </span>
                  </div>
                  {m.quote && (
                    <div
                      style={{
                        marginTop: 10, padding: "10px 14px",
                        background: PARENT.brandSoft, borderLeft: `3px solid ${PARENT.brand}`,
                        borderRadius: 8, fontSize: 13, color: PARENT.text2, lineHeight: 1.55,
                      }}
                    >
                      <strong style={{ color: PARENT.brand }}>Koko:</strong> {m.quote}
                    </div>
                  )}
                </li>
              ))}
            </ol>
          )}
        </Section>

        {/* SECTION 5 — Coming up next */}
        <Section title="Coming up next">
          {data.upcomingMissions.length === 0 ? (
            <p style={{ fontSize: 14, color: PARENT.text2 }}>
              {firstName} has completed every mission in their roadmap. 🎉
            </p>
          ) : (
            <ol className="flex flex-col" style={{ gap: 14, listStyle: "none", padding: 0, margin: 0 }}>
              {data.upcomingMissions.map((m, i) => (
                <li
                  key={i}
                  style={{
                    border: `1px solid ${PARENT.border}`, borderRadius: 14,
                    padding: "16px 18px", display: "flex", alignItems: "flex-start", gap: 14,
                  }}
                >
                  <div
                    style={{
                      width: 32, height: 32, borderRadius: "50%",
                      background: PARENT.brandSoft, color: PARENT.brand,
                      display: "grid", placeItems: "center", fontSize: 14, fontWeight: 700, flexShrink: 0,
                    }}
                  >
                    {i + 1}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 15, fontWeight: 600, color: PARENT.text }}>{m.title}</div>
                    <div style={{ fontSize: 12, color: PARENT.text3, marginTop: 2 }}>{m.phase}</div>
                    <div style={{ fontSize: 13, color: PARENT.text2, marginTop: 8, lineHeight: 1.55 }}>{m.why}</div>
                  </div>
                </li>
              ))}
            </ol>
          )}
        </Section>

        {/* SECTION 6 — Career goal */}
        <Section title="Career goal">
          <div style={{ fontSize: 22, fontWeight: 700, color: PARENT.brand }}>{data.careerTitle}</div>
          {data.careerDescription && (
            <p style={{ fontSize: 14, color: PARENT.text2, lineHeight: 1.65, marginTop: 8 }}>
              {data.careerDescription}
            </p>
          )}

          <div style={{ marginTop: 20 }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: PARENT.text, marginBottom: 8 }}>
              What this career involves
            </div>
            <ul className="flex flex-col" style={{ gap: 8, padding: 0, margin: 0, listStyle: "none" }}>
              {data.careerExamples.map((ex, i) => (
                <li
                  key={i}
                  style={{
                    fontSize: 14, color: PARENT.text2, lineHeight: 1.6,
                    paddingLeft: 22, position: "relative",
                  }}
                >
                  <span style={{ position: "absolute", left: 0, color: PARENT.brand }}>•</span> {ex}
                </li>
              ))}
            </ul>
          </div>

          {data.careerReason && (
            <div
              style={{
                marginTop: 20, padding: "14px 18px",
                background: PARENT.brandSoft, borderRadius: 12,
                fontSize: 14, color: PARENT.text2, lineHeight: 1.6,
              }}
            >
              <strong style={{ color: PARENT.brand }}>Why this matches {firstName}: </strong>
              {data.careerReason}
            </div>
          )}
        </Section>
      </main>

      <footer
        style={{
          background: PARENT.card, borderTop: `1px solid ${PARENT.border}`,
          padding: "24px 32px", textAlign: "center",
        }}
      >
        <div style={{ fontSize: 13, color: PARENT.text2, lineHeight: 1.6 }}>
          You're viewing {data.fullName}'s progress as their parent or guardian. This is a read-only view.
        </div>
        <div style={{ fontSize: 11, color: PARENT.text3, marginTop: 6 }}>
          Powered by WorthScope · 🔒 You can only view information. Nothing can be changed.
        </div>
      </footer>
    </div>
  );
};

export default ParentView;
