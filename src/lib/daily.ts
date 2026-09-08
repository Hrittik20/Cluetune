import { CATALOG, dailyGuessablePool, expandByPopularity } from "./catalog";
import { puzzleNumber, shuffleDeterministic } from "./daily-time";
import type { Track } from "./types";

export {
  formatCountdown,
  hashString,
  isValidDateKey,
  localDateKey,
  msUntilLocalMidnight,
  puzzleNumber,
  shuffleDeterministic,
} from "./daily-time";

/**
 * The daily puzzle resets at the player's local midnight, so the puzzle key is
 * a local calendar date rather than a UTC timestamp. Two players in different
 * timezones can therefore be on different puzzles at the same instant, which is
 * the intended trade for "it resets when your day does".
 *
 * Selection is a pure function of the date key, so the server, the client and
 * a shared result card all derive the same track with no coordination.
 */

/**
 * Walks the catalog in a fixed pseudo-random permutation rather than indexing
 * by hash directly, which would repeat tracks long before the pool is
 * exhausted. Every track is used once per cycle.
 */
export function dailyTrack(dateKey: string, pool: Track[] = CATALOG): Track {
  if (!pool.length) throw new Error("Cannot pick a daily track from an empty pool.");

  const weighted = expandByPopularity(dailyGuessablePool(pool));
  const index = puzzleNumber(dateKey) - 1;
  const cycle = Math.floor(index / weighted.length);
  const offset = ((index % weighted.length) + weighted.length) % weighted.length;

  return shuffleDeterministic(weighted, `cluetune-daily-cycle-${cycle}`)[offset]!;
}
