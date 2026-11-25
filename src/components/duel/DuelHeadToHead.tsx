import type { HeadToHead } from "../../lib/duel/protocol";

export function DuelHeadToHead({ record }: { record: HeadToHead | null }) {
  if (!record) return null;
  const total = record.youWins + record.theirWins + record.draws;
  if (!total) return null;

  return (
    <p className="text-center text-body-sm text-mute">
      Head to head: you {record.youWins}–{record.theirWins}
      {record.draws ? ` · ${record.draws} draw${record.draws === 1 ? "" : "s"}` : ""}
    </p>
  );
}
