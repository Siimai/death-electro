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
import { DotTunnel } from "../components/DotTunnel";
import { EqBars } from "../components/EqBars";
import { Fire } from "../components/Fire";
import { Glenz } from "../components/Glenz";
import { HexGrid } from "../components/HexGrid";
import { Lissajous } from "../components/Lissajous";
import { MatrixRain } from "../components/MatrixRain";
import { Metaballs } from "../components/Metaballs";
import { Plasma } from "../components/Plasma";
import { RotoShapes } from "../components/RotoShapes";
import { Rotozoom } from "../components/Rotozoom";
import { SineScroller } from "../components/SineScroller";
import { Starfield } from "../components/Starfield";
import { Twister } from "../components/Twister";
import { VectorBalls } from "../components/VectorBalls";
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

// Each scene: step=280, duration=300, 20-frame crossfade → env(start, start+20, start+280, start+300)
// Scene index  start   component
// 0               0    CopperBars
// 1             280    Rotozoom
// 2             560    Starfield
// 3             840    Twister
// 4            1120    Plasma
// 5            1400    VectorBalls
// 6            1680    SineScroller
// 7            1960    DotTunnel
// 8            2240    Lissajous
// 9            2520    BoingBall
// 10           2800    Metaballs
// 11           3080    EqBars
// 12           3360    WireframeTunnel
// 13           3640    HexGrid
// 14           3920    MatrixRain
// 15           4200    RotoShapes
// 16           4480    Glenz
// 17           4760    Fire  (310 frames, ends at 5070)

function env(frame: number, start: number): number {
  return interpolate(frame, [start, start + 20, start + 280, start + 300], [0, 1, 1, 0], {
    extrapolateLeft: "clamp", extrapolateRight: "clamp",
  });
}

interface AmigaDemoProps {
  includeAudio?: boolean;
}

export const AmigaDemo: React.FC<AmigaDemoProps> = ({ includeAudio = false }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const freq = useFrequencies(fps, frame);

  const fp = { bass: freq.bass, mid: freq.mid, treble: freq.treble, volume: freq.volume };

  const s0  = env(frame, 0);
  const s1  = env(frame, 280);
  const s2  = env(frame, 560);
  const s3  = env(frame, 840);
  const s4  = env(frame, 1120);
  const s5  = env(frame, 1400);
  const s6  = env(frame, 1680);
  const s7  = env(frame, 1960);
  const s8  = env(frame, 2240);
  const s9  = env(frame, 2520);
  const s10 = env(frame, 2800);
  const s11 = env(frame, 3080);
  const s12 = env(frame, 3360);
  const s13 = env(frame, 3640);
  const s14 = env(frame, 3920);
  const s15 = env(frame, 4200);
  const s16 = env(frame, 4480);
  // Fire: starts at 4760, ends at 5180 (420 frames — outro at +300, fade at +360–420)
  const s17 = interpolate(frame, [4760, 4780, 5160, 5180], [0, 1, 1, 0], {
    extrapolateLeft: "clamp", extrapolateRight: "clamp",
  });

  // Photosensitivity warning — visible for first ~4 s
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
        {/* Scene 0: CopperBars (0–300) */}
        <div style={{ ...LAYER_BASE, opacity: s0 }}><CopperBars {...fp} /></div>

        {/* Scene 1: Rotozoom (280–580) */}
        <div style={{ ...LAYER_BASE, opacity: s1 }}><Rotozoom {...fp} /></div>

        {/* Scene 2: Starfield (560–860) */}
        <div style={{ ...LAYER_BASE, opacity: s2 }}><Starfield {...fp} /></div>

        {/* Scene 3: Twister (840–1140) */}
        <div style={{ ...LAYER_BASE, opacity: s3 }}><Twister {...fp} /></div>

        {/* Scene 4: Plasma (1120–1420) */}
        <div style={{ ...LAYER_BASE, opacity: s4 }}><Plasma {...fp} /></div>

        {/* Scene 5: VectorBalls (1400–1700) */}
        <div style={{ ...LAYER_BASE, opacity: s5 }}><VectorBalls {...fp} /></div>

        {/* Scene 6: SineScroller (1680–1980) */}
        <div style={{ ...LAYER_BASE, opacity: s6 }}><SineScroller {...fp} /></div>

        {/* Scene 7: DotTunnel (1960–2260) */}
        <div style={{ ...LAYER_BASE, opacity: s7 }}><DotTunnel {...fp} /></div>

        {/* Scene 8: Lissajous (2240–2540) */}
        <div style={{ ...LAYER_BASE, opacity: s8 }}><Lissajous {...fp} /></div>

        {/* Scene 9: BoingBall (2520–2820) — no Plasma overlay */}
        <div style={{ ...LAYER_BASE, opacity: s9 }}><BoingBall {...fp} /></div>

        {/* Scene 10: Metaballs (2800–3100) */}
        <div style={{ ...LAYER_BASE, opacity: s10 }}><Metaballs {...fp} /></div>

        {/* Scene 11: EqBars (3080–3380) */}
        <div style={{ ...LAYER_BASE, opacity: s11 }}><EqBars {...fp} /></div>

        {/* Scene 12: WireframeTunnel (3360–3660) */}
        <div style={{ ...LAYER_BASE, opacity: s12 }}><WireframeTunnel {...fp} /></div>

        {/* Scene 13: HexGrid (3640–3940) */}
        <div style={{ ...LAYER_BASE, opacity: s13 }}><HexGrid {...fp} /></div>

        {/* Scene 14: MatrixRain (3920–4220) */}
        <div style={{ ...LAYER_BASE, opacity: s14 }}><MatrixRain {...fp} /></div>

        {/* Scene 15: RotoShapes (4200–4500) */}
        <div style={{ ...LAYER_BASE, opacity: s15 }}><RotoShapes {...fp} /></div>

        {/* Scene 16: Glenz (4480–4780) */}
        <div style={{ ...LAYER_BASE, opacity: s16 }}><Glenz {...fp} /></div>

        {/* Scene 17: Fire (4760–5070) */}
        <div style={{ ...LAYER_BASE, opacity: s17 }}><Fire {...fp} /></div>
      </div>

      {/* Photosensitivity warning (~4 s at the very start) */}
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
