import { useCallback, useEffect, useRef, useState } from "react";
import type { AudioFxPreset } from "../../lib/audioFx";

export interface AudioClipState {
  ready: boolean;
  /** An element exists for the current source, so play() works even before it has buffered. */
  canPlay: boolean;
  playing: boolean;
  /** Current head position within the clip, in milliseconds. */
  positionMs: number;
  durationMs: number;
  error: string | null;
  /** True when the FFT analyser is live, i.e. the CDN allowed CORS. */
  reactive: boolean;
}

export interface UseAudioClipResult extends AudioClipState {
  /** Plays from `fromMs` and hard-stops at `limitMs`. */
  play: (limitMs: number, fromMs?: number) => void;
  pause: () => void;
  toggle: (limitMs: number) => void;
  seek: (ms: number) => void;
  /**
   * Raises the stop boundary without seeking. If the clip had just hit the
   * previous wall, playback resumes from that point into the newly unlocked
   * audio — the Skip (+Ns) case.
   */
  extendLimit: (limitMs: number) => void;
  /** Latest frequency magnitudes, 0-1, or null when not reactive. */
  readLevels: () => Float32Array | null;
}

const BIN_COUNT = 48;

/**
 * Clips are ~0.5 MB. Buffering one during page load competes with first paint
 * on mobile networks, so elements start with preload="none" and switch to
 * "auto" on the first interaction or shortly after load, whichever is first.
 */
let preloadAllowed = false;
const preloadListeners = new Set<() => void>();

function allowPreload(): void {
  if (preloadAllowed) return;
  preloadAllowed = true;
  for (const listener of preloadListeners) listener();
  preloadListeners.clear();
}

if (typeof window !== "undefined") {
  for (const type of ["pointerdown", "keydown", "touchstart", "scroll"]) {
    window.addEventListener(type, allowPreload, { capture: true, passive: true, once: true });
  }
  const arm = () => window.setTimeout(allowPreload, 3000);
  if (document.readyState === "complete") arm();
  else window.addEventListener("load", arm, { once: true });
}

function onPreloadAllowed(listener: () => void): () => void {
  if (preloadAllowed) {
    listener();
    return () => undefined;
  }
  preloadListeners.add(listener);
  return () => preloadListeners.delete(listener);
}

const CLEAN_FX: AudioFxPreset = {
  rate: 1,
  lowpassHz: null,
  delayTime: 0,
  delayFeedback: 0,
  delayWet: 0,
  reverbWet: 0,
  wobbleDepth: 0,
  character: "clean",
};

interface FxGraph {
  source: MediaElementAudioSourceNode;
  lowpass: BiquadFilterNode;
  dryGain: GainNode;
  delay: DelayNode;
  delayFeedback: GainNode;
  delayWet: GainNode;
  reverbInput: GainNode;
  reverbWet: GainNode;
  mix: GainNode;
  analyser: AnalyserNode;
  lfo: OscillatorNode | null;
  lfoGain: GainNode | null;
}

/**
 * Clip playback for the guessing game.
 *
 * Two things make this more involved than a bare <audio> tag:
 *
 * 1. Playback must stop dead at the unlocked boundary. `timeupdate` fires only
 *    every ~250ms, which would leak up to a quarter-second of extra audio and
 *    hand out free hints, so the boundary is polled on rAF instead.
 *
 * 2. Driving the reactive visual (and Drunk wet FX) needs an AnalyserNode /
 *    MediaElementSource, which needs the media element to be CORS-clean.
 *    Preview CDNs mostly are, but not universally, and a `crossOrigin` element
 *    against a non-CORS host fails to load at all. So we try CORS first and
 *    silently rebuild without it on failure — audio always wins over visuals.
 *    Without CORS, Drunk still applies playbackRate (pitch/tempo).
 */
