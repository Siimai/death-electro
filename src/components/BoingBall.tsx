import React, { useLayoutEffect, useRef } from "react";
import { useCurrentFrame, useVideoConfig } from "remotion";
import { FreqProps } from "../hooks/useFrequencies";

const VIRTUAL_W = 320;
const VIRTUAL_H = 256;
const BASE_BALL_R = 38;
const NUM_SECTORS = 8;
const ROTATION_SPEED = 0.045;

function triangleWave(t: number, period: number): number {
  const phase = (((t % period) + period) % period) / period;
  return phase < 0.5 ? phase * 2 : (1 - phase) * 2;
}

const LIGHT = (() => {
  const lx = 0.45, ly = -0.65, lz = 0.62;
  const len = Math.sqrt(lx * lx + ly * ly + lz * lz);
  return { x: lx / len, y: ly / len, z: lz / len };
})();

export const BoingBall: React.FC<FreqProps> = ({ bass, mid, volume }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useLayoutEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Music-reactive parameters
    const ballR   = BASE_BALL_R + bass * 5;            // bass swells radius
    const speedBoost = 1 + bass * 0.15;                // bass tightens bounce period
    const gridHue = (mid * 240 + 220) % 360;           // mid shifts grid colour

    // ── Background ──────────────────────────────────────────────────────────
    ctx.fillStyle = "#000022";
    ctx.fillRect(0, 0, VIRTUAL_W, VIRTUAL_H);

    // Horizontal grid lines — colour reacts to mid frequency
    ctx.strokeStyle = `hsl(${gridHue}, 80%, 30%)`;
    ctx.lineWidth = 1;
    for (let y = 0; y < VIRTUAL_H; y += 16) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(VIRTUAL_W, y);
      ctx.stroke();
    }

    // ── Ball position ────────────────────────────────────────────────────────
    const bounceW = VIRTUAL_W - ballR * 2;
    const bounceH = VIRTUAL_H - ballR * 2;
    const periodX = (bounceW * 2) / (fps * 0.06 * speedBoost);
    const periodY = (bounceH * 2) / (fps * 0.043 * speedBoost);

    const ballX = ballR + triangleWave(frame, periodX) * bounceW;
    const ballY = ballR + triangleWave(frame * 0.72 + 18, periodY) * bounceH;

    // ── Shadow — Y-radius scales with volume ─────────────────────────────────
    ctx.save();
    ctx.globalAlpha = 0.35;
    ctx.fillStyle = "#000000";
    ctx.beginPath();
    ctx.ellipse(
      ballX + 5,
      VIRTUAL_H - 8,
      ballR * 0.9,
      ballR * (0.22 + volume * 0.15),
      0, 0, Math.PI * 2
    );
    ctx.fill();
    ctx.restore();

    // ── Boing Ball — per-pixel sphere ────────────────────────────────────────
    const rotation = frame * ROTATION_SPEED;
    const r2 = ballR * ballR;

    const bboxX = Math.max(0, Math.floor(ballX - ballR) - 1);
    const bboxY = Math.max(0, Math.floor(ballY - ballR) - 1);
    const bboxW = Math.min(VIRTUAL_W - bboxX, Math.ceil(ballR) * 2 + 3);
    const bboxH = Math.min(VIRTUAL_H - bboxY, Math.ceil(ballR) * 2 + 3);

    const imageData = ctx.createImageData(bboxW, bboxH);
    const data = imageData.data;

    for (let i = 0; i < data.length; i += 4) {
      data[i] = 0; data[i + 1] = 0; data[i + 2] = 34; data[i + 3] = 255;
    }

    for (let ly = 0; ly < bboxH; ly++) {
      for (let lx = 0; lx < bboxW; lx++) {
        const px = bboxX + lx;
        const py = bboxY + ly;
        const dx = px - ballX;
        const dy = py - ballY;
        const dist2 = dx * dx + dy * dy;
        if (dist2 > r2) continue;

        const dz = Math.sqrt(r2 - dist2);
        const nx = dx / ballR;
        const ny = dy / ballR;
        const nz = dz / ballR;

        const theta = Math.acos(Math.max(-1, Math.min(1, ny)));
        const phi =
          ((Math.atan2(nx, nz) + rotation) % (Math.PI * 2) + Math.PI * 2) %
          (Math.PI * 2);

        const thetaStripe = Math.floor(theta / (Math.PI / NUM_SECTORS));
        const phiStripe   = Math.floor(phi   / ((Math.PI * 2) / NUM_SECTORS));
        const isRed = (thetaStripe + phiStripe) % 2 === 0;

        const diffuse = Math.max(
          0.18,
          nx * LIGHT.x + ny * LIGHT.y + nz * LIGHT.z
        );
        const reflZ = 2 * nz * LIGHT.z - LIGHT.z;
        const spec = Math.pow(Math.max(0, reflZ), 8) * 0.4;

        const idx = (ly * bboxW + lx) * 4;
        if (isRed) {
          data[idx]     = Math.min(255, Math.round(255 * diffuse + spec * 255));
          data[idx + 1] = Math.min(255, Math.round(20  * diffuse + spec * 255));
          data[idx + 2] = Math.min(255, Math.round(20  * diffuse + spec * 255));
        } else {
          const w = Math.min(255, Math.round(245 * diffuse + spec * 255));
          data[idx] = w; data[idx + 1] = w; data[idx + 2] = w;
        }
        data[idx + 3] = 255;
      }
    }

    ctx.putImageData(imageData, bboxX, bboxY);
  }, [frame, fps, bass, mid, volume]);

  return (
    <canvas
      ref={canvasRef}
      width={VIRTUAL_W}
      height={VIRTUAL_H}
      style={{ display: "block", width: "100%", height: "100%" }}
    />
  );
};
