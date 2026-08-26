import { useEffect, useRef } from "react";

export interface VinylPlayerProps {
  playing: boolean;
  positionMs: number;
  /** How much audio the player has earned so far. */
  unlockedMs: number;
  /** Full ladder length, i.e. the width of the whole dial. */
  totalMs: number;
  /** Pulls live FFT magnitudes; returns null when the stream isn't CORS-clean. */
  readLevels: () => Float32Array | null;
  /** Bump to fire a scratch. Used on wrong guesses and skips. */
  scratchKey: number;
  artworkUrl?: string;
  /** Hides the artwork until the round resolves. */
  revealArtwork: boolean;
  reducedGlitch?: boolean;
}

const TAU = Math.PI * 2;

/**
 * Cluetune's signature player: a record rather than a progress bar.
 *
 * The disc reads as three concentric pieces of information at once — the
 * outer ring is the clip ladder (dim = still locked), the groove field is the
 * live spectrum, and the label is the artwork, which stays blank until the
 * answer is revealed.
 *
 * Everything is drawn with composite operations rather than pixel reads, so
 * cross-origin album art never taints the canvas and the whole thing stays on
 * the compositor.
 */
export function VinylPlayer({
  playing,
  positionMs,
  unlockedMs,
  totalMs,
  readLevels,
  scratchKey,
  artworkUrl,
  revealArtwork,
  reducedGlitch = false,
}: VinylPlayerProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const frameRef = useRef<number | null>(null);
  const angleRef = useRef(0);
  const scratchRef = useRef(0);
  const artworkRef = useRef<HTMLImageElement | null>(null);
  const lastFrameRef = useRef<number>(0);

  // Latest props for the animation loop, so it never needs to be re-created.
  const propsRef = useRef({ playing, positionMs, unlockedMs, totalMs, revealArtwork, reducedGlitch });
  propsRef.current = { playing, positionMs, unlockedMs, totalMs, revealArtwork, reducedGlitch };

  useEffect(() => {
    if (!artworkUrl) {
      artworkRef.current = null;
      return;
    }

    const image = new Image();
    image.crossOrigin = "anonymous";
    image.decoding = "async";
    image.src = artworkUrl;
    image.onload = () => {
      artworkRef.current = image;
    };

    return () => {
      image.onload = null;
    };
  }, [artworkUrl]);

  useEffect(() => {
    if (scratchKey > 0) scratchRef.current = 1;
  }, [scratchKey]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const context = canvas.getContext("2d");
    if (!context) return;

    const prefersReduced =
      typeof matchMedia === "function" && matchMedia("(prefers-reduced-motion: reduce)").matches;

    let size = 0;

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      size = rect.width;
      canvas.width = Math.round(rect.width * dpr);
      canvas.height = Math.round(rect.width * dpr);
      context.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    resize();
    const observer = new ResizeObserver(resize);
    observer.observe(canvas);

    const render = (now: number) => {
      const delta = lastFrameRef.current ? Math.min(now - lastFrameRef.current, 64) : 16;
      lastFrameRef.current = now;

      const current = propsRef.current;

      if (current.playing && !prefersReduced) {
        // 33⅓ rpm, slowed to roughly a third so the grooves stay readable.
        angleRef.current = (angleRef.current + (delta / 1000) * 0.62) % TAU;
      }

      if (scratchRef.current > 0) {
        scratchRef.current = Math.max(0, scratchRef.current - delta / 420);
      }

      draw(context, size, {
        ...current,
        angle: angleRef.current,
        scratch: prefersReduced || current.reducedGlitch ? 0 : scratchRef.current,
        levels: readLevels(),
        artwork: artworkRef.current,
      });

      frameRef.current = requestAnimationFrame(render);
    };

    frameRef.current = requestAnimationFrame(render);

    return () => {
      observer.disconnect();
      if (frameRef.current != null) cancelAnimationFrame(frameRef.current);
      frameRef.current = null;
      lastFrameRef.current = 0;
    };
  }, [readLevels]);

  return (
    <canvas
      ref={canvasRef}
      className="aspect-square w-[min(100%,11rem)] touch-none select-none sm:w-full sm:max-w-[min(52vw,15rem)]"
      role="img"
      aria-label={
        playing
          ? `Playing clip, ${(positionMs / 1000).toFixed(1)} of ${(unlockedMs / 1000).toFixed(0)} seconds unlocked`
          : `Clip paused, ${(unlockedMs / 1000).toFixed(0)} seconds unlocked`
      }
    />
  );
}

