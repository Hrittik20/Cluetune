import { useMemo } from "react";
import { applyInitials, buildClue } from "../../lib/lyricflip";
import type { Track } from "../../lib/types";

export interface LyricClueBoardProps {
  track: Track;
  attempt: number;
  /** Licensed lyric line, when a lyrics provider is configured. */
  sourceLine?: string;
}

/**
 * The Lyric-Flip clue surface. Hidden characters are rendered as blocks rather
 * than blurred text so the phrase shape stays readable to screen readers and
 * to anyone who can't resolve a CSS blur.
 */
export function LyricClueBoard({ track, attempt, sourceLine }: LyricClueBoardProps) {
  const clue = useMemo(
    () => applyInitials(buildClue(track, attempt, sourceLine), attempt),
    [track, attempt, sourceLine],
  );

  const spoken = clue.tokens
    .map((token) => token.chars.map((entry) => (entry.revealed ? entry.char : "blank")).join(""))
    .join(" ");

  return (
    <div className="card-soft flex flex-col gap-4 p-6">
      <div className="flex items-baseline justify-between gap-4">
        <p className="eyebrow">Lyric flip</p>
        <p className="text-caption text-mute">{clue.hint}</p>
      </div>

      <p className="sr-only">Clue: {spoken}</p>

      <div aria-hidden="true" className="flex flex-wrap items-center gap-x-4 gap-y-3">
        {clue.tokens.map((token, wordIndex) => (
          <span key={wordIndex} className="flex gap-1">
            {token.chars.map((entry, charIndex) =>
              entry.revealed ? (
                <span
                  key={charIndex}
                  className="text-display-md font-mono text-ink"
                  style={{ minWidth: "0.7ch" }}
                >
                  {entry.char}
                </span>
              ) : (
                <span
                  key={charIndex}
                  className="inline-block rounded-xs bg-hairline-strong/60 align-middle"
                  style={{ width: "0.7em", height: "1.1em" }}
                />
              ),
            )}
          </span>
        ))}
      </div>

      {clue.scrambled ? (
        <p className="text-caption text-mute">
          Words are out of order until your first guess.
        </p>
      ) : null}
    </div>
  );
}
