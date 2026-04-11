import React, { useLayoutEffect, useRef } from "react";
import { useCurrentFrame } from "remotion";
import { FreqProps } from "../hooks/useFrequencies";

const VIRTUAL_W = 320;
const VIRTUAL_H = 256;
const CX = VIRTUAL_W / 2;
const CY = VIRTUAL_H / 2;

// Convert offset hex axial coords to pixel centre (pointy-top)
// hex size = radius of circumscribed circle
const HEX_SIZE = 14;
const HEX_W = HEX_SIZE * Math.sqrt(3);
const HEX_H = HEX_SIZE * 2;

export const HexGrid: React.FC<FreqProps> = ({ bass, mid }) => {
  const frame = useCurrentFrame();
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useLayoutEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const imageData = ctx.createImageData(VIRTUAL_W, VIRTUAL_H);
    const data = imageData.data;

    // Hue drifts slowly with mid
    const hueBase = (frame * 0.6 + mid * 120) % 360;
    // Wave speed: bass speeds up the ripple
    const waveSpeed = 0.08 + bass * 0.12;

    // Range of axial hex coordinates that could touch the canvas
    const qRange = Math.ceil(VIRTUAL_W / HEX_W) + 1;
    const rRange = Math.ceil(VIRTUAL_H / (HEX_H * 0.75)) + 1;

    for (let q = -qRange; q <= qRange; q++) {
      for (let r = -rRange; r <= rRange; r++) {
        // Pixel centre of this hex (pointy-top, offset layout)
        const px = CX + HEX_W * (q + r * 0.5);
        const py = CY + HEX_H * 0.75 * r;

        // Hex distance from origin (axial distance)
        const s = -q - r;
        const hexDist = (Math.abs(q) + Math.abs(r) + Math.abs(s)) / 2;

        // Ripple: brightness oscillates outward from centre
        const wave = Math.sin(hexDist * 0.9 - frame * waveSpeed);
        const brightness = (wave * 0.5 + 0.5); // 0..1

        const hue = (hueBase + hexDist * 8) % 360;
        const l = 0.08 + brightness * 0.62;
        const sat = 0.9;
        const a = sat * Math.min(l, 1 - l);
        const f = (n: number) => {
          const k = (n + hue / 30) % 12;
          return Math.round((l - a * Math.max(-1, Math.min(k - 3, 9 - k, 1))) * 255);
        };
        const cr = f(0), cg = f(8), cb = f(4);

        // Draw a filled hexagon by iterating its bounding box
        for (let dy = -HEX_SIZE; dy <= HEX_SIZE; dy++) {
          for (let dx = -Math.ceil(HEX_W / 2); dx <= Math.ceil(HEX_W / 2); dx++) {
            const sx = Math.round(px + dx);
            const sy = Math.round(py + dy);
            if (sx < 0 || sx >= VIRTUAL_W || sy < 0 || sy >= VIRTUAL_H) continue;

            // Point-in-hexagon test (pointy-top)
            const ax = Math.abs(dx);
            const ay = Math.abs(dy);
            if (ay > HEX_SIZE * 1.0) continue;
            if (ax * 0.577 + ay * 0.5 > HEX_SIZE) continue; // approx flat-side test

            const idx = (sy * VIRTUAL_W + sx) * 4;
            data[idx]     = cr;
            data[idx + 1] = cg;
            data[idx + 2] = cb;
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
