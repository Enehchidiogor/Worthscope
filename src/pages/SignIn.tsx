import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import logo from "@/assets/worthscope-logo.png";
import { SEO } from "@/components/SEO";
import { signInWithEmail, hydrateProfile } from "@/lib/authClient";
import { lovable } from "@/integrations/lovable/index";
import { supabase } from "@/integrations/supabase/client";
import { getProfile, hasResults } from "@/lib/userState";
import { toast } from "sonner";


const ACCENT = "#3498DB";
const ACCENT_DARK = "#217BBB";
const TEXT = "#111111";
const TEXT3 = "#9CA3AF";
const BORDER = "#E5E7EB";
const FONT = "'DM Sans', sans-serif";

function routeAfterAuth(intended: string): string {
  if (getProfile() && hasResults()) return intended;
  if (!getProfile()) return "/onboarding";
  if (!hasResults()) return "/assessment";
  return intended;
}

export default function SignIn() {
  const navigate = useNavigate();
  const location = useLocation();
  const [showPwd, setShowPwd] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [needsVerify, setNeedsVerify] = useState(false);

  const intended = (location.state as { from?: string } | null)?.from || "/dashboard";

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (submitting) return;
    setSubmitting(true);
    setNeedsVerify(false);
    const { data, error } = await signInWithEmail(email, password);
    setSubmitting(false);
    if (error) {
      const msg = (error.message || "").toLowerCase();
      const code = (error as { code?: string }).code || "";
      if (code === "email_not_confirmed" || msg.includes("not confirmed") || msg.includes("not verified")) {
        setNeedsVerify(true);
        toast.error("Please verify your email before signing in.");
        return;
      }
      if (code === "invalid_credentials" || msg.includes("invalid login")) {
        toast.error("Incorrect email or password. Please try again.");
        return;
      }
      if (msg.includes("network") || msg.includes("fetch")) {
        toast.error("Unable to connect. Please try again.");
        return;
      }
      toast.error(error.message || "Couldn't sign in");
      return;
    }
    if (data.user) await hydrateProfile(data.user);
    navigate(routeAfterAuth(intended), { replace: true });
  };

  const onResend = async () => {
    if (!email) {
      toast.error("Enter your email first");
      return;
    }
    const { error } = await supabase.auth.resend({
      type: "signup",
      email,
      options: { emailRedirectTo: `${window.location.origin}/signin` },
    });
    if (error) toast.error(error.message);
    else toast.success("Verification email sent. Check your inbox.");
  };

  const onGoogle = async () => {
    const result = await lovable.auth.signInWithOAuth("google", {
      redirect_uri: window.location.origin,
    });
    if (result.error) {
      toast.error("Google sign-in failed");
      return;
    }
    if (result.redirected) return;
    const { data } = await supabase.auth.getUser();
    if (data.user) await hydrateProfile(data.user);
    navigate(routeAfterAuth(intended), { replace: true });
  };

  return (
    <div style={{ minHeight: "100vh", background: "#fff", fontFamily: FONT, color: TEXT, position: "relative" }}>
      <div style={{ position: "absolute", top: 0, left: 0, padding: "20px 28px", opacity: 0, animation: "ws-logo 0.3s ease forwards" }}>
        <Link to="/" style={{ display: "flex", alignItems: "center", textDecoration: "none" }}>
          <img src={logo} alt="WorthScope" style={{ height: 72, width: "auto", objectFit: "contain", display: "block" }} />
        </Link>
      </div>

      <div style={{ minHeight: "100vh", display: "grid", placeItems: "center", padding: "100px 20px 40px" }}>
        <form
          onSubmit={onSubmit}
          style={{
            width: "100%", maxWidth: 480, padding: "48px 32px",
            opacity: 0, animation: "ws-form-in 0.5s ease 0.1s forwards",
          }}
        >
          <h1 style={{ fontSize: 48, fontWeight: 700, letterSpacing: "-1.5px", textAlign: "center", margin: 0, color: TEXT }}>
            Welcome
          </h1>
          <p style={{ marginTop: 12, fontSize: 16, color: TEXT, textAlign: "center", marginBottom: 36 }}>
            Continue your <span style={{ color: ACCENT }}>career Journey</span>
          </p>

          <Field label="Email Address">
            <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email address" className="ws-input" style={inputStyle()} />
          </Field>

          <div style={{ height: 20 }} />

          <Field label="Password">
            <div style={{ position: "relative" }}>
              <input type={showPwd ? "text" : "password"} required value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password" className="ws-input"
                style={{ ...inputStyle(), paddingRight: 48 }} />
              <button type="button" aria-label="Toggle password" onClick={() => setShowPwd((v) => !v)}
                style={eyeBtn()}>
                <EyeIcon off={!showPwd} />
              </button>
            </div>
          </Field>

          {needsVerify && (
            <button
              type="button"
              onClick={onResend}
              style={{
                marginTop: 14, width: "100%", height: 44, background: "#fff",
                color: ACCENT, border: `1.5px solid ${ACCENT}`, borderRadius: 12,
                fontFamily: FONT, fontWeight: 600, fontSize: 14, cursor: "pointer",
              }}
            >
              Resend verification email
            </button>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="ws-submit"
            style={{
              marginTop: 28, width: "100%", height: 56, background: ACCENT, color: "#fff",
              border: "none", borderRadius: 14, fontFamily: FONT, fontWeight: 700, fontSize: 17,
              cursor: submitting ? "wait" : "pointer", transition: "all 0.2s ease",
              opacity: submitting ? 0.7 : 1,
            }}
          >
            {submitting ? "Signing in…" : "Sign In"}
          </button>

          <Divider />

          <button type="button" onClick={onGoogle} className="ws-google" style={googleBtn()}>
            <GoogleG />
            <span>Continue with Google</span>
          </button>

          <p style={{ marginTop: 24, textAlign: "center", fontSize: 14, color: TEXT }}>
            Don't have an account?{" "}
            <Link to="/signup" style={{ color: ACCENT, fontWeight: 600, textDecoration: "none" }}>
              Sign up
            </Link>
          </p>
        </form>
      </div>

      <SharedAuthStyles />
      <SEO
        title="Sign In — WorthScope"
        description="Sign in to WorthScope to continue your career roadmap, missions, and skill tracking."
        path="/signin"
      />
    </div>
  );
}

export function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label style={{ display: "block", fontSize: 15, fontWeight: 500, color: TEXT, marginBottom: 8 }}>{label}</label>
      {children}
    </div>
  );
}

