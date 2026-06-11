import { useEffect, useMemo, useState } from "react";
import {
  createParentInviteRemote,
  buildInviteUrl,
  type ParentInviteRow,
} from "@/lib/parentInvite";
import { useUserProfile } from "@/lib/profileStore";

const UsersIcon = ({ size = 24, color = "#3498DB" }: { size?: number; color?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
    <circle cx="9" cy="7" r="4" />
    <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
  </svg>
);

export const InviteParentModal = ({
  open,
  onClose,
  onInvited,
}: {
  open: boolean;
  onClose: () => void;
  onInvited?: () => void;
}) => {
  const [email, setEmail] = useState("");
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [copied, setCopied] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [invite, setInvite] = useState<ParentInviteRow | null>(null);
  const [creating, setCreating] = useState(false);
  const profile = useUserProfile();

  // Generate a fresh invite token whenever the modal opens
  useEffect(() => {
    let cancelled = false;
    if (open) {
      setCreating(true);
      createParentInviteRemote({}).then((row) => {
        if (cancelled) return;
        setInvite(row);
        setCreating(false);
        if (row) onInvited?.();
      });
    } else {
      setEmail("");
      setSending(false);
      setSent(false);
      setCopied(false);
      setShowToast(false);
      setInvite(null);
      setCreating(false);
    }
    return () => { cancelled = true; };
  }, [open, onInvited]);

  const studentFirstName = useMemo(() => {
    const n = profile?.name || "";
    return n.trim().split(/\s+/)[0] || "";
  }, [profile?.name]);

  const link = invite ? buildInviteUrl(invite.token) : "";

  const handleSend = async () => {
    if (!email || sending || sent) return;
    setSending(true);
    // Re-issue invite with email attached so we can show it in the list
    const row = await createParentInviteRemote({ email });
    if (!row) { setSending(false); return; }
    setInvite(row);
    onInvited?.();
    const url = buildInviteUrl(row.token);

    const subject = encodeURIComponent(`${studentFirstName || "Your child"} invited you to view their career journey on WorthScope`);
    const body = encodeURIComponent(
      `Hi,\n\n${studentFirstName || "Your child"} would like to share their career journey with you on WorthScope.\n\nView their progress (read-only) here:\n${url}\n\n— WorthScope`,
    );

    setTimeout(() => {
      window.location.href = `mailto:${encodeURIComponent(email)}?subject=${subject}&body=${body}`;
      setSending(false);
      setSent(true);
      setTimeout(() => onClose(), 2200);
    }, 400);
  };

  const handleCopy = async () => {
    if (!link) return;
    try {
      await navigator.clipboard.writeText(link);
      setCopied(true);
      setShowToast(true);
      setTimeout(() => setCopied(false), 1500);
      setTimeout(() => setShowToast(false), 2000);
    } catch { /* noop */ }
  };

  const handleWhatsApp = () => {
    if (!link) return;
    const text = encodeURIComponent(
      `${studentFirstName || "Your child"} invited you to view their career journey on WorthScope (read-only): ${link}`,
    );
    window.open(`https://wa.me/?text=${text}`, "_blank", "noopener,noreferrer");
  };

  if (!open) return null;

  const sendBg = sent ? "#22C55E" : !email || creating ? "#E5E7EB" : "#3498DB";
  const sendColor = (!email || creating) && !sent ? "#9CA3AF" : "#FFFFFF";
  const sendLabel = sent ? "Invite Sent! ✓" : sending ? "Sending..." : "Send Invite";

  return (
    <div
      className="fixed inset-0 z-[600] flex items-center justify-center p-4 font-poppins"
      style={{ background: "rgba(0,0,0,0.35)", backdropFilter: "blur(4px)", animation: "ws-koko-fade 0.25s ease both" }}
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-[460px] rounded-[20px] bg-white"
        style={{
          padding: "36px 32px",
          boxShadow: "0 20px 60px rgba(0,0,0,0.15)",
          animation: "ws-modal-in 0.25s ease-out both",
        }}
      >
        <button
          onClick={onClose}
          aria-label="Close"
          className="absolute right-3 top-3 grid h-8 w-8 place-items-center rounded-md text-[#9CA3AF] transition-colors hover:bg-[#F4F9FE] hover:text-[#111]"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <path d="M6 6l12 12M18 6 6 18" />
          </svg>
        </button>

        <div className="mb-4 flex justify-center">
          <UsersIcon size={40} />
        </div>

        <h2 className="text-center font-bold text-[#111]" style={{ fontSize: 22, letterSpacing: "-0.3px" }}>
          Invite a Parent or Guardian
        </h2>
        <p
          className="mx-auto mt-2 text-center text-[14px] text-[#6B7280]"
          style={{ lineHeight: 1.65, maxWidth: 360, marginBottom: 28 }}
        >
          They'll get a private link to view your career results, roadmap progress, and skill development. They cannot edit anything.
        </p>

        <label className="mb-2 block text-[13px] font-medium text-[#111]">Parent's Email Address</label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Enter their email address"
          disabled={sent || sending || creating}
          className="w-full rounded-[12px] outline-none transition-all"
          style={{ height: 50, border: "1.5px solid #E5E7EB", padding: "0 16px", fontSize: 14, fontFamily: "Poppins, sans-serif" }}
          onFocus={(e) => {
            e.currentTarget.style.borderColor = "#3498DB";
            e.currentTarget.style.boxShadow = "0 0 0 4px rgba(52,152,219,0.15)";
          }}
          onBlur={(e) => {
            e.currentTarget.style.borderColor = "#E5E7EB";
            e.currentTarget.style.boxShadow = "none";
          }}
        />

        <button
          onClick={handleSend}
          disabled={!email || sending || sent || creating}
          className="mt-3 flex w-full items-center justify-center gap-2 rounded-[12px] font-semibold transition-all"
          style={{ height: 50, background: sendBg, color: sendColor, fontSize: 15, cursor: !email || sending || creating ? "not-allowed" : "pointer" }}
        >
          {sending && (
            <span
              className="inline-block h-4 w-4 rounded-full border-2 border-white border-t-transparent"
              style={{ animation: "spin 0.8s linear infinite" }}
            />
          )}
          {sendLabel}
        </button>

        <div className="my-5 text-center text-[13px] text-[#9CA3AF]">— or —</div>

        <label className="mb-2 block text-[13px] font-medium text-[#111]">Or share this link directly</label>
        <div className="flex">
          <div
            className="flex-1 overflow-hidden text-ellipsis whitespace-nowrap text-[13px] text-[#6B7280]"
            style={{ background: "#F4F9FE", border: "1px solid #E5E7EB", borderRight: "none", borderRadius: "10px 0 0 10px", padding: "12px 14px" }}
          >
            {link || (creating ? "Generating secure link..." : "Could not generate link")}
          </div>
          <button
            onClick={handleCopy}
            disabled={!link}
            className="flex-shrink-0 font-semibold text-white transition-colors"
            style={{ background: "#3498DB", borderRadius: "0 10px 10px 0", padding: "12px 18px", fontSize: 13, border: "none", cursor: link ? "pointer" : "not-allowed" }}
          >
            {copied ? "Copied! ✓" : "Copy"}
          </button>
        </div>

        {showToast && (
          <div className="mt-2 text-center text-[12px] text-[#22C55E]" style={{ animation: "ws-koko-fade 0.3s ease both" }}>
            Link copied to clipboard
          </div>
        )}

        <button
          onClick={handleWhatsApp}
          disabled={!link}
          className="mt-3 flex w-full items-center justify-center gap-2 rounded-[12px] font-semibold transition-all"
          style={{ height: 48, background: "#25D366", color: "#fff", fontSize: 14, border: "none", cursor: link ? "pointer" : "not-allowed", opacity: link ? 1 : 0.5 }}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
            <path d="M20.52 3.48A11.93 11.93 0 0 0 12.05 0C5.5 0 .18 5.32.18 11.87c0 2.09.55 4.13 1.6 5.93L0 24l6.36-1.66a11.86 11.86 0 0 0 5.69 1.45h.01c6.55 0 11.87-5.32 11.87-11.87 0-3.17-1.24-6.15-3.41-8.44ZM12.06 21.5h-.01a9.61 9.61 0 0 1-4.9-1.34l-.35-.21-3.78.99 1.01-3.69-.23-.38a9.61 9.61 0 0 1-1.47-5.1c0-5.31 4.32-9.62 9.63-9.62 2.57 0 4.99 1 6.81 2.82a9.56 9.56 0 0 1 2.82 6.81c0 5.31-4.32 9.62-9.63 9.62Zm5.27-7.21c-.29-.14-1.71-.84-1.97-.94-.27-.1-.46-.14-.66.14-.19.29-.76.94-.93 1.13-.17.19-.34.21-.63.07-.29-.14-1.22-.45-2.32-1.43-.86-.77-1.44-1.71-1.61-2-.17-.29-.02-.45.13-.59.13-.13.29-.34.43-.51.14-.17.19-.29.29-.48.1-.19.05-.36-.02-.51-.07-.14-.66-1.59-.9-2.18-.24-.57-.48-.49-.66-.5h-.57c-.19 0-.51.07-.78.36-.27.29-1.02 1-1.02 2.43 0 1.43 1.05 2.81 1.19 3 .14.19 2.06 3.14 4.99 4.41.7.3 1.24.48 1.66.61.7.22 1.33.19 1.83.12.56-.08 1.71-.7 1.95-1.37.24-.67.24-1.25.17-1.37-.07-.12-.27-.19-.56-.33Z" />
          </svg>
          Share via WhatsApp
        </button>

        <p className="mt-5 text-center text-[11px] text-[#9CA3AF]">
          🔒 This link only gives view access. Your data cannot be changed.
        </p>
      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
};
