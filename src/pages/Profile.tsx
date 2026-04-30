import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Sidebar } from "@/components/dashboard/Sidebar";
import { TopBar } from "@/components/dashboard/TopBar";
import { MobileTabBar } from "@/components/dashboard/MobileTabBar";
import { getProfile, saveProfile } from "@/lib/userState";
import { toast } from "sonner";

const SECONDARY_OPTS = ["SS1", "SS2", "SS3"];
const UNI_OPTS = ["100 Level", "200 Level", "300 Level", "400 Level", "500 Level"];

const Profile = () => {
  const navigate = useNavigate();
  const initial = getProfile() || {
    fullName: "",
    firstName: "",
    lastName: "",
    email: "",
    age: "" as number | "",
    educationLevel: "" as "secondary" | "university" | "",
    classOrLevel: "",
  };

  const [firstName, setFirstName] = useState(initial.firstName || "");
  const [lastName, setLastName] = useState(
    initial.lastName ?? (initial.fullName?.split(/\s+/).slice(1).join(" ") || ""),
  );
  const [email, setEmail] = useState(initial.email || "");
  const [age, setAge] = useState<number | "">(initial.age ?? "");
  const [edu, setEdu] = useState<"secondary" | "university" | "">(initial.educationLevel || "");
  const [cls, setCls] = useState(initial.classOrLevel || "");

  const initials = (firstName?.[0] || "U").toUpperCase() + (lastName?.[0] || "").toUpperCase();
  const yearOptions = edu === "secondary" ? SECONDARY_OPTS : edu === "university" ? UNI_OPTS : [];

  const onSave = () => {
    if (!firstName.trim()) {
      toast.error("First name is required");
      return;
    }
    saveProfile({
      fullName: [firstName.trim(), lastName.trim()].filter(Boolean).join(" "),
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      email: email.trim(),
      age: typeof age === "number" ? age : "",
      educationLevel: edu,
      classOrLevel: cls,
    });
    toast.success("Profile updated ✓");
    setTimeout(() => navigate("/dashboard"), 600);
  };

  return (
    <div className="min-h-screen bg-background font-poppins text-foreground">
      <Sidebar activePath="/profile" />
      <div className="md:ml-[220px]">
        <TopBar title="Profile" />
        <main className="mx-auto w-full max-w-[720px] px-4 pb-24 pt-10 md:px-8">
          <button
            onClick={() => navigate("/dashboard")}
            className="mb-6 text-[13px] font-medium text-text2 hover:text-accent"
          >
            ← Back to Dashboard
          </button>

          <div className="mb-8 flex items-center gap-5">
            <div
              className="grid h-16 w-16 place-items-center rounded-full text-[22px] font-bold text-white"
              style={{ background: "linear-gradient(135deg,#3498DB,#5DADE2)" }}
            >
              {initials}
            </div>
            <div>
              <div className="text-[22px] font-bold">{firstName || "Your name"}</div>
              <button
                className="mt-1 text-[12px] font-medium text-accent hover:underline"
                onClick={() => toast("Photo uploads — coming soon")}
              >
                Change Photo
              </button>
            </div>
          </div>

          <div className="rounded-[18px] border border-border bg-card p-6 shadow-card">
            <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
              <Field label="First Name">
                <input className={inputCls} value={firstName} onChange={(e) => setFirstName(e.target.value)} />
              </Field>
              <Field label="Last Name">
                <input className={inputCls} value={lastName} onChange={(e) => setLastName(e.target.value)} />
              </Field>
              <Field label="Email Address (locked)">
                <input className={inputCls + " opacity-60"} value={email} disabled placeholder="—" />
              </Field>
              <Field label="Age">
                <input
                  type="number"
                  min={12}
                  max={35}
                  className={inputCls}
                  value={age === "" ? "" : age}
                  onChange={(e) => setAge(e.target.value === "" ? "" : Number(e.target.value))}
                />
              </Field>
              <Field label="Education Level">
                <div className="flex gap-2">
                  {(["secondary", "university"] as const).map((opt) => (
                    <button
                      key={opt}
                      type="button"
                      onClick={() => {
                        setEdu(opt);
                        setCls("");
                      }}
                      className={[
                        "h-11 flex-1 rounded-xl border text-[13px] font-medium transition-colors",
                        edu === opt
                          ? "border-accent bg-accent/10 text-accent"
                          : "border-border bg-card text-foreground hover:border-accent/40",
                      ].join(" ")}
                    >
                      {opt === "secondary" ? "🎒 Secondary" : "🎓 University"}
                    </button>
                  ))}
                </div>
              </Field>
              {edu && (
                <Field label={edu === "secondary" ? "Class" : "Level"}>
                  <select
                    className={inputCls}
                    value={cls}
                    onChange={(e) => setCls(e.target.value)}
                  >
                    <option value="">Select…</option>
                    {yearOptions.map((y) => (
                      <option key={y} value={y}>
                        {y}
                      </option>
                    ))}
                  </select>
                </Field>
              )}
            </div>

            <button
              onClick={onSave}
              className="mt-7 w-full rounded-xl bg-accent px-5 py-3 text-[15px] font-semibold text-white transition-colors hover:bg-accent-dark"
              style={{ background: "#3498DB" }}
            >
              Save Changes
            </button>
          </div>
        </main>
      </div>
      <MobileTabBar />
    </div>
  );
};

const inputCls =
  "h-11 w-full rounded-xl border border-border bg-card px-3 text-[14px] text-foreground outline-none transition-colors focus:border-accent";

const Field = ({ label, children }: { label: string; children: React.ReactNode }) => (
  <label className="block">
    <span className="mb-1.5 block text-[12px] font-semibold text-text2">{label}</span>
    {children}
  </label>
);

export default Profile;
