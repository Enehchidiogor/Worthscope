import { useEffect, useState, type CSSProperties, type ReactNode } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import logo from "@/assets/worthscope-logo.png";
import { SEO } from "@/components/SEO";
import { signInWithEmail, hydrateProfile } from "@/lib/authClient";
import { supabase } from "@/integrations/supabase/client";
import { getProfile, hasResults } from "@/lib/userState";
import { toast } from "sonner";
import OAuthButtons from "@/components/auth/OAuthButtons";
import AmbientBackground from "@/components/landing/AmbientBackground";
import { PAPER, PAPER_DIM, BLUE_BRIGHT, LINE, FONT } from "@/components/experience/theme";

const TEXT3 = "rgba(255,255,255,.4)";

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

  // Catches the session set up by an OAuth redirect landing back on this page
  // (Google/Apple/Microsoft via Lovable, GitHub via Supabase directly).
  useEffect(() => {
    const { data: sub } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === "SIGNED_IN" && session?.user) {
        await hydrateProfile(session.user);
        navigate(routeAfterAuth(intended), { replace: true });
      }
    });
    return () => sub.subscription.unsubscribe();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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

  return (
    <div style={{ minHeight: "100vh", position: "relative", fontFamily: FONT, color: PAPER, overflowX: "clip" as "hidden" }}>
      <AmbientBackground />
      <div style={{ position: "absolute", top: 0, left: 0, padding: "24px 28px", zIndex: 2 }}>
        <Link to="/" style={{ display: "flex", alignItems: "center", textDecoration: "none" }}>
          <img src={logo} alt="WorthScope" style={{ height: 60, width: "auto", objectFit: "contain", display: "block" }} />
        </Link>
      </div>

      <div style={{ position: "relative", zIndex: 1, minHeight: "100vh", display: "grid", placeItems: "center", padding: "110px 20px 40px" }}>
        <form
          onSubmit={onSubmit}
          style={{
            width: "100%",
            maxWidth: 440,
            padding: "40px 34px",
            borderRadius: 24,
            background: "rgba(255,255,255,.03)",
            border: `1px solid ${LINE}`,
            backdropFilter: "blur(18px)",
            WebkitBackdropFilter: "blur(18px)",
            boxShadow: "0 40px 90px -40px rgba(0,0,0,.8)",
            opacity: 0,
            animation: "ws-form-in 0.5s ease 0.1s forwards",
          }}
        >
          <h1 style={{ fontSize: 32, fontWeight: 700, letterSpacing: -0.8, textAlign: "center", margin: 0, color: PAPER }}>Welcome Back</h1>
          <p style={{ marginTop: 10, fontSize: 14.5, color: PAPER_DIM, textAlign: "center", marginBottom: 30 }}>
            Continue your <span style={{ color: BLUE_BRIGHT }}>career journey</span>
          </p>

          <OAuthButtons redirectPath="/signin" />

          <Field label="Email Address">
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email address"
              className="ws-input"
              style={inputStyle()}
            />
          </Field>

          <div style={{ height: 18 }} />

          <Field label="Password">
            <div style={{ position: "relative" }}>
              <input
                type={showPwd ? "text" : "password"}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                className="ws-input"
                style={{ ...inputStyle(), paddingRight: 48 }}
              />
              <button type="button" aria-label="Toggle password" onClick={() => setShowPwd((v) => !v)} style={eyeBtn()}>
                <EyeIcon off={!showPwd} />
              </button>
            </div>
          </Field>

          <div style={{ marginTop: 10, textAlign: "right" }}>
            <Link
              to="/forgot-password"
              style={{ color: BLUE_BRIGHT, fontSize: 12.5, fontWeight: 500, textDecoration: "none" }}
              onMouseEnter={(e) => (e.currentTarget.style.textDecoration = "underline")}
              onMouseLeave={(e) => (e.currentTarget.style.textDecoration = "none")}
            >
              Forgot password?
            </Link>
          </div>

          {needsVerify && (
            <button
              type="button"
              onClick={onResend}
              style={{
                marginTop: 14,
                width: "100%",
                height: 44,
                background: "transparent",
                color: BLUE_BRIGHT,
                border: `1.5px solid ${BLUE_BRIGHT}`,
                borderRadius: 12,
                fontFamily: FONT,
                fontWeight: 600,
                fontSize: 13.5,
                cursor: "pointer",
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
              marginTop: 24,
              width: "100%",
              height: 52,
              background: BLUE_BRIGHT,
              color: "#04070D",
              border: "none",
              borderRadius: 14,
              fontFamily: FONT,
              fontWeight: 700,
              fontSize: 15,
              cursor: submitting ? "wait" : "pointer",
              transition: "all 0.2s ease",
              opacity: submitting ? 0.7 : 1,
              boxShadow: `0 0 24px ${BLUE_BRIGHT}55`,
            }}
          >
            {submitting ? "Signing in…" : "Sign In"}
          </button>

          <p style={{ marginTop: 22, textAlign: "center", fontSize: 13.5, color: PAPER_DIM }}>
            Don't have an account?{" "}
            <Link to="/signup" style={{ color: BLUE_BRIGHT, fontWeight: 600, textDecoration: "none" }}>
              Sign up
            </Link>
          </p>
        </form>
      </div>

      <SharedAuthStyles />
      <SEO title="Sign In — WorthScope" description="Sign in to WorthScope to continue your career roadmap, missions, and skill tracking." path="/signin" />
    </div>
  );
}

export function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div>
      <label style={{ display: "block", fontSize: 13, fontWeight: 500, color: PAPER_DIM, marginBottom: 7 }}>{label}</label>
      {children}
    </div>
  );
}

export function inputStyle(): CSSProperties {
  return {
    width: "100%",
    height: 50,
    background: "rgba(255,255,255,.03)",
    border: `1.5px solid ${LINE}`,
    borderRadius: 12,
    padding: "0 16px",
    fontSize: 14.5,
    fontFamily: FONT,
    color: PAPER,
    outline: "none",
    transition: "all 0.18s ease",
    boxSizing: "border-box",
  };
}

export function eyeBtn(): CSSProperties {
  return {
    position: "absolute",
    right: 14,
    top: "50%",
    transform: "translateY(-50%)",
    background: "transparent",
    border: "none",
    cursor: "pointer",
    padding: 4,
    color: TEXT3,
    display: "grid",
    placeItems: "center",
  };
}

export function EyeIcon({ off }: { off: boolean }) {
  return off ? (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
      <line x1="1" y1="1" x2="23" y2="23" />
    </svg>
  ) : (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}

export function SharedAuthStyles() {
  return (
    <style>{`
      @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700;800&display=swap');
      @keyframes ws-form-in { from { opacity: 0; transform: translateY(16px); } to { opacity: 1; transform: translateY(0); } }
      body { background: #000; }
      .ws-input::placeholder { color: rgba(255,255,255,.3); }
      .ws-input:focus { border-color: ${BLUE_BRIGHT} !important; box-shadow: 0 0 0 4px rgba(59,130,246,0.12); }
      .ws-submit:hover { filter: brightness(1.08); box-shadow: 0 0 30px ${BLUE_BRIGHT}77; transform: translateY(-1px); }
      .ws-submit:active { transform: translateY(0); }
    `}</style>
  );
}
