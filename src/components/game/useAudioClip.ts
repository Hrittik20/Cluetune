import { useCallback, useEffect, useRef, useState } from "react";

export interface AudioClipState {
  ready: boolean;
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
  /** Latest frequency magnitudes, 0-1, or null when not reactive. */
  readLevels: () => Float32Array | null;
}

const BIN_COUNT = 48;

/**
 * Clip playback for the guessing game.
 *
 * Two things make this more involved than a bare <audio> tag:
 *
 * 1. Playback must stop dead at the unlocked boundary. `timeupdate` fires only
 *    every ~250ms, which would leak up to a quarter-second of extra audio and
 *    hand out free hints, so the boundary is polled on rAF instead.
 *
 * 2. Driving the reactive visual needs an AnalyserNode, which needs the media
 *    element to be CORS-clean. Preview CDNs mostly are, but not universally,
 *    and a `crossOrigin` element against a non-CORS host fails to load at all.
 *    So we try the CORS-enabled element first and silently rebuild without it
 *    on failure — audio always wins over visuals.
 */
export function useAudioClip(src: string | null, rate = 1): UseAudioClipResult {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const contextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const binsRef = useRef<Uint8Array | null>(null);
  const levelsRef = useRef<Float32Array>(new Float32Array(BIN_COUNT));
  const frameRef = useRef<number | null>(null);
  const limitRef = useRef<number>(Number.POSITIVE_INFINITY);
  /** Set once a CORS load has failed so the retry does not loop. */
  const corsFailedRef = useRef(false);

  const [state, setState] = useState<AudioClipState>({
    ready: false,
    playing: false,
    positionMs: 0,
    durationMs: 0,
    error: null,
    reactive: false,
  });

  const stopLoop = useCallback(() => {
    if (frameRef.current != null) {
      cancelAnimationFrame(frameRef.current);
      frameRef.current = null;
    }
  }, []);

  const pause = useCallback(() => {
    audioRef.current?.pause();
    stopLoop();
    setState((prev) => ({ ...prev, playing: false }));
  }, [stopLoop]);

  /** rAF loop: enforces the clip boundary and samples the analyser. */
  const tick = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const positionMs = audio.currentTime * 1000;

    if (positionMs >= limitRef.current) {
      audio.pause();
      audio.currentTime = 0;
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

  // (Re)build the element whenever the source changes.
  useEffect(() => {
    stopLoop();
    corsFailedRef.current = false;

    if (!src) {
      audioRef.current = null;
      setState({ ready: false, playing: false, positionMs: 0, durationMs: 0, error: null, reactive: false });
      return;
    }

    let disposed = false;

    const build = (withCors: boolean) => {
      const audio = new Audio();
      if (withCors) audio.crossOrigin = "anonymous";
      audio.preload = "auto";
      audio.src = src;

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
        // without it and accept losing the analyser.
        if (withCors && !corsFailedRef.current) {
          corsFailedRef.current = true;
          analyserRef.current = null;
          binsRef.current = null;
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
    };

    build(true);

    return () => {
      disposed = true;
      stopLoop();
      audioRef.current?.pause();
      audioRef.current = null;
    };
  }, [src, stopLoop]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    audio.playbackRate = rate;
    // Letting pitch ride with tempo is the entire point of Sped-Up mode.
    (audio as HTMLAudioElement & { preservesPitch?: boolean }).preservesPitch = rate === 1;
  }, [rate, state.ready]);

  /** Lazily wires the analyser on first play, when a user gesture exists. */
  const ensureGraph = useCallback(() => {
    const audio = audioRef.current;
    if (!audio || corsFailedRef.current || analyserRef.current) return;

    try {
      const Ctor = window.AudioContext ?? (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      const context = contextRef.current ?? new Ctor();
      contextRef.current = context;

      const source = context.createMediaElementSource(audio);
      const analyser = context.createAnalyser();
      analyser.fftSize = 256;
      analyser.smoothingTimeConstant = 0.72;

      source.connect(analyser);
      analyser.connect(context.destination);

      analyserRef.current = analyser;
      binsRef.current = new Uint8Array(analyser.frequencyBinCount);
      setState((prev) => ({ ...prev, reactive: true }));
    } catch {
      // Tainted stream or an unsupported context: fall back to flat visuals.
      analyserRef.current = null;
      setState((prev) => ({ ...prev, reactive: false }));
    }
  }, []);

  const play = useCallback(
    (limitMs: number, fromMs = 0) => {
      const audio = audioRef.current;
      if (!audio) return;

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

  const readLevels = useCallback(() => (analyserRef.current ? levelsRef.current : null), []);

  useEffect(() => () => void contextRef.current?.close(), []);

  return { ...state, play, pause, toggle, seek, readLevels };
}
