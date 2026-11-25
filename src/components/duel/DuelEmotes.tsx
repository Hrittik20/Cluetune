import { EMOTES, type Emote } from "../../lib/duel/protocol";
import type { DuelEmoteEvent } from "./useDuelSocket";

export function EmoteBar({ onEmote, disabled }: { onEmote: (emote: Emote) => void; disabled?: boolean }) {
  return (
    <div className="flex justify-between gap-1 sm:justify-center sm:gap-2" role="group" aria-label="React">
      {EMOTES.map((emote) => (
        <button
          key={emote}
          type="button"
          disabled={disabled}
          onClick={() => onEmote(emote)}
          className="flex size-11 flex-1 items-center justify-center rounded-md text-xl transition-colors hover:bg-canvas-soft-2 active:scale-95 disabled:opacity-40 sm:size-10 sm:flex-none sm:min-w-11"
          aria-label={`Send ${emote}`}
        >
          {emote}
        </button>
      ))}
    </div>
  );
}

export function EmoteToasts({ emotes, you }: { emotes: DuelEmoteEvent[]; you: 0 | 1 }) {
  if (!emotes.length) return null;
  return (
    <div
      className="pointer-events-none absolute inset-x-3 top-14 z-20 flex flex-col gap-1 sm:inset-x-0 sm:top-2"
      aria-live="polite"
    >
      {emotes.map((event) => (
        <span
          key={event.id}
          className={`w-fit rounded-full bg-canvas-soft-2 px-3 py-1.5 text-lg shadow-level-1 ${
            event.seat === you ? "self-start" : "self-end"
          }`}
        >
          {event.emote}
        </span>
      ))}
    </div>
  );
}
