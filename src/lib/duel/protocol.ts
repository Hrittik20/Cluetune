import { CLIP_LADDER_MS } from "../game";
import type { GuessVerdict } from "../types";

/**
 * Wire contract between DuelShell and the DuelRoom / Matchmaker Durable
 * Objects. Shared by client and server, so keep it free of runtime imports
 * beyond constants. Every timestamp here is server epoch milliseconds; clients
 * translate with the offset measured by ping/pong.
 */

export const DUEL_ROUNDS = 3;
/** Regular rounds plus one sudden-death track, all resolved and preloaded up front. */
export const DUEL_TRACKS = DUEL_ROUNDS + 1;
export const STEP_LADDER_MS = CLIP_LADDER_MS;
export const DUEL_STEPS = STEP_LADDER_MS.length;

export const STEP_MS = 8000;
export const CLOSING_MS = 5000;
export const COUNTDOWN_MS = 3000;
export const REVEAL_MS = 6000;
/** How long the room waits for both clients to preload before starting anyway. */
export const READY_TIMEOUT_MS = 15_000;
/** A dropped player has this long to reconnect before the match is forfeited. */
export const RECONNECT_GRACE_MS = 20_000;
/** How long a quick-match room waits for the second matched player to connect. */
export const PUBLIC_JOIN_TIMEOUT_MS = 20_000;
/** An empty or finished room cleans itself up after this much inactivity. */
export const ROOM_IDLE_MS = 15 * 60_000;

export const STEP_POINTS = [1000, 700, 500, 340, 220, 120] as const;
export const FIRST_CORRECT_BONUS = 150;

export const EMOTES = ["😂", "🔥", "💀", "🫡", "🐐"] as const;
export type Emote = (typeof EMOTES)[number];

export const NAME_MAX = 16;
export const GUESS_MAX = 120;
export const ROOM_CODE_LENGTH = 4;

export type Seat = 0 | 1;
export type RoomKind = "private" | "public";

export type DuelPhase =
  | "lobby" // waiting for a second player
  | "loading" // tracks resolved, clients preloading audio
  | "countdown" // 3-2-1 before a round
  | "step" // a ladder step is open, both may act once
  | "closing" // one player is correct, the other has a final guess
  | "reveal" // song shown between rounds
  | "ended"; // match over, rematch possible

/** `timeout` is a step the player let run out; it renders like a skip. */
export type ActionVerdict = GuessVerdict | "timeout";

export interface TileView {
  step: number;
  verdict: ActionVerdict;
}

/** Your own tiles carry what you typed; the opponent's never do. */
export interface OwnTileView extends TileView {
  label: string;
}

export interface PlayerView {
  seat: Seat;
  name: string;
  connected: boolean;
  ready: boolean;
  score: number;
  /** Tiles in the current round. */
  tiles: TileView[];
  /** Step on which this player got the current round, if they have. */
  correctStep: number | null;
  actedThisStep: boolean;
}

export interface RevealedTrack {
  title: string;
  artist: string;
  album: string;
  year: number;
  artworkUrl?: string;
  attribution: string;
}

export interface RoundSummary {
  round: number;
  suddenDeath: boolean;
  track: RevealedTrack | null;
  points: [number, number];
  correctStep: [number | null, number | null];
  /** Seat that was correct first, if anyone was. */
  firstSeat: Seat | null;
}

/** `cancelled` means no playable tracks could be found; nobody wins or loses. */
export type MatchEndReason = "points" | "sudden-death" | "forfeit" | "draw" | "cancelled";

export interface MatchResult {
  winner: Seat | null;
  scores: [number, number];
  reason: MatchEndReason;
}

export interface HeadToHead {
  youWins: number;
  theirWins: number;
  draws: number;
}

export interface DuelSnapshot {
  roomId: string;
  code: string | null;
  kind: RoomKind;
  /** Increments on every rematch; audio clips are tied to it. */
  match: number;
  phase: DuelPhase;
  serverNow: number;
  /** 0-based. `DUEL_ROUNDS` is the sudden-death round. */
  round: number;
  totalRounds: number;
  suddenDeath: boolean;
  /** 1-based ladder step, 0 outside a round. */
  step: number;
  unlockedMs: number;
  /** When the current phase times out, or null if it does not. */
  deadline: number | null;
  /** Server time the current step opened; clients auto-play the clip from here. */
  stepStartedAt: number | null;
  you: Seat;
  players: [PlayerView | null, PlayerView | null];
  canAct: boolean;
  yourTiles: OwnTileView[];
  history: RoundSummary[];
  result: MatchResult | null;
  rematchVotes: [boolean, boolean];
  headToHead: HeadToHead | null;
}

// ---------------------------------------------------------------------------
// Room socket: /api/duel/room/:roomId
// ---------------------------------------------------------------------------

export type ClientMessage =
  | { type: "hello"; playerId: string; name?: string; seatToken?: string }
  | { type: "ready"; match: number }
  | { type: "guess"; label: string }
  | { type: "skip" }
  | { type: "emote"; emote: Emote }
  | { type: "rematch" }
  | { type: "leave" }
  | { type: "ping"; t: number };

export type DuelErrorCode =
  | "room-full"
  | "not-found"
  | "bad-request"
  | "not-allowed"
  | "tracks-unavailable"
  /** A quick-match opponent never connected; the client should requeue. */
  | "opponent-missing"
  | "rate-limited";

export type ServerMessage =
  | { type: "welcome"; seat: Seat; seatToken: string; snapshot: DuelSnapshot }
  | { type: "state"; snapshot: DuelSnapshot }
  /** One opaque, same-origin URL per round (sudden death last). */
  | { type: "audio"; match: number; clips: string[] }
  | { type: "emote"; seat: Seat; emote: Emote }
  | { type: "pong"; t: number; server: number }
  | { type: "error"; code: DuelErrorCode; message: string };

// ---------------------------------------------------------------------------
// Queue socket: /api/duel/queue — never carries player or queue counts.
// ---------------------------------------------------------------------------

export type QueueClientMessage =
  | { type: "queue"; playerId: string; name?: string }
  | { type: "cancel" };

export type QueueServerMessage =
  | { type: "queued" }
  | { type: "matched"; roomId: string }
  | { type: "error"; code: DuelErrorCode; message: string };

// ---------------------------------------------------------------------------
// HTTP
//   POST /api/duel/rooms           { playerId }  -> CreateRoomResponse
//   GET  /api/duel/rooms/:code                    -> { roomId } | 404
//   GET  /api/duel/audio/:roomId/:token           -> audio stream
//   GET  /api/admin/duel  (ADMIN_TOKEN)           -> DuelAdminStats
// ---------------------------------------------------------------------------

export interface CreateRoomResponse {
  roomId: string;
  code: string;
}

export interface DuelAdminStats {
  now: number;
  queue: {
    size: number;
    /** Oldest first. */
    waitingMs: number[];
  };
  liveRooms: number;
  today: {
    /** UTC day the counters below cover, `YYYY-MM-DD`. */
    date: string;
    matchesStarted: number;
    matchesFinished: number;
    privateRoomsCreated: number;
    queueJoins: number;
    queueMatches: number;
    queueAbandons: number;
  };
  /** Median queue wait over the most recent matches, or null with no data. */
  medianQueueWaitMs: number | null;
  /** Median match length over the most recent finished matches. */
  medianMatchMs: number | null;
}

export function unlockedMsForStep(step: number): number {
  if (step <= 0) return 0;
  return STEP_LADDER_MS[Math.min(step, DUEL_STEPS) - 1]!;
}
