/* A cheap, always-on looping backdrop for the whole page — CSS transforms and
   background-position only (no canvas, no per-frame JS), so it stays smooth
   no matter how long the page is. Two slow-drifting blue glows plus a faint
   dot grid that inches diagonally in a loop. */
export default function AmbientBackground() {
  return (
    <div aria-hidden style={{ position: "fixed", inset: 0, zIndex: 0, overflow: "hidden", pointerEvents: "none" }}>
      <div className="wsx-bg-dots" />
      <div className="wsx-bg-blob wsx-bg-blob-a" />
      <div className="wsx-bg-blob wsx-bg-blob-b" />
      <div className="wsx-bg-blob wsx-bg-blob-c" />

      <style>{`
        /* Every page that mounts this relies on a black body — set it here
           once rather than requiring each page to remember it. */
        body { background: #000; }
        .wsx-bg-dots {
          position: absolute;
          inset: -60px;
          background-image: radial-gradient(rgba(255,255,255,.06) 1px, transparent 1px);
          background-size: 34px 34px;
          animation: wsx-drift 46s linear infinite;
        }
        .wsx-bg-blob {
          position: absolute;
          width: 52vw;
          height: 52vw;
          max-width: 760px;
          max-height: 760px;
          border-radius: 50%;
          filter: blur(90px);
          opacity: .55;
        }
        .wsx-bg-blob-a {
          top: -14%;
          left: -10%;
          background: radial-gradient(circle, rgba(59,130,246,.30), transparent 70%);
          animation: wsx-float-a 22s ease-in-out infinite alternate;
        }
        .wsx-bg-blob-b {
          top: 30%;
          right: -14%;
          background: radial-gradient(circle, rgba(37,99,235,.22), transparent 70%);
          animation: wsx-float-b 26s ease-in-out infinite alternate;
        }
        .wsx-bg-blob-c {
          bottom: -18%;
          left: 20%;
          background: radial-gradient(circle, rgba(96,165,250,.18), transparent 70%);
          animation: wsx-float-c 30s ease-in-out infinite alternate;
        }
        @keyframes wsx-drift {
          from { transform: translate(0, 0); }
          to { transform: translate(34px, 34px); }
        }
        @keyframes wsx-float-a {
          from { transform: translate(0, 0) scale(1); }
          to { transform: translate(4vw, 3vh) scale(1.08); }
        }
        @keyframes wsx-float-b {
          from { transform: translate(0, 0) scale(1); }
          to { transform: translate(-3vw, 4vh) scale(1.1); }
        }
        @keyframes wsx-float-c {
          from { transform: translate(0, 0) scale(1); }
          to { transform: translate(3vw, -3vh) scale(1.05); }
        }
        @media (prefers-reduced-motion: reduce) {
          .wsx-bg-dots, .wsx-bg-blob { animation: none !important; }
        }
      `}</style>
    </div>
  );
}
