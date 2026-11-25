import type { GuessVerdict } from "../types";
import {
  CLOSING_MS,
  COUNTDOWN_MS,
  DUEL_ROUNDS,
  DUEL_STEPS,
  READY_TIMEOUT_MS,
  RECONNECT_GRACE_MS,
  REVEAL_MS,
  STEP_MS,
  unlockedMsForStep,
  type ActionVerdict,
  type DuelPhase,
  type DuelSnapshot,
  type HeadToHead,
  type MatchEndReason,
  type MatchResult,
  type PlayerView,
  type RevealedTrack,
  type RoomKind,
  type RoundSummary,
  type Seat,
} from "./protocol";
import { roundPoints, type CorrectMark } from "./scoring";

/**
 * The whole Duel rulebook as a pure reducer. No timers, sockets or track data
 * live here: the room feeds in events stamped with `now` (including `tick`
 * when an alarm fires) and schedules its next alarm from `wakeAt`. Guesses
 * arrive already judged, so this module never sees an answer.
 */

export interface SeatState {
  playerId: string;
  name: string;
  isBot: boolean;
  connected: boolean;
  disconnectedAt: number | null;
  ready: boolean;
  score: number;
}

export interface Action {
  step: number;
  verdict: ActionVerdict;
  label: string;
  at: number;
}

export interface RoundPlay {
  actions: [Action[], Action[]];
  correct: [CorrectMark | null, CorrectMark | null];
  /** Opponent of a correct player who may still use this step's action. */
  lastChance: Seat | null;
  points: [number, number];
  firstSeat: Seat | null;
  endedAt: number | null;
}

export interface EngineState {
  phase: DuelPhase;
  seats: [SeatState | null, SeatState | null];
  match: number;
  round: number;
  step: number;
  deadline: number | null;
  stepStartedAt: number | null;
  closingSeat: Seat | null;
  rounds: RoundPlay[];
  result: MatchResult | null;
  rematch: [boolean, boolean];
  matchStartedAt: number | null;
  audioDelivered: boolean;
}

export type EngineEvent =
  | { type: "join"; seat: Seat; playerId: string; name: string; isBot: boolean; now: number }
  | { type: "disconnect"; seat: Seat; now: number }
  | { type: "reconnect"; seat: Seat; now: number }
  | { type: "leave"; seat: Seat; now: number }
  | { type: "audio-delivered"; now: number }
  | { type: "ready"; seat: Seat; match: number; now: number }
  | { type: "act"; seat: Seat; verdict: GuessVerdict; label: string; now: number }
  | { type: "rematch"; seat: Seat; now: number }
  | { type: "abort"; now: number }
  | { type: "tick"; now: number };

const IN_PLAY: ReadonlySet<DuelPhase> = new Set(["loading", "countdown", "step", "closing", "reveal"]);

export function createEngine(): EngineState {
  return {
    phase: "lobby",
    seats: [null, null],
    match: 0,
    round: 0,
    step: 0,
    deadline: null,
    stepStartedAt: null,
    closingSeat: null,
    rounds: [],
    result: null,
    rematch: [false, false],
    matchStartedAt: null,
    audioDelivered: false,
  };
}

export function isInPlay(state: EngineState): boolean {
  return IN_PLAY.has(state.phase);
}

export function isSuddenDeath(state: EngineState): boolean {
  return state.round >= DUEL_ROUNDS;
}

