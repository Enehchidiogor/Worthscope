import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import logo from "@/assets/worthscope-logo.png";
import { getParentInvite, markAccessGranted, type ParentInvite } from "@/lib/parentInvite";

/* WorthScope — Parent Access (Lightweight Gate)
   Step between "parent opens link" and "parent dashboard".
   Verifies the invite token and asks for the child's first name as a soft check. */

const C = {
  bg: "#F8F9FA",
  card: "#FFFFFF",
  text: "#1A1A2A",
  text2: "#6B7280",
  text3: "#9CA3AF",
  border: "#E5E7EB",
  accent: "#3498DB",
  accentL: "#EBF5FB",
  accentDark: "#217BBB",
  red: "#EF4444",
};

const FONT = "'Poppins', sans-serif";

export default function ParentAccess() {
  const { token = "" } = useParams<{ token: string }>();
  const navigate = useNavigate();
  const [invite, setInvite] = useState<ParentInvite | null>(null);
  const [checked, setChecked] = useState(false);
  const [firstName, setFirstName] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setInvite(getParentInvite(token));
    setChecked(true);
  }, [token]);

  const expectedFirstName = useMemo(
    () => (invite?.studentFirstName || "").trim().toLowerCase(),
    [invite],
  );

  function handleEnter() {
    if (!invite) return;
    setError("");
    const guess = firstName.trim().toLowerCase();
    if (!guess) {
      setError("Please enter the child's first name.");
      return;
    }
    if (expectedFirstName && guess !== expectedFirstName) {
      setError("That name doesn't match our records.");
      return;
    }
    setLoading(true);
    markAccessGranted(token);
    setTimeout(() => navigate(`/parent-view/${token}`), 350);
  }

  // Invalid / expired token
  if (checked && !invite) {
    return (
      <div style={{ minHeight: "100vh", background: C.bg, fontFamily: FONT, display: "grid", placeItems: "center", padding: 24 }}>
        <div style={{ maxWidth: 440, textAlign: "center" }}>
          <div style={{ fontSize: 42 }}>🔗</div>
          <h1 style={{ fontWeight: 700, fontSize: 24, color: C.text, marginTop: 8 }}>
            This link is invalid or has expired
          </h1>
          <p style={{ fontWeight: 400, fontSize: 14, color: C.text2, marginTop: 10, lineHeight: 1.6 }}>
            Ask your child to generate a fresh invite link from their WorthScope dashboard.
          </p>
        </div>
      </div>
    );
  }

  if (!invite) return null;

  return (
    <div style={{ minHeight: "100vh", background: C.bg, fontFamily: FONT, color: C.text, position: "relative" }}>
      {/* Transparent header with logo only */}
      <header
        style={{
          position: "absolute", top: 0, left: 0, right: 0, height: 80,
          padding: "0 32px", display: "flex", alignItems: "center", justifyContent: "flex-start",
          background: "transparent", zIndex: 10,
        }}
      >
        <img src={logo} alt="WorthScope" style={{ height: 72, width: "auto", objectFit: "contain" }} />
      </header>

      <main style={{ minHeight: "100vh", display: "grid", placeItems: "center", padding: "120px 24px 48px" }}>
        <div
          style={{
            width: "100%", maxWidth: 480, background: C.card,
            border: `1px solid ${C.border}`, borderRadius: 20,
            padding: "36px 32px", boxShadow: "0 4px 24px rgba(0,0,0,0.05)",
            animation: "ws-fade-up 0.5s ease both",
          }}
        >
          <div style={{ display: "grid", placeItems: "center", marginBottom: 14 }}>
            <div
              style={{
                width: 56, height: 56, borderRadius: "50%", background: C.accentL,
                display: "grid", placeItems: "center",
              }}
            >
              <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke={C.accent} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7S2 12 2 12z" />
                <circle cx="12" cy="12" r="3" />
              </svg>
            </div>
          </div>

          <h1 style={{ textAlign: "center", fontWeight: 700, fontSize: 24, letterSpacing: "-0.4px", color: C.text }}>
            View Your Child's Career Journey
          </h1>
          <p style={{ textAlign: "center", fontWeight: 400, fontSize: 14, color: C.text2, lineHeight: 1.65, marginTop: 10 }}>
            You've been invited to view progress on WorthScope. This is a private, read-only view.
          </p>

          {/* Preview info */}
          <div
            style={{
              background: C.accentL, border: "1px solid rgba(52,152,219,0.18)",
              borderRadius: 14, padding: "16px 18px", marginTop: 22,
            }}
          >
            <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: "1.5px", textTransform: "uppercase", color: C.accent }}>
              You're viewing
            </div>
            <div style={{ fontSize: 18, fontWeight: 700, color: C.text, marginTop: 6 }}>
              {invite.studentFullName}
            </div>
            {(invite.educationLevel || invite.classOrLevel) && (
              <div style={{ fontSize: 13, color: C.text2, marginTop: 4 }}>
                {[invite.educationLevel, invite.classOrLevel].filter(Boolean).join(" — ")}
              </div>
            )}
          </div>

          {/* Soft security gate */}
          <label style={{ display: "block", fontWeight: 600, fontSize: 13, color: C.text, marginTop: 22, marginBottom: 8 }}>
            Enter your child's first name to continue
          </label>
          <input
            value={firstName}
            onChange={(e) => { setFirstName(e.target.value); setError(""); }}
            onKeyDown={(e) => { if (e.key === "Enter") handleEnter(); }}
            placeholder="e.g. their first name"
            className="ws-gate-input"
            style={{
              width: "100%", height: 52, padding: "0 16px", borderRadius: 12,
              border: `1.5px solid ${error ? C.red : C.border}`, background: "#fff",
              fontFamily: FONT, fontSize: 15, fontWeight: 400, color: C.text,
              outline: "none", boxSizing: "border-box",
              transition: "border-color 0.2s, box-shadow 0.2s",
            }}
          />
          {error && (
            <div style={{ fontSize: 12, color: C.red, marginTop: 6 }}>{error}</div>
          )}

          <button
            onClick={handleEnter}
            disabled={loading}
            style={{
              marginTop: 16, width: "100%", height: 52, borderRadius: 12, border: "none",
              background: C.accent, color: "#fff",
              fontFamily: FONT, fontWeight: 600, fontSize: 15,
              cursor: loading ? "wait" : "pointer",
              transition: "background 0.2s, box-shadow 0.2s, transform 0.18s",
            }}
            onMouseEnter={(e) => {
              if (loading) return;
              e.currentTarget.style.background = C.accentDark;
              e.currentTarget.style.boxShadow = "0 8px 24px rgba(52,152,219,0.35)";
              e.currentTarget.style.transform = "translateY(-1px)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = C.accent;
              e.currentTarget.style.boxShadow = "none";
              e.currentTarget.style.transform = "translateY(0)";
            }}
          >
            {loading ? "Loading..." : "View Dashboard →"}
          </button>

          <p style={{ textAlign: "center", fontSize: 11, color: C.text3, marginTop: 16, lineHeight: 1.6 }}>
            🔒 You can only view information. Nothing can be changed from this view.
          </p>
        </div>
      </main>

      <style>{`
        @keyframes ws-fade-up { from {opacity:0; transform:translateY(12px)} to {opacity:1; transform:translateY(0)} }
        .ws-gate-input:focus {
          border-color: ${C.accent} !important;
          box-shadow: 0 0 0 4px rgba(52,152,219,0.15) !important;
        }
      `}</style>
    </div>
  );
}
