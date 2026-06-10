import { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import logo from "@/assets/worthscope-logo.png";
import { Field, inputStyle, eyeBtn, googleBtn, Divider, EyeIcon, GoogleG, SharedAuthStyles } from "./SignIn";
import { SEO } from "@/components/SEO";
import { signUpWithEmail } from "@/lib/authClient";
import { lovable } from "@/integrations/lovable/index";
import { toast } from "sonner";


const ACCENT = "#3498DB";
const TEXT = "#111111";
const TEXT3 = "#9CA3AF";
const BORDER = "#E5E7EB";
const FONT = "'DM Sans', sans-serif";


type Strength = { level: 0 | 1 | 2 | 3; label: "" | "Weak" | "Medium" | "Strong"; color: string };

function evalPwd(pw: string): Strength {
  if (!pw) return { level: 0, label: "", color: BORDER };
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
      toast.error(error.message || "Couldn't create account");
      return;
    }
    if (data.session) {
      // Signup already captured name/age/education, so skip onboarding
      // and send the user straight into the assessment.
      navigate("/assessment");
    } else {
      toast.success("Check your email to confirm your account.");
      navigate("/signin");
    }
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
    navigate("/assessment");
  };


  const barColor = (idx: number) => (strength.level > idx ? strength.color : BORDER);

  return (
    <div style={{ minHeight: "100vh", background: "#fff", fontFamily: FONT, color: TEXT, position: "relative" }}>
      <SEO
        title="Create Account — WorthScope"
        description="Create your free WorthScope account to start the career assessment and build a personalized roadmap."
        path="/signup"
      />
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
            Discover your <span style={{ color: ACCENT }}>career path</span>
          </p>

          <Field label="First Name">
            <input type="text" required value={name} onChange={(e) => setName(e.target.value)}
              placeholder="Enter your first name" className="ws-input" style={inputStyle()} />
          </Field>

          <div style={{ height: 16 }} />

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
            <Field label="Age">
              <input type="number" min={13} max={99} required value={age}
                onChange={(e) => setAge(e.target.value)}
                placeholder="e.g. 16" className="ws-input" style={inputStyle()} />
            </Field>
            <Field label="Education level">
              <select required value={educationLevel} onChange={(e) => setEducationLevel(e.target.value)}
                className="ws-input" style={{ ...inputStyle(), appearance: "none", paddingRight: 36, cursor: "pointer" }}>
                <option value="" disabled>Select…</option>
                {EDUCATION_OPTIONS.map((o) => <option key={o} value={o}>{o}</option>)}
              </select>
            </Field>
          </div>

          <div style={{ height: 16 }} />

          <Field label="Email Address">
            <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email address" className="ws-input" style={inputStyle()} />
          </Field>

          <div style={{ height: 16 }} />

          <Field label="Password">
            <div style={{ position: "relative" }}>
              <input
                type={showPwd ? "text" : "password"} required placeholder="Create a password" className="ws-input"
                value={pwd} onChange={(e) => setPwd(e.target.value)}
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
              marginTop: 28, width: "100%", height: 56, background: ACCENT, color: "#fff",
              border: "none", borderRadius: 14, fontFamily: FONT, fontWeight: 700, fontSize: 17,
              cursor: submitting ? "wait" : "pointer", transition: "all 0.2s ease",
              opacity: submitting ? 0.7 : 1,
            }}
          >
            {submitting ? "Creating account…" : "Begin Journey"}
          </button>

          <Divider />

          <button type="button" onClick={onGoogle} className="ws-google" style={googleBtn()}>
            <GoogleG />
            <span>Continue with Google</span>
          </button>

          <p style={{ marginTop: 20, textAlign: "center", fontSize: 14, color: TEXT }}>
            Already have an account?{" "}
            <Link to="/signin" style={{ color: ACCENT, fontWeight: 600, textDecoration: "none" }}>
              Sign in
            </Link>
          </p>
        </form>
      </div>

      <SharedAuthStyles />
    </div>
  );
}