export function reduce(prev: EngineState, event: EngineEvent): EngineState {
  const s = structuredClone(prev);
  const { now } = event;

  switch (event.type) {
    case "join": {
      const existing = s.seats[event.seat];
      if (existing && existing.playerId !== event.playerId) return prev;
      if (existing) {
        existing.connected = true;
        existing.disconnectedAt = null;
        existing.name = event.name;
        return s;
      }
      s.seats[event.seat] = {
        playerId: event.playerId,
        name: event.name,
        isBot: event.isBot,
        connected: true,
        disconnectedAt: null,
        ready: false,
        score: 0,
      };
      if (s.phase === "lobby" && s.seats[0] && s.seats[1]) startLoading(s, now);
      return s;
    }

    case "disconnect": {
      const seat = s.seats[event.seat];
      if (!seat) return prev;
      if (s.phase === "lobby") {
        s.seats[event.seat] = null;
        return s;
      }
      seat.connected = false;
      seat.disconnectedAt = now;
      s.rematch[event.seat] = false;
      timeOutAbsent(s, event.seat, now);
      return s;
    }

    case "reconnect": {
      const seat = s.seats[event.seat];
      if (!seat) return prev;
      seat.connected = true;
      seat.disconnectedAt = null;
      return s;
    }

    case "leave": {
      const seat = s.seats[event.seat];
      if (!seat) return prev;
      if (s.phase === "lobby") {
        s.seats[event.seat] = null;
      } else if (isInPlay(s)) {
        seat.connected = false;
        seat.disconnectedAt = now;
        endMatch(s, other(event.seat), "forfeit");
      } else {
        seat.connected = false;
        seat.disconnectedAt = now;
        s.rematch = [false, false];
      }
      return s;
    }

    case "audio-delivered": {
      if (s.phase !== "loading") return prev;
      s.audioDelivered = true;
      s.deadline = now + READY_TIMEOUT_MS;
      maybeStartMatch(s, now);
      return s;
    }

    case "ready": {
      const seat = s.seats[event.seat];
      if (!seat || s.phase !== "loading" || event.match !== s.match) return prev;
      seat.ready = true;
      maybeStartMatch(s, now);
      return s;
    }

    case "act": {
      if (!canAct(s, event.seat)) return prev;
      applyAction(s, event.seat, event.verdict, event.label.trim(), now);
      return s;
    }

    case "rematch": {
      if (s.phase !== "ended" || !s.seats[0] || !s.seats[1]) return prev;
      if (!s.seats[event.seat]?.connected) return prev;
      s.rematch[event.seat] = true;
      for (const seat of [0, 1] as const) {
        if (s.seats[seat]?.isBot) s.rematch[seat] = true;
      }
      if (s.rematch[0] && s.rematch[1]) startLoading(s, now);
      return s;
    }

    case "abort": {
      if (s.phase !== "loading") return prev;
      endMatch(s, null, "cancelled");
      return s;
    }

    case "tick":
      return tick(s, now) ? s : prev;
  }
}

/** Earliest moment the room needs a `tick`, or null when nothing is pending. */
export function wakeAt(state: EngineState): number | null {
  const times: number[] = [];
  if (state.deadline != null) times.push(state.deadline);
  if (isInPlay(state)) {
    for (const seat of state.seats) {
      if (seat && !seat.connected && seat.disconnectedAt != null) {
        times.push(seat.disconnectedAt + RECONNECT_GRACE_MS);
      }
    }
  }
  return times.length ? Math.min(...times) : null;
}

export function currentRound(state: EngineState): RoundPlay | undefined {
  return state.rounds[state.round];
}

export function canAct(state: EngineState, seat: Seat): boolean {
  if (!state.seats[seat]?.connected) return false;
  const round = currentRound(state);
  if (!round) return false;

  if (state.phase === "step") {
    return !round.correct[seat] && !hasActed(round, seat, state.step);
  }
  if (state.phase === "closing") {
    return state.closingSeat === seat && !hasActed(round, seat, state.step);
  }
  return false;
}

// ---------------------------------------------------------------------------
// Transitions
// ---------------------------------------------------------------------------

function startLoading(s: EngineState, now: number): void {
  s.phase = "loading";
  s.match += 1;
  s.round = 0;
  s.step = 0;
  s.rounds = [];
  s.result = null;
  s.rematch = [false, false];
  s.deadline = null;
  s.stepStartedAt = null;
  s.closingSeat = null;
  s.audioDelivered = false;
  s.matchStartedAt = now;
  for (const seat of s.seats) {
    if (!seat) continue;
    seat.score = 0;
    seat.ready = seat.isBot;
  }
}

function maybeStartMatch(s: EngineState, now: number): void {
  if (!s.audioDelivered) return;
  if (s.seats.every((seat) => seat?.ready)) startCountdown(s, now);
}

function startCountdown(s: EngineState, now: number): void {
  s.phase = "countdown";
  s.step = 0;
  s.stepStartedAt = null;
  s.closingSeat = null;
  s.deadline = now + COUNTDOWN_MS;
  s.rounds[s.round] = emptyRound();
}

function startStep(s: EngineState, step: number, now: number): void {
  const round = currentRound(s)!;
  s.phase = "step";
  s.step = step;
  s.stepStartedAt = now;
  s.deadline = now + STEP_MS;
  s.closingSeat = null;
  round.lastChance = null;

  // A dropped player times out instantly so the match runs at the pace of
  // whoever is still here rather than eight seconds per step.
  for (const seat of [0, 1] as const) {
    if (!s.seats[seat]?.connected && !round.correct[seat]) {
      round.actions[seat].push({ step, verdict: "timeout", label: "", at: now });
    }
  }
  resolveStep(s, now);
}

