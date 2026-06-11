import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Sidebar } from "@/components/dashboard/Sidebar";
import { TopBar } from "@/components/dashboard/TopBar";
import { MobileTabBar } from "@/components/dashboard/MobileTabBar";
import { InviteParentModal } from "@/components/parent/InviteParentModal";
import { getProfile } from "@/lib/userState";
import { SEO } from "@/components/SEO";
import { UserAvatar, gradientFor } from "@/components/UserAvatar";
import { KokoAvatar, KOKO_AVATARS } from "@/components/koko/KokoAvatar";
import { supabase } from "@/integrations/supabase/client";
import {
  useUserProfile,
  updateKokoAvatar,
  setAvatarUrl,
  loadUserProfile,
  setOnboardingTourCompleted,
  type KokoAvatarKey,
} from "@/lib/profileStore";
import {
  listParentInvites,
  revokeParentInvite,
  type ParentInviteRow,
} from "@/lib/parentInvite";

/* WorthScope — Settings Page
   5 grouped white cards on a soft-blue page bg.
   Apple-like clean grouping with rows that toggle, edit inline,
   open modals, and fade up on load. */

// ───────── Toggle switch ─────────
const Toggle = ({ on, onChange }: { on: boolean; onChange: () => void }) => (
  <button
    onClick={(e) => {
      e.stopPropagation();
      onChange();
    }}
    aria-pressed={on}
    className="relative h-6 w-11 flex-shrink-0 rounded-full transition-colors duration-200"
    style={{ background: on ? "#3498DB" : "#E5E7EB" }}
  >
    <span
      className="absolute top-[3px] h-[18px] w-[18px] rounded-full bg-white transition-all duration-200"
      style={{
        left: on ? 23 : 3,
        boxShadow: "0 1px 4px rgba(0,0,0,0.2)",
      }}
    />
  </button>
);

// ───────── Chevron ─────────
const Chev = ({ color = "#9CA3AF" }: { color?: string }) => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="m9 6 6 6-6 6" />
  </svg>
);

// ───────── Group label ─────────
const GroupLabel = ({ children }: { children: React.ReactNode }) => (
  <div className="mb-2 text-[11px] font-semibold uppercase tracking-[1.5px] text-[#9CA3AF]">
    {children}
  </div>
);

// ───────── Row shell ─────────
type RowProps = {
  icon: React.ReactNode;
  iconBg?: string;
  label: string;
  sub?: string;
  right: React.ReactNode;
  onClick?: () => void;
  danger?: boolean;
  hasBorder?: boolean;
};
const Row = ({ icon, iconBg = "#EBF5FB", label, sub, right, onClick, danger, hasBorder = true }: RowProps) => (
  <div
    onClick={onClick}
    className="flex cursor-pointer items-center justify-between px-5 py-3.5 transition-colors"
    style={{
      borderBottom: hasBorder ? "1px solid #E5E7EB" : "none",
      minHeight: 56,
    }}
    onMouseEnter={(e) => (e.currentTarget.style.background = danger ? "rgba(239,68,68,0.04)" : "#F9FAFB")}
    onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
  >
    <div className="flex min-w-0 items-center">
      <div className="grid h-8 w-8 flex-shrink-0 place-items-center rounded-full" style={{ background: iconBg }}>
        {icon}
      </div>
      <div className="ml-3 min-w-0">
        <div className="text-[15px] font-medium" style={{ color: danger ? "#EF4444" : "#111" }}>
          {label}
        </div>
        {sub && <div className="mt-0.5 truncate text-[12px] text-[#9CA3AF]">{sub}</div>}
      </div>
    </div>
    <div className="ml-3 flex flex-shrink-0 items-center gap-2">{right}</div>
  </div>
);

