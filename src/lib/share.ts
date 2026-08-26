import { MAX_ATTEMPTS, tilePattern, type RoundState } from "./game";
import type { GameMode } from "./types";

export const SITE_URL = "https://cluetune.com";

/**
 * A challenge is a self-contained link: the whole payload lives in the URL, so
 * sending one needs no account, no database row, and no expiry. The recipient
 * plays the exact same track and is scored against the sender's result.
 */
export interface ChallengePayload {
  /** Catalog track id. */
  t: string;
  /** Mode the challenge was set in. */
  m: GameMode;
  /** Winning attempt, or 0 if the sender lost. */
  a: number;
  /** Seconds to guess, rounded. */
  s: number;
  /** Optional display name, 16 chars max. */
  n?: string;
}

function toBase64Url(bytes: Uint8Array): string {
  let binary = "";
  for (const byte of bytes) binary += String.fromCharCode(byte);
  const base64 = typeof btoa === "function" ? btoa(binary) : Buffer.from(binary, "binary").toString("base64");
  return base64.replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function fromBase64Url(value: string): Uint8Array {
  const base64 = value.replace(/-/g, "+").replace(/_/g, "/").padEnd(Math.ceil(value.length / 4) * 4, "=");
  const binary = typeof atob === "function" ? atob(base64) : Buffer.from(base64, "base64").toString("binary");
  return Uint8Array.from(binary, (char: string) => char.charCodeAt(0));
}

export function encodeChallenge(payload: ChallengePayload): string {
  const json = JSON.stringify(payload);
  return toBase64Url(new TextEncoder().encode(json));
}

export function decodeChallenge(code: string): ChallengePayload | null {
  try {
    const parsed = JSON.parse(new TextDecoder().decode(fromBase64Url(code))) as ChallengePayload;
    if (typeof parsed?.t !== "string" || typeof parsed?.m !== "string") return null;
    if (typeof parsed.a !== "number" || typeof parsed.s !== "number") return null;
    return parsed;
  } catch {
    return null;
  }
}

export function challengeUrl(payload: ChallengePayload, origin = SITE_URL): string {
  return `${origin}/challenge/${encodeChallenge(payload)}`;
}

export function challengeFromRound(state: RoundState, name?: string): ChallengePayload {
  const attempt = state.status === "won" ? state.guesses.length : 0;
  const seconds = Math.round(((state.endedAt ?? Date.now()) - (state.startedAt ?? Date.now())) / 1000);

  return {
    t: state.track.id,
    m: state.mode,
    a: attempt,
    s: Math.max(0, seconds),
    ...(name ? { n: name.slice(0, 16) } : {}),
  };
}

const MODE_LABELS: Record<GameMode, string> = {
  daily: "Daily",
  unlimited: "Unlimited",
  "sped-up": "Sped-Up",
  "lyric-flip": "Lyrics",
  gauntlet: "Gauntlet",
};

export function modeLabel(mode: GameMode): string {
  return MODE_LABELS[mode];
}

export interface ShareTextOptions {
  state: RoundState;
  /** Puzzle number, for daily only. */
  puzzle?: number;
  /** Include a challenge link in the body. */
  challenge?: string;
}

/**
 * Kept deliberately short. Long share blocks get truncated by X and clipped in
 * iMessage previews, which is where most of these actually get pasted.
 */
export function buildShareText({ state, puzzle, challenge }: ShareTextOptions): string {
  const heading =
    state.mode === "daily" && puzzle != null
      ? `Cluetune #${puzzle}`
      : `Cluetune · ${modeLabel(state.mode)}`;

  const outcome =
    state.status === "won" ? `${state.guesses.length}/${MAX_ATTEMPTS}` : `X/${MAX_ATTEMPTS}`;

  const seconds = Math.round(((state.endedAt ?? 0) - (state.startedAt ?? 0)) / 1000);
  const timing = state.status === "won" && seconds > 0 ? ` · ${seconds}s` : "";

  return [`${heading} ${outcome}${timing}`, tilePattern(state), challenge ?? SITE_URL]
    .filter(Boolean)
    .join("\n");
}

/**
 * Uses the Web Share API when the platform offers it (which is where a 9:16
 * card actually lands in a Story), and falls back to the clipboard elsewhere.
 */
export async function shareOrCopy(payload: {
  title: string;
  text: string;
  url?: string;
  files?: File[];
}): Promise<"shared" | "copied" | "failed"> {
  const canShareFiles =
    typeof navigator !== "undefined" &&
    "canShare" in navigator &&
    payload.files?.length &&
    navigator.canShare({ files: payload.files });

  if (typeof navigator !== "undefined" && "share" in navigator) {
    try {
      await navigator.share(canShareFiles ? payload : { title: payload.title, text: payload.text, url: payload.url });
      return "shared";
    } catch (error) {
      // A user-cancelled share should not fall through to a surprise copy.
      if (error instanceof DOMException && error.name === "AbortError") return "failed";
    }
  }

  try {
    await navigator.clipboard.writeText([payload.text, payload.url].filter(Boolean).join("\n"));
    return "copied";
  } catch {
    return "failed";
  }
}
