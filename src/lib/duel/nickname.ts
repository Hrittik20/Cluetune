import { NAME_MAX } from "./protocol";

/**
 * Nickname validation for Duel. Kept client- and server-friendly: no I/O,
 * ASCII-leaning charset, and a short blocklist that catches common leetspeak.
 */

const ALLOWED = /^[\p{L}\p{N} _.\-']+$/u;

/** Lowercased, leetspeak-normalized tokens that are never allowed as a name. */
const BLOCKLIST = new Set([
  "admin",
  "mod",
  "moderator",
  "cluetune",
  "cluebot",
  "system",
  "official",
  "support",
  "nigger",
  "nigga",
  "faggot",
  "fag",
  "retard",
  "retarded",
  "tranny",
  "kike",
  "chink",
  "spic",
  "rape",
  "rapist",
  "pedophile",
  "paedophile",
  "pedo",
  "hitler",
  "nazi",
  "fuck",
  "fucker",
  "fucking",
  "shit",
  "asshole",
  "bitch",
  "cunt",
  "whore",
  "slut",
]);

export type NicknameResult =
  | { ok: true; name: string }
  | { ok: false; reason: "empty" | "too-long" | "charset" | "blocked" };

export function normalizeNickname(raw: string): string {
  return raw.replace(/[\p{Cc}\p{Cf}]/gu, "").replace(/\s+/g, " ").trim();
}

/** Collapse leetspeak so `n1gger` / `f@g` still hit the blocklist. */
export function foldForFilter(input: string): string {
  return input
    .toLowerCase()
    .replace(/[@4]/g, "a")
    .replace(/[1!|]/g, "i")
    .replace(/3/g, "e")
    .replace(/0/g, "o")
    .replace(/\$/g, "s")
    .replace(/5/g, "s")
    .replace(/7/g, "t")
    .replace(/[^a-z0-9]/g, "");
}

export function validateNickname(raw: string): NicknameResult {
  const name = normalizeNickname(raw);
  if (!name) return { ok: false, reason: "empty" };
  if (name.length > NAME_MAX) return { ok: false, reason: "too-long" };
  if (!ALLOWED.test(name)) return { ok: false, reason: "charset" };

  const folded = foldForFilter(name);
  for (const bad of BLOCKLIST) {
    if (folded === bad || folded.includes(bad)) return { ok: false, reason: "blocked" };
  }

  return { ok: true, name };
}

/** Always returns a displayable name; falls back to `Player` when invalid. */
export function safeNickname(raw: unknown, fallback = "Player"): string {
  if (typeof raw !== "string") return fallback;
  const result = validateNickname(raw);
  return result.ok ? result.name : fallback;
}
