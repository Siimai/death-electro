# 18-Scene Expansion Plan

## Goal
Expand the demo from 7 long scenes to 18 short scenes, each ≤ 10 seconds (300 frames). The full track (5,070 frames / 2m 49s) is filled by 18 scenes with 20-frame crossfades between them. All 7 existing scenes are kept; 11 new ones are added.

---

## Timing Formula

- Scene duration: **300 frames (10 s)** — except the last (Fire, 310 frames to reach exactly 5,070)
- Crossfade: 20 frames (fade-out start of scene N overlaps fade-in of scene N+1)
- Step between scene starts: **280 frames**
- Total: 17 × 280 + 310 = **5,070 frames** ✓

Each scene's opacity envelope:
```
interpolate(frame, [start, start+20, end-20, end], [0, 1, 1, 0])
```

---

## Scene List

| # | ID | Component | Frames | Notes |
|---|-----|-----------|--------|-------|
| 0 | `Scene1-CopperBars` | `CopperBars` *(existing)* | 0 – 300 | Calm opener |
| 1 | `Scene2-Rotozoom` | `Rotozoom` *(new)* | 280 – 580 | Rotating/zooming tiled checker |
| 2 | `Scene3-Starfield` | `Starfield` *(existing)* | 560 – 860 | Space flythrough with comets |
| 3 | `Scene4-Twister` | `Twister` *(new)* | 840 – 1140 | Twisted ribbon of neon colour bands |
| 4 | `Scene5-Plasma` | `Plasma` *(existing)* | 1120 – 1420 | Flowing palette plasma |
| 5 | `Scene6-VectorBalls` | `VectorBalls` *(new)* | 1400 – 1700 | Metallic 3-D spheres on sine orbits |
| 6 | `Scene7-SineScroller` | `SineScroller` *(existing)* | 1680 – 1980 | Classic sine text scroll |
| 7 | `Scene8-DotTunnel` | `DotTunnel` *(new)* | 1960 – 2260 | Perspective dot grid zooming into screen |
| 8 | `Scene9-Lissajous` | `Lissajous` *(new)* | 2240 – 2540 | Neon XY oscilloscope curves |
| 9 | `Scene10-BoingBall` | `BoingBall` *(existing)* | 2520 – 2820 | Iconic Amiga bouncing ball |
| 10 | `Scene11-Metaballs` | `Metaballs` *(new)* | 2800 – 3100 | Organic blobs merging/separating |
| 11 | `Scene12-EqBars` | `EqBars` *(new)* | 3080 – 3380 | Equaliser bar chart pulsing with music |
| 12 | `Scene13-Tunnel` | `WireframeTunnel` *(existing)* | 3360 – 3660 | Neon wireframe tunnel (fan favourite) |
| 13 | `Scene14-HexGrid` | `HexGrid` *(new)* | 3640 – 3940 | Hexagonal grid rippling from centre |
| 14 | `Scene15-MatrixRain` | `MatrixRain` *(new)* | 3920 – 4220 | Green falling-character columns |
| 15 | `Scene16-RotoShapes` | `RotoShapes` *(new)* | 4200 – 4500 | Rotating filled vector polygons |
| 16 | `Scene17-Glenz` | `Glenz` *(new)* | 4480 – 4780 | Transparent overlapping rotating polygons |
| 17 | `Scene18-Fire` | `Fire` *(existing, updated)* | 4760 – 5070 | Growing flames + outro text |

---

## New Components — Visual Descriptions

### `Rotozoom`
Every pixel is rotated + zoomed back to a tiled checkerboard UV. The checker tile hue rotates slowly; zoom pulses with `mid`; rotation speed bumps on `bass`. Gives the classic "infinite rotating floor" look.

### `Twister`
A horizontal ribbon of 6 neon colour bands appears to twist vertically (each row has a different sine-phase). At `twist = 0` the ribbon is full-width and face-on; near `±1` it forreshortens to a thin edge. Bass jolts the twist speed.

### `VectorBalls`
20 metallic-looking spheres orbit on independent 3D sine paths. Each sphere is drawn as a lit disk (normal-map shading with a point light). Sorted back-to-front by Z. Bass swells the sphere radius.

### `DotTunnel`
A 3D grid of points (8 × 6) repeated across 20 depth layers flies toward the camera via perspective projection. Layers recycle as they pass. `mid` twists the grid around Z; `bass` surges the flight speed.

### `Lissajous`
Draws 5 overlapping Lissajous curves (parametric sine/cosine, different a/b ratios) as neon lines using the canvas stroke API. The a/b integer ratio cycles every ~4 s; `mid` advances the delta phase. Trail of 5 previous curves gives a glowing afterimage.

### `Metaballs`
6 blobs positioned on independent sine paths. Per pixel, sum the `r²/d²` contributions from each blob; pixels above threshold 1.0 are coloured by a hue-weighted average of the contributing blobs. `bass` swells blob radius.

### `EqBars`
32 vertical bars, heights driven by `bass` (low bars), `mid` (mid bars), `treble` (high bars) with a per-bar sine shimmer for liveliness. Bar colour gradient from red → green → cyan → blue across the freq range. Peak dot 4 px above each bar.

### `HexGrid`
Per-pixel axial hex coordinate lookup. Each hex is coloured by a ripple wave: `brightness = sin(hexDist × 0.9 − frame × 0.12)`. Hue slowly drifts with `mid`. `bass` makes waves faster.

### `MatrixRain`
40 columns of 8 × 8 character cells (320 ÷ 8 = 40). Each column has a deterministic fall speed and phase. The head cell is white; 12 trailing cells fade to dark green; the rest are black. Character texture is a per-cell deterministic pixel pattern that refreshes every 6 frames.

### `RotoShapes`
6 solid-filled polygons (triangle, square, pentagon, hexagon, …) each orbiting the screen centre on an elliptical path while spinning independently. Rendered via `ctx.fill()`. Hue cycles by shape. Edge highlight from a one-frame motion-blur offset gives depth.

### `Glenz`
8 translucent equilateral triangles, all centred but at different scales, rotating at independent speeds with `ctx.globalAlpha = 0.35`. The additive colour mixing creates shifting Moiré patterns. `volume` varies alpha slightly.

---

## Files to Create / Modify

**New:** `src/components/Rotozoom.tsx`, `Twister.tsx`, `VectorBalls.tsx`, `DotTunnel.tsx`, `Lissajous.tsx`, `Metaballs.tsx`, `EqBars.tsx`, `HexGrid.tsx`, `MatrixRain.tsx`, `RotoShapes.tsx`, `Glenz.tsx`

**Modify:**
- `src/compositions/AmigaDemo.tsx` — full retiming, 18 scene imports
- `src/compositions/ScenePreview.tsx` — extend `scene` prop to `1..18`
- `src/Root.tsx` — add 11 new `<Composition>` preview entries
- `src/components/Fire.tsx` — update `SCENE_START = 4760`, `REL_OUTRO_START = 200`, etc.

---

## Open Questions

1. Some new scenes (Lissajous, EqBars, RotoShapes, Glenz) use the canvas `ctx` stroke/fill API rather than `putImageData`. Is that acceptable, or should everything stay pixel-level?
2. The scene order above is designed for visual variety — do you want to reorder any scenes?
3. Should the `BoingBall` still have the Plasma screen-blend overlay on top (scene 9)? It will only be visible for 10 s now.
