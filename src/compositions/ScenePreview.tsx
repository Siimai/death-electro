import React from "react";
import { AbsoluteFill } from "remotion";
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

const VIRTUAL_W = 320;
const VIRTUAL_H = 256;
const INT_SCALE = 4;
const SCALED_W = VIRTUAL_W * INT_SCALE;
const SCALED_H = VIRTUAL_H * INT_SCALE;
const OFFSET_X = (1920 - SCALED_W) / 2;
const OFFSET_Y = (1080 - SCALED_H) / 2;

// Static mid-range freq values so all reactive visuals look interesting
const F = { bass: 0.3, mid: 0.3, treble: 0.3, volume: 0.3 };

export interface ScenePreviewProps {
  scene?: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12 | 13 | 14 | 15 | 16 | 17 | 18;
}

export const ScenePreview: React.FC<ScenePreviewProps> = ({ scene = 1 }) => {
  const content = (() => {
    switch (scene) {
      case  1: return <CopperBars {...F} />;
      case  2: return <Rotozoom {...F} />;
      case  3: return <Starfield {...F} />;
      case  4: return <Twister {...F} />;
      case  5: return <Plasma {...F} />;
      case  6: return <VectorBalls {...F} />;
      case  7: return <SineScroller {...F} />;
      case  8: return <DotTunnel {...F} />;
      case  9: return <Lissajous {...F} />;
      case 10: return <BoingBall {...F} />;
      case 11: return <Metaballs {...F} />;
      case 12: return <EqBars {...F} />;
      case 13: return <WireframeTunnel {...F} />;
      case 14: return <HexGrid {...F} />;
      case 15: return <MatrixRain {...F} />;
      case 16: return <RotoShapes {...F} />;
      case 17: return <Glenz {...F} />;
      case 18: return <Fire {...F} frameOffset={0} />;
    }
  })();

  return (
    <AbsoluteFill style={{ backgroundColor: "#000000" }}>
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
        {content}
      </div>
    </AbsoluteFill>
  );
};

