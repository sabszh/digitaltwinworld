"use client";

import { useEffect, useRef } from "react";

const STAR_COUNT = 88;
const DURATION = 2400; // matches year counter animation duration

// Pre-compute star geometry — golden ratio angle spread, seeded distances
const stars = Array.from({ length: STAR_COUNT }, (_, i) => ({
  angle: (i / STAR_COUNT) * Math.PI * 2 + i * 2.399,
  seed: ((i * 137.508) % STAR_COUNT) / STAR_COUNT,
}));

export function WarpCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener("resize", resize);

    const startTime = performance.now();
    let frameId: number;

    const draw = (now: number) => {
      const elapsed = now - startTime;
      const t = Math.min(elapsed / DURATION, 1);

      // Speed peaks at t=0.65, then decelerates as we arrive at 2046
      const rawSpeed = t < 0.65 ? t / 0.65 : 1 - (t - 0.65) / 0.35;
      const speed = Math.pow(rawSpeed, 0.65);

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const cx = canvas.width / 2;
      const cy = canvas.height / 2;
      const diagonal = Math.sqrt(cx * cx + cy * cy);
      if (!Number.isFinite(diagonal) || diagonal <= 0) {
        frameId = requestAnimationFrame(draw);
        return;
      }

      for (const star of stars) {
        const baseDist = (0.04 + star.seed * 0.14) * diagonal;
        const maxStreak = diagonal * (0.38 + star.seed * 0.52);
        const streakLen = speed * maxStreak;

        if (streakLen < 1) continue;

        const cos = Math.cos(star.angle);
        const sin = Math.sin(star.angle);

        const x1 = cx + cos * baseDist;
        const y1 = cy + sin * baseDist;
        const x2 = cx + cos * (baseDist + streakLen);
        const y2 = cy + sin * (baseDist + streakLen);
        if (![x1, y1, x2, y2].every(Number.isFinite)) continue;

        const alpha = Math.min(speed * 0.6, 0.48);

        const grad = ctx.createLinearGradient(x1, y1, x2, y2);
        grad.addColorStop(0, `rgba(143, 199, 232, ${alpha})`);
        grad.addColorStop(0.55, `rgba(143, 199, 232, ${alpha * 0.4})`);
        grad.addColorStop(1, `rgba(143, 199, 232, 0)`);

        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.strokeStyle = grad;
        ctx.lineWidth = 0.4 + speed * 1.2;
        ctx.stroke();
      }

      if (t < 1) {
        frameId = requestAnimationFrame(draw);
      }
    };

    frameId = requestAnimationFrame(draw);

    return () => {
      window.removeEventListener("resize", resize);
      cancelAnimationFrame(frameId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden
      style={{
        position: "fixed",
        inset: 0,
        width: "100%",
        height: "100%",
        pointerEvents: "none",
        zIndex: 11,
      }}
    />
  );
}
