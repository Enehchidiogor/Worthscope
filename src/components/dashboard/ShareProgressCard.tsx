import { useState } from "react";
import { InviteParentModal } from "@/components/parent/InviteParentModal";

export const ShareProgressCard = () => {
  const [open, setOpen] = useState(false);

  return (
    <>
      <div
        className="ws-fade-up mt-6 flex items-center justify-between font-poppins"
        style={{
          background: "linear-gradient(135deg, #EBF5FB, #F0FFF4)",
          border: "1px solid rgba(52,152,219,0.15)",
          borderRadius: 18,
          padding: "22px 26px",
          gap: 20,
          animationDelay: "0.8s",
        }}
      >
        <div className="flex min-w-0 items-center">
          <svg
            width="28"
            height="28"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#3498DB"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            style={{ flexShrink: 0 }}
          >
            <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
            <circle cx="9" cy="7" r="4" />
            <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
            <path d="M16 3.13a4 4 0 0 1 0 7.75" />
          </svg>
          <div style={{ marginLeft: 14 }} className="min-w-0">
            <div className="font-bold text-[#111]" style={{ fontSize: 16 }}>
              Share Your Progress
            </div>
            <div className="text-[#6B7280]" style={{ fontSize: 13, marginTop: 4 }}>
              Let a parent or guardian track your career journey.
            </div>
          </div>
        </div>

        <button
          onClick={() => setOpen(true)}
          className="flex-shrink-0 font-semibold text-white transition-all"
          style={{
            background: "#3498DB",
            fontSize: 13,
            borderRadius: 10,
            padding: "10px 20px",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = "#217BBB";
            e.currentTarget.style.boxShadow = "0 4px 14px rgba(52,152,219,0.3)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = "#3498DB";
            e.currentTarget.style.boxShadow = "none";
          }}
        >
          Invite Parent
        </button>
      </div>

      <InviteParentModal open={open} onClose={() => setOpen(false)} />
    </>
  );
};
