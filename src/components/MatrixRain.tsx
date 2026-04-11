import React, { useLayoutEffect, useRef } from "react";
import { useCurrentFrame } from "remotion";
import { FreqProps } from "../hooks/useFrequencies";

const VIRTUAL_W = 320;
const VIRTUAL_H = 256;
const CHAR_W = 8;
const CHAR_H = 8;
const COLS = Math.floor(VIRTUAL_W / CHAR_W);  // 40
const ROWS = Math.floor(VIRTUAL_H / CHAR_H);  // 32
const TRAIL_LEN = 14;
const REFRESH_RATE = 6; // frames between character tile changes

function seeded(n: number) {
  const x = Math.sin(n + 1) * 10000;
  return x - Math.floor(x);
}

// Generates a deterministic 8×8 pixel glyph for a given seed value
function glyph(seed: number): number[] {
  return Array.from({ length: 8 }, (_, row) =>
    Array.from({ length: 8 }, (__, col) =>
      seeded(seed * 64 + row * 8 + col) > 0.45 ? 1 : 0
    ).reduce((acc: number, v, i) => acc | (v << i), 0)
  );
}

export const MatrixRain: React.FC<FreqProps> = ({ bass, mid }) => {
  const frame = useCurrentFrame();
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useLayoutEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const imageData = ctx.createImageData(VIRTUAL_W, VIRTUAL_H);
    const data = imageData.data;

    // Speed boost from bass
    const speed = 1 + bass * 2;

    for (let col = 0; col < COLS; col++) {
      // Each column has a deterministic fall speed and starting phase
      const colSpeed = (seeded(col * 2) * 0.8 + 0.6) * speed;
      const phase    = seeded(col * 2 + 1) * (ROWS + TRAIL_LEN);
      const headRow  = Math.floor((frame * colSpeed * 0.25 + phase) % (ROWS + TRAIL_LEN)) - TRAIL_LEN;

      for (let tr = 0; tr <= TRAIL_LEN; tr++) {
        const row = headRow + tr;
        if (row < 0 || row >= ROWS) continue;

        // Character seed changes every REFRESH_RATE frames
        const charSeed = Math.floor(frame / REFRESH_RATE) * 100 + col * 41 + tr * 7;
        const pixels = glyph(charSeed);

        // Colour: head is white, tip of trail is dark green
        const trailT = tr / TRAIL_LEN; // 0 = head, 1 = tail
        let r: number, g: number, b: number;
        if (tr === 0) {
          r = 200; g = 255; b = 200; // bright white-green head
        } else {
          r = 0;
          // Mid boosts brightness slightly
          g = Math.round((1 - trailT) * (180 + mid * 60));
          b = 0;
        }

        // Render 8×8 glyph
        const baseX = col * CHAR_W;
        const baseY = row * CHAR_H;
        for (let gr = 0; gr < 8; gr++) {
          const rowBits = pixels[gr];
          for (let gc = 0; gc < 8; gc++) {
            if (!((rowBits >> gc) & 1)) continue;
            const px = baseX + gc;
            const py = baseY + gr;
            if (px >= VIRTUAL_W || py >= VIRTUAL_H) continue;
            const idx = (py * VIRTUAL_W + px) * 4;
            data[idx]     = r;
            data[idx + 1] = g;
            data[idx + 2] = b;
            data[idx + 3] = 255;
          }
        }
      }
    }

    ctx.putImageData(imageData, 0, 0);
  }, [frame, bass, mid]);

  return (
    <canvas ref={canvasRef} width={VIRTUAL_W} height={VIRTUAL_H}
      style={{ display: "block", width: "100%", height: "100%" }} />
  );
};
