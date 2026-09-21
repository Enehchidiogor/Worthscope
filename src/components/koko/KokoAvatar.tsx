/* WorthScope — shared Koko avatar. Renders Koko's animated face (the same
   one used on the landing and discovery pages) in a dark round bubble. */

import KokoFace from "@/components/experience/KokoFace";

type Props = {
  size?: number;
  className?: string;
  /** Optional outer ring color (used in some chat headers). */
  ring?: string;
  talking?: boolean;
};

export const KokoAvatar = ({ size = 36, className = "", ring, talking = false }: Props) => (
  <div
    aria-label="Koko"
    className={className}
    style={{
      width: size,
      height: size,
      borderRadius: "9999px",
      background: "#05070C",
      border: "1px solid rgba(96,165,250,0.35)",
      boxShadow: ring ? `0 0 0 2px ${ring}` : "0 0 14px rgba(59,130,246,0.25)",
      display: "grid",
      placeItems: "center",
      overflow: "hidden",
      flexShrink: 0,
    }}
  >
    <KokoFace expression={talking ? "talking" : "idle"} talking={talking} size={Math.round(size * 0.95)} lookAtCursor={false} />
  </div>
);
