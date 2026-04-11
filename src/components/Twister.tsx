import React, { useLayoutEffect, useRef } from "react";
import { useCurrentFrame } from "remotion";
import { FreqProps } from "../hooks/useFrequencies";

const VIRTUAL_W = 320;
const VIRTUAL_H = 256;
const BAND_COUNT = 6;

// Palette for each colour band
const BAND_HUES = [0, 40, 80, 170, 220, 280];

export const Twister: React.FC<FreqProps> = ({ bass, mid }) => {
  const frame = useCurrentFrame();
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useLayoutEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const imageData = ctx.createImageData(VIRTUAL_W, VIRTUAL_H);
    const data = imageData.data;

    // Base twist frequency increases with mid
    const twistSpeed = 0.06 + mid * 0.04;
    // Bass adds a quick phase jolt
    const bassBump = bass * 0.5;

    for (let y = 0; y < VIRTUAL_H; y++) {
      // Sine wave encodes how "face-on" the ribbon is at this row.
      // phase ranges from -π to +π as it unrolls over time.
      const phase = y * twistSpeed - frame * 0.04 + bassBump;
      const twist = Math.cos(phase); // -1..+1 (edge-on → face-on)

      // Full ribbon occupies the central 80 % of the width; twisting forshortens it
      const halfWidth = Math.round(VIRTUAL_W * 0.40 * Math.abs(twist));
      const cx = VIRTUAL_W / 2;

      for (let x = 0; x < VIRTUAL_W; x++) {
        const idx = (y * VIRTUAL_W + x) * 4;
        const dx = x - cx;

        if (halfWidth < 1 || Math.abs(dx) > halfWidth) {
          // Outside ribbon — black
          data[idx + 3] = 255;
          continue;
        }

        // U coordinate across the ribbon (0..1)
        const u = (dx / halfWidth + 1) * 0.5;
        // Which band does this U fall in?
        const band = Math.min(BAND_COUNT - 1, Math.floor(u * BAND_COUNT));
        const hue = BAND_HUES[band];

        // Flipping twist direction means bands appear reversed — mirrored look
        const finalHue = twist >= 0 ? hue : BAND_HUES[BAND_COUNT - 1 - band];

        // Brightness slightly brighter near edge to give pseudo-lighting
        const edgeDist = 1 - Math.abs(dx / halfWidth);
        const l = 0.35 + edgeDist * 0.35;

        // Inline HSL → RGB
        const s = 1.0;
        const a = s * Math.min(l, 1 - l);
        const f = (n: number) => {
          const k = (n + finalHue / 30) % 12;
          return l - a * Math.max(-1, Math.min(k - 3, 9 - k, 1));
        };
        data[idx]     = Math.round(f(0) * 255);
        data[idx + 1] = Math.round(f(8) * 255);
        data[idx + 2] = Math.round(f(4) * 255);
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
