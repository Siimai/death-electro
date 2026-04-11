import React, { useLayoutEffect, useRef } from "react";
import { useCurrentFrame } from "remotion";
import { FreqProps } from "../hooks/useFrequencies";

const VIRTUAL_W = 320;
const VIRTUAL_H = 256;
const NUM_BARS = 32;
const BAR_W = Math.floor(VIRTUAL_W / NUM_BARS); // 10 px each
const MAX_BAR_H = VIRTUAL_H - 16; // leave some top margin

// Colour for each bar: red (low) → yellow → green → cyan → blue (high)
function barColour(t: number): [number, number, number] {
  // t: 0..1 across the frequency range
  if (t < 0.25) {
    const s = t * 4;
    return [255, Math.round(s * 200), 0];
  } else if (t < 0.5) {
    const s = (t - 0.25) * 4;
    return [Math.round(255 * (1 - s * 0.5)), 200, 0];
  } else if (t < 0.75) {
    const s = (t - 0.5) * 4;
    return [Math.round(128 * (1 - s)), 200, Math.round(s * 200)];
  } else {
    const s = (t - 0.75) * 4;
    return [0, Math.round(200 * (1 - s * 0.6)), 200];
  }
}

export const EqBars: React.FC<FreqProps> = ({ bass, mid, treble }) => {
  const frame = useCurrentFrame();
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useLayoutEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const imageData = ctx.createImageData(VIRTUAL_W, VIRTUAL_H);
    const data = imageData.data;

    const BOTTOM = VIRTUAL_H - 6;

    for (let b = 0; b < NUM_BARS; b++) {
      const t = b / (NUM_BARS - 1); // 0..1 across freq range

      // Bars in the low third are driven by bass, mid third by mid, high third by treble
      // with a per-bar sine shimmer to avoid identical heights
      const shimmer = (Math.sin(frame * 0.12 + b * 0.7) * 0.5 + 0.5) * 0.25;
      let level: number;
      if      (t < 0.33)  level = bass   * (1 - shimmer) + shimmer;
      else if (t < 0.67)  level = mid    * (1 - shimmer) + shimmer;
      else                level = treble * (1 - shimmer) + shimmer;

      level = Math.max(0.05, Math.min(1, level));
      const barH = Math.round(level * MAX_BAR_H);
      const [cr, cg, cb] = barColour(t);

      // Dim version for the gap between bars
      const bx = b * BAR_W;

      for (let dy = 0; dy < barH; dy++) {
        const py = BOTTOM - dy;
        if (py < 0) continue;
        // Slightly brighter at top
        const bright = 0.55 + (dy / barH) * 0.45;
        for (let dx = 0; dx < BAR_W - 1; dx++) { // -1 for 1-px gap
          const px = bx + dx;
          if (px >= VIRTUAL_W) continue;
          const idx = (py * VIRTUAL_W + px) * 4;
          data[idx]     = Math.round(cr * bright);
          data[idx + 1] = Math.round(cg * bright);
          data[idx + 2] = Math.round(cb * bright);
          data[idx + 3] = 255;
        }
      }

      // Peak dot — 4 px above bar tip
      const peakY = BOTTOM - barH - 4;
      if (peakY >= 0) {
        for (let dx = 0; dx < BAR_W - 1; dx++) {
          for (let peakDy = 0; peakDy <= 2; peakDy++) {
            const py = peakY + peakDy;
            if (py < 0 || py >= VIRTUAL_H) continue;
            const px = b * BAR_W + dx;
            if (px >= VIRTUAL_W) continue;
            const idx = (py * VIRTUAL_W + px) * 4;
            data[idx]     = Math.min(255, cr + 80);
            data[idx + 1] = Math.min(255, cg + 80);
            data[idx + 2] = Math.min(255, cb + 80);
            data[idx + 3] = 255;
          }
        }
      }
    }

    ctx.putImageData(imageData, 0, 0);
  }, [frame, bass, mid, treble]);

  return (
    <canvas ref={canvasRef} width={VIRTUAL_W} height={VIRTUAL_H}
      style={{ display: "block", width: "100%", height: "100%" }} />
  );
};
