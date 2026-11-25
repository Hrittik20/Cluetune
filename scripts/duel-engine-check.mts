/**
 * Scenario checks for the Duel rulebook (`src/lib/duel/engine.ts`).
 * Run with `npm run duel:check`.
 */
import assert from "node:assert/strict";
import { createEngine, reduce, wakeAt, type EngineEvent, type EngineState } from "../src/lib/duel/engine.ts";
import {
  CLOSING_MS,
  COUNTDOWN_MS,
  FIRST_CORRECT_BONUS,
  RECONNECT_GRACE_MS,
  REVEAL_MS,
  STEP_MS,
  STEP_POINTS,
} from "../src/lib/duel/protocol.ts";
import type { GuessVerdict } from "../src/lib/types.ts";

let now = 1_000_000;
let s: EngineState;

type WithoutNow<T> = T extends unknown ? Omit<T, "now"> : never;

function send(event: WithoutNow<EngineEvent>): void {
  s = reduce(s, { now, ...event } as EngineEvent);
}
function advance(ms: number): void {
  now += ms;
  send({ type: "tick" });
}
function act(seat: 0 | 1, verdict: GuessVerdict): void {
  send({ type: "act", seat, verdict, label: verdict });
}
function freshMatch(): void {
  now = 1_000_000;
  s = createEngine();
  send({ type: "join", seat: 0, playerId: "a", name: "A", isBot: false });
  assert.equal(s.phase, "lobby");
  send({ type: "join", seat: 1, playerId: "b", name: "B", isBot: false });
  assert.equal(s.phase, "loading");
  send({ type: "audio-delivered" });
  send({ type: "ready", seat: 0, match: 1 });
  send({ type: "ready", seat: 1, match: 1 });
  assert.equal(s.phase, "countdown");
  advance(COUNTDOWN_MS);
  assert.equal(s.phase, "step");
  assert.equal(s.step, 1);
}
function finishRound(): void {
  advance(REVEAL_MS);
  if (s.phase === "countdown") advance(COUNTDOWN_MS);
}

