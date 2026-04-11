import React from "react";
import { AbsoluteFill } from "remotion";
import { BoingBall } from "../components/BoingBall";
import { CopperBars } from "../components/CopperBars";
import { Fire } from "../components/Fire";
import { Plasma } from "../components/Plasma";
import { SineScroller } from "../components/SineScroller";
import { Starfield } from "../components/Starfield";
import { WireframeTunnel } from "../components/WireframeTunnel";

const VIRTUAL_W = 320;
const VIRTUAL_H = 256;
const INT_SCALE = 4;
const SCALED_W = VIRTUAL_W * INT_SCALE;
const SCALED_H = VIRTUAL_H * INT_SCALE;
const OFFSET_X = (1920 - SCALED_W) / 2;
const OFFSET_Y = (1080 - SCALED_H) / 2;

const LAYER: React.CSSProperties = {
  position: "absolute",
  width: VIRTUAL_W,
  height: VIRTUAL_H,
  top: 0,
  left: 0,
  imageRendering: "pixelated",
};

// Static mid-range freq values so all reactive visuals look interesting
const F = { bass: 0.3, mid: 0.3, treble: 0.3, volume: 0.3 };

export interface ScenePreviewProps {
  scene?: 1 | 2 | 3 | 4 | 5 | 6 | 7;
}

export const ScenePreview: React.FC<ScenePreviewProps> = ({ scene = 1 }) => {
  const content = (() => {
    switch (scene) {
      case 1: return <CopperBars {...F} />;
      case 2: return <Starfield {...F} />;
      case 3: return <Plasma {...F} />;
      case 4: return <SineScroller {...F} />;
      case 5:
        return (
          <>
            <BoingBall {...F} />
            <div style={{ ...LAYER, opacity: 0.25, mixBlendMode: "screen" }}>
              <Plasma {...F} />
            </div>
          </>
        );
      case 6: return <WireframeTunnel {...F} />;
      case 7: return <Fire {...F} frameOffset={0} />;
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
