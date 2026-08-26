import { MAX_ATTEMPTS } from "../../lib/game";
import type { Guess, GuessVerdict } from "../../lib/types";

export interface GuessRowsProps {
  guesses: Guess[];
  ladder: readonly number[];
  /** Index of the row currently in play, or -1 when the round is over. */
  activeIndex: number;
  /** Playback head, for the clip loading bar. */
  positionMs?: number;
  /** How much of the ladder is currently unlocked. */
  unlockedMs?: number;
  /** Set false when the bar is rendered next to the player instead. */
  showBar?: boolean;
  /** Empty active-row copy. Audio modes talk about seconds; lyrics mode does not. */
  activeHint?: string;
}

const VERDICT_TONE: Record<GuessVerdict, { dot: string; text: string; label: string }> = {
  correct: { dot: "bg-tone-correct", text: "text-tone-correct", label: "Correct" },
  close: { dot: "bg-tone-close", text: "text-tone-close", label: "Right artist" },
  wrong: { dot: "bg-tone-wrong", text: "text-tone-wrong", label: "Wrong" },
  skip: { dot: "bg-hairline-strong", text: "text-mute", label: "Skipped" },
};

/**
 * One colour per rung, drawn from the brand mesh so the strip reads as a
 * clip timeline rather than a Wordle row. Order matches the six-attempt ladder.
 */
const STEP_COLORS = [
  "var(--cluetune-develop-end)",
  "var(--cluetune-blue)",
  "var(--cluetune-violet)",
  "var(--cluetune-pink)",
  "var(--cluetune-coral)",
  "var(--cluetune-amber)",
] as const;

/**
 * The attempt ladder: a clip loading bar on top, then the guess list.
 *
 * Tile width is proportional to how much audio that rung unlocks. Fill follows
 * the playhead, so Skip (+2s) visibly lengthens the coloured track.
 */
export function GuessRows({
  guesses,
  ladder,
  activeIndex,
  positionMs = 0,
  unlockedMs,
  showBar = true,
  activeHint,
}: GuessRowsProps) {
  const total = ladder[ladder.length - 1] ?? 1;
  const unlocked = unlockedMs ?? (activeIndex < 0 ? total : (ladder[Math.max(0, activeIndex)] ?? 0));

  return (
    <div className="flex flex-col gap-3">
      {showBar ? (
        <ClipLadderBar
          ladder={ladder}
          total={total}
          unlockedMs={unlocked}
          positionMs={positionMs}
          attempt={Math.min(guesses.length + 1, MAX_ATTEMPTS)}
        />
      ) : null}

      <ol className="flex flex-col gap-1.5">
        {Array.from({ length: MAX_ATTEMPTS }, (_, index) => {
          const guess = guesses[index];
          const isActive = index === activeIndex;

          if (!guess) {
            return (
              <li
                key={index}
                className={[
                  "flex min-h-9 items-center gap-3 rounded-md px-3 text-body-sm sm:h-10",
                  isActive
                    ? "bg-canvas-soft-2 text-mute shadow-level-1"
                    : "border border-dashed border-hairline text-mute/60",
                ].join(" ")}
              >
                <span className="tabular w-6 shrink-0 font-mono text-caption text-mute">
                  {index + 1}
                </span>
                <span className="truncate">
                  {isActive
                    ? activeHint ?? `Listening to ${(ladder[index]! / 1000).toFixed(0)}s…`
                    : "—"}
                </span>
              </li>
            );
          }

          const tone = VERDICT_TONE[guess.verdict];

          return (
            <li
              key={index}
              className="flex min-h-9 animate-tile-in items-center gap-3 rounded-md bg-canvas-soft-2 px-3 shadow-level-1 sm:h-10"
            >
              <span className="tabular w-6 shrink-0 font-mono text-caption text-mute">{index + 1}</span>
              <span aria-hidden="true" className={`size-2 shrink-0 rounded-full ${tone.dot}`} />
              <span className="min-w-0 flex-1 truncate text-body-sm text-ink">
                {guess.verdict === "skip" ? <span className="text-mute">Skipped</span> : guess.label}
              </span>
              <span className={`shrink-0 text-caption ${tone.text}`}>{tone.label}</span>
            </li>
          );
        })}
      </ol>
    </div>
  );
}

export function ClipLadderBar({
  ladder,
  total,
  unlockedMs,
  positionMs,
  attempt,
}: {
  ladder: readonly number[];
  total: number;
  unlockedMs: number;
  positionMs: number;
  attempt: number;
}) {
  return (
    <ol
      className="flex h-3 w-full gap-1 overflow-hidden"
      aria-label={`Attempt ${attempt} of ${MAX_ATTEMPTS}. Clip ${Math.min(positionMs, unlockedMs) / 1000} of ${unlockedMs / 1000} seconds.`}
    >
      {ladder.map((cumulative, index) => {
        const previous = index === 0 ? 0 : ladder[index - 1]!;
        const span = cumulative - previous;
        const available = unlockedMs > previous;
        const played = Math.min(span, Math.max(0, positionMs - previous));
        const playedPct = span > 0 ? (played / span) * 100 : 0;
        const color = STEP_COLORS[index] ?? STEP_COLORS[0];

        return (
          <li
            key={cumulative}
            style={{ flexGrow: span / total }}
            className="relative h-full overflow-hidden rounded-full bg-hairline"
          >
            {available ? (
              <span
                aria-hidden="true"
                className="absolute inset-0 rounded-full opacity-30"
                style={{ backgroundColor: color }}
              />
            ) : null}
            {playedPct > 0 ? (
              <span
                aria-hidden="true"
                className="absolute inset-y-0 left-0 rounded-full"
                style={{ width: `${playedPct}%`, backgroundColor: color }}
              />
            ) : null}
          </li>
        );
      })}
    </ol>
  );
}
