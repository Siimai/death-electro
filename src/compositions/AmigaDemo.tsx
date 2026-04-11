import React from "react";
import {
  AbsoluteFill,
  Audio,
  interpolate,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { BoingBall } from "../components/BoingBall";
import { CopperBars } from "../components/CopperBars";
import { Fire } from "../components/Fire";
import { Plasma } from "../components/Plasma";
import { SineScroller } from "../components/SineScroller";
import { Starfield } from "../components/Starfield";
import { WireframeTunnel } from "../components/WireframeTunnel";
import { useFrequencies } from "../hooks/useFrequencies";

// Virtual (Amiga-like) resolution rendered at this size, then CSS-scaled up
const VIRTUAL_W = 320;
const VIRTUAL_H = 256;
const INT_SCALE = 4; // 1280 × 1024 inside a 1920×1080 frame

const SCALED_W = VIRTUAL_W * INT_SCALE; // 1280
const SCALED_H = VIRTUAL_H * INT_SCALE; // 1024
const OFFSET_X = (1920 - SCALED_W) / 2;
const OFFSET_Y = (1080 - SCALED_H) / 2;

const LAYER_BASE: React.CSSProperties = {
  position: "absolute",
  width: VIRTUAL_W,
  height: VIRTUAL_H,
  top: 0,
  left: 0,
  imageRendering: "pixelated",
};

interface AmigaDemoProps {
  includeAudio?: boolean;
}

export const AmigaDemo: React.FC<AmigaDemoProps> = ({ includeAudio = false }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const freq = useFrequencies(fps, frame);

  const fp = { bass: freq.bass, mid: freq.mid, treble: freq.treble, volume: freq.volume };

  // ── Scene opacity envelopes (20-frame fades at each boundary) ────────────
  // Scene 1: Copper Bars        0 – 900
  const scene1 = interpolate(frame, [0, 20, 880, 900], [0, 1, 1, 0], {
    extrapolateLeft: "clamp", extrapolateRight: "clamp",
  });
  // Scene 2: Starfield          750 – 1800
  const scene2 = interpolate(frame, [750, 770, 1780, 1800], [0, 1, 1, 0], {
    extrapolateLeft: "clamp", extrapolateRight: "clamp",
  });
  // Scene 3: Plasma             1650 – 2700
  const scene3 = interpolate(frame, [1650, 1670, 2680, 2700], [0, 1, 1, 0], {
    extrapolateLeft: "clamp", extrapolateRight: "clamp",
  });
  // Scene 4: Sine Scroller      2550 – 3600
  const scene4 = interpolate(frame, [2550, 2570, 3580, 3600], [0, 1, 1, 0], {
    extrapolateLeft: "clamp", extrapolateRight: "clamp",
  });
  // Scene 5: Boing Ball         3450 – 4350
  const scene5 = interpolate(frame, [3450, 3470, 4330, 4350], [0, 1, 1, 0], {
    extrapolateLeft: "clamp", extrapolateRight: "clamp",
  });
  // Scene 6: Wireframe Tunnel   4200 – 4800
  const scene6 = interpolate(frame, [4200, 4220, 4780, 4800], [0, 1, 1, 0], {
    extrapolateLeft: "clamp", extrapolateRight: "clamp",
  });
  // Scene 7: Fire + Outro       4650 – 5070
  const scene7 = interpolate(frame, [4650, 4670, 5050, 5070], [0, 1, 1, 0], {
    extrapolateLeft: "clamp", extrapolateRight: "clamp",
  });

  // ── Photosensitivity warning — fades in at start, gone by frame 120 ────
  const warningOpacity = interpolate(frame, [0, 15, 90, 120], [0, 1, 1, 0], {
    extrapolateLeft: "clamp", extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill style={{ backgroundColor: "#000000" }}>
      {includeAudio && (
        <Audio src={staticFile("10-Death Electro.mp3")} volume={1} />
      )}

      <div
        style={{
          position: "absolute",
          width: VIRTUAL_W,
          height: VIRTUAL_H,
          left: OFFSET_X,
          top: OFFSET_Y,
          transform: `scale(${INT_SCALE})`,
          transformOrigin: "top left",
          imageRendering: "pixelated",
        }}
      >
        {/* ── Scene 1: Copper Bars (0–900) ── */}
        <div style={{ ...LAYER_BASE, opacity: scene1 }}>
          <CopperBars {...fp} />
        </div>

        {/* ── Scene 2: Starfield (750–1800) ── */}
        <div style={{ ...LAYER_BASE, opacity: scene2 }}>
          <Starfield {...fp} />
        </div>

        {/* ── Scene 3: Plasma (1650–2700) ── */}
        <div style={{ ...LAYER_BASE, opacity: scene3 }}>
          <Plasma {...fp} />
        </div>

        {/* ── Scene 4: Sine Scroller (2550–3600) ── */}
        <div style={{ ...LAYER_BASE, opacity: scene4 }}>
          <SineScroller {...fp} />
        </div>

        {/* ── Scene 5: Boing Ball (3450–4350) + Plasma screen-blended over ── */}
        <div style={{ ...LAYER_BASE, opacity: scene5 }}>
          <BoingBall {...fp} />
          <div style={{ ...LAYER_BASE, opacity: 0.25, mixBlendMode: "screen" }}>
            <Plasma {...fp} />
          </div>
        </div>

        {/* ── Scene 6: Wireframe Tunnel (4200–4800) ── */}
        <div style={{ ...LAYER_BASE, opacity: scene6 }}>
          <WireframeTunnel {...fp} />
        </div>

        {/* ── Scene 7: Fire + Outro (4650–5070) ── */}
        <div style={{ ...LAYER_BASE, opacity: scene7 }}>
          <Fire {...fp} />
        </div>
      </div>

      {/* ── Photosensitivity warning (~4 s at the very start) ── */}
      {frame < 125 && (
        <AbsoluteFill
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: "rgba(0,0,0,0.88)",
            opacity: warningOpacity,
          }}
        >
          <div
            style={{
              fontFamily: "sans-serif",
              textAlign: "center",
              padding: "40px 60px",
              border: "3px solid #f90",
              borderRadius: 8,
              maxWidth: 960,
            }}
          >
            <div style={{ fontSize: 38, fontWeight: "bold", marginBottom: 20, color: "#f90" }}>
              &#9888; PHOTOSENSITIVITY WARNING
            </div>
            <div style={{ fontSize: 26, color: "#fff", lineHeight: 1.7 }}>
              This video contains flashing lights and rapidly changing colours.<br />
              Viewer discretion is advised for people with photosensitive epilepsy.
            </div>
          </div>
        </AbsoluteFill>
      )}
    </AbsoluteFill>
  );
};
