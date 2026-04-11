import React from "react";
import { Composition } from "remotion";
import { AmigaDemo } from "./compositions/AmigaDemo";
import { ScenePreview } from "./compositions/ScenePreview";

export const RemotionRoot: React.FC = () => {
  return (
    <>
      {/* ── Full composition ─────────────────────────────────────────────── */}
      <Composition
        id="AmigaDemo"
        component={AmigaDemo}
        durationInFrames={5070} // 2m 49s × 30 fps
        fps={30}
        width={1920}
        height={1080}
        defaultProps={{ includeAudio: true }}
      />

      {/* ── Individual scene previews (10 s each; Scene7_Fire is 14 s) ───── */}
      <Composition id="Scene1-CopperBars"   component={ScenePreview} durationInFrames={300} fps={30} width={1920} height={1080} defaultProps={{ scene: 1 }} />
      <Composition id="Scene2-Starfield"    component={ScenePreview} durationInFrames={300} fps={30} width={1920} height={1080} defaultProps={{ scene: 2 }} />
      <Composition id="Scene3-Plasma"       component={ScenePreview} durationInFrames={300} fps={30} width={1920} height={1080} defaultProps={{ scene: 3 }} />
      <Composition id="Scene4-SineScroller" component={ScenePreview} durationInFrames={300} fps={30} width={1920} height={1080} defaultProps={{ scene: 4 }} />
      <Composition id="Scene5-BoingBall"    component={ScenePreview} durationInFrames={300} fps={30} width={1920} height={1080} defaultProps={{ scene: 5 }} />
      <Composition id="Scene6-Tunnel"       component={ScenePreview} durationInFrames={300} fps={30} width={1920} height={1080} defaultProps={{ scene: 6 }} />
      <Composition id="Scene7-Fire"         component={ScenePreview} durationInFrames={420} fps={30} width={1920} height={1080} defaultProps={{ scene: 7 }} />
    </>
  );
};
