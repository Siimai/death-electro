import React, { useLayoutEffect, useMemo, useRef } from "react";
import { useCurrentFrame } from "remotion";
import { FreqProps } from "../hooks/useFrequencies";

const VIRTUAL_W = 320;
const VIRTUAL_H = 256;
const CX = VIRTUAL_W / 2;
const CY = VIRTUAL_H / 2;
const NUM_SHAPES = 6;

function seeded(n: number) {
  const x = Math.sin(n + 1) * 10000;
  return x - Math.floor(x);
}

interface ShapeSeed {
  sides: number;     // 3..8
  orbitA: number;    // orbit semi-major
  orbitB: number;    // orbit semi-minor
  orbitFreq: number; // orbit frequency
  orbitPhase: number;
  spinFreq: number;  // spin frequency
  spinPhase: number;
  radius: number;    // polygon circumradius
  hue: number;
}

export const RotoShapes: React.FC<FreqProps> = ({ bass, mid, volume }) => {
  const frame = useCurrentFrame();
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const seeds = useMemo<ShapeSeed[]>(
    () => Array.from({ length: NUM_SHAPES }, (_, i) => ({
      sides:      i + 3,
      orbitA:     seeded(i * 8 + 0) * 80 + 30,
      orbitB:     seeded(i * 8 + 1) * 60 + 20,
      orbitFreq:  seeded(i * 8 + 2) * 0.03 + 0.01,
      orbitPhase: seeded(i * 8 + 3) * Math.PI * 2,
      spinFreq:   seeded(i * 8 + 4) * 0.06 + 0.02,
      spinPhase:  seeded(i * 8 + 5) * Math.PI * 2,
      radius:     seeded(i * 8 + 6) * 20 + 22,
      hue:        Math.round(seeded(i * 8 + 7) * 360),
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

    for (const sh of seeds) {
      const ox = CX + Math.cos(frame * sh.orbitFreq + sh.orbitPhase) * sh.orbitA;
      const oy = CY + Math.sin(frame * sh.orbitFreq + sh.orbitPhase) * sh.orbitB;
      const angle = frame * sh.spinFreq + sh.spinPhase;
      const R = sh.radius + bass * 10;

      // Build polygon vertices
      const verts: [number, number][] = Array.from({ length: sh.sides }, (_, k) => {
        const a = angle + (k / sh.sides) * Math.PI * 2;
        return [ox + Math.cos(a) * R, oy + Math.sin(a) * R];
      });

      const hue = (sh.hue + mid * 80) % 360;
      const l = 0.35 + volume * 0.2;
      const sat = 0.95;
      const ac = sat * Math.min(l, 1 - l);
      const col = (n: number) => {
        const k = (n + hue / 30) % 12;
        return Math.round((l - ac * Math.max(-1, Math.min(k - 3, 9 - k, 1))) * 255);
      };
      const cr = col(0), cg = col(8), cb = col(4);

      // Rasterise the filled polygon via scanline
      const minY = Math.max(0, Math.floor(Math.min(...verts.map(v => v[1]))));
      const maxY = Math.min(VIRTUAL_H - 1, Math.ceil(Math.max(...verts.map(v => v[1]))));

      for (let scanY = minY; scanY <= maxY; scanY++) {
        const intersects: number[] = [];
        const n = sh.sides;
        for (let j = 0; j < n; j++) {
          const [x0, y0] = verts[j];
          const [x1, y1] = verts[(j + 1) % n];
          if ((y0 <= scanY && y1 > scanY) || (y1 <= scanY && y0 > scanY)) {
            intersects.push(x0 + ((scanY - y0) / (y1 - y0)) * (x1 - x0));
          }
        }
        intersects.sort((a, b) => a - b);
        for (let k = 0; k + 1 < intersects.length; k += 2) {
          const x0 = Math.max(0, Math.ceil(intersects[k]));
          const x1 = Math.min(VIRTUAL_W - 1, Math.floor(intersects[k + 1]));
          for (let px = x0; px <= x1; px++) {
            const idx = (scanY * VIRTUAL_W + px) * 4;
            data[idx]     = cr;
            data[idx + 1] = cg;
            data[idx + 2] = cb;
            data[idx + 3] = 255;
          }
        }
      }

      // 1-px brighter edge highlight (re-draw outline pixels)
      const ecr = Math.min(255, cr + 80), ecg = Math.min(255, cg + 80), ecb = Math.min(255, cb + 80);
      for (let j = 0; j < sh.sides; j++) {
        const [x0, y0] = verts[j];
        const [x1, y1] = verts[(j + 1) % sh.sides];
        const steps = Math.ceil(Math.hypot(x1 - x0, y1 - y0));
        for (let s = 0; s <= steps; s++) {
          const t = s / steps;
          const px = Math.round(x0 + t * (x1 - x0));
          const py = Math.round(y0 + t * (y1 - y0));
          if (px < 0 || px >= VIRTUAL_W || py < 0 || py >= VIRTUAL_H) continue;
          const idx = (py * VIRTUAL_W + px) * 4;
          data[idx] = ecr; data[idx + 1] = ecg; data[idx + 2] = ecb; data[idx + 3] = 255;
        }
      }
    }

    ctx.putImageData(imageData, 0, 0);
  }, [frame, seeds, bass, mid, volume]);

  return (
    <canvas ref={canvasRef} width={VIRTUAL_W} height={VIRTUAL_H}
      style={{ display: "block", width: "100%", height: "100%" }} />
  );
};
