import type { DuelSnapshot, PlayerView } from "../../lib/duel/protocol";

export function DuelScoreboard({ snapshot }: { snapshot: DuelSnapshot }) {
  const you = snapshot.players[snapshot.you];
  const them = snapshot.players[snapshot.you === 0 ? 1 : 0];
  const roundLabel = snapshot.suddenDeath
    ? "Sudden death"
    : `R${Math.min(snapshot.round + 1, snapshot.totalRounds)}/${snapshot.totalRounds}`;

  return (
    <div className="rounded-lg border border-hairline bg-canvas-soft/80 px-3 py-2.5 backdrop-blur-sm sm:px-4 sm:py-3">
      <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-2 sm:gap-4">
        <PlayerChip player={you} side="you" acted={you?.actedThisStep} />
        <div className="flex flex-col items-center gap-0.5 px-1">
          <p className="tabular text-display-sm leading-none text-ink sm:text-display-md">
            {you?.score ?? 0}
            <span className="mx-1 text-mute">–</span>
            {them?.score ?? 0}
          </p>
          <p className="font-mono text-[11px] text-mute sm:text-caption">{roundLabel}</p>
        </div>
        <PlayerChip player={them} side="them" acted={them?.actedThisStep} />
      </div>
    </div>
  );
}

function PlayerChip({
  player,
  side,
  acted,
}: {
  player: PlayerView | null;
  side: "you" | "them";
  acted?: boolean;
}) {
  const align = side === "you" ? "items-start text-left" : "items-end text-right";
  return (
    <div className={`flex min-w-0 flex-col gap-0.5 ${align}`}>
      <p className="font-mono text-[11px] text-mute sm:text-caption">
        {side === "you" ? "You" : "Rival"}
        {acted ? " · locked" : ""}
      </p>
      <p className="truncate text-body-sm font-medium text-ink">{player?.name ?? "—"}</p>
      {player && !player.connected ? (
        <p className="text-[10px] text-tone-wrong sm:text-caption">Reconnecting…</p>
      ) : null}
    </div>
  );
}
