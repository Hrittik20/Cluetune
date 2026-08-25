import { useEffect, useMemo, useState } from "react";
import { MAX_ATTEMPTS, accuracy, averageAttempts, averageSeconds, type SessionStats } from "../../lib/game";
import { modeLabel } from "../../lib/share";
import { dailyDistribution, emptyState, loadState, saveState, type PersistedState } from "../../lib/storage";
import type { GameMode } from "../../lib/types";

const MODES: GameMode[] = ["unlimited", "daily", "sped-up", "lyric-flip", "gauntlet"];

/**
 * Stats live entirely in this browser. There is no account to create and no
 * sync to wait on, which means the page has to be honest about the trade —
 * hence the export/reset controls rather than a silent black box.
 */
export default function StatsBoard() {
  const [state, setState] = useState<PersistedState | null>(null);

  useEffect(() => {
    setState(loadState());
  }, []);

  const distribution = useMemo(() => (state ? dailyDistribution(state) : []), [state]);
  const dailyPlays = state ? Object.keys(state.daily.history).length : 0;
  const dailyWins = state
    ? Object.values(state.daily.history).filter((record) => record.won).length
    : 0;

  if (!state) {
    return (
      <div className="card-soft h-64 animate-pulse rounded-lg" role="status" aria-label="Loading your stats" />
    );
  }

  const maxBucket = Math.max(1, ...distribution);

  return (
    <div className="flex flex-col gap-10">
      <section aria-labelledby="daily-stats" className="flex flex-col gap-5">
        <h2 id="daily-stats" className="text-display-md text-ink">
          Daily
        </h2>

        <dl className="grid grid-cols-2 gap-px overflow-hidden rounded-lg bg-hairline shadow-level-1 sm:grid-cols-4">
          <Metric label="Current streak" value={String(state.daily.streak)} />
          <Metric label="Best streak" value={String(state.daily.bestStreak)} />
          <Metric label="Played" value={String(dailyPlays)} />
          <Metric
            label="Win rate"
            value={dailyPlays ? `${Math.round((dailyWins / dailyPlays) * 100)}%` : "—"}
          />
        </dl>

        <div className="card-soft flex flex-col gap-3 p-5">
          <p className="eyebrow">Guess distribution</p>

          {dailyPlays === 0 ? (
            <p className="text-body-sm text-mute">
              No dailies logged yet. Your first one starts the streak.
            </p>
          ) : (
            <ol className="flex flex-col gap-2">
              {distribution.map((count, index) => (
                <li key={index} className="flex items-center gap-3">
                  <span className="tabular w-4 shrink-0 font-mono text-caption text-mute">
                    {index + 1}
                  </span>
                  <div className="h-6 flex-1 overflow-hidden rounded-sm bg-canvas-soft-2">
                    <div
                      className="flex h-full items-center justify-end rounded-sm bg-tone-correct px-2"
                      style={{ width: `${Math.max(count ? 8 : 0, (count / maxBucket) * 100)}%` }}
                    >
                      {count > 0 ? (
                        <span className="tabular text-caption font-medium text-[#08080a]">{count}</span>
                      ) : null}
                    </div>
                  </div>
                </li>
              ))}
            </ol>
          )}
        </div>
      </section>

      <section aria-labelledby="mode-stats" className="flex flex-col gap-5">
        <h2 id="mode-stats" className="text-display-md text-ink">
          By mode
        </h2>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[38rem] border-collapse text-left">
            <thead>
              <tr className="hairline-b">
                {["Mode", "Rounds", "Accuracy", "Avg. guesses", "Avg. speed", "Best streak"].map((heading) => (
                  <th
                    key={heading}
                    scope="col"
                    className="px-3 py-2.5 font-mono text-caption font-normal uppercase tracking-[0.16em] text-mute"
                  >
                    {heading}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {MODES.map((mode) => {
                const session = state.sessions[mode];
                return <ModeRow key={mode} mode={mode} session={session} />;
              })}
            </tbody>
          </table>
        </div>
      </section>

      <section aria-labelledby="data-controls" className="card-soft flex flex-col gap-4 p-5">
        <h2 id="data-controls" className="text-display-sm text-ink">
          Your data
        </h2>
        <p className="max-w-prose text-body-sm text-body">
          Everything above is stored in this browser only. Clearing site data or switching devices
          loses it — export a copy if that matters to you.
        </p>

        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            className="btn btn-secondary btn-md"
            onClick={() => {
              const blob = new Blob([JSON.stringify(state, null, 2)], { type: "application/json" });
              const url = URL.createObjectURL(blob);
              const link = document.createElement("a");
              link.href = url;
              link.download = "cluetune-stats.json";
              link.click();
              URL.revokeObjectURL(url);
            }}
          >
            Export JSON
          </button>

          <button
            type="button"
            className="btn btn-ghost btn-md text-tone-wrong"
            onClick={() => {
              // Destructive and unrecoverable, so it gets an explicit gate.
              if (!confirm("Reset every streak and stat on this device? This cannot be undone.")) return;
              const fresh = emptyState();
              saveState(fresh);
              setState(fresh);
            }}
          >
            Reset All Stats
          </button>
        </div>
      </section>
    </div>
  );
}

function ModeRow({ mode, session }: { mode: GameMode; session?: SessionStats }) {
  const attempts = session ? averageAttempts(session) : null;
  const seconds = session ? averageSeconds(session) : null;

  return (
    <tr className="hairline-b">
      <th scope="row" className="px-3 py-3 text-body-sm font-medium text-ink">
        {modeLabel(mode)}
      </th>
      <td className="tabular px-3 py-3 text-body-sm text-body">{session?.rounds ?? 0}</td>
      <td className="tabular px-3 py-3 text-body-sm text-body">
        {session?.rounds ? `${Math.round(accuracy(session) * 100)}%` : "—"}
      </td>
      <td className="tabular px-3 py-3 text-body-sm text-body">
        {attempts ? `${attempts.toFixed(1)} / ${MAX_ATTEMPTS}` : "—"}
      </td>
      <td className="tabular px-3 py-3 text-body-sm text-body">
        {seconds ? `${seconds.toFixed(0)}s` : "—"}
      </td>
      <td className="tabular px-3 py-3 text-body-sm text-body">{session?.bestStreak ?? 0}</td>
    </tr>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-1 bg-canvas-soft px-4 py-4">
      <dt className="eyebrow">{label}</dt>
      <dd className="tabular text-display-md text-ink">{value}</dd>
    </div>
  );
}
