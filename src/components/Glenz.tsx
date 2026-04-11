import React, { useLayoutEffect, useMemo, useRef } from "react";
import { useCurrentFrame } from "remotion";
import { FreqProps } from "../hooks/useFrequencies";

const VIRTUAL_W = 320;
const VIRTUAL_H = 256;
const CX = VIRTUAL_W / 2;
const CY = VIRTUAL_H / 2;
const NUM_TRIS = 8;

function seeded(n: number) {
  const x = Math.sin(n + 1) * 10000;
  return x - Math.floor(x);
}

interface TriSeed {
  radius: number;
  spinFreq: number;
  spinPhase: number;
  hue: number;
  alpha: number; // base additive strength 0.2..0.55
}

export const Glenz: React.FC<FreqProps> = ({ bass, mid, volume }) => {
  const frame = useCurrentFrame();
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const seeds = useMemo<TriSeed[]>(
    () => Array.from({ length: NUM_TRIS }, (_, i) => ({
      radius:    20 + i * 12 + seeded(i * 4) * 10,
      spinFreq:  (seeded(i * 4 + 1) * 0.04 + 0.01) * (i % 2 === 0 ? 1 : -1),
      spinPhase: seeded(i * 4 + 2) * Math.PI * 2,
      hue:       (i * 45) % 360,
      alpha:     0.25 + seeded(i * 4 + 3) * 0.25,
    })),
    []
  );

  useLayoutEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Accumulation buffers: r, g, b (float 0..1 each)
    const R = new Float32Array(VIRTUAL_W * VIRTUAL_H);
    const G = new Float32Array(VIRTUAL_W * VIRTUAL_H);
    const B = new Float32Array(VIRTUAL_W * VIRTUAL_H);

    for (const tri of seeds) {
      const angle = frame * tri.spinFreq + tri.spinPhase;
      const R_eff = tri.radius + bass * 14;

      // Equilateral triangle vertices (centred at CX, CY)
      const verts: [number, number][] = Array.from({ length: 3 }, (_, k) => {
        const a = angle + (k / 3) * Math.PI * 2;
        return [CX + Math.cos(a) * R_eff, CY + Math.sin(a) * R_eff];
      });

      const hue = (tri.hue + mid * 60) % 360;
      const alpha = tri.alpha * (0.8 + volume * 0.8);

      // HSL → RGB for the additive colour
      const l = 0.55;
      const sat = 1.0;
      const ac = sat * Math.min(l, 1 - l);
      const chsl = (n: number) => {
        const k = (n + hue / 30) % 12;
        return l - ac * Math.max(-1, Math.min(k - 3, 9 - k, 1));
      };
      const cr = chsl(0) * alpha;
      const cg = chsl(8) * alpha;
      const cb = chsl(4) * alpha;

      // Scanline rasterise the triangle
      const [x0, y0] = verts[0];
      const [x1, y1] = verts[1];
      const [x2, y2] = verts[2];

      const minY = Math.max(0, Math.floor(Math.min(y0, y1, y2)));
      const maxY = Math.min(VIRTUAL_H - 1, Math.ceil(Math.max(y0, y1, y2)));

      for (let scanY = minY; scanY <= maxY; scanY++) {
        const intersects: number[] = [];
        const edges: [number, number, number, number][] = [
          [x0, y0, x1, y1], [x1, y1, x2, y2], [x2, y2, x0, y0],
        ];
        for (const [ex0, ey0, ex1, ey1] of edges) {
          if ((ey0 <= scanY && ey1 > scanY) || (ey1 <= scanY && ey0 > scanY)) {
            intersects.push(ex0 + ((scanY - ey0) / (ey1 - ey0)) * (ex1 - ex0));
          }
        }
        intersects.sort((a, b) => a - b);
        for (let k = 0; k + 1 < intersects.length; k += 2) {
          const xa = Math.max(0, Math.ceil(intersects[k]));
          const xb = Math.min(VIRTUAL_W - 1, Math.floor(intersects[k + 1]));
          for (let px = xa; px <= xb; px++) {
            const idx = scanY * VIRTUAL_W + px;
            R[idx] += cr;
            G[idx] += cg;
            B[idx] += cb;
          }
        }
      }
    }

    // Map accumulation buffers to imageData (clamp to 255)
    const imageData = ctx.createImageData(VIRTUAL_W, VIRTUAL_H);
    const data = imageData.data;
    for (let i = 0; i < VIRTUAL_W * VIRTUAL_H; i++) {
      const base = i * 4;
      data[base]     = Math.min(255, Math.round(R[i] * 255));
      data[base + 1] = Math.min(255, Math.round(G[i] * 255));
      data[base + 2] = Math.min(255, Math.round(B[i] * 255));
      data[base + 3] = 255;
    }

    ctx.putImageData(imageData, 0, 0);
  }, [frame, seeds, bass, mid, volume]);

  return (
    <canvas ref={canvasRef} width={VIRTUAL_W} height={VIRTUAL_H}
      style={{ display: "block", width: "100%", height: "100%" }} />
  );
};
