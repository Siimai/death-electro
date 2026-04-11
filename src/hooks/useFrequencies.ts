import { useAudioData, visualizeAudio } from "@remotion/media-utils";
import { staticFile } from "remotion";

const AUDIO_SRC = staticFile("10-Death Electro.mp3");
const NUM_BINS = 256;

// Frequency bin ranges
const BASS_END = 10;   // bins 0–9   (~sub-bass / bass)
const MID_END = 80;    // bins 10–79 (~midrange)
// treble = bins 80–255

export interface FreqData {
  bass:         number; // 0–1, raw spike
  mid:          number; // 0–1, raw spike
  treble:       number; // 0–1, raw spike
  volume:       number; // 0–1, raw RMS

  bassSmooth:   number; // 10-frame rolling average
  midSmooth:    number;
  volumeSmooth: number;
}

export interface FreqProps {
  bass:   number;
  mid:    number;
  treble: number;
  volume: number;
}

const ZERO: FreqData = {
  bass: 0, mid: 0, treble: 0, volume: 0,
  bassSmooth: 0, midSmooth: 0, volumeSmooth: 0,
};

function sliceAvg(bins: number[], start: number, end: number): number {
  let sum = 0;
  for (let i = start; i < end; i++) sum += bins[i];
  return sum / (end - start);
}

function rms(bins: number[]): number {
  let sum = 0;
  for (const v of bins) sum += v * v;
  return Math.sqrt(sum / bins.length);
}

function clamp01(v: number): number {
  return v < 0 ? 0 : v > 1 ? 1 : v;
}

function extractScalars(bins: number[]): { bass: number; mid: number; treble: number; volume: number } {
  // Multiply raw dB-normalised values (typically very small) up into a useful 0-1 range
  return {
    bass:   clamp01(sliceAvg(bins, 0,       BASS_END) * 4),
    mid:    clamp01(sliceAvg(bins, BASS_END, MID_END)  * 4),
    treble: clamp01(sliceAvg(bins, MID_END, NUM_BINS)  * 4),
    volume: clamp01(rms(bins) * 5),
  };
}

/**
 * Called once in AmigaDemo.tsx. Loads the track audio data and returns
 * per-frame frequency scalars. Returns all-zero while loading.
 */
export function useFrequencies(fps: number, frame: number): FreqData {
  const audioData = useAudioData(AUDIO_SRC);
  if (!audioData) return ZERO;

  const binsNow = visualizeAudio({ fps, frame, audioData, numberOfSamples: NUM_BINS });
  const { bass, mid, treble, volume } = extractScalars(binsNow);

  // 10-frame rolling average for smoothed values
  const SMOOTH = 10;
  let sb = 0, sm = 0, sv = 0;
  for (let i = 0; i < SMOOTH; i++) {
    const f = Math.max(0, frame - i);
    const b = visualizeAudio({ fps, frame: f, audioData, numberOfSamples: NUM_BINS });
    const s = extractScalars(b);
    sb += s.bass;
    sm += s.mid;
    sv += s.volume;
  }

  return {
    bass, mid, treble, volume,
    bassSmooth:   sb / SMOOTH,
    midSmooth:    sm / SMOOTH,
    volumeSmooth: sv / SMOOTH,
  };
}
