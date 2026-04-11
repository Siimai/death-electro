import React, { useLayoutEffect, useRef } from "react";
import { useCurrentFrame } from "remotion";
import { FreqProps } from "../hooks/useFrequencies";

const VIRTUAL_W = 320;
const VIRTUAL_H = 256;
const CX = VIRTUAL_W / 2;
const CY = VIRTUAL_H / 2;

export const WireframeTunnel: React.FC<FreqProps> = ({ bass, mid, volume }) => {
  const frame = useCurrentFrame();
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useLayoutEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const imageData = ctx.createImageData(VIRTUAL_W, VIRTUAL_H);
    const data = imageData.data;

    // Music-reactive parameters
    const zoomSpeed = 0.4 + bass * 2;          // kick drums surge the viewer forward
    const twist     = mid * 0.08;              // midrange corkscrew rotation per depth unit
    const hue       = ((frame * 0.5 + volume * 120) % 360 + 360) % 360;

    const GRID_FREQ  = 6;    // number of grid divisions around the circle / along the depth
    const LINE_FRAC  = 0.12; // fraction of a grid cell occupied by each line (line width)

    for (let y = 0; y < VIRTUAL_H; y++) {
      for (let x = 0; x < VIRTUAL_W; x++) {
        const dx = x - CX;
        const dy = y - CY;
        const r = Math.sqrt(dx * dx + dy * dy);

        if (r < 0.5) {
          // Dead centre pixel — set to pure black
          const idx = (y * VIRTUAL_W + x) * 4;
          data[idx + 3] = 255;
          continue;
        }

        // "Depth" into the tunnel — approaches infinity near centre
        const depth = frame * zoomSpeed * 0.01 + 30.0 / r;

        // Angular position around the tunnel opening (0..1)
        // Twist rotates the angle pattern as depth increases
        const rawAngle = Math.atan2(dy, dx) / (Math.PI * 2) + 0.5;
        const angle = ((rawAngle + depth * twist) % 1 + 1) % 1;

        // Grid space: fractional position within each cell
        const cellU = ((angle * GRID_FREQ) % 1 + 1) % 1;
        const cellV = ((depth * GRID_FREQ * 0.5) % 1 + 1) % 1;

        const onLine = cellU < LINE_FRAC || cellU > (1 - LINE_FRAC) ||
                       cellV < LINE_FRAC || cellV > (1 - LINE_FRAC);

        const idx = (y * VIRTUAL_W + x) * 4;

        if (onLine) {
          // Neon glow: brightness tapers away from dead centre but stays vivid
          const brightness = Math.min(1, 0.4 + (30.0 / (r + 8)) * 0.6);
          // Convert HSL to approximate RGB inline for speed
          // hsl(hue, 100%, brightness*50%) approximation
          const H = hue / 60;
          const C = brightness;
          const X = C * (1 - Math.abs(H % 2 - 1));
          let rr = 0, gg = 0, bb = 0;
          if      (H < 1) { rr = C; gg = X; }
          else if (H < 2) { rr = X; gg = C; }
          else if (H < 3) { gg = C; bb = X; }
          else if (H < 4) { gg = X; bb = C; }
          else if (H < 5) { rr = X; bb = C; }
          else            { rr = C; bb = X; }
          data[idx]     = Math.round(rr * 255);
          data[idx + 1] = Math.round(gg * 255);
          data[idx + 2] = Math.round(bb * 255);
        } else {
          // Deep background — very dark, slight colour tint
          data[idx]     = 0;
          data[idx + 1] = 0;
          data[idx + 2] = 8;
        }
        data[idx + 3] = 255;
      }
    }

    ctx.putImageData(imageData, 0, 0);
  }, [frame, bass, mid, volume]);

  return (
    <canvas
      ref={canvasRef}
      width={VIRTUAL_W}
      height={VIRTUAL_H}
      style={{ display: "block", width: "100%", height: "100%" }}
    />
  );
};
