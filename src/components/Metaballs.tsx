import React, { useLayoutEffect, useMemo, useRef } from "react";
import { useCurrentFrame } from "remotion";
import { FreqProps } from "../hooks/useFrequencies";

const VIRTUAL_W = 320;
const VIRTUAL_H = 256;
const CX = VIRTUAL_W / 2;
const CY = VIRTUAL_H / 2;
const NUM_BLOBS = 6;
const THRESHOLD = 1.0;

function seeded(n: number) {
  const x = Math.sin(n + 1) * 10000;
  return x - Math.floor(x);
}

interface BlobSeed { ax: number; fx: number; px: number; ay: number; fy: number; py: number; hue: number; }

export const Metaballs: React.FC<FreqProps> = ({ bass, mid }) => {
  const frame = useCurrentFrame();
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const seeds = useMemo<BlobSeed[]>(
    () => Array.from({ length: NUM_BLOBS }, (_, i) => ({
      ax: seeded(i * 7 + 0) * 90 + 40,
      fx: seeded(i * 7 + 1) * 0.03 + 0.01,
      px: seeded(i * 7 + 2) * Math.PI * 2,
      ay: seeded(i * 7 + 3) * 70 + 30,
      fy: seeded(i * 7 + 4) * 0.025 + 0.01,
      py: seeded(i * 7 + 5) * Math.PI * 2,
      hue: Math.round(seeded(i * 7 + 6) * 360),
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

    const blobR = 28 + bass * 18;

    // Current blob positions
    const bx = seeds.map(s => CX + Math.sin(frame * s.fx + s.px) * s.ax);
    const by = seeds.map(s => CY + Math.sin(frame * s.fy + s.py) * s.ay);

    for (let y = 0; y < VIRTUAL_H; y++) {
      for (let x = 0; x < VIRTUAL_W; x++) {
        let sum = 0;
        let hueR = 0, hueG = 0, hueB = 0;
        let totalW = 0;

        for (let b = 0; b < NUM_BLOBS; b++) {
          const dx = x - bx[b];
          const dy = y - by[b];
          const d2 = dx * dx + dy * dy;
          const contrib = (blobR * blobR) / Math.max(1, d2);
          sum += contrib;

          // Accumulate hue as unit-vector average to handle wrapping
          const hrad = (seeds[b].hue + mid * 60) * Math.PI / 180;
          hueR += Math.cos(hrad) * contrib;
          hueG += Math.sin(hrad) * contrib;
          totalW += contrib;
        }

        const idx = (y * VIRTUAL_W + x) * 4;
        if (sum < THRESHOLD) {
          data[idx + 3] = 255;
          continue;
        }

        // Hue from weighted circular mean
        const hue = ((Math.atan2(hueG / totalW, hueR / totalW) * 180 / Math.PI) + 360) % 360;
        // Brightness flares near edges (sum ≈ threshold) and interior stays vivid
        const edge = Math.min(1, (sum - THRESHOLD) / THRESHOLD);
        const l = 0.3 + edge * 0.4;
        const s = 1.0;
        const a = s * Math.min(l, 1 - l);
        const f = (n: number) => {
          const k = (n + hue / 30) % 12;
          return Math.round((l - a * Math.max(-1, Math.min(k - 3, 9 - k, 1))) * 255);
        };
        data[idx]     = f(0);
        data[idx + 1] = f(8);
        data[idx + 2] = f(4);
        data[idx + 3] = 255;
      }
    }

    ctx.putImageData(imageData, 0, 0);
  }, [frame, seeds, bass, mid]);

  return (
    <canvas ref={canvasRef} width={VIRTUAL_W} height={VIRTUAL_H}
      style={{ display: "block", width: "100%", height: "100%" }} />
  );
};
