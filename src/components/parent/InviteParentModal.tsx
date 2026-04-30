import { useEffect, useState } from "react";

const UsersIcon = ({ size = 24, color = "#3498DB" }: { size?: number; color?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
    <circle cx="9" cy="7" r="4" />
    <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
  </svg>
);

export const InviteParentModal = ({ open, onClose }: { open: boolean; onClose: () => void }) => {
  const [email, setEmail] = useState("");
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [copied, setCopied] = useState(false);
  const [showToast, setShowToast] = useState(false);

  const link = "https://worthscope.app/parent/abc123xyz";

  useEffect(() => {
    if (!open) {
      setEmail("");
      setSending(false);
      setSent(false);
      setCopied(false);
      setShowToast(false);
    }
  }, [open]);

  const handleSend = () => {
    if (!email || sending || sent) return;
    setSending(true);
    setTimeout(() => {
      setSending(false);
      setSent(true);
      setTimeout(() => onClose(), 2000);
    }, 1100);
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(link);
      setCopied(true);
      setShowToast(true);
      setTimeout(() => setCopied(false), 1500);
      setTimeout(() => setShowToast(false), 2000);
    } catch {
      // noop
    }
  };

  if (!open) return null;

  const sendBg = sent ? "#22C55E" : !email ? "#E5E7EB" : "#3498DB";
  const sendColor = !email && !sent ? "#9CA3AF" : "#FFFFFF";
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

        {/* Email Invite */}
        <label className="mb-2 block text-[13px] font-medium text-[#111]">Parent's Email Address</label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Enter their email address"
          disabled={sent || sending}
          className="w-full rounded-[12px] outline-none transition-all"
          style={{
            height: 50,
            border: "1.5px solid #E5E7EB",
            padding: "0 16px",
            fontSize: 14,
            fontFamily: "Poppins, sans-serif",
          }}
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
          disabled={!email || sending || sent}
          className="mt-3 flex w-full items-center justify-center gap-2 rounded-[12px] font-semibold transition-all"
          style={{
            height: 50,
            background: sendBg,
            color: sendColor,
            fontSize: 15,
            cursor: !email || sending ? "not-allowed" : "pointer",
          }}
          onMouseEnter={(e) => {
            if (email && !sending && !sent) {
              e.currentTarget.style.background = "#217BBB";
              e.currentTarget.style.boxShadow = "0 8px 24px rgba(52,152,219,0.35)";
            }
          }}
          onMouseLeave={(e) => {
            if (email && !sending && !sent) {
              e.currentTarget.style.background = "#3498DB";
              e.currentTarget.style.boxShadow = "none";
            }
          }}
        >
          {sending && (
            <span
              className="inline-block h-4 w-4 rounded-full border-2 border-white border-t-transparent"
              style={{ animation: "spin 0.8s linear infinite" }}
            />
          )}
          {sendLabel}
        </button>

        {/* Divider */}
        <div className="my-5 text-center text-[13px] text-[#9CA3AF]">— or —</div>

        {/* Copy link */}
        <label className="mb-2 block text-[13px] font-medium text-[#111]">Or share this link directly</label>
        <div className="flex">
          <div
            className="flex-1 overflow-hidden text-ellipsis whitespace-nowrap text-[13px] text-[#6B7280]"
            style={{
              background: "#F4F9FE",
              border: "1px solid #E5E7EB",
              borderRight: "none",
              borderRadius: "10px 0 0 10px",
              padding: "12px 14px",
            }}
          >
            {link}
          </div>
          <button
            onClick={handleCopy}
            className="flex-shrink-0 font-semibold text-white transition-colors"
            style={{
              background: "#3498DB",
              borderRadius: "0 10px 10px 0",
              padding: "12px 18px",
              fontSize: 13,
              border: "none",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.background = "#217BBB")}
            onMouseLeave={(e) => (e.currentTarget.style.background = "#3498DB")}
          >
            {copied ? "Copied! ✓" : "Copy"}
          </button>
        </div>

        {showToast && (
          <div
            className="mt-2 text-center text-[12px] text-[#22C55E]"
            style={{ animation: "ws-koko-fade 0.3s ease both" }}
          >
            Link copied to clipboard
          </div>
        )}

        <p className="mt-5 text-center text-[11px] text-[#9CA3AF]">
          🔒 This link only gives view access. Your data cannot be changed.
        </p>
      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
};
