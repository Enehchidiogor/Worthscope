import { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import logo from "@/assets/worthscope-logo.png";
import { Field, inputStyle, eyeBtn, EyeIcon, SharedAuthStyles } from "./SignIn";
import { SEO } from "@/components/SEO";
import { signUpWithEmail } from "@/lib/authClient";
import { toast } from "sonner";
import { notifyWelcome } from "@/lib/notifications";
import OAuthButtons from "@/components/auth/OAuthButtons";
import AmbientBackground from "@/components/landing/AmbientBackground";
import { PAPER, PAPER_DIM, BLUE_BRIGHT, LINE, FONT } from "@/components/experience/theme";

type Strength = { level: 0 | 1 | 2 | 3; label: "" | "Weak" | "Medium" | "Strong"; color: string };

function evalPwd(pw: string): Strength {
  if (!pw) return { level: 0, label: "", color: LINE };
  const hasNum = /\d/.test(pw);
  const hasSym = /[^A-Za-z0-9]/.test(pw);
  const hasUpper = /[A-Z]/.test(pw);
  if (pw.length >= 8 && ((hasNum && hasSym) || hasUpper)) return { level: 3, label: "Strong", color: "#22C55E" };
  if (pw.length >= 6 || hasNum || hasSym) return { level: 2, label: "Medium", color: "#F59E0B" };
  return { level: 1, label: "Weak", color: "#EF4444" };
}

export default function SignUp() {
  const navigate = useNavigate();
  const [showPwd, setShowPwd] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [pwd, setPwd] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const strength = useMemo(() => evalPwd(pwd), [pwd]);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (submitting) return;
    if (!name.trim()) return toast.error("Enter your first name");
    setSubmitting(true);
    const { data, error } = await signUpWithEmail({
      email,
      password: pwd,
      name: name.trim(),
    });
    setSubmitting(false);
    if (error) {
      const msg = (error.message || "").toLowerCase();
      if (msg.includes("already") || msg.includes("registered") || msg.includes("exists")) {
        toast.error("This email is already registered. Please sign in instead.");
        navigate("/signin");
        return;
      }
      toast.error(error.message || "Couldn't create account");
      return;
    }
    if (data.session) {
      toast.success("Welcome to WorthScope!");
      notifyWelcome(name.trim()).catch(() => {});
      navigate("/onboarding");
    } else {
      toast.success("Account created. Please check your email to verify, then sign in.");
      navigate("/signin");
    }
  };

  const barColor = (idx: number) => (strength.level > idx ? strength.color : LINE);

  return (
    <div style={{ minHeight: "100vh", position: "relative", fontFamily: FONT, color: PAPER, overflowX: "clip" as "hidden" }}>
      <AmbientBackground />
      <SEO
        title="Create Account — WorthScope"
        description="Create your free WorthScope account to start the career assessment and build a personalized roadmap."
        path="/signup"
      />
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
          <h1 style={{ fontSize: 32, fontWeight: 700, letterSpacing: -0.8, textAlign: "center", margin: 0, color: PAPER }}>Get Started</h1>
          <p style={{ marginTop: 10, fontSize: 14.5, color: PAPER_DIM, textAlign: "center", marginBottom: 30 }}>
            Discover your <span style={{ color: BLUE_BRIGHT }}>career path</span>
          </p>

          <OAuthButtons redirectPath="/signup" />

          <Field label="First Name">
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter your first name"
              className="ws-input"
              style={inputStyle()}
            />
          </Field>

          <div style={{ height: 16 }} />

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

          <div style={{ height: 16 }} />

          <Field label="Password">
            <div style={{ position: "relative" }}>
              <input
                type={showPwd ? "text" : "password"}
                required
                placeholder="Create a password"
                className="ws-input"
                value={pwd}
                onChange={(e) => setPwd(e.target.value)}
                style={{ ...inputStyle(), paddingRight: 48 }}
              />
              <button type="button" aria-label="Toggle password" onClick={() => setShowPwd((v) => !v)} style={eyeBtn()}>
                <EyeIcon off={!showPwd} />
              </button>
            </div>

            <div style={{ marginTop: 10, display: "flex", gap: 4 }}>
              {[0, 1, 2].map((i) => (
                <div key={i} style={{ flex: 1, height: 3, borderRadius: 2, background: barColor(i), transition: "background 0.2s ease" }} />
              ))}
            </div>
            {strength.label && (
              <div style={{ marginTop: 6, textAlign: "right", fontSize: 11, color: strength.color, fontWeight: 500, animation: "ws-form-in 0.2s ease" }}>
                {strength.label}
              </div>
            )}
          </Field>

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
            {submitting ? "Creating account…" : "Begin Journey"}
          </button>

          <p style={{ marginTop: 20, textAlign: "center", fontSize: 13.5, color: PAPER_DIM }}>
            Already have an account?{" "}
            <Link to="/signin" style={{ color: BLUE_BRIGHT, fontWeight: 600, textDecoration: "none" }}>
              Sign in
            </Link>
          </p>
        </form>
      </div>

      <SharedAuthStyles />
    </div>
  );
}
