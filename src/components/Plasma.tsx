import React, { useLayoutEffect, useRef } from "react";
import { useCurrentFrame } from "remotion";
import { FreqProps } from "../hooks/useFrequencies";

const VIRTUAL_W = 320;
const VIRTUAL_H = 256;

// Convert HSL (h in [0,1], s in [0,1], l in [0,1]) to RGB ([0,255] each)
function hueToRgb(p: number, q: number, t: number): number {
  let tt = t;
  if (tt < 0) tt += 1;
  if (tt > 1) tt -= 1;
  if (tt < 1 / 6) return p + (q - p) * 6 * tt;
  if (tt < 1 / 2) return q;
  if (tt < 2 / 3) return p + (q - p) * (2 / 3 - tt) * 6;
  return p;
}

function hslToRgb(
  h: number,
  s: number,
  l: number
): [number, number, number] {
  const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
  const p = 2 * l - q;
  return [
    Math.round(hueToRgb(p, q, h + 1 / 3) * 255),
    Math.round(hueToRgb(p, q, h) * 255),
    Math.round(hueToRgb(p, q, h - 1 / 3) * 255),
  ];
}

export const Plasma: React.FC<FreqProps> = ({ volume }) => {
  const frame = useCurrentFrame();
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useLayoutEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const imageData = ctx.createImageData(VIRTUAL_W, VIRTUAL_H);
    const data = imageData.data;

    // Loud sections churn plasma faster; quiet passages slow to an ooze
    const speedMult = 1 + volume * 0.7;
    // Saturation breathes subtly with volume
    const saturation = 0.7 + volume * 0.1;

    for (let y = 0; y < VIRTUAL_H; y++) {
      for (let x = 0; x < VIRTUAL_W; x++) {
        const t = frame * speedMult;
        const v =
          Math.sin(x / 8  + t / 20) * 128 +
          Math.sin(y / 6  + t / 15) * 128 +
          Math.sin((x + y) / 10 + t / 25) * 128 +
          Math.sin(Math.sqrt(x * x + y * y) / 7 + t / 18) * 128;

        const hue = (v + 512) / 1024;
        const [r, g, b] = hslToRgb(hue, saturation, 0.5);

        const idx = (y * VIRTUAL_W + x) * 4;
        data[idx]     = r;
        data[idx + 1] = g;
        data[idx + 2] = b;
        data[idx + 3] = 255;
      }
    }

    ctx.putImageData(imageData, 0, 0);
  }, [frame, volume]);

  return (
    <canvas
      ref={canvasRef}
      width={VIRTUAL_W}
      height={VIRTUAL_H}
      style={{ display: "block", width: "100%", height: "100%" }}
    />
  );
};
