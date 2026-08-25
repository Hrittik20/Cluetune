import { hashString } from "../../lib/daily";
import type { GuessVerdict } from "../../lib/types";

export interface ShareCardOptions {
  headline: string;
  /** e.g. "3/6" or "X/6". */
  result: string;
  title: string;
  artist: string;
  artworkUrl?: string;
  verdicts: GuessVerdict[];
  seconds: number;
  /** Peak history captured during play, 0-1. Falls back to a seeded shape. */
  waveform: number[];
  won: boolean;
  footer: string;
  /** Seeds the fallback waveform so a track always looks the same. */
  seed: string;
}

export const CARD_WIDTH = 1080;
export const CARD_HEIGHT = 1920;

const VERDICT_FILL: Record<GuessVerdict, string> = {
  correct: "#50e3c2",
  close: "#f9cb28",
  wrong: "#ff4d4d",
  skip: "#33333c",
};

/**
 * Renders the vertical result card.
 *
 * 1080x1920 is the native canvas for Stories, Reels and TikTok, so the card is
 * built at that size and downscaled for the on-page preview rather than the
 * other way round — a screenshot of a web layout always reads as a screenshot.
 *
 * Everything is drawn from primitives except the album art, which is the only
 * cross-origin asset and is skipped entirely if it will not load CORS-clean
 * (a tainted canvas cannot be exported at all).
 */
export async function renderShareCard(options: ShareCardOptions): Promise<Blob | null> {
  const canvas = document.createElement("canvas");
  canvas.width = CARD_WIDTH;
  canvas.height = CARD_HEIGHT;

  const context = canvas.getContext("2d");
  if (!context) return null;

  drawBackground(context);
  drawWordmark(context, options);
  const artwork = await loadArtwork(options.artworkUrl);
  drawArtwork(context, artwork, options);
  drawWaveform(context, options);
  drawResult(context, options);
  drawTiles(context, options);
  drawFooter(context, options);

  try {
    return await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, "image/png"));
  } catch {
    // Tainted canvas. Callers fall back to sharing text.
    return null;
  }
}

function drawBackground(context: CanvasRenderingContext2D) {
  context.fillStyle = "#08080a";
  context.fillRect(0, 0, CARD_WIDTH, CARD_HEIGHT);

  // The brand mesh, at hero scale, as the card's only decoration.
  const blobs: [number, number, number, string][] = [
    [180, 420, 720, "rgba(0,124,240,0.5)"],
    [900, 260, 640, "rgba(0,223,216,0.34)"],
    [880, 1180, 780, "rgba(255,0,128,0.34)"],
    [140, 1420, 700, "rgba(121,40,202,0.36)"],
    [560, 1780, 640, "rgba(249,203,40,0.22)"],
  ];

  context.save();
  context.globalCompositeOperation = "lighter";
  for (const [x, y, radius, color] of blobs) {
    const gradient = context.createRadialGradient(x, y, 0, x, y, radius);
    gradient.addColorStop(0, color);
    gradient.addColorStop(1, "rgba(0,0,0,0)");
    context.fillStyle = gradient;
    context.fillRect(0, 0, CARD_WIDTH, CARD_HEIGHT);
  }
  context.restore();

  // Knock the mesh back so type stays at full contrast over it.
  context.fillStyle = "rgba(8,8,10,0.62)";
  context.fillRect(0, 0, CARD_WIDTH, CARD_HEIGHT);
}

function drawWordmark(context: CanvasRenderingContext2D, options: ShareCardOptions) {
  context.save();
  context.fillStyle = "#fafafa";
  context.font = "600 44px Geist Variable, Inter, system-ui, sans-serif";
  context.letterSpacing = "-1px";
  context.fillText("Cluetune", 96, 190);

  context.fillStyle = "rgba(250,250,250,0.55)";
  context.font = "400 30px Geist Mono Variable, ui-monospace, monospace";
  context.letterSpacing = "4px";
  context.fillText(options.headline.toUpperCase(), 96, 248);
  context.restore();
}

async function loadArtwork(url?: string): Promise<HTMLImageElement | null> {
  if (!url) return null;

  return new Promise((resolve) => {
    const image = new Image();
    image.crossOrigin = "anonymous";
    image.onload = () => resolve(image);
    image.onerror = () => resolve(null);
    image.src = url;

    // Never let a slow CDN block the share sheet.
    setTimeout(() => resolve(null), 2500);
  });
}

function drawArtwork(
  context: CanvasRenderingContext2D,
  artwork: HTMLImageElement | null,
  options: ShareCardOptions,
) {
  const size = 520;
  const x = (CARD_WIDTH - size) / 2;
  const y = 360;
  const radius = 28;

  context.save();
  roundedRect(context, x, y, size, size, radius);
  context.clip();

  if (artwork) {
    context.drawImage(artwork, x, y, size, size);
  } else {
    const gradient = context.createLinearGradient(x, y, x + size, y + size);
    gradient.addColorStop(0, "#007cf0");
    gradient.addColorStop(0.45, "#7928ca");
    gradient.addColorStop(1, "#ff0080");
    context.fillStyle = gradient;
    context.fillRect(x, y, size, size);
  }
  context.restore();

  context.save();
  roundedRect(context, x, y, size, size, radius);
  context.strokeStyle = "rgba(255,255,255,0.16)";
  context.lineWidth = 2;
  context.stroke();
  context.restore();

  context.save();
  context.textAlign = "center";

  context.fillStyle = "#fafafa";
  context.font = "600 60px Geist Variable, Inter, system-ui, sans-serif";
  context.letterSpacing = "-2px";
  fitText(context, options.title, CARD_WIDTH / 2, y + size + 96, CARD_WIDTH - 160);

  context.fillStyle = "rgba(250,250,250,0.62)";
  context.font = "400 38px Geist Variable, Inter, system-ui, sans-serif";
  context.letterSpacing = "0px";
  fitText(context, options.artist, CARD_WIDTH / 2, y + size + 154, CARD_WIDTH - 160);

  context.restore();
}

