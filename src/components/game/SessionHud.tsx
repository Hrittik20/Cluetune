import { accuracy, averageAttempts, averageSeconds, type SessionStats } from "../../lib/game";
import type { DrunkLevel } from "../../lib/audioFx";

export interface SessionHudProps {
  session: SessionStats;
  /** Drunk mode buzz meter — replaces avg. speed when present. */
  buzz?: { level: DrunkLevel; label: string };
}

/**
 * Live session readout for continuous modes.
 *
 * Unlimited has no single win/loss moment to pay off, so the loop needs a
 * different reward: numbers that move every round. Streak sits first because
 * it is the one players actually chase. Drunk swaps avg. speed for the buzz
 * meter — the distortion pressure that defines the mode.
 */
export function SessionHud({ session, buzz }: SessionHudProps) {
  const attempts = averageAttempts(session);
  const seconds = averageSeconds(session);

  return (
    <dl className="grid grid-cols-2 gap-px overflow-hidden rounded-lg bg-hairline shadow-level-1 sm:grid-cols-4">
      <Metric label="Streak" value={String(session.currentStreak)} sub={`Best ${session.bestStreak}`} />
      <Metric
        label="Accuracy"
        value={session.rounds ? `${Math.round(accuracy(session) * 100)}%` : "—"}
        sub={`${session.wins}/${session.rounds} solved`}
      />
      <Metric
        label="Avg. guesses"
        value={attempts ? attempts.toFixed(1) : "—"}
        sub="On wins"
      />
      {buzz ? (
        <BuzzMetric level={buzz.level} label={buzz.label} />
      ) : (
        <Metric
          label="Avg. speed"
          value={seconds ? `${seconds.toFixed(0)}s` : "—"}
          sub="To answer"
        />
      )}
    </dl>
  );
}

function Metric({ label, value, sub }: { label: string; value: string; sub: string }) {
  return (
    <div className="flex flex-col gap-0.5 bg-canvas-soft px-4 py-3">
      <dt className="eyebrow">{label}</dt>
      <dd className="tabular text-display-sm text-ink">{value}</dd>
      <p className="text-caption text-mute">{sub}</p>
    </div>
  );
}

function BuzzMetric({ level, label }: { level: DrunkLevel; label: string }) {
  return (
    <div className="flex flex-col gap-0.5 bg-canvas-soft px-4 py-3">
      <dt className="eyebrow">
        <span className="label-drunk">Drunk</span>
      </dt>
      <dd className="tabular text-display-sm text-ink">{label}</dd>
      <div className="mt-0.5 flex gap-1" aria-hidden="true">
        {Array.from({ length: 6 }, (_, i) => (
          <span
            key={i}
            className={`h-1.5 w-1.5 rounded-sm ${i <= level ? "bg-ink" : "bg-hairline"}`}
          />
        ))}
      </div>
      <p className="sr-only">
        Drunk level {level} of 5, {label}
      </p>
    </div>
  );
}