// ───────── Modal ─────────
const Modal = ({
  open,
  onClose,
  children,
}: {
  open: boolean;
  onClose: () => void;
  children: React.ReactNode;
}) => {
  if (!open) return null;
  return (
    <div
      className="fixed inset-0 z-[600] flex items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.3)", backdropFilter: "blur(4px)", animation: "ws-koko-fade 0.25s ease both" }}
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-[480px] rounded-[20px] bg-white p-8"
        style={{ animation: "ws-modal-in 0.25s ease-out both" }}
      >
        <button
          onClick={onClose}
          className="absolute right-4 top-4 text-[#9CA3AF] hover:text-[#111]"
          aria-label="Close"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <path d="M6 6l12 12M18 6 6 18" />
          </svg>
        </button>
        {children}
      </div>
    </div>
  );
};

// ───────── Inline edit row ─────────
const EditableRow = ({
  icon,
  label,
  value,
  onSave,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  onSave: (v: string) => void;
}) => {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(value);
  return (
    <div className="border-b border-[#E5E7EB] px-5 py-3.5 transition-colors hover:bg-[#F9FAFB]" style={{ minHeight: 56 }}>
      <div className="flex items-center justify-between">
        <div className="flex min-w-0 items-center">
          <div className="grid h-8 w-8 flex-shrink-0 place-items-center rounded-full bg-[#EBF5FB]">{icon}</div>
          <div className="ml-3 min-w-0">
            <div className="text-[15px] font-medium text-[#111]">{label}</div>
            {editing ? (
              <input
                autoFocus
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                className="mt-1 w-full rounded-md border border-[#3498DB] px-2 py-1 text-[13px] text-[#111] outline-none"
                style={{ boxShadow: "0 0 0 3px rgba(52,152,219,0.15)" }}
              />
            ) : (
              <div className="mt-0.5 truncate text-[12px] text-[#9CA3AF]">{value}</div>
            )}
          </div>
        </div>
        {editing ? (
          <div className="ml-3 flex gap-2" style={{ animation: "ws-koko-fade 0.2s ease both" }}>
            <button
              onClick={() => {
                setDraft(value);
                setEditing(false);
              }}
              className="text-[13px] font-medium text-[#6B7280]"
            >
              Cancel
            </button>
            <button
              onClick={() => {
                onSave(draft);
                setEditing(false);
              }}
              className="text-[13px] font-semibold text-[#3498DB]"
            >
              Save
            </button>
          </div>
        ) : (
          <button onClick={() => setEditing(true)} className="ml-3 flex items-center gap-2">
            <span className="hidden text-[13px] text-[#9CA3AF] sm:inline">{value.length > 24 ? value.slice(0, 24) + "…" : value}</span>
            <Chev />
          </button>
        )}
      </div>
    </div>
  );
};

