import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import logo from "@/assets/worthscope-logo.png";
import { markAccessGranted, validateParentToken } from "@/lib/parentInvite";

/* WorthScope — Parent Access (Lightweight Gate)
   Verifies the invite token server-side and asks for the child's first
   name as a soft second check. */

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
  const [checking, setChecking] = useState(true);
  const [tokenError, setTokenError] = useState<"invalid" | "expired" | "revoked" | null>(null);
  const [studentFirstName, setStudentFirstName] = useState<string>("");
  const [firstName, setFirstName] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Initial token check (without name) just to learn validity & first name to greet
  useEffect(() => {
    let cancelled = false;
    (async () => {
      const r = await validateParentToken(token);
      if (cancelled) return;
      if (r.ok) {
        setStudentFirstName(r.firstName);
      } else if (r.error === "expired" || r.error === "revoked") {
        setTokenError(r.error);
      } else {
        setTokenError("invalid");
      }
      setChecking(false);
    })();
    return () => { cancelled = true; };
  }, [token]);

  async function handleEnter() {
    setError("");
    const guess = firstName.trim();
    if (!guess) { setError("Please enter the child's first name."); return; }
    setLoading(true);
    const r = await validateParentToken(token, guess);
    setLoading(false);
    if (r.ok) {
      markAccessGranted(token);
      navigate(`/parent-view/${token}`);
    } else if (r.error === "name_mismatch") {
      setError("That name doesn't match our records.");
    } else if (r.error === "expired" || r.error === "revoked") {
      setTokenError(r.error);
    } else {
      setError("This link is no longer valid.");
    }
  }

  if (checking) {
    return (
      <div style={{ minHeight: "100vh", background: C.bg, fontFamily: FONT, display: "grid", placeItems: "center" }}>
        <div style={{ color: C.text2, fontSize: 14 }}>Verifying link…</div>
      </div>
    );
  }

  if (tokenError) {
    const msg =
      tokenError === "expired" ? "This invitation link has expired." :
      tokenError === "revoked" ? "This invitation link has been revoked." :
      "This invitation link is no longer valid.";
    return (
      <div style={{ minHeight: "100vh", background: C.bg, fontFamily: FONT, display: "grid", placeItems: "center", padding: 24 }}>
        <div style={{ maxWidth: 460, textAlign: "center" }}>
          <div style={{ fontSize: 42 }}>🔗</div>
          <h1 style={{ fontWeight: 700, fontSize: 24, color: C.text, marginTop: 8 }}>{msg}</h1>
          <p style={{ fontWeight: 400, fontSize: 14, color: C.text2, marginTop: 10, lineHeight: 1.6 }}>
            Please ask the student to send a new invitation from their WorthScope dashboard.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", background: C.bg, fontFamily: FONT, color: C.text, position: "relative" }}>
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
              style={{ width: 56, height: 56, borderRadius: "50%", background: C.accentL, display: "grid", placeItems: "center" }}
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
          {error && (<div style={{ fontSize: 12, color: C.red, marginTop: 6 }}>{error}</div>)}

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
          >
            {loading ? "Verifying…" : "View Dashboard →"}
          </button>

          <p style={{ textAlign: "center", fontSize: 11, color: C.text3, marginTop: 16, lineHeight: 1.6 }}>
            🔒 You can only view information. Nothing can be changed from this view.
            {studentFirstName ? <><br />Hint: This invite is for the parent or guardian of {studentFirstName}.</> : null}
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
