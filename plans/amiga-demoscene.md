# Plan: Amiga Demoscene Animation — Music-Reactive Extended Cut (2m 49s)

## Goal

Extend the existing 30-second Amiga demoscene animation to cover the full "10-Death Electro.mp3" track (~2m 49s / 169s). All scenes — existing and new — must **react to the music in real time** using per-frame audio frequency analysis via `@remotion/media-utils`. The result should feel like a proper Amiga demo synchronized to an electro beat.

---

## Composition

- **ID**: `AmigaDemo`
- **File**: `src/compositions/AmigaDemo.tsx`
- **Duration**: 169s × 30fps = **5,070 frames**
- **Resolution**: 320×256 virtual canvas, CSS `scale(4)` → 1280×1024, centred in 1920×1080
- **FPS**: 30
- **Audio**: `public/10-Death Electro.mp3`

---

## Architecture Change: Music Reactivity

### New dependency

```bash
npm install @remotion/media-utils
```

### New shared hook — `src/hooks/useFrequencies.ts`

Wraps `useAudioData` + `visualizeAudio` into three derived scalar values (0–1 each), safe to call in any component:

```ts
interface Frequencies {
  // Raw (spike) values — react instantly to transients, good for flashes/bursts
  bass:         number;   // sub-bass + bass  (<= ~250 Hz),  bins 0–10
  mid:          number;   // midrange          (250 Hz–2 kHz), bins 10–80
  treble:       number;   // high-mid + air    (> 2 kHz),     bins 80–256
  volume:       number;   // overall amplitude (RMS across all bins)

  // Smoothed envelope — 10-frame rolling average, good for slow colour/speed drift
  bassSmooth:   number;
  midSmooth:    number;
  volumeSmooth: number;
}
```

**Which value drives which element:**

| Raw (spike) | Smoothed |
|-------------|---------|
| Copper bar brightness flare | Copper hue drift speed |
| Star warp burst | Star field density |
| Plasma colour saturation flash | Plasma wave speed |
| Scroller sine amplitude jolt | Scroller scroll speed |
| Ball radius swell | Ball bounce period |
| Tunnel zoom surge | Tunnel twist angle |
| Fire seed intensity | Fire flame height / cooling |
| Full-screen strobe flash | Background glow level |

`useAudioData` is called once per composition (not per component); the resulting `audioData` object and all four derived values are computed in `AmigaDemo.tsx` and **passed as props** to every scene component. This avoids duplicate loading and keeps rendering deterministic.

### Prop pattern for all scene components

Every component receives:
```ts
interface FreqProps {
  bass:   number;
  mid:    number;
  treble: number;
  volume: number;
}
```

When `audioData` is loading (`null`) all four values default to `0` so the scene still renders without music.

---

## Full Scene Timeline (5,070 frames / 2m 49s)

| # | Scene | Frames | Wall time | Duration | Status |
|---|-------|--------|-----------|----------|--------|
| 1 | Copper Bars | 0 – 900 | 0:00 – 0:30 | 30s | **modify** |
| 2 | Starfield | 750 – 1 800 | 0:25 – 1:00 | 35s | **modify** |
| 3 | Plasma | 1 650 – 2 700 | 0:55 – 1:30 | 35s | **modify** |
| 4 | Sine Scroller | 2 550 – 3 600 | 1:25 – 2:00 | 35s | **modify** |
| 5 | Boing Ball | 3 450 – 4 350 | 1:55 – 2:25 | 30s | **modify** |
| 6 | Wireframe Tunnel | 4 200 – 4 800 | 2:20 – 2:40 | 20s | **new** |
| 7 | Fire Effect + Outro | 4 650 – 5 070 | 2:35 – 2:49 | 14s | **new** |

Cross-fades between scenes are 150-frame (5s) dissolves, except the final fade-to-black which is 60 frames.

---

## Modifications to Existing Scenes

### Scene 1 — Copper Bars
- **Extended**: now runs 0–900 frames (30s) instead of 0–210
- **Bass beat pulse**: every copper bar row's brightness is multiplied by `1 + bass * 0.8`; on strong beats the entire screen momentarily flares white then snaps back
- **Hue drift speed**: horizontal hue scroll speed scales with `1 + mid * 2` — faster cycling during busy mid-range passages

### Scene 2 — Starfield
- **Extended**: 750–1 800 frames
- **Star brightness**: each star's opacity is boosted by `+ treble * 0.4`; hi-hat hits make the starfield shimmer
- **Warp burst**: the global star speed multiplier spikes from 1× to `1 + bass * 6` per frame — bass kicks cause a momentary "warp jump"

### Scene 3 — Plasma
- **Extended**: 1 650–2 700 frames
- **Colour wave speed**: the frame divisors in the four sine equations scale inversely with `volume` — loud sections make the plasma churn faster, quiet sections slow to an ooze
- **Saturation modulation**: saturation = `80% + volume * 20%`; builds dynamically through the track

