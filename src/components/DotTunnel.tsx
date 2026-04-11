import React, { useLayoutEffect, useRef } from "react";
import { useCurrentFrame } from "remotion";
import { FreqProps } from "../hooks/useFrequencies";

const VIRTUAL_W = 320;
const VIRTUAL_H = 256;
const COLS = 8;
const ROWS = 6;
const LAYERS = 20;
const FL = 200; // focal length

export const DotTunnel: React.FC<FreqProps> = ({ bass, mid }) => {
  const frame = useCurrentFrame();
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useLayoutEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const imageData = ctx.createImageData(VIRTUAL_W, VIRTUAL_H);
    const data = imageData.data;

    const CX = VIRTUAL_W / 2;
    const CY = VIRTUAL_H / 2;

    // Flight speed: surges with bass
    const speed = 2.5 + bass * 6;
    // Twist angle around Z per unit depth; mid slowly rotates the grid
    const twistRate = mid * 0.008;

    // Layer spacing in 3D space
    const LAYER_DEPTH = 20;
    const TOTAL_DEPTH = LAYERS * LAYER_DEPTH;

    for (let l = 0; l < LAYERS; l++) {
      // Raw depth before wrapping
      const rawZ = l * LAYER_DEPTH + TOTAL_DEPTH - ((frame * speed) % TOTAL_DEPTH);
      const z = ((rawZ % TOTAL_DEPTH) + TOTAL_DEPTH) % TOTAL_DEPTH + 1;

      const sc = FL / z;
      // Twist this layer by its depth
      const twist = z * twistRate;
      const cosT = Math.cos(twist);
      const sinT = Math.sin(twist);

      // Brightness fades with distance
      const brightness = Math.min(1, 80 / z);
      const hue = (frame * 0.8 + l * 20) % 360;

      // Colour from HSL
      const lc = brightness * 0.7;
      const sat = 0.9;
      const ac = sat * Math.min(lc, 1 - lc);
      const rgb = (n: number) => {
        const k = (n + hue / 30) % 12;
        return Math.round((lc - ac * Math.max(-1, Math.min(k - 3, 9 - k, 1))) * 255);
      };
      const dr = rgb(0), dg = rgb(8), db = rgb(4);

      for (let row = 0; row < ROWS; row++) {
        for (let col = 0; col < COLS; col++) {
          // Grid point in local space (centred)
          const gx0 = (col - (COLS - 1) / 2) * 25;
          const gy0 = (row - (ROWS - 1) / 2) * 25;

          // Twist rotation
          const gx = gx0 * cosT - gy0 * sinT;
          const gy = gx0 * sinT + gy0 * cosT;

          const sx = Math.round(CX + gx * sc);
          const sy = Math.round(CY + gy * sc);

          if (sx < 0 || sx >= VIRTUAL_W || sy < 0 || sy >= VIRTUAL_H) continue;

          // Dot size: larger when close
          const dotR = Math.max(0, Math.round(sc * 4));
          for (let dy = -dotR; dy <= dotR; dy++) {
            for (let dx = -dotR; dx <= dotR; dx++) {
              if (dx * dx + dy * dy > dotR * dotR) continue;
              const px = sx + dx, py = sy + dy;
              if (px < 0 || px >= VIRTUAL_W || py < 0 || py >= VIRTUAL_H) continue;
              const idx = (py * VIRTUAL_W + px) * 4;
              data[idx]     = dr;
              data[idx + 1] = dg;
              data[idx + 2] = db;
              data[idx + 3] = 255;
            }
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