const checks: [string, () => void][] = [
  ["both acting early advances the step immediately", () => {
    freshMatch();
    act(0, "wrong");
    assert.equal(s.step, 1);
    act(1, "skip");
    assert.equal(s.step, 2);
    assert.equal(s.phase, "step");
  }],

  ["one guess per step", () => {
    freshMatch();
    act(0, "wrong");
    const before = s;
    act(0, "correct");
    assert.equal(s, before);
  }],

  ["timer expiry times out silent players and advances", () => {
    freshMatch();
    act(0, "wrong");
    advance(STEP_MS);
    assert.equal(s.step, 2);
    assert.equal(s.rounds[0]!.actions[1][0]!.verdict, "timeout");
  }],

  ["correct with rival unacted: rival keeps this step, timer shortens", () => {
    freshMatch();
    now += 1000;
    act(0, "correct");
    assert.equal(s.phase, "step");
    assert.equal(s.rounds[0]!.lastChance, 1);
    assert.equal(s.deadline, now + CLOSING_MS);
    act(1, "wrong");
    assert.equal(s.phase, "reveal");
    assert.deepEqual(s.rounds[0]!.points, [STEP_POINTS[0] + FIRST_CORRECT_BONUS, 0]);
  }],

  ["correct after rival already acted: rival gets a closing guess on the next rung", () => {
    freshMatch();
    act(1, "wrong");
    act(0, "correct");
    assert.equal(s.phase, "closing");
    assert.equal(s.closingSeat, 1);
    assert.equal(s.step, 2);
    act(1, "correct");
    assert.equal(s.phase, "reveal");
    assert.deepEqual(s.rounds[0]!.points, [STEP_POINTS[0] + FIRST_CORRECT_BONUS, STEP_POINTS[1]]);
  }],

  ["closing window expiry ends the round", () => {
    freshMatch();
    act(1, "skip");
    act(0, "correct");
    advance(CLOSING_MS);
    assert.equal(s.phase, "reveal");
  }],

  ["both correct on the same step: earlier one gets the bonus", () => {
    freshMatch();
    act(1, "correct");
    now += 10;
    act(0, "correct");
    assert.equal(s.phase, "reveal");
    assert.equal(s.rounds[0]!.firstSeat, 1);
  }],

  ["nobody gets it in six steps", () => {
    freshMatch();
    for (let i = 0; i < 6; i++) {
      act(0, "wrong");
      act(1, "wrong");
    }
    assert.equal(s.phase, "reveal");
    assert.deepEqual(s.rounds[0]!.points, [0, 0]);
  }],

  ["three rounds, points decide", () => {
    freshMatch();
    for (let r = 0; r < 3; r++) {
      act(0, "correct");
      act(1, "wrong");
      finishRound();
    }
    assert.equal(s.phase, "ended");
    assert.equal(s.result?.winner, 0);
    assert.equal(s.result?.reason, "points");
  }],

  ["tied after three goes to sudden death; first correct wins", () => {
    freshMatch();
    for (let r = 0; r < 3; r++) {
      act(0, "wrong");
      act(1, "wrong");
      for (let i = 1; i < 6; i++) {
        act(0, "wrong");
        act(1, "wrong");
      }
      finishRound();
    }
    assert.equal(s.round, 3);
    assert.equal(s.phase, "step");
    act(1, "correct");
    assert.equal(s.phase, "reveal");
    advance(REVEAL_MS);
    assert.equal(s.result?.winner, 1);
    assert.equal(s.result?.reason, "sudden-death");
    assert.deepEqual(s.result?.scores, [0, 0]);
  }],

  ["leaving mid-match forfeits", () => {
    freshMatch();
    send({ type: "leave", seat: 1 });
    assert.equal(s.phase, "ended");
    assert.equal(s.result?.winner, 0);
    assert.equal(s.result?.reason, "forfeit");
  }],

  ["disconnect: instant timeouts, forfeit after grace, reconnect cancels it", () => {
    freshMatch();
    send({ type: "disconnect", seat: 1 });
    act(0, "wrong");
    assert.equal(s.step, 2, "dropped player should not hold the step");
    send({ type: "reconnect", seat: 1 });
    advance(RECONNECT_GRACE_MS);
    assert.notEqual(s.phase, "ended");

    send({ type: "disconnect", seat: 1 });
    assert.equal(wakeAt(s), Math.min(s.deadline!, now + RECONNECT_GRACE_MS));
    advance(RECONNECT_GRACE_MS);
    assert.equal(s.phase, "ended");
    assert.equal(s.result?.reason, "forfeit");
  }],

  ["ready timeout starts without the slow loader", () => {
    now = 0;
    s = createEngine();
    send({ type: "join", seat: 0, playerId: "a", name: "A", isBot: false });
    send({ type: "join", seat: 1, playerId: "b", name: "B", isBot: false });
    send({ type: "audio-delivered" });
    send({ type: "ready", seat: 0, match: 1 });
    advance(s.deadline! - now);
    assert.equal(s.phase, "countdown");
  }],

  ["rematch needs both votes and resets scores", () => {
    freshMatch();
    send({ type: "leave", seat: 1 });
    send({ type: "rematch", seat: 0 });
    assert.equal(s.phase, "ended", "cannot rematch an absent player");

    freshMatch();
    for (let r = 0; r < 3; r++) {
      act(0, "correct");
      act(1, "correct");
      finishRound();
    }
    assert.equal(s.phase, "ended");
    send({ type: "rematch", seat: 0 });
    assert.equal(s.phase, "ended");
    send({ type: "rematch", seat: 1 });
    assert.equal(s.phase, "loading");
    assert.equal(s.match, 2);
    assert.equal(s.seats[0]!.score, 0);
  }],

  ["bots are ready and vote rematch automatically", () => {
    now = 0;
    s = createEngine();
    send({ type: "join", seat: 0, playerId: "a", name: "A", isBot: false });
    send({ type: "join", seat: 1, playerId: "bot", name: "Bot", isBot: true });
    send({ type: "audio-delivered" });
    send({ type: "ready", seat: 0, match: 1 });
    assert.equal(s.phase, "countdown");
  }],
];

let failed = 0;
for (const [name, run] of checks) {
  try {
    run();
    console.log(`ok   ${name}`);
  } catch (error) {
    failed++;
    console.log(`FAIL ${name}\n     ${(error as Error).message}`);
  }
}
console.log(`\n${checks.length - failed}/${checks.length} passed`);
process.exit(failed ? 1 : 0);
