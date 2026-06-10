/* WorthScope — shared user avatar. Uses uploaded avatar_url when present,
   otherwise renders a friendly gradient circle (seeded by the user's name)
   with their first initial in white. */

import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useUserProfile } from "@/lib/profileStore";

type Props = {
  size?: number;
  fallbackInitial?: string;
  fallbackName?: string;
  className?: string;
};

// Simple deterministic hash → hue for the gradient seed.
function hash(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0;
  return Math.abs(h);
}

export function gradientFor(name: string): string {
  const h = hash(name || "user");
  const hue1 = h % 360;
  const hue2 = (hue1 + 35) % 360;
  return `linear-gradient(135deg, hsl(${hue1} 70% 60%), hsl(${hue2} 70% 50%))`;
}

// Cache for signed URLs so we don't re-sign on every render
const signedCache: Record<string, { url: string; exp: number }> = {};

async function resolveAvatarUrl(stored: string | null): Promise<string | null> {
  if (!stored) return null;
  // Already a full URL (http/https) — use directly
  if (/^https?:\/\//i.test(stored)) return stored;
  // Otherwise treat as a storage path inside profile-pictures
  const now = Date.now();
  const cached = signedCache[stored];
  if (cached && cached.exp > now + 30_000) return cached.url;
  const { data, error } = await supabase.storage
    .from("profile-pictures")
    .createSignedUrl(stored, 60 * 60); // 1 hour
  if (error || !data?.signedUrl) return null;
  signedCache[stored] = { url: data.signedUrl, exp: now + 60 * 60 * 1000 };
  return data.signedUrl;
}

export const UserAvatar = ({ size = 36, fallbackInitial, fallbackName, className = "" }: Props) => {
  const profile = useUserProfile();
  const [resolvedUrl, setResolvedUrl] = useState<string | null>(null);
  const [errored, setErrored] = useState(false);

  const name = profile?.name || fallbackName || "User";
  const initial = (fallbackInitial || name?.[0] || "U").toUpperCase();
  const raw = profile?.avatar_url || null;

  useEffect(() => {
    setErrored(false);
    let alive = true;
    resolveAvatarUrl(raw).then((u) => { if (alive) setResolvedUrl(u); });
    return () => { alive = false; };
  }, [raw]);

  const baseStyle: React.CSSProperties = {
    width: size,
    height: size,
    borderRadius: "9999px",
    display: "grid",
    placeItems: "center",
    overflow: "hidden",
    flexShrink: 0,
    fontWeight: 700,
    color: "white",
    fontSize: Math.round(size * 0.42),
    fontFamily: "'Poppins', sans-serif",
  };

  if (resolvedUrl && !errored) {
    return (
      <div className={className} style={baseStyle}>
        <img
          src={resolvedUrl}
          alt={name}
          onError={() => setErrored(true)}
          style={{ width: "100%", height: "100%", objectFit: "cover" }}
        />
      </div>
    );
  }

  return (
    <div className={className} style={{ ...baseStyle, background: gradientFor(name) }}>
      {initial}
    </div>
  );
};
