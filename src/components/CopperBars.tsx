import React, { useLayoutEffect, useRef } from "react";
import { useCurrentFrame } from "remotion";
import { FreqProps } from "../hooks/useFrequencies";

const VIRTUAL_W = 320;
const VIRTUAL_H = 256;

export const CopperBars: React.FC<FreqProps> = ({ bass, mid }) => {
  const frame = useCurrentFrame();
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useLayoutEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Black background
    ctx.fillStyle = "#000000";
    ctx.fillRect(0, 0, VIRTUAL_W, VIRTUAL_H);

    // Hue drift speed scales with mid (1x baseline → 3x on loud mid)
    const hueSpeed = 1 + mid * 2;

    // Classic copper bars: each scanline gets a cycling HSL color.
    for (let y = 0; y < VIRTUAL_H; y++) {
      const wave1 = Math.sin(y * 0.05 + frame * 0.08) * 60;
      const wave2 = Math.sin(y * 0.03 - frame * 0.05) * 40;
      const wave3 = Math.sin(y * 0.1 + frame * 0.12) * 20;

      const hue =
        ((frame * 2 * hueSpeed + y * 1.4 + wave1 + wave2 + wave3) % 360 + 360) % 360;

      // Bass beats flare brightness (clamped to keep saturation meaningful)
      const baseLightness = 35 + (Math.sin(y * 0.07 + frame * 0.06) * 0.5 + 0.5) * 40;
      const lightness = Math.min(90, baseLightness * (1 + bass * 0.8));

      ctx.fillStyle = `hsl(${hue}, 100%, ${lightness}%)`;
      ctx.fillRect(0, y, VIRTUAL_W, 1);
    }

    // Overlay a faint scanline grid for CRT feel
    ctx.fillStyle = "rgba(0,0,0,0.18)";
    for (let y = 1; y < VIRTUAL_H; y += 2) {
      ctx.fillRect(0, y, VIRTUAL_W, 1);
    }
  }, [frame, bass, mid]);

  return (
    <canvas
      ref={canvasRef}
      width={VIRTUAL_W}
      height={VIRTUAL_H}
      style={{ display: "block", width: "100%", height: "100%" }}
    />
  );
};
