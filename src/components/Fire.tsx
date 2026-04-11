import React, { useLayoutEffect, useRef } from "react";
import { interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { FreqProps } from "../hooks/useFrequencies";

const VIRTUAL_W = 320;
const VIRTUAL_H = 256;

// Default absolute offsets when rendered as part of the full composition
const SCENE_START = 4650;
// Relative offsets within the scene (same whether standalone or full)
const REL_OUTRO_START  = 300;
const REL_FADE_START   = 360;
const REL_SCENE_LENGTH = 420;

// Fire palette: black → dark red → red → orange → yellow → white
function firePalette(heat: number): [number, number, number] {
  const t = heat < 0 ? 0 : heat > 1 ? 1 : heat;
  if (t < 0.25) {
    const s = t * 4;
    return [Math.round(s * 139), 0, 0];
  } else if (t < 0.5) {
    const s = (t - 0.25) * 4;
    return [Math.round(139 + s * 116), Math.round(s * 30), 0];
  } else if (t < 0.75) {
    const s = (t - 0.5) * 4;
    return [255, Math.round(30 + s * 165), 0];
  } else {
    const s = (t - 0.75) * 4;
    return [255, Math.round(195 + s * 60), Math.round(s * 200)];
  }
}

interface FireProps extends FreqProps {
  /** Absolute frame at which this scene starts in the full composition.
   *  Pass 0 when rendering this component standalone for preview. */
  frameOffset?: number;
}

export const Fire: React.FC<FireProps> = ({ bass, volume, frameOffset = SCENE_START }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Local frame offset (0 at scene start, regardless of full-video position)
  const localFrame  = frame - frameOffset;
  const outroLocalF = Math.max(0, localFrame - REL_OUTRO_START);

  const outroOpacity = interpolate(localFrame, [REL_OUTRO_START, REL_OUTRO_START + 30], [0, 1], {
    extrapolateLeft: "clamp", extrapolateRight: "clamp",
  });
  const outroScale = spring({ frame: outroLocalF, fps, config: { damping: 14, stiffness: 120 } });

  const finalFade = interpolate(localFrame, [REL_FADE_START, REL_SCENE_LENGTH], [1, 0], {
    extrapolateLeft: "clamp", extrapolateRight: "clamp",
  });

  useLayoutEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const imageData = ctx.createImageData(VIRTUAL_W, VIRTUAL_H);
    const data = imageData.data;

    // growthT: 0 at scene start → 1 at frame 250 (~8s), then holds full size
    const growthT = Math.min(1, Math.max(0, localFrame / 250));

    // Seed intensity: starts modest, climbs to full intensity; bass adds transient kicks
    const seedMax = 0.35 + growthT * 0.55 + bass * 0.25;

    // Seed rows: 3 at the start, expands to 12 — wider base = bigger flames
    const seedRows = 3 + Math.round(growthT * 9);

    // Cooling: high (short flames) at the start, drops to minimum at peak.
    // At cooling=0.038 flames reach ~26 rows; at cooling=0.008 they reach ~125 rows.
    const cooling = Math.max(0.006, 0.038 - growthT * 0.030 - volume * 0.008);

    // Build a simple heat array: seed bottom rows, spread upward deterministically
    const heatBuf = new Float32Array(VIRTUAL_W * VIRTUAL_H);

    // Seed with two slow spatial waves travelling in opposite directions.
    // Their interference creates organic flickering without any consistent horizontal scroll.
    for (let row = 0; row < seedRows; row++) {
      const gy = VIRTUAL_H - 1 - row;
      for (let x = 0; x < VIRTUAL_W; x++) {
        const n = 0.5
          + 0.32 * Math.sin(x * 0.12 + localFrame * 0.10 + row * 1.0)
          + 0.18 * Math.sin(x * 0.23 - localFrame * 0.15 + row * 0.5);
        heatBuf[gy * VIRTUAL_W + x] = Math.max(0, n * seedMax);
      }
    }

    // Wind: a slow sinusoidal lean (full swing every ~6 s) that shifts the
    // sampling column fractionally as heat rises — flames bend in the breeze.
    const windDrift = Math.sin(localFrame * 0.035) * 0.9;

    // Propagate heat upward with wind-biased fractional sampling
    for (let y = VIRTUAL_H - seedRows - 1; y >= 0; y--) {
      for (let x = 0; x < VIRTUAL_W; x++) {
        const wx  = x + windDrift;
        const wx0 = Math.max(0, Math.min(VIRTUAL_W - 1, Math.floor(wx)));
        const wx1 = Math.min(VIRTUAL_W - 1, wx0 + 1);
        const f   = wx - Math.floor(wx);

        const yb  = y + 1;
        const yb2 = Math.min(VIRTUAL_H - 1, y + 2);

        const lerp = (a: number, b: number) => a * (1 - f) + b * f;
        const hl = lerp(heatBuf[yb * VIRTUAL_W + Math.max(0, wx0 - 1)],             heatBuf[yb * VIRTUAL_W + Math.max(0, wx1 - 1)]);
        const hc = lerp(heatBuf[yb * VIRTUAL_W + wx0],                               heatBuf[yb * VIRTUAL_W + wx1]);
        const hr = lerp(heatBuf[yb * VIRTUAL_W + Math.min(VIRTUAL_W - 1, wx0 + 1)], heatBuf[yb * VIRTUAL_W + Math.min(VIRTUAL_W - 1, wx1 + 1)]);
        const h2 = lerp(heatBuf[yb2 * VIRTUAL_W + wx0],                              heatBuf[yb2 * VIRTUAL_W + wx1]);

        heatBuf[y * VIRTUAL_W + x] = Math.max(0, (hl + hc + hr + h2) * 0.25 - cooling);
      }
    }

    // Render heat buffer using the fire palette
    for (let i = 0; i < VIRTUAL_W * VIRTUAL_H; i++) {
      const [r, g, b] = firePalette(heatBuf[i]);
      data[i * 4]     = r;
      data[i * 4 + 1] = g;
      data[i * 4 + 2] = b;
      data[i * 4 + 3] = 255;
    }

    ctx.putImageData(imageData, 0, 0);

    // ── Outro text overlay ───────────────────────────────────────────────────
    if (outroOpacity > 0) {
      ctx.save();
      ctx.globalAlpha = outroOpacity;
      ctx.translate(VIRTUAL_W / 2, VIRTUAL_H / 2 - 20);
      ctx.scale(outroScale, outroScale);

      const lines = ["GREETINGS", "* END OF LINE *", "REMOTION DEMO 2026"];
      const lineH = 14;

      lines.forEach((line, i) => {
        const y = (i - 1) * lineH;
        // Green glow shadow
        ctx.font = `bold 11px "Courier New", monospace`;
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillStyle = "#003300";
        ctx.fillText(line, 1, y + 1);
        // Main green text
        ctx.fillStyle = "#00ff44";
        ctx.fillText(line, 0, y);
      });

      ctx.restore();
    }

    // ── Final fade to black ───────────────────────────────────────────────────
    if (finalFade < 1) {
      ctx.save();
      ctx.globalAlpha = 1 - finalFade;
      ctx.fillStyle = "#000000";
      ctx.fillRect(0, 0, VIRTUAL_W, VIRTUAL_H);
      ctx.restore();
    }
  }, [frame, bass, volume, outroOpacity, outroScale, finalFade, localFrame, fps]);

  return (
    <canvas
      ref={canvasRef}
      width={VIRTUAL_W}
      height={VIRTUAL_H}
      style={{ display: "block", width: "100%", height: "100%" }}
    />
  );
};
