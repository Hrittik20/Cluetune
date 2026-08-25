import { MAX_ATTEMPTS } from "../../lib/game";
import type { Guess, GuessVerdict } from "../../lib/types";

export interface GuessRowsProps {
  guesses: Guess[];
  ladder: readonly number[];
  /** Index of the row currently in play, or -1 when the round is over. */
  activeIndex: number;
}

const VERDICT_TONE: Record<GuessVerdict, { dot: string; text: string; label: string }> = {
  correct: { dot: "bg-tone-correct", text: "text-tone-correct", label: "Correct" },
  close: { dot: "bg-tone-close", text: "text-tone-close", label: "Right artist" },
  wrong: { dot: "bg-tone-wrong", text: "text-tone-wrong", label: "Wrong" },
  skip: { dot: "bg-hairline-strong", text: "text-mute", label: "Skipped" },
};

/**
 * The attempt ladder.
 *
 * Rather than Wordle's uniform grid, tile width is proportional to how much
 * audio that rung unlocks — so the strip doubles as a picture of the clip
 * getting longer, which is the thing an audio game actually needs to convey.
 */
export function GuessRows({ guesses, ladder, activeIndex }: GuessRowsProps) {
  const total = ladder[ladder.length - 1] ?? 1;

  return (
    <div className="flex flex-col gap-3">
      <ol
        className="flex h-2.5 w-full gap-1 overflow-hidden"
        aria-label={`Attempt ${Math.min(guesses.length + 1, MAX_ATTEMPTS)} of ${MAX_ATTEMPTS}`}
      >
        {ladder.map((cumulative, index) => {
          const previous = index === 0 ? 0 : ladder[index - 1]!;
          const guess = guesses[index];
          const tone = guess ? VERDICT_TONE[guess.verdict].dot : "";

          return (
            <li
              key={cumulative}
              // Widths mirror the increment each rung buys, not the total.
              style={{ flexGrow: (cumulative - previous) / total }}
              className={[
                "h-full rounded-full transition-colors duration-300",
                guess ? tone : index === activeIndex ? "bg-ink/35" : "bg-hairline",
              ].join(" ")}
            />
          );
        })}
      </ol>

      <ol className="flex flex-col gap-1.5">
        {Array.from({ length: MAX_ATTEMPTS }, (_, index) => {
          const guess = guesses[index];
          const isActive = index === activeIndex;

          if (!guess) {
            return (
              <li
                key={index}
                className={[
                  "flex h-11 items-center gap-3 rounded-md px-3 text-body-sm",
                  isActive
                    ? "bg-canvas-soft-2 text-mute shadow-level-1"
                    : "border border-dashed border-hairline text-mute/60",
                ].join(" ")}
              >
                <span className="tabular w-6 shrink-0 font-mono text-caption text-mute">
                  {index + 1}
                </span>
                <span className="truncate">
                  {isActive ? `Listening to ${(ladder[index]! / 1000).toFixed(0)}s…` : "—"}
                </span>
              </li>
            );
          }

          const tone = VERDICT_TONE[guess.verdict];

          return (
            <li
              key={index}
              className="flex h-11 animate-tile-in items-center gap-3 rounded-md bg-canvas-soft-2 px-3 shadow-level-1"
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
