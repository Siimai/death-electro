import React, { useLayoutEffect, useMemo, useRef } from "react";
import { useCurrentFrame } from "remotion";
import { FreqProps } from "../hooks/useFrequencies";

const VIRTUAL_W = 320;
const VIRTUAL_H = 256;
const NUM_STARS = 200;
const CX = VIRTUAL_W / 2;
const CY = VIRTUAL_H / 2;
const MAX_R = Math.sqrt(CX * CX + CY * CY) + 20;

// Deterministic seeded pseudo-random number generator (no Math.random)
function seeded(seed: number): number {
  const x = Math.sin(seed + 1) * 10000;
  return x - Math.floor(x);
}

interface StarData {
  angle: number;
  speed: number;
  phase: number;
  /** 0 = white, 210 = blue-white, 40 = gold */
  hue: number;
  sat: number;
}

// Comets: 3 streaks that sweep outward at music-reactive angles
const COMET_COUNT   = 3;
const COMET_PERIOD  = 75; // frames per comet pass
const COMET_SEEDS   = [7, 19, 41];

// Bass rings: expanding shockwave circles
const RING_COUNT    = 4;
const RING_PERIOD   = 32; // frames between ring spawns (staggered)

export const Starfield: React.FC<FreqProps> = ({ bass, mid, treble }) => {
  const frame = useCurrentFrame();
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const stars = useMemo<StarData[]>(
    () =>
      Array.from({ length: NUM_STARS }, (_, i) => {
        const colorRoll = seeded(i * 3 + 4);
        return {
          angle: seeded(i * 3)     * Math.PI * 2,
          speed: seeded(i * 3 + 1) * 1.8 + 0.4,
          phase: seeded(i * 3 + 2) * MAX_R,
          // ~55 % white, ~30 % blue-white, ~15 % gold
          hue: colorRoll < 0.55 ? 0 : colorRoll < 0.85 ? 210 : 40,
          sat: colorRoll < 0.55 ? 0 : 0.7,
        };
      }),
    []
  );

  useLayoutEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.fillStyle = "#000000";
    ctx.fillRect(0, 0, VIRTUAL_W, VIRTUAL_H);

    // ── Bass rings ────────────────────────────────────────────────────────
    ctx.save();
    for (let i = 0; i < RING_COUNT; i++) {
      const phase = ((frame + i * (RING_PERIOD / RING_COUNT)) % RING_PERIOD) / RING_PERIOD;
      const ringR = phase * MAX_R * 0.92;
      const alpha = (1 - phase) * (0.15 + bass * 0.7);
      if (alpha < 0.01) continue;
      ctx.beginPath();
      ctx.arc(CX, CY, ringR, 0, Math.PI * 2);
      ctx.strokeStyle = `rgba(80,160,255,${alpha.toFixed(2)})`;
      ctx.lineWidth = 1 + bass * 1.5;
      ctx.stroke();
    }
    ctx.restore();

    // ── Stars ─────────────────────────────────────────────────────────────
    const speedMult = 1 + bass * 6;

    for (const star of stars) {
      const r = (star.phase + frame * star.speed * speedMult) % MAX_R;
      const x = CX + Math.cos(star.angle) * r;
      const y = CY + Math.sin(star.angle) * r;

      if (x < 0 || x >= VIRTUAL_W || y < 0 || y >= VIRTUAL_H) continue;

      const t = r / MAX_R;
      const alpha = Math.min(1, t * 1.4 + treble * 0.4);
      const size = t > 0.65 ? 2 : 1;
      const l = Math.round(70 + t * 30);

      ctx.fillStyle = star.sat > 0
        ? `hsla(${star.hue},${Math.round(star.sat * 100)}%,${l}%,${alpha.toFixed(2)})`
        : `rgba(255,255,255,${alpha.toFixed(2)})`;
      ctx.fillRect(Math.floor(x), Math.floor(y), size, size);
    }

    // ── Comets ────────────────────────────────────────────────────────────
    // Each comet sweeps radially outward; mid shifts all angles gently.
    for (let c = 0; c < COMET_COUNT; c++) {
      const stagger = c * (COMET_PERIOD / COMET_COUNT);
      const cometPhase = ((frame + stagger) % COMET_PERIOD) / COMET_PERIOD; // 0..1

      const baseAngle = seeded(COMET_SEEDS[c]) * Math.PI * 2;
      const cometAngle = baseAngle + mid * 2.0; // mid slowly rotates each comet's lane

      const headR    = cometPhase * MAX_R;
      const trailLen = 18 + mid * 30 + bass * 20;
      const tailR    = Math.max(0, headR - trailLen);

      for (let r = tailR; r <= headR; r += 0.7) {
        const tTrail = (r - tailR) / Math.max(1, headR - tailR); // 0 at tail, 1 at head
        const a = tTrail * (0.55 + bass * 0.45) * (1 - cometPhase * 0.4);
        if (a < 0.02) continue;

        const cx2 = CX + Math.cos(cometAngle) * r;
        const cy2 = CY + Math.sin(cometAngle) * r;
        if (cx2 < 0 || cx2 >= VIRTUAL_W || cy2 < 0 || cy2 >= VIRTUAL_H) continue;

        ctx.fillStyle = `rgba(200,230,255,${a.toFixed(2)})`;
        ctx.fillRect(Math.floor(cx2), Math.floor(cy2), 1, 1);
      }
    }
  }, [frame, stars, bass, mid, treble]);

  return (
    <canvas
      ref={canvasRef}
      width={VIRTUAL_W}
      height={VIRTUAL_H}
      style={{ display: "block", width: "100%", height: "100%" }}
    />
  );
};
