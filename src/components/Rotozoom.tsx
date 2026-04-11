import React, { useLayoutEffect, useRef } from "react";
import { useCurrentFrame } from "remotion";
import { FreqProps } from "../hooks/useFrequencies";

const VIRTUAL_W = 320;
const VIRTUAL_H = 256;
const CX = VIRTUAL_W / 2;
const CY = VIRTUAL_H / 2;
const TILE = 32; // checker tile size in texture space

// HSL → RGB helper (returns 0-255 integers)
function hslRgb(h: number, s: number, l: number): [number, number, number] {
  const a = s * Math.min(l, 1 - l);
  const f = (n: number) => {
    const k = (n + h / 30) % 12;
    return l - a * Math.max(-1, Math.min(k - 3, 9 - k, 1));
  };
  return [Math.round(f(0) * 255), Math.round(f(8) * 255), Math.round(f(4) * 255)];
}

export const Rotozoom: React.FC<FreqProps> = ({ bass, mid }) => {
  const frame = useCurrentFrame();
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useLayoutEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const imageData = ctx.createImageData(VIRTUAL_W, VIRTUAL_H);
    const data = imageData.data;

    // Angle advances steadily; bass gives a tiny lurch each kick
    const angle = frame * 0.018 + bass * 0.12;
    // Zoom oscillates between 0.5× and 2×; mid tightens the range
    const zoom = 1.0 + Math.sin(frame * 0.035) * (0.5 + mid * 0.4);

    const cosA = Math.cos(angle) / zoom;
    const sinA = Math.sin(angle) / zoom;

    // Hue shifts slowly — one full cycle every ~300 frames
    const hue = (frame * 1.2) % 360;
    const [r1, g1, b1] = hslRgb(hue, 0.9, 0.55);
    const [r2, g2, b2] = hslRgb((hue + 180) % 360, 0.9, 0.15);

    for (let y = 0; y < VIRTUAL_H; y++) {
      const dy = y - CY;
      for (let x = 0; x < VIRTUAL_W; x++) {
        const dx = x - CX;
        // Inverse rotate + scale back to texture space
        const u = Math.floor(dx * cosA - dy * sinA) & (TILE * 2 - 1);
        const v = Math.floor(dx * sinA + dy * cosA) & (TILE * 2 - 1);
        const checker = ((u < TILE) !== (v < TILE));

        const idx = (y * VIRTUAL_W + x) * 4;
        if (checker) {
          data[idx] = r1; data[idx + 1] = g1; data[idx + 2] = b1;
        } else {
          data[idx] = r2; data[idx + 1] = g2; data[idx + 2] = b2;
        }
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