export function inputStyle(): React.CSSProperties {
  return {
    width: "100%", height: 56, background: "#fff", border: `1.5px solid ${BORDER}`,
    borderRadius: 12, padding: "0 18px", fontSize: 15, fontFamily: FONT, color: TEXT,
    outline: "none", transition: "all 0.18s ease", boxSizing: "border-box",
  };
}

export function eyeBtn(): React.CSSProperties {
  return {
    position: "absolute", right: 16, top: "50%", transform: "translateY(-50%)",
    background: "transparent", border: "none", cursor: "pointer", padding: 4,
    color: TEXT3, display: "grid", placeItems: "center",
  };
}

export function googleBtn(): React.CSSProperties {
  return {
    width: "100%", height: 56, background: "#fff", border: `1.5px solid ${BORDER}`,
    borderRadius: 14, display: "flex", alignItems: "center", justifyContent: "center", gap: 12,
    fontFamily: FONT, fontWeight: 500, fontSize: 15, color: TEXT, cursor: "pointer",
    transition: "all 0.18s ease",
  };
}

export function Divider() {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 12, margin: "24px 0" }}>
      <div style={{ flex: 1, height: 1, background: BORDER }} />
      <span style={{ fontSize: 13, color: TEXT3 }}>or continue with</span>
      <div style={{ flex: 1, height: 1, background: BORDER }} />
    </div>
  );
}

export function EyeIcon({ off }: { off: boolean }) {
  return off ? (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
      <line x1="1" y1="1" x2="23" y2="23" />
    </svg>
  ) : (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}

export function GoogleG() {
  return (
    <svg width="22" height="22" viewBox="0 0 48 48" aria-hidden="true">
      <path fill="#FFC107" d="M43.611 20.083H42V20H24v8h11.303c-1.649 4.657-6.08 8-11.303 8-6.627 0-12-5.373-12-12s5.373-12 12-12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 12.955 4 4 12.955 4 24s8.955 20 20 20 20-8.955 20-20c0-1.341-.138-2.65-.389-3.917z" />
      <path fill="#FF3D00" d="M6.306 14.691l6.571 4.819C14.655 15.108 18.961 12 24 12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 16.318 4 9.656 8.337 6.306 14.691z" />
      <path fill="#4CAF50" d="M24 44c5.166 0 9.86-1.977 13.409-5.192l-6.19-5.238C29.211 35.091 26.715 36 24 36c-5.202 0-9.619-3.317-11.283-7.946l-6.522 5.025C9.505 39.556 16.227 44 24 44z" />
      <path fill="#1976D2" d="M43.611 20.083H42V20H24v8h11.303c-.792 2.237-2.231 4.166-4.087 5.571l6.19 5.238C36.971 39.205 44 34 44 24c0-1.341-.138-2.65-.389-3.917z" />
    </svg>
  );
}

export function SharedAuthStyles() {
  return (
    <style>{`
      @keyframes ws-form-in { from { opacity: 0; transform: translateY(16px); } to { opacity: 1; transform: translateY(0); } }
      @keyframes ws-logo { from { opacity: 0; } to { opacity: 1; } }
      .ws-input:focus { border-color: ${ACCENT} !important; box-shadow: 0 0 0 4px rgba(52,152,219,0.1); }
      .ws-submit:hover { background: ${ACCENT_DARK} !important; box-shadow: 0 8px 24px rgba(52,152,219,0.35); transform: translateY(-1px); }
      .ws-submit:active { transform: translateY(0); }
      .ws-google:hover { background: #F9FAFB !important; border-color: #D1D5DB !important; box-shadow: 0 2px 8px rgba(0,0,0,0.06); }
    `}</style>
  );
}
