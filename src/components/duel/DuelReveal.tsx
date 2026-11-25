import type { RoundSummary, Seat } from "../../lib/duel/protocol";

export function DuelReveal({
  summary,
  you,
  names,
}: {
  summary: RoundSummary;
  you: Seat;
  names: [string, string];
}) {
  const track = summary.track;
  const yourPoints = summary.points[you];
  const theirPoints = summary.points[you === 0 ? 1 : 0];

  return (
    <div className="flex flex-col items-center gap-4 text-center sm:gap-5">
      {track?.artworkUrl ? (
        <img
          src={track.artworkUrl}
          alt=""
          width={160}
          height={160}
          className="size-28 rounded-md object-cover shadow-level-2 sm:size-40"
        />
      ) : null}
      <div className="flex max-w-full flex-col gap-1 px-1">
        <p className="text-balance text-display-sm text-ink sm:text-display-md">{track?.title ?? "—"}</p>
        <p className="text-body-md text-body">{track?.artist ?? ""}</p>
        {track ? (
          <p className="text-caption text-mute">
            {track.album} · {track.year}
          </p>
        ) : null}
      </div>
      <div className="grid w-full grid-cols-2 gap-2 sm:max-w-sm sm:gap-3">
        <ScoreChip
          name={names[you] || "You"}
          points={yourPoints}
          step={summary.correctStep[you]}
          first={summary.firstSeat === you}
        />
        <ScoreChip
          name={names[you === 0 ? 1 : 0] || "Rival"}
          points={theirPoints}
          step={summary.correctStep[you === 0 ? 1 : 0]}
          first={summary.firstSeat !== null && summary.firstSeat !== you}
        />
      </div>
      {summary.suddenDeath ? <p className="text-caption text-mute">Sudden death</p> : null}
    </div>
  );
}

function ScoreChip({
  name,
  points,
  step,
  first,
}: {
  name: string;
  points: number;
  step: number | null;
  first: boolean;
}) {
  return (
    <div className="card flex flex-col gap-1 p-3 text-left sm:p-3.5">
      <p className="truncate text-caption text-mute">{name}</p>
      <p className="tabular text-display-sm text-ink">+{points}</p>
      <p className="text-caption text-mute">
        {step != null ? `Step ${step}` : "Missed"}
        {first ? " · first" : ""}
      </p>
    </div>
  );
}
