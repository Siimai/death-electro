import React, { useLayoutEffect, useMemo, useRef } from "react";
import { useCurrentFrame } from "remotion";
import { FreqProps } from "../hooks/useFrequencies";

const VIRTUAL_W = 320;
const VIRTUAL_H = 256;
const NUM_BALLS = 20;

function seeded(n: number) {
  const x = Math.sin(n + 1) * 10000;
  return x - Math.floor(x);
}

interface BallSeed {
  ax: number; fx: number; px: number;
  ay: number; fy: number; py: number;
  az: number; fz: number; pz: number;
  baseR: number;
  hue: number;
}

export const VectorBalls: React.FC<FreqProps> = ({ bass, mid }) => {
  const frame = useCurrentFrame();
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const seeds = useMemo<BallSeed[]>(
    () => Array.from({ length: NUM_BALLS }, (_, i) => ({
      ax: seeded(i * 9 + 0) * 80 + 30,
      fx: seeded(i * 9 + 1) * 0.04 + 0.01,
      px: seeded(i * 9 + 2) * Math.PI * 2,
      ay: seeded(i * 9 + 3) * 60 + 20,
      fy: seeded(i * 9 + 4) * 0.04 + 0.01,
      py: seeded(i * 9 + 5) * Math.PI * 2,
      az: seeded(i * 9 + 6) * 50 + 10,
      fz: seeded(i * 9 + 7) * 0.025 + 0.005,
      pz: seeded(i * 9 + 8) * Math.PI * 2,
      baseR: seeded(i * 9 + 1) * 8 + 5,
      hue: Math.round(seeded(i * 9 + 3) * 360),
    })),
    []
  );

  useLayoutEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const imageData = ctx.createImageData(VIRTUAL_W, VIRTUAL_H);
    const data = imageData.data;

    // Black background
    for (let i = 0; i < VIRTUAL_W * VIRTUAL_H; i++) data[i * 4 + 3] = 255;

    const t = frame;
    const CX = VIRTUAL_W / 2;
    const CY = VIRTUAL_H / 2;
    const FL = 160; // focal length for perspective

    // Compute 3D position for each ball
    type Ball3D = { sx: number; sy: number; sz: number; r: number; hue: number };
    const balls: Ball3D[] = seeds.map(s => {
      const bx = Math.sin(t * s.fx + s.px) * s.ax;
      const by = Math.sin(t * s.fy + s.py) * s.ay;
      const bz = Math.sin(t * s.fz + s.pz) * s.az + 80;
      const sc = FL / (FL + bz);
      return {
        sx: CX + bx * sc,
        sy: CY + by * sc,
        sz: bz,
        r: Math.max(1, (s.baseR + bass * 6) * sc),
        hue: s.hue,
      };
    });

    // Sort back-to-front (painter's algorithm)
    balls.sort((a, b) => b.sz - a.sz);

    // Draw each ball as a lit sphere via per-pixel shading
    for (const ball of balls) {
      const bx = Math.round(ball.sx);
      const by = Math.round(ball.sy);
      const R = ball.r;
      const hue = (ball.hue + mid * 60) % 360;

      for (let dy = -Math.ceil(R); dy <= Math.ceil(R); dy++) {
        for (let dx = -Math.ceil(R); dx <= Math.ceil(R); dx++) {
          const d2 = dx * dx + dy * dy;
          if (d2 > R * R) continue;
          const px = bx + dx;
          const py = by + dy;
          if (px < 0 || px >= VIRTUAL_W || py < 0 || py >= VIRTUAL_H) continue;

          // Normal vector of the sphere surface at this pixel
          const nz = Math.sqrt(1 - d2 / (R * R));
          // Point light from upper-left
          const lx = -0.6, ly = -0.7, lz = 0.3;
          const diff = Math.max(0, dx / R * lx + dy / R * ly + nz * lz) * 0.8;
          const spec = Math.pow(Math.max(0, nz * 0.9 + diff * 0.1), 8) * 0.5;
          const bright = Math.min(1, 0.08 + diff + spec);

          // HSL → RGB inline
          const l = bright * 0.75;
          const s2 = 0.85;
          const a = s2 * Math.min(l, 1 - l);
          const f = (n: number) => {
            const k = (n + hue / 30) % 12;
            return l - a * Math.max(-1, Math.min(k - 3, 9 - k, 1));
          };
          const idx = (py * VIRTUAL_W + px) * 4;
          data[idx]     = Math.min(255, data[idx]     + Math.round(f(0) * 255));
          data[idx + 1] = Math.min(255, data[idx + 1] + Math.round(f(8) * 255));
          data[idx + 2] = Math.min(255, data[idx + 2] + Math.round(f(4) * 255));
        }
      }
    }

    ctx.putImageData(imageData, 0, 0);
  }, [frame, seeds, bass, mid]);

  return (
    <canvas ref={canvasRef} width={VIRTUAL_W} height={VIRTUAL_H}
      style={{ display: "block", width: "100%", height: "100%" }} />
  );
};