/**
 * The waveform is the part that makes this legible as a music result at a
 * glance in a feed. Real capture is used when the stream allowed analysis;
 * otherwise a seeded shape keeps the card consistent per track.
 */
function drawWaveform(context: CanvasRenderingContext2D, options: ShareCardOptions) {
  const bars = 64;
  const left = 96;
  const width = CARD_WIDTH - left * 2;
  const centerY = 1210;
  const maxHeight = 150;
  const barWidth = width / bars;

  const samples = options.waveform.length >= 8 ? resample(options.waveform, bars) : seededWave(options.seed, bars);

  context.save();
  for (let i = 0; i < bars; i++) {
    const magnitude = Math.max(0.06, Math.min(1, samples[i] ?? 0));
    const height = magnitude * maxHeight;
    const x = left + i * barWidth;

    const gradient = context.createLinearGradient(0, centerY - height, 0, centerY + height);
    gradient.addColorStop(0, "#00dfd8");
    gradient.addColorStop(0.5, "#50e3c2");
    gradient.addColorStop(1, "#7928ca");

    context.fillStyle = gradient;
    roundedRect(context, x + barWidth * 0.18, centerY - height, barWidth * 0.64, height * 2, barWidth * 0.32);
    context.fill();
  }
  context.restore();
}

function drawResult(context: CanvasRenderingContext2D, options: ShareCardOptions) {
  context.save();
  context.textAlign = "center";

  context.fillStyle = options.won ? "#50e3c2" : "#ff4d4d";
  context.font = "600 168px Geist Variable, Inter, system-ui, sans-serif";
  context.letterSpacing = "-8px";
  context.fillText(options.result, CARD_WIDTH / 2, 1470);

  context.fillStyle = "rgba(250,250,250,0.62)";
  context.font = "400 34px Geist Mono Variable, ui-monospace, monospace";
  context.letterSpacing = "2px";
  context.fillText(
    options.won ? `SOLVED IN ${options.seconds}S` : "NOT SOLVED",
    CARD_WIDTH / 2,
    1528,
  );

  context.restore();
}

function drawTiles(context: CanvasRenderingContext2D, options: ShareCardOptions) {
  const count = 6;
  const gap = 18;
  const size = 76;
  const totalWidth = count * size + (count - 1) * gap;
  const left = (CARD_WIDTH - totalWidth) / 2;
  const y = 1600;

  for (let i = 0; i < count; i++) {
    const verdict = options.verdicts[i];
    context.save();
    roundedRect(context, left + i * (size + gap), y, size, size, 18);

    if (verdict) {
      context.fillStyle = VERDICT_FILL[verdict];
      context.fill();
    } else {
      context.strokeStyle = "rgba(250,250,250,0.18)";
      context.lineWidth = 3;
      context.stroke();
    }
    context.restore();
  }
}

function drawFooter(context: CanvasRenderingContext2D, options: ShareCardOptions) {
  context.save();
  context.textAlign = "center";
  context.fillStyle = "rgba(250,250,250,0.78)";
  context.font = "500 36px Geist Variable, Inter, system-ui, sans-serif";
  context.fillText(options.footer, CARD_WIDTH / 2, 1800);
  context.restore();
}

function roundedRect(
  context: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number,
) {
  context.beginPath();
  context.roundRect(x, y, width, height, radius);
}

/** Shrinks the font until the string fits, rather than clipping it. */
function fitText(
  context: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  maxWidth: number,
) {
  const original = context.font;
  const match = original.match(/(\d+)px/);
  let size = match ? Number.parseInt(match[1]!, 10) : 40;

  while (size > 20 && context.measureText(text).width > maxWidth) {
    size -= 2;
    context.font = original.replace(/\d+px/, `${size}px`);
  }

  context.fillText(text, x, y);
  context.font = original;
}

function resample(values: number[], count: number): number[] {
  const out = new Array<number>(count);
  const ratio = values.length / count;

  for (let i = 0; i < count; i++) {
    const start = Math.floor(i * ratio);
    const end = Math.max(start + 1, Math.floor((i + 1) * ratio));

    let peak = 0;
    for (let j = start; j < end && j < values.length; j++) peak = Math.max(peak, values[j] ?? 0);
    out[i] = peak;
  }

  return out;
}

/** Deterministic stand-in so the same track always yields the same shape. */
function seededWave(seed: string, count: number): number[] {
  let state = hashString(seed) || 1;

  const next = () => {
    state = (Math.imul(state, 1664525) + 1013904223) >>> 0;
    return state / 0x100000000;
  };

  return Array.from({ length: count }, (_, i) => {
    const envelope = Math.sin((i / count) * Math.PI) * 0.55 + 0.3;
    return Math.min(1, envelope * (0.55 + next() * 0.75));
  });
}
