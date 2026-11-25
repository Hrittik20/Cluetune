import type { DuelSnapshot } from "../../lib/duel/protocol";
import { DuelHeadToHead } from "./DuelHeadToHead";

export function DuelResult({
  snapshot,
  onRematch,
  onShare,
  sharing,
}: {
  snapshot: DuelSnapshot;
  onRematch: () => void;
  onShare?: () => void;
  sharing?: boolean;
}) {
  const result = snapshot.result;
  if (!result) return null;

  const youWon = result.winner === snapshot.you;
  const draw = result.winner === null;
  const youVoted = snapshot.rematchVotes[snapshot.you];
  const theyVoted = snapshot.rematchVotes[snapshot.you === 0 ? 1 : 0];

  const headline =
    result.reason === "cancelled"
      ? "Match cancelled"
      : result.reason === "forfeit"
        ? youWon
          ? "Rival left — you win"
          : "You left"
        : draw
          ? "Draw"
          : youWon
            ? "You win"
            : "You lose";

  return (
    <div className="mx-auto flex w-full max-w-md flex-col items-center gap-5 text-center sm:gap-6">
      <div className="flex flex-col gap-2">
        <p className="eyebrow">Match over</p>
        <h2 className="text-display-md text-ink sm:text-display-lg">{headline}</h2>
        <p className="tabular text-display-sm text-body">
          {result.scores[snapshot.you]} – {result.scores[snapshot.you === 0 ? 1 : 0]}
        </p>
      </div>

      <DuelHeadToHead record={snapshot.headToHead} />

      <div className="flex w-full flex-col gap-2 sm:flex-row sm:flex-wrap sm:justify-center">
        <button type="button" className="btn btn-primary btn-lg w-full sm:w-auto" onClick={onRematch} disabled={youVoted}>
          {youVoted ? "Waiting for rival…" : "Rematch"}
        </button>
        {onShare ? (
          <button type="button" className="btn btn-secondary btn-lg w-full sm:w-auto" onClick={onShare} disabled={sharing}>
            {sharing ? "Sharing…" : "Share"}
          </button>
        ) : null}
        <a href="/duel" className="btn btn-ghost btn-lg w-full sm:w-auto">
          Lobby
        </a>
      </div>

      {youVoted && !theyVoted ? <p className="text-caption text-mute">Rematch vote sent</p> : null}
      {theyVoted && !youVoted ? <p className="text-caption text-mute">Rival wants a rematch</p> : null}
    </div>
  );
}
