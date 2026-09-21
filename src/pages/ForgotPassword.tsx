import { useState } from "react";
import { Link } from "react-router-dom";
import logo from "@/assets/worthscope-logo.png";
import { SEO } from "@/components/SEO";
import { Field, inputStyle, SharedAuthStyles } from "./SignIn";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

/* WorthScope — Forgot Password (request a reset link).
   Matches the SignIn/SignUp visual style. For security we always show the
   "Check your email" screen on success and never reveal whether an email
   is registered. */

const PURPLE = "#3498DB";
const TEXT = "#111111";
const TEXT2 = "#6B7280";
const FONT = "'DM Sans', sans-serif";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [sent, setSent] = useState(false);

  const sendReset = async () => {
    const addr = email.trim();
    if (!addr || submitting) return;
    setSubmitting(true);
    const { error } = await supabase.auth.resetPasswordForEmail(addr, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    setSubmitting(false);
    if (error) {
      // Only surface genuine failures (network / rate limit). A non-existent
      // email is NOT treated as an error — we always show the success screen
      // so the form can't be used to enumerate registered users.
      toast.error("Something went wrong. Please try again.");
      return;
    }
    setSent(true);
  };

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendReset();
  };

  return (
    <div style={{ minHeight: "100vh", background: "#fff", fontFamily: FONT, color: TEXT, position: "relative" }}>
      <SEO
        title="Forgot Password — WorthScope"
        description="Reset your WorthScope password — we'll email you a secure link."
        path="/forgot-password"
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
          {sent ? (
            <div style={{ textAlign: "center" }}>
              <div style={{ fontSize: 52, lineHeight: 1 }}>📬</div>
              <h1 style={{ fontSize: 40, fontWeight: 700, letterSpacing: "-1px", margin: "14px 0 0", color: TEXT }}>
                Check your email
              </h1>
              <p style={{ marginTop: 14, fontSize: 15, color: TEXT2, lineHeight: 1.6 }}>
                We sent a password reset link to{" "}
                <strong style={{ color: TEXT }}>{email.trim()}</strong>. Click the link in the email to reset your password.
              </p>
              <p style={{ marginTop: 18, fontSize: 13, color: TEXT2 }}>
                Didn't get it? Check your spam folder or{" "}
                <button
                  type="button"
                  onClick={sendReset}
                  disabled={submitting}
                  style={{
                    background: "none", border: "none", padding: 0, color: PURPLE,
                    fontWeight: 600, fontFamily: FONT, fontSize: 13,
                    cursor: submitting ? "wait" : "pointer",
                  }}
                >
                  resend link
                </button>
              </p>
              <p style={{ marginTop: 28, fontSize: 14 }}>
                <Link to="/signin" style={{ color: PURPLE, fontWeight: 600, textDecoration: "none" }}>
                  Back to sign in
                </Link>
              </p>
            </div>
          ) : (
            <form onSubmit={onSubmit}>
              <h1 style={{ fontSize: 40, fontWeight: 700, letterSpacing: "-1px", textAlign: "center", margin: 0, color: TEXT }}>
                Forgot your password?
              </h1>
              <p style={{ marginTop: 12, fontSize: 15, color: TEXT2, textAlign: "center", marginBottom: 36 }}>
                No worries — enter your email and we'll send you a reset link.
              </p>

              <Field label="Email Address">
                <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email" className="ws-input" style={inputStyle()} />
              </Field>

              <button
                type="submit"
                disabled={submitting || !email.trim()}
                className="ws-submit"
                style={{
                  marginTop: 28, width: "100%", height: 56, background: PURPLE, color: "#fff",
                  border: "none", borderRadius: 14, fontFamily: FONT, fontWeight: 700, fontSize: 17,
                  cursor: submitting ? "wait" : "pointer", transition: "all 0.2s ease",
                  opacity: submitting || !email.trim() ? 0.7 : 1,
                  display: "flex", alignItems: "center", justifyContent: "center", gap: 10,
                }}
              >
                {submitting && <Spinner />}
                {submitting ? "Sending…" : "Send reset link"}
              </button>

              <p style={{ marginTop: 24, textAlign: "center", fontSize: 14, color: TEXT }}>
                Remember your password?{" "}
                <Link to="/signin" style={{ color: PURPLE, fontWeight: 600, textDecoration: "none" }}>
                  Sign in
                </Link>
              </p>
            </form>
          )}
        </div>
      </div>

      <SharedAuthStyles />
      <style>{`@keyframes ws-spin { to { transform: rotate(360deg); } }`}</style>
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
