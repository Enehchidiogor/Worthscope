/* WorthScope — shared Koko avatar.
   Reads the user's chosen koko_avatar from profileStore and renders the
   correct PNG. Falls back to an emoji + colored circle when the image
   cannot be loaded (e.g. /koko-avatars/*.png missing in dev). */

import { useEffect, useState } from "react";
import { useUserProfile, type KokoAvatarKey } from "@/lib/profileStore";

type Props = {
  size?: number;
  className?: string;
  /** Override the avatar key (e.g. for the picker tiles in Settings). */
  avatarKey?: KokoAvatarKey;
  /** Optional outer ring color (used in some chat headers). */
  ring?: string;
};

export const KOKO_AVATARS: Record<KokoAvatarKey, { label: string; emoji: string; src: string }> = {
  robot: { label: "Robot Koko",   emoji: "🤖", src: "/koko-avatars/robot.png" },
  owl:   { label: "Owl Koko",     emoji: "🦉", src: "/koko-avatars/owl.png" },
  fox:   { label: "Fox Koko",     emoji: "🦊", src: "/koko-avatars/fox.png" },
  cat:   { label: "Cat Koko",     emoji: "🐱", src: "/koko-avatars/cat.png" },
  spark: { label: "Spark Koko",   emoji: "⭐", src: "/koko-avatars/spark.png" },
};

const warned: Record<string, true> = {};

export const KokoAvatar = ({ size = 36, className = "", avatarKey, ring }: Props) => {
  const profile = useUserProfile();
  const key: KokoAvatarKey = avatarKey || profile?.koko_avatar || "robot";
  const meta = KOKO_AVATARS[key] || KOKO_AVATARS.robot;
  const [errored, setErrored] = useState(false);

  // Reset error state when key changes
  useEffect(() => { setErrored(false); }, [key]);

  const style: React.CSSProperties = {
    width: size,
    height: size,
    borderRadius: "9999px",
    background: "#F3EEFF",
    boxShadow: ring ? `0 0 0 2px ${ring}` : undefined,
    display: "grid",
    placeItems: "center",
    overflow: "hidden",
    flexShrink: 0,
  };

  if (errored) {
    return (
      <div aria-label={meta.label} className={className} style={style}>
        <span style={{ fontSize: Math.round(size * 0.55), lineHeight: 1 }}>{meta.emoji}</span>
      </div>
    );
  }

  return (
    <div aria-label={meta.label} className={className} style={style}>
      <img
        src={meta.src}
        alt={meta.label}
        onError={() => {
          if (!warned[key]) {
            console.warn(`[KokoAvatar] missing ${meta.src} — falling back to emoji ${meta.emoji}`);
            warned[key] = true;
          }
          setErrored(true);
        }}
        style={{ width: "100%", height: "100%", objectFit: "cover" }}
      />
    </div>
  );
};
