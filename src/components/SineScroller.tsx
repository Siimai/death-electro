import React, { useLayoutEffect, useRef } from "react";
import { useCurrentFrame } from "remotion";
import { FreqProps } from "../hooks/useFrequencies";

const VIRTUAL_W = 320;
const VIRTUAL_H = 256;

const SCROLL_TEXT =
  "* GREETINGS FROM THE DEMOSCENE * REMOTION RULEZ * KEEP ON CODING * AMIGA FOREVER * 1992 CALLED, IT WANTS ITS PIXELS BACK * ";

const FONT_SIZE = 12;
const CHAR_W = 7;
const BASE_Y = 225;
const SINE_FREQ = 0.38;
const SINE_SPEED = 0.09;

export const SineScroller: React.FC<FreqProps> = ({ bass, mid, treble }) => {
  const frame = useCurrentFrame();
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useLayoutEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Music-reactive parameters
    const sineAmp   = 16 + bass * 12;           // bass jolts chars up/down
    const scrollSpeed = 1.2 + mid * 0.8;        // mid pushes text faster
    const lightness = 55 + treble * 20;         // treble brightens colours

    const stripTop = BASE_Y - sineAmp - FONT_SIZE - 2;
    const stripH   = sineAmp * 2 + FONT_SIZE + 6;
    const charsOnScreen = Math.ceil(VIRTUAL_W / CHAR_W) + 2;

    ctx.fillStyle = "#000000";
    ctx.fillRect(0, 0, VIRTUAL_W, VIRTUAL_H);

    ctx.fillStyle = "#001400";
    ctx.fillRect(0, stripTop, VIRTUAL_W, stripH);

    ctx.font = `bold ${FONT_SIZE}px "Courier New", monospace`;
    ctx.textBaseline = "top";

    const textPixelLen = SCROLL_TEXT.length * CHAR_W;
    const scrollOffset = (frame * scrollSpeed) % textPixelLen;
    const startChar = Math.floor(scrollOffset / CHAR_W);
    const subCharOffset = scrollOffset - startChar * CHAR_W;

    for (let slot = 0; slot < charsOnScreen + 1; slot++) {
      const charIndex = (startChar + slot) % SCROLL_TEXT.length;
      const char = SCROLL_TEXT[charIndex];
      const charX = slot * CHAR_W - subCharOffset;
      if (charX > VIRTUAL_W) break;

      const absoluteCharPos = startChar + slot;
      const charY =
        BASE_Y +
        Math.sin(frame * SINE_SPEED + absoluteCharPos * SINE_FREQ) * sineAmp;

      const hue = ((absoluteCharPos * 8 + frame * 3) % 360 + 360) % 360;
      ctx.fillStyle = `hsl(${hue}, 100%, ${lightness}%)`;
      ctx.fillText(char, charX, charY);
    }
  }, [frame, bass, mid, treble]);

  return (
    <canvas
      ref={canvasRef}
      width={VIRTUAL_W}
      height={VIRTUAL_H}
      style={{ display: "block", width: "100%", height: "100%" }}
    />
  );
};
