import { useState } from "react";
import { toast } from "sonner";
import { signInWithProvider } from "@/lib/oauth";
import { PAPER, PAPER_DIM, LINE, FONT } from "@/components/experience/theme";

/* Google/Apple/Microsoft go through Lovable's auth bridge, which only works
   once this app is deployed on Lovable's own hosting (it intercepts a
   /~oauth/... route that doesn't exist on a plain dev server or other host).
   GitHub goes straight to Supabase, so it's the one that can actually go
   live today — it just needs a GitHub OAuth App registered in the Supabase
   dashboard. Re-add the others here once the app is live on Lovable. */
export default function OAuthButtons({ redirectPath = "/signin" }: { redirectPath?: string }) {
  const [loading, setLoading] = useState(false);

  const go = async () => {
    if (loading) return;
    setLoading(true);
    try {
      const { error } = await signInWithProvider("github", redirectPath);
      if (error) {
        toast.error(error.message || "Couldn't continue with GitHub");
        setLoading(false);
      }
      // On success the browser navigates away to GitHub, so no further
      // action here — control returns via the redirect, not this call.
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Couldn't continue with GitHub");
      setLoading(false);
    }
  };

  return (
    <div>
      <button
        type="button"
        onClick={go}
        disabled={loading}
        className="wsx-oauth-btn"
        style={{
          width: "100%",
          height: 50,
          borderRadius: 14,
          border: `1px solid ${LINE}`,
          background: "rgba(255,255,255,.03)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 10,
          cursor: loading ? "wait" : "pointer",
          opacity: loading ? 0.6 : 1,
          fontFamily: FONT,
          fontWeight: 600,
          fontSize: 14,
          color: PAPER,
          transition: "border-color .2s ease, background .2s ease, opacity .2s ease",
        }}
      >
        <GitHubIcon />
        {loading ? "Redirecting…" : "Continue with GitHub"}
      </button>

      <div style={{ display: "flex", alignItems: "center", gap: 14, margin: "26px 0" }}>
        <div style={{ flex: 1, height: 1, background: LINE }} />
        <span style={{ fontFamily: FONT, fontSize: 12, color: PAPER_DIM, whiteSpace: "nowrap" }}>or continue with email</span>
        <div style={{ flex: 1, height: 1, background: LINE }} />
      </div>

      <style>{`
        .wsx-oauth-btn:hover:not(:disabled) { border-color: rgba(59,130,246,.55) !important; background: rgba(59,130,246,.08) !important; }
      `}</style>
    </div>
  );
}

function GitHubIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="#fff">
      <path d="M12 .3a12 12 0 0 0-3.8 23.4c.6.1.8-.3.8-.6v-2.1c-3.3.7-4-1.6-4-1.6-.5-1.4-1.3-1.7-1.3-1.7-1.1-.7.1-.7.1-.7 1.2.1 1.8 1.2 1.8 1.2 1 1.8 2.8 1.3 3.5 1 .1-.8.4-1.3.8-1.6-2.7-.3-5.5-1.3-5.5-5.9 0-1.3.5-2.4 1.2-3.2-.1-.3-.5-1.5.1-3.1 0 0 1-.3 3.3 1.2a11 11 0 0 1 6 0c2.3-1.5 3.3-1.2 3.3-1.2.6 1.6.2 2.8.1 3.1.8.8 1.2 1.9 1.2 3.2 0 4.6-2.8 5.6-5.5 5.9.4.4.8 1.1.8 2.2v3.3c0 .3.2.7.8.6A12 12 0 0 0 12 .3z" />
    </svg>
  );
}