### Scene 4 — Sine Scroller
- **Extended**: 2 550–3 600 frames
- **Sine amplitude**: `SINE_AMP = 16 + bass * 32` — bass kicks throw characters wildly up and down  
- **Scroll speed**: `SCROLL_SPEED = 1.2 + mid * 2` — mid-range energy pushes the text faster  
- **Letter colour brightness**: lightness = `55% + treble * 20%`

### Scene 5 — Boing Ball
- **Extended**: 3 450–4 350 frames (consistent with timeline table)
- **Plasma background**: Plasma rendered underneath at 50% opacity with `mix-blend-mode: screen` — the colour field churns behind the bouncing ball for extra visual density
- **Ball radius**: `BALL_R = 38 + bass * 12` — the ball swells on every kick  
- **Bounce speed**: `periodX` and `periodY` tighten with `1 + bass * 0.4` — the ball bounces faster during intense sections  
- **Background grid colour**: grid lines shift to `hsl(mid * 240, 80%, 30%)` — changes colour with midrange  
- **Shadow elongation**: shadow Y-radius scales with `volume`

---

## New Scenes

### Scene 6 — 3-D Wireframe Tunnel (`src/components/WireframeTunnel.tsx`)

A first-person perspective flight through a square tunnel with glowing neon wireframe walls — a staple of 90s demos.

**Technique**: per-pixel canvas rendering. For each pixel, cast a ray from the viewer; compute tunnel coordinates `(texU, texV)` via `atan2` + `1/distance` math. Colour the pixel based on a grid pattern of thin neon lines.

**Music reactivity**:
- Zoom speed (depth advance per frame) = `0.4 + bass * 2` — kick drums surge the viewer forward
- Tunnel twist angle per depth unit = `mid * 0.08` — midrange causes the tunnel to corkscrew  
- Grid line colour hue = `(frame * 0.5 + volume * 120) % 360` — pulses through spectrum with amplitude

### Scene 7 — Fire Effect + Outro (`src/components/Fire.tsx`)

Classic "fire palette" cellular automaton — columns of embers rise and cool. The scene ends the demo, with a "REMOTION DEMO 2026" text logo fading in at frame 4,950 and a slow fade-to-black into silence at 5,010–5,070.

**Technique**: maintain a `320×256` `Uint8Array` heat buffer. Each frame:
1. Bottom row seeded with random heat values (0–255), scaled by `1 + bass * 1.5`
2. Each pixel = average of pixel below, below-left, below-right, two-below — all minus a small cooling constant
3. Heat value mapped through a 256-entry fire palette (black → red → orange → yellow → white)

**Music reactivity**:
- Seed intensity (bottom flame row max value) scales with `bass * 255 + 80`
- Cooling constant decreases with `volume` — loud sections produce taller, slower-cooling flames
- Colour palette hue-shifts gradually with `mid` during the scene — can go from red fire to a cool "blue plasma fire" during breakdowns

**Outro text** (frame 4,950–5,070): "GREETINGS * END OF LINE * REMOTION DEMO 2026" fades in with a spring then fades to black with the music.

---

## New Files

| File | Purpose |
|------|---------|
| `src/hooks/useFrequencies.ts` | `useFrequencies(fps, frame)` → `{bass, mid, treble, volume}` |
| `src/components/WireframeTunnel.tsx` | Scene 6 |
| `src/components/Fire.tsx` | Scene 7 + outro |

## Modified Files

| File | Change |
|------|--------|
| `src/compositions/AmigaDemo.tsx` | Extend to 5,070 frames; wire `useAudioData`; pass freq props; update scene timing |
| `src/Root.tsx` | Update `durationInFrames` to `5070`; set `includeAudio: true` default |
| `src/components/CopperBars.tsx` | Accept + apply `FreqProps` |
| `src/components/Starfield.tsx` | Accept + apply `FreqProps` |
| `src/components/Plasma.tsx` | Accept + apply `FreqProps` |
| `src/components/SineScroller.tsx` | Accept + apply `FreqProps` |
| `src/components/BoingBall.tsx` | Accept + apply `FreqProps` |

---

## Open Questions

All resolved — ready to implement.

| # | Question | Answer |
|---|----------|--------|
| 2 | Beat detection | Both: raw FFT spikes (fast elements) + 10-frame smoothed envelope (slow elements) |
| 3 | Fire colour | Classic red/orange palette only |
| 4 | Boing Ball background | Plasma composited underneath at 50% opacity (`mix-blend-mode: screen`) for extra density |

---

## Scene Breakdown

### Scene 1 — Copper Bars (0–7s, frames 0–210)

Classic horizontal raster/copper color bars scrolling vertically. The bars cycle through a bright palette (red, orange, yellow, cyan, magenta) in a sine-wave pattern.

- Render N horizontal bars, each with a color derived from `sin(frame + i * offset)`
- Palette: vivid HSL colors cycling over time
- Bars undulate vertically using a sine wave

### Scene 2 — Starfield (frames 150–450, overlaps with scene 1 fade)