interface DrawState {
  angle: number;
  scratch: number;
  levels: Float32Array | null;
  artwork: HTMLImageElement | null;
  playing: boolean;
  positionMs: number;
  unlockedMs: number;
  totalMs: number;
  revealArtwork: boolean;
}

function draw(context: CanvasRenderingContext2D, size: number, state: DrawState) {
  if (size <= 0) return;

  const center = size / 2;
  const outer = center - size * 0.03;

  context.clearRect(0, 0, size, size);
  context.save();
  context.translate(center, center);

  // Horizontal tear: the "needle skip" that fires on a wrong guess.
  if (state.scratch > 0) {
    context.translate((Math.random() - 0.5) * state.scratch * size * 0.05, 0);
  }

  drawDisc(context, outer, state);
  drawGrooves(context, outer, state);
  drawSpectrum(context, outer, state);
  drawLadder(context, outer, state);
  drawLabel(context, outer, state);

  context.restore();

  if (state.scratch > 0) drawChromaticSplit(context, size, state.scratch);
}

function drawDisc(context: CanvasRenderingContext2D, outer: number, state: DrawState) {
  const body = context.createRadialGradient(0, 0, outer * 0.18, 0, 0, outer);
  body.addColorStop(0, "#151519");
  body.addColorStop(0.55, "#0d0d10");
  body.addColorStop(1, "#08080a");

  context.beginPath();
  context.arc(0, 0, outer, 0, TAU);
  context.fillStyle = body;
  context.fill();

  // Rotating specular sheen, so the disc reads as spinning even between grooves.
  context.save();
  context.rotate(state.angle);
  const sheen = context.createLinearGradient(-outer, -outer, outer, outer);
  sheen.addColorStop(0, "rgba(255,255,255,0)");
  sheen.addColorStop(0.42, "rgba(255,255,255,0.045)");
  sheen.addColorStop(0.5, "rgba(255,255,255,0.075)");
  sheen.addColorStop(0.58, "rgba(255,255,255,0.045)");
  sheen.addColorStop(1, "rgba(255,255,255,0)");

  context.beginPath();
  context.arc(0, 0, outer, 0, TAU);
  context.fillStyle = sheen;
  context.fill();
  context.restore();
}

function drawGrooves(context: CanvasRenderingContext2D, outer: number, state: DrawState) {
  context.save();
  context.rotate(state.angle);
  context.strokeStyle = "rgba(255,255,255,0.05)";
  context.lineWidth = 1;

  for (let radius = outer * 0.34; radius < outer * 0.94; radius += outer * 0.028) {
    context.beginPath();
    // A tiny gap in each groove gives the rotation something to hold on to.
    context.arc(0, 0, radius, 0.06, TAU - 0.06);
    context.stroke();
  }

  context.restore();
}

function drawSpectrum(context: CanvasRenderingContext2D, outer: number, state: DrawState) {
  const bins = state.levels;
  const count = bins?.length ?? 48;
  const inner = outer * 0.63;
  const span = outer * 0.26;

  context.save();
  context.rotate(-Math.PI / 2 + state.angle * 0.35);
  context.lineCap = "round";

  for (let i = 0; i < count; i++) {
    // Without a CORS-clean stream there is no FFT, so fall back to a gentle
    // synthetic wave rather than a dead ring.
    const level = bins
      ? bins[i]!
      : state.playing
        ? 0.18 + 0.12 * Math.sin(i * 0.7 + state.angle * 4)
        : 0.08;

    const angle = (i / count) * TAU;
    const length = span * Math.min(1, level * 1.35);
    if (length < 0.4) continue;

    const x0 = Math.cos(angle) * inner;
    const y0 = Math.sin(angle) * inner;
    const x1 = Math.cos(angle) * (inner + length);
    const y1 = Math.sin(angle) * (inner + length);

    const hueStop = i / count;
    context.strokeStyle = spectrumColor(hueStop, 0.28 + level * 0.6);
    context.lineWidth = Math.max(1.5, outer * 0.014);
    context.beginPath();
    context.moveTo(x0, y0);
    context.lineTo(x1, y1);
    context.stroke();
  }

  context.restore();
}

