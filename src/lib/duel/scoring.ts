import { DUEL_STEPS, FIRST_CORRECT_BONUS, STEP_POINTS, type Seat } from "./protocol";

/** Points for a correct guess made while `step` was unlocked. */
export function stepPoints(step: number): number {
  return STEP_POINTS[Math.min(Math.max(step, 1), DUEL_STEPS) - 1]!;
}

export interface CorrectMark {
  step: number;
  at: number;
}

/**
 * The first correct player gets the bonus even when the opponent never
 * solves it, so solving a round alone is always worth more than tying it late.
 */
export function roundPoints(correct: [CorrectMark | null, CorrectMark | null]): {
  points: [number, number];
  firstSeat: Seat | null;
} {
  const [a, b] = correct;
  const firstSeat: Seat | null = a && b ? (a.at <= b.at ? 0 : 1) : a ? 0 : b ? 1 : null;
  const points: [number, number] = [a ? stepPoints(a.step) : 0, b ? stepPoints(b.step) : 0];
  if (firstSeat !== null) points[firstSeat] += FIRST_CORRECT_BONUS;
  return { points, firstSeat };
}
