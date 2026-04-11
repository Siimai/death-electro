# Remotion Motion Graphics — Project Guidelines

## Planning Workflow

**Before implementing anything**, always create a plan first:

1. Create a markdown file in `plans/` named after the feature or task (e.g., `plans/intro-scene.md`).
2. The plan must include:
   - **Goal** — what we are building and why
   - **Compositions / components affected** — files to create or modify
   - **Animation breakdown** — key frames, timings, and effects described in plain language
   - **Props / types** — any new TypeScript interfaces needed
   - **Open questions** — anything that needs the user's input before proceeding
3. Stop and wait for the user to review (and optionally edit) the plan.
4. Only proceed with implementation after the user explicitly approves the plan.

> Never write production code, create source files, or modify existing components before the plan has been reviewed.

---

## Project Overview

This project uses **Remotion** to create programmatic motion graphics and videos with React and TypeScript. All animations are rendered frame-by-frame; think of it as "React for video".

## Tech Stack

- **Remotion** — programmatic video / motion graphics framework
- **React** (functional components only, no class components)
- **TypeScript** — strict mode enabled
- **Node.js** — for rendering and bundling

## Core Remotion Concepts

### Key Hooks

| Hook | Purpose |
|------|---------|
| `useCurrentFrame()` | Returns the current frame number (0-based). The primary driver of all animations. |
| `useVideoConfig()` | Returns `{ width, height, fps, durationInFrames }` for the active composition. |

### Key Utilities

| Utility | Purpose |
|---------|---------|
| `interpolate(frame, [in, out], [from, to], options?)` | Maps a frame range to a value range. Always prefer `extrapolateLeft/Right: 'clamp'` unless scrolling is intentional. |
| `spring({ frame, fps, config?, from?, to? })` | Physics-based spring animation. Use instead of `interpolate` for natural-feeling motion. |
| `Sequence` | Offsets children so they start at a given frame. Prefer over manual frame math. |
| `Series` | Lays `<Series.Sequence>` children one after another automatically. |
| `Audio`, `Video`, `Img`, `OffthreadVideo` | Media primitives — always use these over native HTML equivalents. |

### Composition Registration

All compositions must be registered in `src/Root.tsx` via `<Composition>`:

```tsx
<Composition
  id="MyScene"
  component={MyScene}
  durationInFrames={150}
  fps={30}
  width={1920}
  height={1080}
  defaultProps={{ ... }}
/>
```

## Architecture

```
src/
  Root.tsx          # Registers all <Composition> entries — the entry point
  compositions/     # One file per composition (scene)
  components/       # Reusable animated building blocks
  animations/       # Shared interpolate/spring helpers and easing curves
  assets/           # Static images, fonts, audio
```

- Keep each composition self-contained in its own file under `compositions/`.
- Extract reusable animated primitives (e.g. `<FadeIn>`, `<SlideUp>`) into `components/`.
- Never reference `document`, `window`, or browser-only APIs — Remotion renders in a headless browser; code must be deterministic per frame.

## Animation Patterns

### Fade In

```tsx
const frame = useCurrentFrame();
const opacity = interpolate(frame, [0, 20], [0, 1], { extrapolateRight: 'clamp' });
```

### Spring Entrance

```tsx
const { fps } = useVideoConfig();
const frame = useCurrentFrame();
const scale = spring({ frame, fps, config: { damping: 12 } });
```

### Staggered children

Use `<Sequence from={i * gap}>` inside a `.map()` to stagger items without manual frame math.

### Text reveal (clip)

Use `overflow: 'hidden'` with a `translateY` spring on the inner element for a clean text wipe-up.

## Easing

Import from `remotion` — `Easing` is re-exported from React Native:

```ts
import { Easing, interpolate } from 'remotion';
interpolate(frame, [0, 30], [0, 1], {
  easing: Easing.out(Easing.cubic),
  extrapolateRight: 'clamp',
});
```

## Build and Render Commands

```bash
# Start Remotion Studio (interactive preview)
npx remotion studio

# Render a single composition to a video file
npx remotion render <CompositionId> out/video.mp4

# Render a still (single frame)
npx remotion still <CompositionId> --frame=0 out/still.png

# Install / upgrade Remotion (keeps all @remotion/* packages in sync)
npx remotion upgrade
```

## Code Style

- **TypeScript strict** — no `any`, no non-null assertions without justification.
- All component props must have explicit TypeScript types or interfaces.
- Prefer `const` arrow functions for components: `const MyScene: React.FC<Props> = ({ ... }) => { ... }`.
- Use named exports, not default exports, for components and compositions.
- All `interpolate` calls must include `extrapolateLeft: 'clamp'` and/or `extrapolateRight: 'clamp'` unless intentional overflow is needed.

## Performance

- Avoid computing expensive values inside the render function without `useMemo`.
- Prefer `<OffthreadVideo>` over `<Video>` for smoother frame-accurate playback of source footage.
- Keep asset files under `public/` or import them directly; avoid runtime `fetch` inside components.
- Remote assets must use absolute HTTPS URLs and be allowed via `allowedUrls` in `remotion.config.ts` if needed.

## Conventions

- Frame durations: use `fps`-relative math (e.g., `2 * fps` for 2 seconds), never hardcoded frame counts when `fps` might change.
- Composition IDs use PascalCase matching the component name.
- All compositions should accept `defaultProps` so they can be rendered headlessly without user input.
