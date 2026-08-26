import type { LyricSnippet } from "../../lib/types";

export interface LyricsBoardProps {
  lyrics: LyricSnippet;
  attempt: number;
}

/**
 * Lyrics Guess surface: a few lines now, more after each miss or skip.
 * Locked lines stay as bars so the remaining length of the snippet is visible
 * without leaking the words.
 */
export function LyricsBoard({ lyrics, attempt }: LyricsBoardProps) {
  const per = lyrics.linesPerReveal;
  const shownCount = Math.min(lyrics.lines.length, (attempt + 1) * per);
  const shown = lyrics.lines.slice(0, shownCount);
  const locked = lyrics.lines.length - shownCount;
  const nextBatch = Math.min(per, locked);

  return (
    <div className="card-soft flex flex-col gap-4 p-4 sm:p-6">
      <div className="flex items-baseline justify-between gap-3">
        <p className="eyebrow">Lyrics guess</p>
        <p className="tabular text-caption text-mute">
          {shownCount} / {lyrics.lines.length} lines
        </p>
      </div>

      <div className="flex flex-col gap-3" aria-live="polite">
        {shown.map((line, index) => (
          <p key={`${index}-${line.slice(0, 12)}`} className="text-pretty text-body-lg text-ink sm:text-display-sm">
            {line}
          </p>
        ))}

        {locked > 0 ? (
          <div className="flex flex-col gap-2" aria-hidden="true">
            {Array.from({ length: Math.min(locked, 4) }, (_, index) => (
              <span key={index} className="h-5 max-w-full rounded-md bg-hairline-strong/25 sm:h-6" />
            ))}
          </div>
        ) : null}
      </div>

      <p className="text-caption text-mute">
        {nextBatch > 0
          ? `Skip or miss to reveal the next ${nextBatch === 1 ? "line" : `${nextBatch} lines`}.`
          : "All lines are on the table."}
      </p>
    </div>
  );
}
