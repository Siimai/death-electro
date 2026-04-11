import React, { useLayoutEffect, useRef } from "react";
import { useCurrentFrame } from "remotion";
import { FreqProps } from "../hooks/useFrequencies";

const VIRTUAL_W = 320;
const VIRTUAL_H = 256;
const CX = VIRTUAL_W / 2;
const CY = VIRTUAL_H / 2;
// Amplitude so curves fill most of the canvas
const AX = VIRTUAL_W * 0.44;
const AY = VIRTUAL_H * 0.44;
// Steps per curve — more = smoother line
const STEPS = 800;
// Number of overlapping trail frames
const TRAIL = 5;

// Integer ratios a:b for Lissajous figures that look interesting
const RATIOS: [number, number][] = [[1, 2], [2, 3], [3, 4], [3, 5], [4, 5], [5, 6]];

export const Lissajous: React.FC<FreqProps> = ({ bass, mid }) => {
  const frame = useCurrentFrame();
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useLayoutEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const imageData = ctx.createImageData(VIRTUAL_W, VIRTUAL_H);
    const data = imageData.data;

    // Which ratio set are we showing? Cycle every 60 frames
    const ratioIdx = Math.floor(frame / 60) % RATIOS.length;
    const [a, b] = RATIOS[ratioIdx];

    // Base hue shifts with mid
    const baseHue = (frame * 0.8 + mid * 90) % 360;

    // Draw TRAIL overlapping curves (current + 4 older frames), fading
    for (let tr = 0; tr < TRAIL; tr++) {
      const trFrame = frame - tr;
      if (trFrame < 0) continue;

      // Delta phase slowly advances — drives the figure through its full family
      const delta = trFrame * 0.008 + bass * 0.15;

      const alpha = Math.round(((TRAIL - tr) / TRAIL) * 180);
      // Hue shifts between trail frames for a rainbow afterglow
      const hue = (baseHue + tr * 25) % 360;

      // Compute RGB for this trail step
      const l = 0.55;
      const s = 1.0;
      const ac = s * Math.min(l, 1 - l);
      const f = (n: number) => {
        const k = (n + hue / 30) % 12;
        return Math.round((l - ac * Math.max(-1, Math.min(k - 3, 9 - k, 1))) * 255);
      };
      const cr = f(0), cg = f(8), cb = f(4);

      for (let i = 0; i <= STEPS; i++) {
        const t = (i / STEPS) * Math.PI * 2;
        const sx = Math.round(CX + Math.sin(a * t + delta) * AX);
        const sy = Math.round(CY + Math.sin(b * t) * AY);

        if (sx < 0 || sx >= VIRTUAL_W || sy < 0 || sy >= VIRTUAL_H) continue;

        const idx = (sy * VIRTUAL_W + sx) * 4;
        // Additive-ish blend: blend toward the new colour
        data[idx]     = Math.min(255, data[idx]     + Math.round(cr * alpha / 255));
        data[idx + 1] = Math.min(255, data[idx + 1] + Math.round(cg * alpha / 255));
        data[idx + 2] = Math.min(255, data[idx + 2] + Math.round(cb * alpha / 255));
        data[idx + 3] = 255;
      }
    }

    ctx.putImageData(imageData, 0, 0);
  }, [frame, bass, mid]);

  return (
    <canvas ref={canvasRef} width={VIRTUAL_W} height={VIRTUAL_H}
      style={{ display: "block", width: "100%", height: "100%" }} />
  );
};