/** Samples the brand mesh so the spectrum reads as the gradient, not a rainbow. */
function spectrumColor(stop: number, alpha: number): string {
  const stops: [number, number, number][] = [
    [0, 124, 240],
    [0, 223, 216],
    [121, 40, 202],
    [255, 0, 128],
    [255, 77, 77],
    [249, 203, 40],
  ];

  const scaled = stop * (stops.length - 1);
  const index = Math.min(stops.length - 2, Math.floor(scaled));
  const t = scaled - index;

  const from = stops[index]!;
  const to = stops[index + 1]!;
  const mix = from.map((channel, i) => Math.round(channel + (to[i]! - channel) * t));

  return `rgba(${mix[0]}, ${mix[1]}, ${mix[2]}, ${alpha})`;
}

/** Outer dial: dim for the whole ladder, bright for what has been unlocked. */
function drawLadder(context: CanvasRenderingContext2D, outer: number, state: DrawState) {
  const radius = outer * 0.975;
  const start = -Math.PI / 2;

  context.save();
  context.lineCap = "butt";
  context.lineWidth = Math.max(3, outer * 0.035);

  context.beginPath();
  context.arc(0, 0, radius, 0, TAU);
  context.strokeStyle = "rgba(255,255,255,0.08)";
  context.stroke();

  const unlockedFraction = Math.min(1, state.unlockedMs / state.totalMs);
  if (unlockedFraction > 0) {
    context.beginPath();
    context.arc(0, 0, radius, start, start + TAU * unlockedFraction);
    context.strokeStyle = "rgba(250,250,250,0.34)";
    context.stroke();
  }

  const playedFraction = Math.min(unlockedFraction, state.positionMs / state.totalMs);
  if (playedFraction > 0) {
    context.beginPath();
    context.arc(0, 0, radius, start, start + TAU * playedFraction);
    context.strokeStyle = "#50e3c2";
    context.stroke();

    // Playhead pip riding the leading edge of the played arc.
    const angle = start + TAU * playedFraction;
    context.beginPath();
    context.arc(Math.cos(angle) * radius, Math.sin(angle) * radius, Math.max(2.5, outer * 0.022), 0, TAU);
    context.fillStyle = "#ffffff";
    context.fill();
  }

  context.restore();
}

function drawLabel(context: CanvasRenderingContext2D, outer: number, state: DrawState) {
  const labelRadius = outer * 0.3;

  context.save();
  context.beginPath();
  context.arc(0, 0, labelRadius, 0, TAU);
  context.closePath();
  context.clip();

  if (state.revealArtwork && state.artwork?.complete && state.artwork.naturalWidth > 0) {
    context.save();
    context.rotate(state.angle);
    const diameter = labelRadius * 2;
    context.drawImage(state.artwork, -labelRadius, -labelRadius, diameter, diameter);
    context.restore();
  } else {
    // Pre-reveal the label is the brand mesh, never the artwork.
    const mesh = context.createLinearGradient(-labelRadius, -labelRadius, labelRadius, labelRadius);
    mesh.addColorStop(0, "#007cf0");
    mesh.addColorStop(0.3, "#00dfd8");
    mesh.addColorStop(0.6, "#7928ca");
    mesh.addColorStop(0.82, "#ff0080");
    mesh.addColorStop(1, "#f9cb28");

    context.fillStyle = mesh;
    context.fillRect(-labelRadius, -labelRadius, labelRadius * 2, labelRadius * 2);

    context.fillStyle = "rgba(8,8,10,0.55)";
    context.fillRect(-labelRadius, -labelRadius, labelRadius * 2, labelRadius * 2);
  }

  context.restore();

  context.beginPath();
  context.arc(0, 0, labelRadius, 0, TAU);
  context.strokeStyle = "rgba(255,255,255,0.14)";
  context.lineWidth = 1;
  context.stroke();

  // Spindle hole.
  context.beginPath();
  context.arc(0, 0, Math.max(2.5, outer * 0.022), 0, TAU);
  context.fillStyle = "#08080a";
  context.fill();
}

/** RGB split, drawn additively so no pixel read is needed. */
function drawChromaticSplit(context: CanvasRenderingContext2D, size: number, intensity: number) {
  const offset = intensity * size * 0.012;

  context.save();
  context.globalCompositeOperation = "lighter";
  context.globalAlpha = intensity * 0.4;

  context.fillStyle = "#ff0080";
  context.fillRect(-offset, 0, size, size);

  context.fillStyle = "#00dfd8";
  context.fillRect(offset, 0, size, size);

  context.restore();

  // Scanline tear across a random band.
  context.save();
  context.globalAlpha = intensity * 0.5;
  context.fillStyle = "rgba(255,255,255,0.16)";
  const bandY = Math.random() * size;
  context.fillRect(0, bandY, size, Math.max(1, intensity * size * 0.01));
  context.restore();
}
