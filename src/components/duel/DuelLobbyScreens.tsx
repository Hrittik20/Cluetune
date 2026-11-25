import { useEffect, useState } from "react";
import { ROOM_CODE_LENGTH } from "../../lib/duel/protocol";
import { WAITING_MESSAGES } from "../../lib/duel/waitingMessages";

export function PrivateLobby({
  code,
  roomUrl,
  onCopy,
  copied,
}: {
  code: string | null;
  roomUrl: string;
  onCopy: () => void;
  copied: boolean;
}) {
  const canShare = typeof navigator !== "undefined" && "share" in navigator;

  return (
    <div className="mx-auto flex w-full max-w-md flex-col items-center gap-5 text-center sm:gap-6">
      <div className="flex flex-col gap-1.5 sm:gap-2">
        <p className="eyebrow">Private room</p>
        <h2 className="text-display-sm text-ink sm:text-display-md">Waiting for a friend</h2>
        <p className="text-body-sm text-body">Send the code or link. First to join sits across from you.</p>
      </div>

      {code ? (
        <div className="w-full rounded-lg border border-hairline bg-canvas-soft px-4 py-5 sm:py-6">
          <p className="mb-2 text-caption text-mute">Room code</p>
          <p
            className="select-all tabular text-[2.5rem] leading-none tracking-[0.35em] text-ink sm:text-display-xl"
            translate="no"
          >
            {code}
          </p>
        </div>
      ) : null}

      <div className="flex w-full flex-col gap-2">
        {canShare ? (
          <button
            type="button"
            className="btn btn-primary btn-lg w-full"
            onClick={() => void navigator.share({ title: "Cluetune Duel", url: roomUrl, text: "1v1 me on Cluetune." })}
          >
            Share invite
          </button>
        ) : null}
        <button type="button" className={`btn ${canShare ? "btn-secondary" : "btn-primary"} btn-lg w-full`} onClick={onCopy}>
          {copied ? "Copied" : "Copy invite link"}
        </button>
      </div>

      <p className="max-w-full break-all px-1 text-caption text-mute">{roomUrl}</p>
    </div>
  );
}

export function QueueScreen({
  messageIndex,
  joinedAt,
  onInvite,
  onCancel,
  onPlaySolo,
}: {
  messageIndex: number;
  joinedAt: number | null;
  onInvite: () => void;
  onCancel: () => void;
  onPlaySolo: () => void;
}) {
  const [now, setNow] = useState(Date.now());
  useEffect(() => {
    const id = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(id);
  }, []);

  const waited = joinedAt ? Math.floor((now - joinedAt) / 1000) : 0;
  const showFriendPrompt = waited >= 60;

  return (
    <div className="mx-auto flex w-full max-w-md flex-col items-center gap-5 text-center sm:gap-6">
      <div className="flex flex-col gap-2">
        <p className="eyebrow">Quick match</p>
        <h2 className="text-display-sm text-ink sm:text-display-md">Finding a rival</h2>
        <div className="mx-auto mt-1 flex gap-1" aria-hidden="true">
          <span className="size-1.5 animate-pulse rounded-full bg-ink" />
          <span className="size-1.5 animate-pulse rounded-full bg-ink [animation-delay:150ms]" />
          <span className="size-1.5 animate-pulse rounded-full bg-ink [animation-delay:300ms]" />
        </div>
        <p className="min-h-12 max-w-md text-body-sm text-body" aria-live="polite">
          {WAITING_MESSAGES[messageIndex % WAITING_MESSAGES.length]}
        </p>
      </div>

      <div className="flex w-full flex-col gap-2">
        <button type="button" className="btn btn-primary btn-lg w-full" onClick={onInvite}>
          Invite a friend instead
        </button>
        <button type="button" className="btn btn-ghost btn-lg w-full" onClick={onCancel}>
          Cancel
        </button>
      </div>

      {showFriendPrompt ? (
        <div className="card w-full p-4 text-left text-body-sm text-body">
          <p>Still waiting? Private rooms don’t need a queue.</p>
          <button type="button" className="btn btn-secondary mt-3 w-full sm:w-auto" onClick={onInvite}>
            Create a room
          </button>
        </div>
      ) : null}

      <button type="button" className="min-h-11 text-body-sm text-link underline underline-offset-4" onClick={onPlaySolo}>
        Play Unlimited while you wait
      </button>
    </div>
  );
}

export function JoinByCode({ onJoin, busy }: { onJoin: (code: string) => void; busy?: boolean }) {
  const [code, setCode] = useState("");
  return (
    <form
      className="flex flex-col gap-2 sm:flex-row sm:gap-3"
      onSubmit={(event) => {
        event.preventDefault();
        const trimmed = code.trim().toUpperCase();
        if (trimmed.length === ROOM_CODE_LENGTH) onJoin(trimmed);
      }}
    >
      <input
        value={code}
        onChange={(event) => setCode(event.target.value.toUpperCase().replace(/[^A-Z]/g, "").slice(0, ROOM_CODE_LENGTH))}
        className="field field-lg text-center tabular tracking-[0.4em]"
        placeholder="CODE"
        aria-label="Room code"
        maxLength={ROOM_CODE_LENGTH}
        autoComplete="off"
        autoCapitalize="characters"
        spellCheck={false}
        inputMode="text"
      />
      <button
        type="submit"
        className="btn btn-secondary btn-lg w-full sm:w-auto"
        disabled={busy || code.length !== ROOM_CODE_LENGTH}
      >
        Join
      </button>
    </form>
  );
}

export function LoadingScreen({ loaded, total }: { loaded: number; total: number }) {
  const pct = total ? Math.round((loaded / total) * 100) : 0;
  return (
    <div className="mx-auto flex w-full max-w-xs flex-col items-center gap-3 py-8 text-center">
      <p className="eyebrow">Loading clips</p>
      <h2 className="text-display-sm text-ink">Cueing the set</h2>
      <div className="h-1.5 w-full overflow-hidden rounded-full bg-hairline">
        <div className="h-full bg-ink transition-[width] duration-300" style={{ width: `${pct}%` }} />
      </div>
      <p className="text-caption text-mute">
        {loaded}/{total || "…"}
      </p>
    </div>
  );
}

export function CountdownScreen({ seconds }: { seconds: number }) {
  return (
    <div className="flex flex-col items-center gap-2 py-10 text-center" aria-live="assertive">
      <p className="eyebrow">Get ready</p>
      <p className="tabular text-[4.5rem] leading-none text-ink sm:text-display-xl">{Math.max(1, seconds)}</p>
    </div>
  );
}