function startClosing(s: EngineState, seat: Seat, now: number): void {
  s.phase = "closing";
  s.step += 1;
  s.closingSeat = seat;
  s.stepStartedAt = now;
  s.deadline = now + CLOSING_MS;
  if (!s.seats[seat]?.connected) endRound(s, now);
}

function applyAction(s: EngineState, seat: Seat, verdict: GuessVerdict, label: string, now: number): void {
  const round = currentRound(s)!;
  round.actions[seat].push({ step: s.step, verdict, label, at: now });

  if (verdict === "correct") round.correct[seat] = { step: s.step, at: now };

  if (s.phase === "closing") {
    endRound(s, now);
    return;
  }

  if (verdict === "correct") onCorrect(s, seat, now);
  else resolveStep(s, now);
}

function onCorrect(s: EngineState, seat: Seat, now: number): void {
  const round = currentRound(s)!;
  const rival = other(seat);

  if (isSuddenDeath(s) || round.correct[rival]) {
    endRound(s, now);
    return;
  }

  if (hasActed(round, rival, s.step)) {
    // Rival already spent this step, so they get one guess on the next rung.
    if (s.step < DUEL_STEPS) startClosing(s, rival, now);
    else endRound(s, now);
    return;
  }

  round.lastChance = rival;
  s.deadline = Math.min(s.deadline ?? now + CLOSING_MS, now + CLOSING_MS);
}

/** Called after any non-correct action or timeout in the `step` phase. */
function resolveStep(s: EngineState, now: number): void {
  if (s.phase !== "step") return;
  const round = currentRound(s)!;

  if (round.lastChance !== null) {
    if (hasActed(round, round.lastChance, s.step)) endRound(s, now);
    return;
  }

  const bothDone = ([0, 1] as const).every((seat) => round.correct[seat] || hasActed(round, seat, s.step));
  if (!bothDone) return;

  if (round.correct[0] || round.correct[1]) endRound(s, now);
  else if (s.step < DUEL_STEPS) startStep(s, s.step + 1, now);
  else endRound(s, now);
}

function endRound(s: EngineState, now: number): void {
  const round = currentRound(s)!;
  const { points, firstSeat } = roundPoints(round.correct);

  // Sudden death decides the winner by who was first; it never moves scores.
  round.points = isSuddenDeath(s) ? [0, 0] : points;
  round.firstSeat = firstSeat;
  round.endedAt = now;
  round.lastChance = null;

  for (const seat of [0, 1] as const) {
    const state = s.seats[seat];
    if (state) state.score += round.points[seat];
  }

  s.phase = "reveal";
  s.closingSeat = null;
  s.stepStartedAt = null;
  s.deadline = now + REVEAL_MS;
}

function afterReveal(s: EngineState, now: number): void {
  if (isSuddenDeath(s)) {
    const first = currentRound(s)!.firstSeat;
    endMatch(s, first, first === null ? "draw" : "sudden-death");
    return;
  }

  if (s.round + 1 < DUEL_ROUNDS) {
    s.round += 1;
    startCountdown(s, now);
    return;
  }

  const [a, b] = scores(s);
  if (a === b) {
    s.round = DUEL_ROUNDS;
    startCountdown(s, now);
  } else {
    endMatch(s, a > b ? 0 : 1, "points");
  }
}

function endMatch(s: EngineState, winner: Seat | null, reason: MatchEndReason): void {
  s.phase = "ended";
  s.result = { winner, scores: scores(s), reason };
  s.deadline = null;
  s.stepStartedAt = null;
  s.closingSeat = null;
  s.rematch = [false, false];
  const round = currentRound(s);
  if (round) round.lastChance = null;
}

/** Returns whether anything changed. */
function tick(s: EngineState, now: number): boolean {
  if (isInPlay(s)) {
    const gone = ([0, 1] as const).filter((seat) => {
      const state = s.seats[seat];
      return state && !state.connected && state.disconnectedAt != null && now - state.disconnectedAt >= RECONNECT_GRACE_MS;
    });
    if (gone.length === 2) {
      endMatch(s, null, "cancelled");
      return true;
    }
    if (gone.length === 1) {
      endMatch(s, other(gone[0]!), "forfeit");
      return true;
    }
  }

  if (s.deadline == null || now < s.deadline) return false;

  switch (s.phase) {
    case "loading":
      // Start without the slow loader rather than hold the other player hostage.
      startCountdown(s, now);
      return true;
    case "countdown":
      startStep(s, 1, now);
      return true;
    case "step": {
      const round = currentRound(s)!;
      for (const seat of [0, 1] as const) {
        if (!round.correct[seat] && !hasActed(round, seat, s.step)) {
          round.actions[seat].push({ step: s.step, verdict: "timeout", label: "", at: now });
        }
      }
      if (round.correct[0] || round.correct[1]) endRound(s, now);
      else if (s.step < DUEL_STEPS) startStep(s, s.step + 1, now);
      else endRound(s, now);
      return true;
    }
    case "closing": {
      const round = currentRound(s)!;
      const seat = s.closingSeat;
      if (seat !== null && !hasActed(round, seat, s.step)) {
        round.actions[seat].push({ step: s.step, verdict: "timeout", label: "", at: now });
      }
      endRound(s, now);
      return true;
    }
    case "reveal":
      afterReveal(s, now);
      return true;
    default:
      s.deadline = null;
      return true;
  }
}

