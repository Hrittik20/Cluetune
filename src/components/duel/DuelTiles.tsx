import { DUEL_STEPS, type ActionVerdict, type OwnTileView, type TileView } from "../../lib/duel/protocol";

const FILL: Record<ActionVerdict, string> = {
  correct: "bg-tone-correct",
  close: "bg-tone-close",
  wrong: "bg-tone-wrong",
  skip: "bg-hairline-strong",
  timeout: "bg-hairline-strong",
};

/** Compact strip of both players' step results — fits under the vinyl on phones. */
export function DualTileStrip({
  yours,
  theirs,
  step,
}: {
  yours: TileView[];
  theirs: TileView[];
  step: number;
}) {
  return (
    <div className="grid grid-cols-2 gap-3" aria-label="Guess results">
      <StepRow label="You" tiles={yours} step={step} align="start" />
      <StepRow label="Rival" tiles={theirs} step={step} align="end" />
    </div>
  );
}

function StepRow({
  label,
  tiles,
  step,
  align,
}: {
  label: string;
  tiles: TileView[];
  step: number;
  align: "start" | "end";
}) {
  const byStep = new Map(tiles.map((tile) => [tile.step, tile]));
  return (
    <div className={`flex flex-col gap-1 ${align === "end" ? "items-end" : "items-start"}`}>
      <p className="font-mono text-[11px] text-mute">{label}</p>
      <div className="flex gap-1">
        {Array.from({ length: DUEL_STEPS }, (_, i) => {
          const n = i + 1;
          const tile = byStep.get(n);
          const current = !tile && n === step;
          return (
            <span
              key={n}
              className={`size-2.5 rounded-sm sm:size-3 ${
                tile ? FILL[tile.verdict] : current ? "bg-ink/40 ring-1 ring-ink/30" : "bg-hairline"
              }`}
              title={tile ? `Step ${n}: ${tile.verdict}` : `Step ${n}`}
            />
          );
        })}
      </div>
    </div>
  );
}

export function OpponentTiles({ tiles }: { tiles: TileView[] }) {
  return (
    <div className="flex flex-wrap justify-end gap-1.5" aria-label="Opponent guesses">
      {tiles.map((tile, index) => (
        <span
          key={`${tile.step}-${index}`}
          className={`size-3 rounded-sm ${FILL[tile.verdict]}`}
          title={`Step ${tile.step}: ${tile.verdict}`}
        />
      ))}
    </div>
  );
}

export function OwnTiles({ tiles }: { tiles: OwnTileView[] }) {
  if (!tiles.length) return null;
  return (
    <ul className="flex max-h-24 flex-col gap-1 overflow-y-auto sm:max-h-none" aria-label="Your guesses">
      {tiles.map((tile, index) => (
        <li key={`${tile.step}-${index}`} className="flex items-center gap-2 text-body-sm">
          <span className={`size-2.5 shrink-0 rounded-sm ${FILL[tile.verdict]}`} />
          <span className="shrink-0 text-mute">#{tile.step}</span>
          <span className="truncate text-ink">{tile.label || tile.verdict}</span>
        </li>
      ))}
    </ul>
  );
}