Classic 2D starfield — white dots moving outward from the center to simulate warp-speed travel.

- ~200 stars, each with a fixed angle and a speed proportional to their distance from center
- Stars reset to center when they leave the viewport
- Use `useMemo` to seed star positions deterministically (no `Math.random()` — use a seeded sequence)

### Scene 3 — Plasma Effect (frames 360–600)

Smooth, full-screen color plasma using overlapping sine waves — the defining effect of Amiga demos.

- Rendered onto an `<AbsoluteFill>` grid of colored `<div>` cells (e.g. 64×36 cells)
- Color at cell `(x, y)` = `hsl(sin(x/8 + frame/20) * 180 + cos(y/6 + frame/15) * 180 + sin((x+y)/10 + frame/25) * 180, 100%, 50%)`
- Cells are large enough to look chunky/pixelated

### Scene 4 — Sine Scroller (frames 540–780)

A classic horizontally scrolling text band at the bottom of the screen. Text moves right-to-left with each character offset vertically by a sine wave.

- Text: `"GREETINGS FROM THE DEMOSCENE * REMOTION RULEZ * KEEP ON CODING * "`
- Font: monospace, large, white or green on black background strip
- Each character's `translateY` = `sin(frame / 10 + charIndex * 0.4) * 20`
- Horizontal position driven by `frame * scrollSpeed`

### Scene 5 — Boing Ball + Logo Outro (frames 720–900)

The iconic Amiga Boing Ball: a red/white checkerboard sphere bouncing around the screen, with a group name / logo fading in.

- Approximate the Boing Ball as a CSS circle with a rotating conic-gradient (checkerboard illusion via `background: conic-gradient(...)` + `border-radius: 50%`)
- Ball bounces around the screen, reversing direction on edge collision (all deterministic from `frame`)
- Text logo `"REMOTION DEMO 2026"` fades in with a spring at frame 810
- Hard cut to black at frame 900

---

## Transitions

| From → To | Frames | Method |
|-----------|--------|--------|
| Copper → Starfield | 150–210 | Cross-fade via opacity |
| Starfield → Plasma | 360–420 | Plasma fades in over starfield |
| Plasma → Scroller | 540–600 | Plasma fades out, scroller snaps in |
| Scroller → Boing Ball | 720–780 | Fade to black, then ball appears |

---

## Components

| Component | File | Purpose |
|-----------|------|---------|
| `<CopperBars>` | `src/components/CopperBars.tsx` | Animated raster bar rows |
| `<Starfield>` | `src/components/Starfield.tsx` | 2D expanding starfield |
| `<Plasma>` | `src/components/Plasma.tsx` | Sine-wave color grid |
| `<SineScroller>` | `src/components/SineScroller.tsx` | Bouncing character text scroll |
| `<BoingBall>` | `src/components/BoingBall.tsx` | Bouncing checkerboard ball |

---

## Props / Types

```ts
// AmigaDemo has no external props — all motion is driven purely by frame
type AmigaDemoProps = Record<string, never>;

interface Star {
  angle: number;   // radians, fixed
  speed: number;   // pixels per frame
}
```

---

## Palette Reference

| Effect | Colors |
|--------|--------|
| Copper bars | HSL cycling: hue = `(frame * 2 + i * 15) % 360` |
| Plasma | Full HSL spectrum, saturation 100%, lightness 50% |
| Starfield | White `#ffffff`, varying opacity by distance |
| Scroller | Green `#00ff41` on black (Matrix-ish terminal feel) |
| Boing Ball | Red `#ff2200` + white `#ffffff` alternating segments |

---

## Decisions

| # | Question | Answer |
|---|----------|--------|
| 1 | Font for sine scroller | `"Courier New"` (system monospace) |
| 2 | Audio | Chiptune `.mp3` track via Remotion `<Audio>` — place file at `public/chiptune.mp3` |
| 3 | Resolution mode | True **320×256** canvas rendered pixel-perfect, scaled up to 1920×1080 via CSS `image-rendering: pixelated` + `transform: scale(6)` |
| 4 | Boing Ball | `<canvas>` arc math — per-frame sphere rendering with spherical UV mapping for accurate rotating checkerboard |

### Resolution Implementation Detail

All scene components render onto an `<AbsoluteFill>` sized 320×256 at position 0,0, then the wrapper applies:
```tsx
style={{
  width: 320,
  height: 256,
  transform: `scale(${1920 / 320})`,
  transformOrigin: 'top left',
  imageRendering: 'pixelated',
}}
```
The outer composition remains 1920×1080; a black letterbox fills the 32px vertical remainder.

### Chiptune Audio Note

The `<Audio>` component will reference `staticFile('chiptune.mp3')`. A suitable royalty-free MOD/chiptune track (e.g. from [modarchive.org](https://modarchive.org)) must be converted to `.mp3` and placed at `public/chiptune.mp3` before rendering. The code will include the `<Audio>` tag but the file is not generated — it must be supplied manually.