// ───────── Page ─────────
const Settings = () => {
  // Profile — pulled from real user state
  const profile = getProfile();
  const initialName = profile ? `${profile.firstName}${profile.lastName ? " " + profile.lastName : ""}` : "";
  const initialEdu = profile
    ? profile.educationLevel === "secondary"
      ? `Secondary School${profile.classOrLevel ? " · " + profile.classOrLevel : ""}`
      : profile.educationLevel === "university"
      ? `University${profile.classOrLevel ? " · " + profile.classOrLevel : ""}`
      : ""
    : "";
  const [name, setName] = useState(initialName);
  const [email, setEmail] = useState(profile?.email || "");
  const [edu, setEdu] = useState(initialEdu);

  // Appearance — Dark mode is "coming soon": always off, shows toast
  const [dark, setDark] = useState(false);
  const [compact, setCompact] = useState(false);

  // Ensure light mode is always applied
  useEffect(() => {
    document.documentElement.classList.remove("dark");
    localStorage.setItem("worthscope_theme", "light");
  }, []);

  const handleDarkToggle = () => {
    // Briefly animate ON then snap back OFF
    setDark(true);
    toast("Dark mode is coming soon 🌙", {
      style: {
        background: "#1A1A2E",
        color: "#FFFFFF",
        fontWeight: 500,
        fontSize: 13,
        borderRadius: 10,
        padding: "10px 20px",
        border: "none",
      },
      duration: 3000,
    });
    window.setTimeout(() => setDark(false), 500);
  };

  // Notifications
  const [missionRem, setMissionRem] = useState(true);
  const [streakRem, setStreakRem] = useState(true);
  const [progressUp, setProgressUp] = useState(true);

  // Modals
  const [dataModal, setDataModal] = useState(false);
  const [deleteModal, setDeleteModal] = useState(false);
  const [logoutModal, setLogoutModal] = useState(false);
  const [inviteOpen, setInviteOpen] = useState(false);
  const [parentInvites, setParentInvites] = useState<ParentInviteRow[]>([]);
  const [revokingId, setRevokingId] = useState<string | null>(null);
  const [deleteConfirmText, setDeleteConfirmText] = useState("");
  const [deleting, setDeleting] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);
  const navigate = useNavigate();

  const refreshInvites = async () => {
    const rows = await listParentInvites();
    setParentInvites(rows.filter((r) => !r.revoked_at));
  };

  useEffect(() => { refreshInvites(); }, []);

  const formatViewed = (iso: string | null) => {
    if (!iso) return "Not yet viewed";
    const diff = Date.now() - new Date(iso).getTime();
    const d = Math.floor(diff / 86400000);
    if (d <= 0) return "Viewed today";
    if (d === 1) return "Viewed yesterday";
    if (d < 7) return `Viewed ${d} days ago`;
    return `Viewed on ${new Date(iso).toLocaleDateString()}`;
  };

  const handleLogout = async () => {
    setLoggingOut(true);
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      try {
        Object.keys(localStorage)
          .filter((k) => k.startsWith("worthscope_"))
          .forEach((k) => localStorage.removeItem(k));
      } catch {}
      setLogoutModal(false);
      navigate("/signin", { replace: true });
    } catch {
      toast.error("Couldn't log you out. Please try again.");
    } finally {
      setLoggingOut(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (deleteConfirmText !== "DELETE") return;
    setDeleting(true);
    try {
      const { data: sessionData } = await supabase.auth.getSession();
      const token = sessionData.session?.access_token;
      if (!token) throw new Error("no-session");
      const { data, error } = await supabase.functions.invoke("delete-user-account", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (error || (data as any)?.error) throw error || new Error((data as any).error);
      try {
        Object.keys(localStorage)
          .filter((k) => k.startsWith("worthscope_"))
          .forEach((k) => localStorage.removeItem(k));
      } catch {}
      await supabase.auth.signOut();
      setDeleteModal(false);
      toast.success("Your account has been deleted. We're sorry to see you go.");
      navigate("/", { replace: true });
    } catch {
      toast.error("Couldn't delete your account right now. Please contact support.");
    } finally {
      setDeleting(false);
    }
  };


  // Password form
  const [showPw, setShowPw] = useState(false);

  // ───── Avatar + Koko avatar wiring ─────
  const userProfile = useUserProfile();
  useEffect(() => { loadUserProfile(); }, []);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  const handleAvatarClick = () => fileInputRef.current?.click();

  const handleAvatarFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    const okTypes = ["image/jpeg", "image/png", "image/webp", "image/jpg"];
    if (!okTypes.includes(file.type)) {
      toast.error("Please use a JPG, PNG, or WebP image.");
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      toast.error("Image is larger than 2 MB.");
      return;
    }
    setUploading(true);
    try {
      const { data: u } = await supabase.auth.getUser();
      if (!u.user) throw new Error("Not signed in.");
      const ext = file.name.split(".").pop()?.toLowerCase() || "jpg";
      const path = `${u.user.id}/avatar.${ext}`;
      const { error: upErr } = await supabase.storage
        .from("profile-pictures")
        .upload(path, file, { upsert: true, contentType: file.type });
      if (upErr) throw upErr;
      const ok = await setAvatarUrl(path);
      if (!ok) throw new Error("Save failed");
      toast.success("Profile photo updated");
    } catch (err) {
      console.error(err);
      toast.error("Couldn't upload your photo. Try again.");
    } finally {
      setUploading(false);
    }
  };

  const handleKokoSelect = async (key: KokoAvatarKey) => {
    const ok = await updateKokoAvatar(key);
    if (!ok) toast.error("Couldn't update Koko's look. Try again.");
  };

  const selectedKoko: KokoAvatarKey = userProfile?.koko_avatar || "robot";
  const displayName = userProfile?.name || initialName || "User";


  // Page-level overrides removed — global .dark tokens now drive all surfaces
  const pageBg = "hsl(var(--background))";
  const cardBg = "hsl(var(--bg-card))";
  const textColor = "hsl(var(--foreground))";

  return (
    <div className="min-h-screen font-poppins" style={{ background: pageBg, color: textColor, transition: "all 0.3s ease" }}>
      <SEO
        title="Settings — WorthScope"
        description="Manage notifications, preferences, and account settings for WorthScope."
        path="/settings"
      />
      <Sidebar activePath="/settings" />

      <div className="md:ml-[220px]">
        <TopBar title="Settings" />

        <main className="mx-auto w-full max-w-[720px] px-4 pb-24 pt-10 md:px-8">
          {/* ───── Profile header ───── */}
          <div className="ws-fade-up mb-8 flex items-center justify-between" style={{ animationDelay: "0s" }}>
            <div className="flex items-center">
              <button
                onClick={handleAvatarClick}
                aria-label="Change profile picture"
                className="group relative grid h-20 w-20 place-items-center overflow-hidden rounded-full"
                style={{
                  background: gradientFor(displayName),
                  cursor: "pointer",
                  border: "none",
                  padding: 0,
                }}
              >
                <UserAvatar size={80} fallbackInitial={(displayName[0] || "U").toUpperCase()} fallbackName={displayName} />
                <div
                  className="absolute inset-0 grid place-items-center opacity-0 transition-opacity duration-200 group-hover:opacity-100"
                  style={{ background: "rgba(0,0,0,0.45)", borderRadius: "50%" }}
                >
                  {uploading ? (
                    <div
                      className="h-6 w-6 animate-spin rounded-full border-2 border-white border-t-transparent"
                      aria-label="Uploading"
                    />
                  ) : (
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
                      <circle cx="12" cy="13" r="4" />
                    </svg>
                  )}
                </div>
                {uploading && (
                  <div className="absolute inset-0 grid place-items-center" style={{ background: "rgba(0,0,0,0.45)", borderRadius: "50%" }}>
                    <div className="h-6 w-6 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  </div>
                )}
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/png,image/jpeg,image/webp"
                className="hidden"
                onChange={handleAvatarFile}
              />
              <div className="ml-4">
                <div className="text-[22px] font-bold" style={{ color: textColor }}>
                  {name.split(" ")[0]}
                </div>
                <div className="text-[14px] text-[#6B7280]">{email}</div>
                <div className="text-[13px] text-[#9CA3AF]">{edu}</div>
              </div>
            </div>
            <button
              onClick={handleAvatarClick}
              className="rounded-[10px] px-5 py-2.5 text-[13px] font-medium transition-colors"
              style={{
                background: "rgba(137,90,246,0.1)",
                border: "1px solid rgba(137,90,246,0.25)",
                color: "#895AF6",
              }}
            >
              {uploading ? "Uploading…" : "Change Photo"}
            </button>
          </div>

          {/* ───── Koko's Avatar (new) ───── */}
          <section className="ws-fade-up mb-5" style={{ animationDelay: "0.05s" }}>
            <GroupLabel>Koko's Avatar</GroupLabel>
            <div
              className="overflow-hidden rounded-[18px] border border-[#E5E7EB] p-5"
              style={{ background: cardBg, boxShadow: "0 2px 12px rgba(0,0,0,0.04)" }}
            >
              <div className="text-[13px] text-[#6B7280]">
                Choose how Koko looks across your dashboard
              </div>
              <div className="mt-4 flex flex-wrap gap-3">
                {(Object.keys(KOKO_AVATARS) as KokoAvatarKey[]).map((key) => {
                  const meta = KOKO_AVATARS[key];
                  const active = selectedKoko === key;
                  return (
                    <button
                      key={key}
                      onClick={() => handleKokoSelect(key)}
                      aria-pressed={active}
                      title={meta.label}
                      className="relative grid place-items-center rounded-full transition-all duration-150 hover:scale-[1.05]"
                      style={{
                        width: 72,
                        height: 72,
                        borderRadius: "50%",
                        border: active ? "3px solid #895AF6" : "1px solid #E5E7EB",
                        background: "white",
                        boxShadow: active ? "0 0 0 6px rgba(137,90,246,0.18)" : "0 1px 4px rgba(0,0,0,0.04)",
                        cursor: "pointer",
                      }}
                    >
                      <KokoAvatar size={56} avatarKey={key} />
                    </button>
                  );
                })}
              </div>
              <div className="mt-4 text-[12px] text-[#6B7280]">
                Currently selected: <span style={{ color: "#895AF6", fontWeight: 600 }}>{KOKO_AVATARS[selectedKoko].label}</span>
              </div>
            </div>
          </section>

          {/* ───── Group 1: Profile ───── */}
          <section className="ws-fade-up mb-5" style={{ animationDelay: "0.1s" }}>
            <GroupLabel>Profile</GroupLabel>
            <div className="overflow-hidden rounded-[18px] border border-[#E5E7EB]" style={{ background: cardBg, boxShadow: "0 2px 12px rgba(0,0,0,0.04)" }}>
              <EditableRow
                label="Full Name"
                value={name}
                onSave={setName}
                icon={
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#3498DB" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="8" r="4" />
                    <path d="M4 21c0-4 4-7 8-7s8 3 8 7" />
                  </svg>
                }
              />
              <EditableRow
                label="Email Address"
                value={email}
                onSave={setEmail}
                icon={
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#3498DB" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="5" width="18" height="14" rx="2" />
                    <path d="m3 7 9 6 9-6" />
                  </svg>
                }
              />
              <div className="last:border-b-0">
                <EditableRow
                  label="Education Level"
                  value={edu}
                  onSave={setEdu}
                  icon={
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#3498DB" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M12 3 2 9l10 6 10-6z" />
                      <path d="M6 11v5c2 2 10 2 12 0v-5" />
                    </svg>
                  }
                />
              </div>
            </div>
          </section>

          {/* ───── Group 2: Appearance ───── */}
          <section className="ws-fade-up mb-5" style={{ animationDelay: "0.2s" }}>
            <GroupLabel>Appearance</GroupLabel>
            <div className="overflow-hidden rounded-[18px] border border-[#E5E7EB]" style={{ background: cardBg, boxShadow: "0 2px 12px rgba(0,0,0,0.04)" }}>
              <Row
                icon={
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#6B7280" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z" />
                  </svg>
                }
                iconBg="#F3F4F6"
                label="Dark Mode (Coming Soon)"
                sub="Switch to a darker interface"
                onClick={handleDarkToggle}
                right={<Toggle on={dark} onChange={handleDarkToggle} />}
              />
              <Row
                icon={
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#6B7280" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="3" width="18" height="18" rx="2" />
                    <path d="M3 10h18M10 3v18" />
                  </svg>
                }
                iconBg="#F3F4F6"
                label="Compact View"
                sub="Reduce spacing between elements"
                onClick={() => setCompact((c) => !c)}
                right={<Toggle on={compact} onChange={() => setCompact((c) => !c)} />}
                hasBorder={false}
              />
            </div>
          </section>

          {/* ───── Group 3: Notifications ───── */}
          <section className="ws-fade-up mb-5" style={{ animationDelay: "0.3s" }}>
            <GroupLabel>Notifications</GroupLabel>
            <div className="overflow-hidden rounded-[18px] border border-[#E5E7EB]" style={{ background: cardBg, boxShadow: "0 2px 12px rgba(0,0,0,0.04)" }}>
              <Row
                icon={
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#3498DB" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" />
                    <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" />
                  </svg>
                }
                label="Mission Reminders"
                sub="Get reminded when a mission is waiting"
                onClick={() => setMissionRem((v) => !v)}
                right={<Toggle on={missionRem} onChange={() => setMissionRem((v) => !v)} />}
              />
              <Row
                icon={
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#FB923C" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 2s4 4 4 8a4 4 0 0 1-8 0c0-1.5.5-2.5 1-3 0 2 1 3 2 3 0-3-3-4-3-7 0 0 4 1 4-1z" />
                  </svg>
                }
                iconBg="rgba(251,146,60,0.1)"
                label="Streak Reminders"
                sub="Don't let your streak break"
                onClick={() => setStreakRem((v) => !v)}
                right={<Toggle on={streakRem} onChange={() => setStreakRem((v) => !v)} />}
              />
              <Row
                icon={
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#3498DB" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M4 20V10M10 20V4M16 20v-7M22 20H2" />
                  </svg>
                }
                label="Progress Updates"
                sub="Weekly summary of your skill growth"
                onClick={() => setProgressUp((v) => !v)}
                right={<Toggle on={progressUp} onChange={() => setProgressUp((v) => !v)} />}
                hasBorder={false}
              />
            </div>
          </section>

          {/* ───── Group 4: Privacy ───── */}
          <section className="ws-fade-up mb-5" style={{ animationDelay: "0.4s" }}>
            <GroupLabel>Privacy</GroupLabel>
            <div className="overflow-hidden rounded-[18px] border border-[#E5E7EB]" style={{ background: cardBg, boxShadow: "0 2px 12px rgba(0,0,0,0.04)" }}>
              <Row
                icon={
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#6B7280" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                  </svg>
                }
                iconBg="#F3F4F6"
                label="Data Usage"
                sub="How WorthScope uses your data"
                onClick={() => setDataModal(true)}
                right={<Chev />}
              />
              <Row
                icon={
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#EF4444" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M3 6h18M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
                  </svg>
                }
                iconBg="rgba(239,68,68,0.08)"
                label="Delete Account"
                sub="Permanently remove your account and data"
                danger
                onClick={() => setDeleteModal(true)}
                right={<Chev color="#EF4444" />}
                hasBorder={false}
              />
            </div>
          </section>

          {/* ───── Group 5: Account ───── */}
          <section className="ws-fade-up mb-5" style={{ animationDelay: "0.5s" }}>
            <GroupLabel>Account</GroupLabel>
            <div className="overflow-hidden rounded-[18px] border border-[#E5E7EB]" style={{ background: cardBg, boxShadow: "0 2px 12px rgba(0,0,0,0.04)" }}>
              <Row
                icon={
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#6B7280" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="4" y="11" width="16" height="10" rx="2" />
                    <path d="M8 11V8a4 4 0 0 1 8 0v3" />
                  </svg>
                }
                iconBg="#F3F4F6"
                label="Change Password"
                onClick={() => setShowPw((v) => !v)}
                right={<Chev />}
              />
              {showPw && (
                <div className="space-y-3 border-b border-[#E5E7EB] px-5 py-4" style={{ animation: "ws-koko-fade 0.2s ease both" }}>
                  {["Current Password", "New Password", "Confirm Password"].map((p) => (
                    <input
                      key={p}
                      type="password"
                      placeholder={p}
                      className="w-full rounded-lg border border-[#E5E7EB] bg-white px-3 py-2.5 text-[14px] outline-none transition-all focus:border-[#3498DB]"
                      style={{ boxShadow: "0 0 0 0 transparent" }}
                      onFocus={(e) => (e.currentTarget.style.boxShadow = "0 0 0 3px rgba(52,152,219,0.15)")}
                      onBlur={(e) => (e.currentTarget.style.boxShadow = "0 0 0 0 transparent")}
                    />
                  ))}
                  <button className="w-full rounded-lg bg-[#3498DB] py-2.5 text-[14px] font-semibold text-white transition-colors hover:bg-[#217DBB]">
                    Update Password
                  </button>
                </div>
              )}
              <Row
                icon={
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#EF4444" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                    <path d="m16 17 5-5-5-5M21 12H9" />
                  </svg>
                }
                iconBg="rgba(239,68,68,0.08)"
                label="Log Out"
                danger
                onClick={() => setLogoutModal(true)}
                right={<span />}
                hasBorder={false}
              />
            </div>
          </section>

          {/* ───── Group 6: Family Access ───── */}
          <section className="ws-fade-up mb-5" style={{ animationDelay: "0.6s" }}>
            <GroupLabel>Family Access</GroupLabel>
            <div className="overflow-hidden rounded-[18px] border border-[#E5E7EB]" style={{ background: cardBg, boxShadow: "0 2px 12px rgba(0,0,0,0.04)" }}>
              <Row
                icon={
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#3498DB" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                    <circle cx="9" cy="7" r="4" />
                    <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
                    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                  </svg>
                }
                label="Parent / Guardian Access"
                sub={parentInvites.length === 0
                  ? "Invite someone to view your career progress"
                  : `${parentInvites.length} active invite${parentInvites.length === 1 ? "" : "s"}`}
                onClick={() => setInviteOpen(true)}
                hasBorder={parentInvites.length > 0}
                right={
                  <button
                    onClick={(e) => { e.stopPropagation(); setInviteOpen(true); }}
                    className="rounded-[8px] font-medium transition-colors"
                    style={{
                      background: "#EBF5FB",
                      border: "1px solid rgba(52,152,219,0.3)",
                      color: "#3498DB",
                      fontSize: 12,
                      padding: "6px 14px",
                    }}
                  >
                    {parentInvites.length === 0 ? "Invite" : "Re-invite"}
                  </button>
                }
              />

              {parentInvites.map((inv, idx) => (
                <div
                  key={inv.id}
                  className="flex items-center justify-between"
                  style={{
                    padding: "14px 18px",
                    borderTop: idx === 0 ? "1px solid #F3F4F6" : "1px solid #F3F4F6",
                    gap: 12,
                  }}
                >
                  <div style={{ minWidth: 0, flex: 1 }}>
                    <div style={{ fontSize: 13, fontWeight: 600, color: "#111", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {inv.parent_email || inv.parent_label || "Shared link"}
                    </div>
                    <div style={{ fontSize: 11, color: "#9CA3AF", marginTop: 2 }}>
                      {formatViewed(inv.last_viewed_at)} · Expires {new Date(inv.expires_at).toLocaleDateString()}
                    </div>
                  </div>
                  <button
                    disabled={revokingId === inv.id}
                    onClick={async () => {
                      setRevokingId(inv.id);
                      const ok = await revokeParentInvite(inv.id);
                      setRevokingId(null);
                      if (ok) {
                        toast.success("Access removed.");
                        refreshInvites();
                      } else {
                        toast.error("Could not remove access.");
                      }
                    }}
                    className="rounded-[8px] font-medium transition-colors"
                    style={{
                      background: "rgba(239,68,68,0.08)",
                      border: "1px solid rgba(239,68,68,0.25)",
                      color: "#EF4444",
                      fontSize: 12,
                      padding: "6px 12px",
                      cursor: revokingId === inv.id ? "wait" : "pointer",
                      flexShrink: 0,
                    }}
                  >
                    {revokingId === inv.id ? "Removing…" : "Remove access"}
                  </button>
                </div>
              ))}
            </div>
          </section>


          {/* ───── Group 7: Help ───── */}
          <section className="ws-fade-up mb-5" style={{ animationDelay: "0.7s" }}>
            <GroupLabel>Help</GroupLabel>
            <div
              className="overflow-hidden rounded-[18px] border border-[#E5E7EB]"
              style={{ background: cardBg, boxShadow: "0 2px 12px rgba(0,0,0,0.04)" }}
            >
              <Row
                icon={
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#895AF6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10" />
                    <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
                    <path d="M12 17h.01" />
                  </svg>
                }
                iconBg="rgba(137,90,246,0.12)"
                label="Replay onboarding tour"
                sub="Take Koko's quick walkthrough of your dashboard again"
                onClick={async () => {
                  await setOnboardingTourCompleted(false);
                  toast.success("Tour will restart on your dashboard.");
                  setTimeout(() => {
                    window.location.href = "/dashboard";
                  }, 600);
                }}
                hasBorder={false}
                right={<Chev />}
              />
            </div>
          </section>
        </main>
      </div>

      <InviteParentModal open={inviteOpen} onClose={() => setInviteOpen(false)} />

      <MobileTabBar />

      {/* ───── Modals ───── */}
      <Modal open={dataModal} onClose={() => setDataModal(false)}>
        <h3 className="text-[20px] font-bold text-[#111]">How We Use Your Data</h3>
        <div className="mt-4 space-y-3 text-[14px] leading-relaxed text-[#6B7280]">
          <p>We collect what you tell us during the assessment — your interests, education level, and goals — so we can build a roadmap that actually fits you.</p>
          <p>We track your progress on missions to keep your streak, unlock new content, and personalise Koko's suggestions. Nothing more.</p>
          <p>Your data is never sold. You can delete your account at any time, and everything tied to it goes with it.</p>
        </div>
        <button
          onClick={() => setDataModal(false)}
          className="mt-6 w-full rounded-lg bg-[#3498DB] py-3 text-[14px] font-semibold text-white hover:bg-[#217DBB]"
        >
          Got it
        </button>
      </Modal>

      <Modal open={deleteModal} onClose={() => { setDeleteModal(false); setDeleteConfirmText(""); }}>
        <h3 className="text-[20px] font-bold text-[#111]">Delete your account?</h3>
        <p className="mt-3 text-[14px] text-[#6B7280]">
          This will permanently delete your account, your roadmap, your progress, and everything Koko has created for you. This cannot be undone.
        </p>
        <p className="mt-4 text-[13px] font-medium text-[#374151]">
          Type <span className="font-bold text-[#EF4444]">DELETE</span> to confirm:
        </p>
        <input
          type="text"
          value={deleteConfirmText}
          onChange={(e) => setDeleteConfirmText(e.target.value)}
          placeholder="DELETE"
          autoFocus={false}
          className="mt-2 w-full rounded-lg border border-[#E5E7EB] bg-white px-3 py-2.5 text-[14px] outline-none focus:border-[#EF4444]"
        />
        <div className="mt-6 flex gap-3">
          <button
            autoFocus
            onClick={() => { setDeleteModal(false); setDeleteConfirmText(""); }}
            className="flex-1 rounded-lg border border-[#E5E7EB] bg-white py-2.5 text-[14px] font-medium text-[#6B7280] hover:bg-[#F9FAFB]"
          >
            Cancel
          </button>
          <button
            onClick={handleDeleteAccount}
            disabled={deleteConfirmText !== "DELETE" || deleting}
            className="flex-1 rounded-lg bg-[#EF4444] py-2.5 text-[14px] font-semibold text-white transition-opacity hover:bg-[#dc2626] disabled:cursor-not-allowed disabled:opacity-40"
          >
            {deleting ? "Deleting…" : "Permanently delete account"}
          </button>
        </div>
      </Modal>

      <Modal open={logoutModal} onClose={() => setLogoutModal(false)}>
        <h3 className="text-[20px] font-bold text-[#111]">Are you sure you want to log out?</h3>
        <p className="mt-3 text-[14px] text-[#6B7280]">You can log back in any time to continue your journey.</p>
        <div className="mt-6 flex gap-3">
          <button onClick={() => setLogoutModal(false)} className="flex-1 rounded-lg border border-[#E5E7EB] bg-white py-2.5 text-[14px] font-medium text-[#6B7280] hover:bg-[#F9FAFB]">
            Cancel
          </button>
          <button
            onClick={handleLogout}
            disabled={loggingOut}
            className="flex-1 rounded-lg bg-[#EF4444] py-2.5 text-[14px] font-semibold text-white hover:bg-[#dc2626] disabled:opacity-50"
          >
            {loggingOut ? "Logging out…" : "Log Out"}
          </button>
        </div>
      </Modal>

    </div>
  );
};

export default Settings;
