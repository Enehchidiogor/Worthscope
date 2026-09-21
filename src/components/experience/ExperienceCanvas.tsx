import { useEffect, useRef } from "react";
import { useExperience } from "./ExperienceContext";

/* Shared ambient state — plain mutable object, not React state, so callers can
   nudge the background without triggering re-renders on every frame. */
export const canvasState = { intensity: 1, pulse: 0, bendEnabled: true };
let intensityTarget = 1;

export function setCanvasIntensity(target: number) {
  intensityTarget = target;
}
export function pulseCanvas(amount = 0.6) {
  canvasState.pulse = Math.min(1.4, canvasState.pulse + amount);
}

type PathDef = { base: { x: number; y: number }[]; phase: number; speed: number; amp: number };
type Particle = { pathIndex: number; t: number; speed: number; size: number };

/* `contained`: sized to its own positioned parent instead of the viewport, and
   pauses drawing via IntersectionObserver when scrolled off-screen — used for
   the Hero's pathway backdrop so a 60fps loop doesn't run for the whole page. */
export default function ExperienceCanvas({ contained = false }: { contained?: boolean }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { cursor, isMobile, prefersReducedMotion } = useExperience();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const container = contained ? canvas.parentElement : null;

    let width = 0;
    let height = 0;
    let paths: PathDef[] = [];
    let particles: Particle[] = [];
    const PATH_COUNT = isMobile ? 4 : 7;
    const PARTICLES_PER_PATH = isMobile ? 2 : 4;
    const POINTS_PER_PATH = 5;

    function buildPaths() {
      paths = [];
      particles = [];
      for (let i = 0; i < PATH_COUNT; i++) {
        const colX = ((i + 0.5) / PATH_COUNT) * width + (Math.random() - 0.5) * width * 0.12;
        const pts: { x: number; y: number }[] = [];
        for (let j = 0; j < POINTS_PER_PATH; j++) {
          const y = (j / (POINTS_PER_PATH - 1)) * height;
          const jitter = (Math.random() - 0.5) * width * 0.16;
          pts.push({ x: Math.min(Math.max(colX + jitter, width * 0.04), width * 0.96), y });
        }
        paths.push({
          base: pts,
          phase: Math.random() * Math.PI * 2,
          speed: 0.15 + Math.random() * 0.12,
          amp: width * 0.03 + Math.random() * width * 0.02,
        });
        for (let p = 0; p < PARTICLES_PER_PATH; p++) {
          particles.push({ pathIndex: i, t: Math.random(), speed: 0.035 + Math.random() * 0.03, size: 1.2 + Math.random() * 1.6 });
        }
      }
    }

    function resize() {
      const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
      width = container ? container.clientWidth : window.innerWidth;
      height = container ? container.clientHeight : window.innerHeight;
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      canvas.style.width = width + "px";
      canvas.style.height = height + "px";
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      buildPaths();
    }
    resize();
    window.addEventListener("resize", resize);
    let ro: ResizeObserver | null = null;
    if (container && "ResizeObserver" in window) {
      ro = new ResizeObserver(() => resize());
      ro.observe(container);
    }

    function livePoints(path: PathDef, time: number) {
      const rect = contained ? canvas.getBoundingClientRect() : { left: 0, top: 0 };
      const cx = cursor.current.x - rect.left;
      const cy = cursor.current.y - rect.top;
      return path.base.map((pt, idx) => {
        const sway = Math.sin(time * path.speed + path.phase + idx * 0.6) * path.amp;
        let x = pt.x + sway;
        let y = pt.y;
        if (canvasState.bendEnabled && !isMobile) {
          const dx = cx - x;
          const dy = cy - y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          const radius = 280;
          if (dist < radius) {
            const pull = (1 - dist / radius) * 34;
            x += (dx / (dist || 1)) * pull;
            y += (dy / (dist || 1)) * pull * 0.4;
          }
        }
        return { x, y };
      });
    }

    function pointAt(pts: { x: number; y: number }[], t: number) {
      if (pts.length < 2) return pts[0] || { x: 0, y: 0 };
      const seg = Math.max(0, Math.min(pts.length - 2, Math.floor(t * (pts.length - 1))));
      const localT = t * (pts.length - 1) - seg;
      const a = pts[seg];
      const b = pts[seg + 1];
      return { x: a.x + (b.x - a.x) * localT, y: a.y + (b.y - a.y) * localT };
    }

    let raf = 0;
    let last = performance.now();
    let hidden = false;
    let offscreen = false;
    const onVis = () => {
      hidden = document.hidden;
    };
    document.addEventListener("visibilitychange", onVis);

    let io: IntersectionObserver | null = null;
    if ("IntersectionObserver" in window) {
      io = new IntersectionObserver(([entry]) => {
        offscreen = !entry.isIntersecting;
      });
      io.observe(canvas);
    }

    function draw(now: number) {
      raf = requestAnimationFrame(draw);
      if (hidden || offscreen || width === 0 || height === 0 || paths.length === 0) {
        last = now;
        return;
      }
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      const t = now / 1000;

      canvasState.intensity += (intensityTarget - canvasState.intensity) * 0.04;
      canvasState.pulse *= 0.94;
      const brightness = Math.min(1.5, canvasState.intensity + canvasState.pulse);

      ctx.clearRect(0, 0, width, height);
      ctx.globalCompositeOperation = "lighter";

      const reduceMotion = prefersReducedMotion;

      paths.forEach((path) => {
        const pts = reduceMotion ? path.base : livePoints(path, t);
        ctx.beginPath();
        ctx.moveTo(pts[0].x, pts[0].y);
        for (let i = 1; i < pts.length - 1; i++) {
          const midX = (pts[i].x + pts[i + 1].x) / 2;
          const midY = (pts[i].y + pts[i + 1].y) / 2;
          ctx.quadraticCurveTo(pts[i].x, pts[i].y, midX, midY);
        }
        ctx.lineTo(pts[pts.length - 1].x, pts[pts.length - 1].y);
        ctx.strokeStyle = `rgba(59,130,246,${0.16 * brightness})`;
        ctx.lineWidth = 1.4;
        ctx.shadowColor = "rgba(59,130,246,.9)";
        ctx.shadowBlur = 10 * brightness;
        ctx.stroke();
      });

      particles.forEach((particle) => {
        if (!reduceMotion) particle.t = (particle.t + particle.speed * dt) % 1;
        const path = paths[particle.pathIndex];
        const pts = reduceMotion ? path.base : livePoints(path, t);
        const pos = pointAt(pts, particle.t);
        const edgeFade = Math.sin(Math.PI * particle.t);
        ctx.beginPath();
        ctx.arc(pos.x, pos.y, particle.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(147,197,253,${0.75 * brightness * Math.max(0.15, edgeFade)})`;
        ctx.shadowColor = "rgba(96,165,250,1)";
        ctx.shadowBlur = 8 * brightness;
        ctx.fill();
      });

      ctx.globalCompositeOperation = "source-over";
    }
    raf = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
      document.removeEventListener("visibilitychange", onVis);
      ro?.disconnect();
      io?.disconnect();
    };
  }, [cursor, isMobile, prefersReducedMotion, contained]);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden
      style={contained ? { position: "absolute", inset: 0, zIndex: 0, pointerEvents: "none" } : { position: "fixed", inset: 0, zIndex: 0, pointerEvents: "none" }}
    />
  );
}
