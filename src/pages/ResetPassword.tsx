import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import logo from "@/assets/worthscope-logo.png";
import { SEO } from "@/components/SEO";
import { Field, inputStyle, eyeBtn, EyeIcon, SharedAuthStyles } from "./SignIn";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

/* WorthScope — Reset Password (landed here from the email link).
   Supabase auto-detects the recovery token in the URL and opens a temporary
   session; we then let the user set a new password and sign them in. */

const PURPLE = "#3498DB";
const TEXT = "#111111";
const TEXT2 = "#6B7280";
const TEXT3 = "#9CA3AF";
const SUCCESS = "#22C55E";
const FONT = "'DM Sans', sans-serif";

export default function ResetPassword() {
  const navigate = useNavigate();
  const [validSession, setValidSession] = useState<boolean | null>(null);
  const [pwd, setPwd] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPwd, setShowPwd] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Supabase (detectSessionInUrl) processes the recovery token on load and
  // fires onAuthStateChange / populates getSession. If no session appears, the
  // link is expired or already used.
  useEffect(() => {
    let resolved = false;
    const { data: sub } = supabase.auth.onAuthStateChange((_evt, session) => {
      if (session) {
        resolved = true;
        setValidSession(true);
      }
    });
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) {
        resolved = true;
        setValidSession(true);
      }
    });
    const t = window.setTimeout(() => {
      if (!resolved) setValidSession(false);
    }, 3000);
    return () => {
      clearTimeout(t);
      sub.subscription.unsubscribe();
    };
  }, []);

  const minLen = pwd.length >= 8;
  const match = pwd.length > 0 && pwd === confirm;
  const canSubmit = minLen && match && !submitting;

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (submitting) return;
    if (!minLen) return toast.error("Password must be at least 8 characters.");
    if (!match) return toast.error("Passwords don't match.");
    setSubmitting(true);
    const { error } = await supabase.auth.updateUser({ password: pwd });
    setSubmitting(false);
    if (error) {
      toast.error("Couldn't update your password. Please try again.");
      return;
    }
    // updateUser leaves the user in a full session — they're now signed in.
    toast.success("Password updated! You're now signed in.");
    navigate("/dashboard", { replace: true });
  };

  return (
    <div style={{ minHeight: "100vh", background: "#fff", fontFamily: FONT, color: TEXT, position: "relative" }}>
      <SEO
        title="Reset Password — WorthScope"
        description="Set a new password for your WorthScope account."
        path="/reset-password"
      />
      <div style={{ position: "absolute", top: 0, left: 0, padding: "20px 28px", opacity: 0, animation: "ws-logo 0.3s ease forwards" }}>
        <Link to="/" style={{ display: "flex", alignItems: "center", textDecoration: "none" }}>
          <img src={logo} alt="WorthScope" style={{ height: 72, width: "auto", objectFit: "contain", display: "block" }} />
        </Link>
      </div>

      <div style={{ minHeight: "100vh", display: "grid", placeItems: "center", padding: "100px 20px 40px" }}>
        <div
          style={{
            width: "100%", maxWidth: 480, padding: "48px 32px",
            opacity: 0, animation: "ws-form-in 0.5s ease 0.1s forwards",
          }}
        >
          {validSession === false ? (
            <div style={{ textAlign: "center" }}>
              <div style={{ fontSize: 52, lineHeight: 1 }}>⚠️</div>
              <h1 style={{ fontSize: 32, fontWeight: 700, letterSpacing: "-0.6px", margin: "14px 0 0", color: TEXT }}>
                Link no longer valid
              </h1>
              <p style={{ marginTop: 14, fontSize: 15, color: TEXT2, lineHeight: 1.6 }}>
                This password reset link is no longer valid. Request a new one.
              </p>
              <p style={{ marginTop: 28, fontSize: 14 }}>
                <Link to="/forgot-password" style={{ color: PURPLE, fontWeight: 600, textDecoration: "none" }}>
                  Request a new link
                </Link>
              </p>
            </div>
          ) : validSession === null ? (
            <p style={{ textAlign: "center", fontSize: 15, color: TEXT2 }}>Verifying your reset link…</p>
          ) : (
            <form onSubmit={onSubmit}>
              <h1 style={{ fontSize: 40, fontWeight: 700, letterSpacing: "-1px", textAlign: "center", margin: 0, color: TEXT }}>
                Set your new password
              </h1>
              <p style={{ marginTop: 12, fontSize: 15, color: TEXT2, textAlign: "center", marginBottom: 36 }}>
                Choose a strong password you'll remember.
              </p>

              <Field label="New Password">
                <div style={{ position: "relative" }}>
                  <input
                    type={showPwd ? "text" : "password"} required value={pwd}
                    onChange={(e) => setPwd(e.target.value)}
                    placeholder="Enter a new password" className="ws-input"
                    style={{ ...inputStyle(), paddingRight: 48 }}
                  />
                  <button type="button" aria-label="Toggle password" onClick={() => setShowPwd((v) => !v)} style={eyeBtn()}>
                    <EyeIcon off={!showPwd} />
                  </button>
                </div>
              </Field>

              <div style={{ height: 16 }} />

              <Field label="Confirm New Password">
                <div style={{ position: "relative" }}>
                  <input
                    type={showConfirm ? "text" : "password"} required value={confirm}
                    onChange={(e) => setConfirm(e.target.value)}
                    placeholder="Re-enter your new password" className="ws-input"
                    style={{ ...inputStyle(), paddingRight: 48 }}
                  />
                  <button type="button" aria-label="Toggle password" onClick={() => setShowConfirm((v) => !v)} style={eyeBtn()}>
                    <EyeIcon off={!showConfirm} />
                  </button>
                </div>
              </Field>

              <div style={{ marginTop: 16, display: "flex", flexDirection: "column", gap: 9 }}>
                <Req met={minLen} label="At least 8 characters" />
                <Req met={match} label="Passwords match" />
              </div>

              <button
                type="submit"
                disabled={!canSubmit}
                className="ws-submit"
                style={{
                  marginTop: 28, width: "100%", height: 56, background: PURPLE, color: "#fff",
                  border: "none", borderRadius: 14, fontFamily: FONT, fontWeight: 700, fontSize: 17,
                  cursor: canSubmit ? "pointer" : "not-allowed", transition: "all 0.2s ease",
                  opacity: canSubmit ? 1 : 0.6,
                  display: "flex", alignItems: "center", justifyContent: "center", gap: 10,
                }}
              >
                {submitting && <Spinner />}
                {submitting ? "Updating…" : "Update password"}
              </button>
            </form>
          )}
        </div>
      </div>

      <SharedAuthStyles />
      <style>{`@keyframes ws-spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

function Req({ met, label }: { met: boolean; label: string }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 9, fontSize: 13, color: met ? SUCCESS : TEXT3, transition: "color 0.2s ease" }}>
      <span
        style={{
          width: 16, height: 16, borderRadius: "50%", display: "grid", placeItems: "center",
          border: `1.5px solid ${met ? SUCCESS : "#D1D5DB"}`, background: met ? SUCCESS : "transparent",
          transition: "all 0.2s ease",
        }}
      >
        {met && (
          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M20 6 9 17l-5-5" />
          </svg>
        )}
      </span>
      {label}
    </div>
  );
}

function Spinner() {
  return (
    <span
      aria-hidden
      style={{
        width: 18, height: 18, borderRadius: "50%",
        border: "2.5px solid rgba(255,255,255,0.45)", borderTopColor: "#fff",
        display: "inline-block", animation: "ws-spin 0.7s linear infinite",
      }}
    />
  );
}