/** A player who drops mid-step forfeits that step's action immediately. */
function timeOutAbsent(s: EngineState, seat: Seat, now: number): void {
  const round = currentRound(s);
  if (!round) return;

  if (s.phase === "closing" && s.closingSeat === seat && !hasActed(round, seat, s.step)) {
    round.actions[seat].push({ step: s.step, verdict: "timeout", label: "", at: now });
    endRound(s, now);
    return;
  }

  if (s.phase === "step" && !round.correct[seat] && !hasActed(round, seat, s.step)) {
    round.actions[seat].push({ step: s.step, verdict: "timeout", label: "", at: now });
    resolveStep(s, now);
  }
}

// ---------------------------------------------------------------------------
// Views
// ---------------------------------------------------------------------------

export interface SnapshotContext {
  roomId: string;
  code: string | null;
  kind: RoomKind;
  now: number;
  /** Track metadata by round index. Only entries for finished rounds are ever exposed. */
  tracks: (RevealedTrack | null)[];
  headToHead: HeadToHead | null;
}

export function snapshotFor(state: EngineState, you: Seat, ctx: SnapshotContext): DuelSnapshot {
  const round = currentRound(state);
  const step = state.phase === "step" || state.phase === "closing" ? state.step : 0;

  const players = ([0, 1] as const).map((seat): PlayerView | null => {
    const s = state.seats[seat];
    if (!s) return null;
    return {
      seat,
      name: s.name,
      connected: s.connected,
      ready: s.ready,
      score: s.score,
      tiles: round?.actions[seat].map(({ step, verdict }) => ({ step, verdict })) ?? [],
      correctStep: round?.correct[seat]?.step ?? null,
      actedThisStep: round && step ? hasActed(round, seat, step) : false,
    };
  }) as [PlayerView | null, PlayerView | null];

  const history: RoundSummary[] = state.rounds.flatMap((play, index) =>
    play.endedAt == null
      ? []
      : [
          {
            round: index,
            suddenDeath: index >= DUEL_ROUNDS,
            track: ctx.tracks[index] ?? null,
            points: play.points,
            correctStep: [play.correct[0]?.step ?? null, play.correct[1]?.step ?? null],
            firstSeat: play.firstSeat,
          },
        ],
  );

  const revealAll = state.phase === "reveal" || state.phase === "ended";

  return {
    roomId: ctx.roomId,
    code: ctx.code,
    kind: ctx.kind,
    match: state.match,
    phase: state.phase,
    serverNow: ctx.now,
    round: state.round,
    totalRounds: DUEL_ROUNDS,
    suddenDeath: isSuddenDeath(state),
    step,
    unlockedMs: revealAll ? unlockedMsForStep(DUEL_STEPS) : unlockedMsForStep(step),
    deadline: state.deadline,
    stepStartedAt: state.stepStartedAt,
    you,
    players,
    canAct: canAct(state, you),
    yourTiles: round?.actions[you].map(({ step, verdict, label }) => ({ step, verdict, label })) ?? [],
    history,
    result: state.result,
    rematchVotes: state.rematch,
    headToHead: ctx.headToHead,
  };
}

// ---------------------------------------------------------------------------

function emptyRound(): RoundPlay {
  return {
    actions: [[], []],
    correct: [null, null],
    lastChance: null,
    points: [0, 0],
    firstSeat: null,
    endedAt: null,
  };
}

function hasActed(round: RoundPlay, seat: Seat, step: number): boolean {
  return round.actions[seat].some((action) => action.step === step);
}

function other(seat: Seat): Seat {
  return seat === 0 ? 1 : 0;
}

function scores(s: EngineState): [number, number] {
  return [s.seats[0]?.score ?? 0, s.seats[1]?.score ?? 0];
}