export function useAudioClip(src: string | null, fx: AudioFxPreset | null = null): UseAudioClipResult {
  const preset = fx ?? CLEAN_FX;
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const contextRef = useRef<AudioContext | null>(null);
  const graphRef = useRef<FxGraph | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const binsRef = useRef<Uint8Array | null>(null);
  const levelsRef = useRef<Float32Array>(new Float32Array(BIN_COUNT));
  const frameRef = useRef<number | null>(null);
  const limitRef = useRef<number>(Number.POSITIVE_INFINITY);
  /** Set once a CORS load has failed so the retry does not loop. */
  const corsFailedRef = useRef(false);
  const fxRef = useRef(preset);
  fxRef.current = preset;

  const [state, setState] = useState<AudioClipState>({
    ready: false,
    canPlay: false,
    playing: false,
    positionMs: 0,
    durationMs: 0,
    error: null,
    reactive: false,
  });

  const stopLoop = useCallback(() => {
    if (frameRef.current != null) {
      cancelAnimationFrame(frameRef.current);
    }
    frameRef.current = null;
  }, []);

  const pause = useCallback(() => {
    audioRef.current?.pause();
    stopLoop();
    setState((prev) => ({ ...prev, playing: false }));
  }, [stopLoop]);

  /** rAF loop: enforces the clip boundary, drunk rate-sway, and samples the analyser. */
  const tick = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const fx = fxRef.current;
    if (fx.wobbleDepth > 0.05) {
      // Mild pitch/tempo sway — readable drunk, not seasick.
      const sway =
        1 +
        Math.sin(performance.now() / 1000 * (0.8 + fx.wobbleDepth)) * fx.wobbleDepth * 0.06 +
        Math.sin(performance.now() / 1000 * 0.35) * fx.wobbleDepth * 0.025;
      const nextRate = Math.max(0.55, Math.min(1.6, fx.rate * sway));
      if (Math.abs(audio.playbackRate - nextRate) > 0.002) {
        audio.playbackRate = nextRate;
        (audio as HTMLAudioElement & { preservesPitch?: boolean }).preservesPitch = false;
      }
    }

    const positionMs = audio.currentTime * 1000;

    if (positionMs >= limitRef.current) {
      audio.pause();
      // Hold the head at the wall instead of rewinding, so a skip that lands
      // in this same tick can extend the window and keep going.
      audio.currentTime = limitRef.current / 1000;
      stopLoop();
      setState((prev) => ({ ...prev, playing: false, positionMs: limitRef.current }));
      return;
    }

    const analyser = analyserRef.current;
    const bins = binsRef.current;
    if (analyser && bins) {
      analyser.getByteFrequencyData(bins as Uint8Array<ArrayBuffer>);

      // Fold the FFT into a fixed bin count so the visual is resolution-stable.
      const step = Math.floor(bins.length / BIN_COUNT) || 1;
      for (let i = 0; i < BIN_COUNT; i++) {
        let sum = 0;
        for (let j = 0; j < step; j++) sum += bins[i * step + j] ?? 0;
        const next = sum / step / 255;
        // Asymmetric smoothing: snap up on transients, fall away slowly.
        const previous = levelsRef.current[i] ?? 0;
        levelsRef.current[i] = next > previous ? next : previous * 0.82 + next * 0.18;
      }
    }

    setState((prev) => (prev.positionMs === positionMs ? prev : { ...prev, positionMs }));
    frameRef.current = requestAnimationFrame(tick);
  }, [stopLoop]);

  const applyRate = useCallback((audio: HTMLAudioElement, rate: number, forceUnpitched = false) => {
    audio.playbackRate = rate;
    (audio as HTMLAudioElement & { preservesPitch?: boolean }).preservesPitch = rate === 1 && !forceUnpitched;
  }, []);

  const applyFxParams = useCallback((graph: FxGraph, next: AudioFxPreset) => {
    const now = graph.lowpass.context.currentTime;
    const cutoff = next.lowpassHz ?? 18_000;
    graph.lowpass.frequency.setTargetAtTime(cutoff, now, 0.02);
    graph.lowpass.Q.setTargetAtTime(next.wobbleDepth > 0.35 ? 1.1 : 0.7, now, 0.05);

    // Keep dry dominant so the track stays recognizable.
    const dry = Math.max(0.35, 1 - next.delayWet * 0.45 - next.reverbWet * 0.4);
    graph.dryGain.gain.setTargetAtTime(dry, now, 0.02);
    graph.delay.delayTime.setTargetAtTime(Math.max(0.01, next.delayTime || 0.01), now, 0.02);
    graph.delayFeedback.gain.setTargetAtTime(Math.min(0.55, next.delayFeedback), now, 0.02);
    graph.delayWet.gain.setTargetAtTime(next.delayWet, now, 0.02);
    graph.reverbInput.gain.setTargetAtTime(next.reverbWet > 0.01 ? 1 : 0, now, 0.02);
    graph.reverbWet.gain.setTargetAtTime(next.reverbWet, now, 0.02);

    if (graph.lfo && graph.lfoGain) {
      graph.lfo.frequency.setTargetAtTime(0.6 + next.wobbleDepth * 0.9, now, 0.05);
      const depthHz = next.wobbleDepth * Math.min(900, Math.max(200, cutoff * 0.28));
      graph.lfoGain.gain.setTargetAtTime(depthHz, now, 0.05);
    }
  }, []);

  const teardownGraph = useCallback(() => {
    const graph = graphRef.current;
    if (graph?.lfo) {
      try {
        graph.lfo.stop();
      } catch {
        /* already stopped */
      }
    }
    graphRef.current = null;
    analyserRef.current = null;
    binsRef.current = null;
  }, []);

  // (Re)build the element whenever the source changes.
  useEffect(() => {
    stopLoop();
    corsFailedRef.current = false;
    teardownGraph();

    if (!src) {
      audioRef.current = null;
      setState({ ready: false, canPlay: false, playing: false, positionMs: 0, durationMs: 0, error: null, reactive: false });
      return;
    }

    let disposed = false;

    const build = (withCors: boolean) => {
      teardownGraph();
      const audio = new Audio();
      if (withCors) audio.crossOrigin = "anonymous";
      audio.preload = preloadAllowed ? "auto" : "none";
      audio.src = src;
      applyRate(audio, fxRef.current.rate, fxRef.current.wobbleDepth > 0.05);

      audio.addEventListener("loadedmetadata", () => {
        if (disposed) return;
        setState((prev) => ({
          ...prev,
          ready: true,
          error: null,
          durationMs: Number.isFinite(audio.duration) ? audio.duration * 1000 : 30_000,
        }));
      });

      audio.addEventListener("error", () => {
        if (disposed) return;

        // A CORS-enabled element against a non-CORS host fails here. Rebuild
        // without it and accept losing the analyser / wet FX.
        if (withCors && !corsFailedRef.current) {
          corsFailedRef.current = true;
          teardownGraph();
          build(false);
          return;
        }

        setState((prev) => ({ ...prev, ready: false, error: "This clip could not be loaded." }));
      });

      audio.addEventListener("ended", () => {
        if (disposed) return;
        stopLoop();
        setState((prev) => ({ ...prev, playing: false }));
      });

      audioRef.current = audio;
      setState((prev) => ({ ...prev, canPlay: true }));
    };

    build(true);

    const stopWaiting = onPreloadAllowed(() => {
      const audio = audioRef.current;
      if (disposed || !audio || audio.preload === "auto") return;
      audio.preload = "auto";
      if (audio.paused && audio.readyState === HTMLMediaElement.HAVE_NOTHING) audio.load();
    });

    return () => {
      disposed = true;
      stopWaiting();
      stopLoop();
      audioRef.current?.pause();
      audioRef.current = null;
      teardownGraph();
    };
  }, [src, stopLoop, teardownGraph, applyRate]);

  // Keep element rate in sync when the preset changes (same src).
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    applyRate(audio, preset.rate, preset.wobbleDepth > 0.05);
    if (graphRef.current) applyFxParams(graphRef.current, preset);
  }, [preset, applyRate, applyFxParams, state.ready]);

  /** Lazily wires the analyser + FX chain on first play, when a user gesture exists. */
  const ensureGraph = useCallback(() => {
    const audio = audioRef.current;
    if (!audio || corsFailedRef.current || graphRef.current) {
      if (graphRef.current) applyFxParams(graphRef.current, fxRef.current);
      return;
    }

    try {
      const Ctor = window.AudioContext ?? (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      const context = contextRef.current ?? new Ctor();
      contextRef.current = context;

      const source = context.createMediaElementSource(audio);
      const lowpass = context.createBiquadFilter();
      lowpass.type = "lowpass";
      lowpass.Q.value = 0.7;

      const dryGain = context.createGain();
      const delay = context.createDelay(1.0);
      const delayFeedback = context.createGain();
      const delayWet = context.createGain();
      const reverbInput = context.createGain();
      const reverbWet = context.createGain();
      const mix = context.createGain();
      mix.gain.value = 1;

      const analyser = context.createAnalyser();
      analyser.fftSize = 256;
      analyser.smoothingTimeConstant = 0.72;

      // Dry path
      source.connect(lowpass);
      lowpass.connect(dryGain);
      dryGain.connect(mix);

      // Echo: delay with feedback loop
      lowpass.connect(delay);
      delay.connect(delayFeedback);
      delayFeedback.connect(delay);
      delay.connect(delayWet);
      delayWet.connect(mix);

      // Filter wobble LFO (depth driven by preset) — slow drunk sway
      const lfo = context.createOscillator();
      lfo.type = "sine";
      lfo.frequency.value = 0.8;
      const lfoGain = context.createGain();
      lfoGain.gain.value = 0;
      lfo.connect(lfoGain);
      lfoGain.connect(lowpass.frequency);
      lfo.start();

      // Longer, louder room taps so reverb actually reads as drunk space
      const tapTimes = [0.031, 0.073, 0.131, 0.197, 0.281];
      for (let i = 0; i < tapTimes.length; i++) {
        const tap = context.createDelay(0.5);
        tap.delayTime.value = tapTimes[i]!;
        const tapGain = context.createGain();
        tapGain.gain.value = 0.35 / (i + 1);
        reverbInput.connect(tap);
        tap.connect(tapGain);
        tapGain.connect(reverbWet);
      }
      lowpass.connect(reverbInput);
      reverbWet.connect(mix);

      mix.connect(analyser);
      analyser.connect(context.destination);

      const graph: FxGraph = {
        source,
        lowpass,
        dryGain,
        delay,
        delayFeedback,
        delayWet,
        reverbInput,
        reverbWet,
        mix,
        analyser,
        lfo,
        lfoGain,
      };

      applyFxParams(graph, fxRef.current);
      graphRef.current = graph;
      analyserRef.current = analyser;
      binsRef.current = new Uint8Array(analyser.frequencyBinCount);
      setState((prev) => ({ ...prev, reactive: true }));
    } catch {
      // Tainted stream or an unsupported context: fall back to flat visuals / rate-only.
      teardownGraph();
      setState((prev) => ({ ...prev, reactive: false }));
    }
  }, [applyFxParams, teardownGraph]);

  const play = useCallback(
    (limitMs: number, fromMs = 0) => {
      const audio = audioRef.current;
      if (!audio) return;

      allowPreload();
      audio.preload = "auto";
      ensureGraph();
      void contextRef.current?.resume();

      limitRef.current = limitMs;
      audio.currentTime = Math.max(0, fromMs / 1000);

      void audio
        .play()
        .then(() => {
          setState((prev) => ({ ...prev, playing: true, error: null }));
          stopLoop();
          frameRef.current = requestAnimationFrame(tick);
        })
        .catch(() => {
          setState((prev) => ({ ...prev, playing: false, error: "Tap play to start audio." }));
        });
    },
    [ensureGraph, stopLoop, tick],
  );

  const toggle = useCallback(
    (limitMs: number) => {
      if (state.playing) pause();
      else play(limitMs);
    },
    [pause, play, state.playing],
  );

  const seek = useCallback((ms: number) => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.currentTime = Math.max(0, Math.min(ms, limitRef.current) / 1000);
    setState((prev) => ({ ...prev, positionMs: ms }));
  }, []);

  const extendLimit = useCallback(
    (limitMs: number) => {
      const audio = audioRef.current;
      const previous = limitRef.current;
      limitRef.current = limitMs;
      if (!audio || limitMs <= previous) return;

      const positionMs = audio.currentTime * 1000;
      if (!audio.paused) return;

      // Resume when we were parked on (or just past) the old wall.
      const parkedAtWall = positionMs >= previous - 80;
      if (!parkedAtWall || positionMs >= limitMs) return;

      ensureGraph();
      void contextRef.current?.resume();
      void audio
        .play()
        .then(() => {
          setState((prev) => ({ ...prev, playing: true, error: null }));
          stopLoop();
          frameRef.current = requestAnimationFrame(tick);
        })
        .catch(() => undefined);
    },
    [ensureGraph, stopLoop, tick],
  );

  const readLevels = useCallback(() => (analyserRef.current ? levelsRef.current : null), []);

  useEffect(() => () => void contextRef.current?.close(), []);

  return { ...state, play, pause, toggle, seek, extendLimit, readLevels };
}
