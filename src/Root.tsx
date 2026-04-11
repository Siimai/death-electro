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
        durationInFrames={5180}
        fps={30}
        width={1920}
        height={1080}
        defaultProps={{ includeAudio: true }}
      />

      {/* ── Individual scene previews (10 s = 300 frames each; Fire = 310) ── */}
      <Composition id="Scene1-CopperBars"    component={ScenePreview} durationInFrames={300} fps={30} width={1920} height={1080} defaultProps={{ scene:  1 }} />
      <Composition id="Scene2-Rotozoom"      component={ScenePreview} durationInFrames={300} fps={30} width={1920} height={1080} defaultProps={{ scene:  2 }} />
      <Composition id="Scene3-Starfield"     component={ScenePreview} durationInFrames={300} fps={30} width={1920} height={1080} defaultProps={{ scene:  3 }} />
      <Composition id="Scene4-Twister"       component={ScenePreview} durationInFrames={300} fps={30} width={1920} height={1080} defaultProps={{ scene:  4 }} />
      <Composition id="Scene5-Plasma"        component={ScenePreview} durationInFrames={300} fps={30} width={1920} height={1080} defaultProps={{ scene:  5 }} />
      <Composition id="Scene6-VectorBalls"   component={ScenePreview} durationInFrames={300} fps={30} width={1920} height={1080} defaultProps={{ scene:  6 }} />
      <Composition id="Scene7-SineScroller"  component={ScenePreview} durationInFrames={300} fps={30} width={1920} height={1080} defaultProps={{ scene:  7 }} />
      <Composition id="Scene8-DotTunnel"     component={ScenePreview} durationInFrames={300} fps={30} width={1920} height={1080} defaultProps={{ scene:  8 }} />
      <Composition id="Scene9-Lissajous"     component={ScenePreview} durationInFrames={300} fps={30} width={1920} height={1080} defaultProps={{ scene:  9 }} />
      <Composition id="Scene10-BoingBall"    component={ScenePreview} durationInFrames={300} fps={30} width={1920} height={1080} defaultProps={{ scene: 10 }} />
      <Composition id="Scene11-Metaballs"    component={ScenePreview} durationInFrames={300} fps={30} width={1920} height={1080} defaultProps={{ scene: 11 }} />
      <Composition id="Scene12-EqBars"       component={ScenePreview} durationInFrames={300} fps={30} width={1920} height={1080} defaultProps={{ scene: 12 }} />
      <Composition id="Scene13-Tunnel"       component={ScenePreview} durationInFrames={300} fps={30} width={1920} height={1080} defaultProps={{ scene: 13 }} />
      <Composition id="Scene14-HexGrid"      component={ScenePreview} durationInFrames={300} fps={30} width={1920} height={1080} defaultProps={{ scene: 14 }} />
      <Composition id="Scene15-MatrixRain"   component={ScenePreview} durationInFrames={300} fps={30} width={1920} height={1080} defaultProps={{ scene: 15 }} />
      <Composition id="Scene16-RotoShapes"   component={ScenePreview} durationInFrames={300} fps={30} width={1920} height={1080} defaultProps={{ scene: 16 }} />
      <Composition id="Scene17-Glenz"        component={ScenePreview} durationInFrames={300} fps={30} width={1920} height={1080} defaultProps={{ scene: 17 }} />
      <Composition id="Scene18-Fire"         component={ScenePreview} durationInFrames={420} fps={30} width={1920} height={1080} defaultProps={{ scene: 18 }} />
    </>
  );
};
