import { useEffect, useMemo, useState } from "react";
import { safeNickname, validateNickname } from "../../lib/duel/nickname";
import { NAME_MAX } from "../../lib/duel/protocol";
import { loadState } from "../../lib/storage";
import { JoinByCode, QueueScreen } from "./DuelLobbyScreens";
import { useDuelQueue } from "./useDuelQueue";

const NAME_KEY = "cluetune:duel-name";

export default function DuelLobby() {
  const playerId = useMemo(() => loadState().playerId, []);
  const [name, setName] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [messageIndex, setMessageIndex] = useState(0);

  useEffect(() => {
    try {
      setName(localStorage.getItem(NAME_KEY) ?? "");
    } catch {
      /* private mode */
    }
  }, []);

  const queue = useDuelQueue({ playerId, name: safeNickname(name) });

  useEffect(() => {
    if (queue.status === "matched" && queue.roomId) {
      window.location.assign(`/duel/m/${queue.roomId}`);
    }
  }, [queue.status, queue.roomId]);

  useEffect(() => {
    if (queue.status !== "waiting") return;
    const id = window.setInterval(() => setMessageIndex((i) => i + 1), 4500);
    return () => window.clearInterval(id);
  }, [queue.status]);

  const persistName = () => {
    const result = validateNickname(name);
    const clean = result.ok ? result.name : safeNickname(name);
    try {
      localStorage.setItem(NAME_KEY, clean);
    } catch {
      /* private mode */
    }
    return clean;
  };

  const createRoom = async () => {
    setBusy(true);
    setError(null);
    persistName();
    try {
      const response = await fetch("/api/duel/rooms", { method: "POST" });
      if (!response.ok) throw new Error("Could not create a room. Try again.");
      const body = (await response.json()) as { code?: string };
      if (!body.code) throw new Error("Could not create a room. Try again.");
      window.location.assign(`/duel/r/${body.code}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not create a room.");
      setBusy(false);
    }
  };

  const joinCode = async (code: string) => {
    setBusy(true);
    setError(null);
    persistName();
    try {
      const response = await fetch(`/api/duel/rooms/${code}`);
      if (!response.ok) throw new Error("No room with that code.");
      window.location.assign(`/duel/r/${code}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not join.");
      setBusy(false);
    }
  };

  if (queue.status === "waiting" || queue.status === "connecting" || queue.status === "matched") {
    return (
      <QueueScreen
        messageIndex={messageIndex}
        joinedAt={queue.joinedAt}
        onInvite={() => {
          queue.cancel();
          void createRoom();
        }}
        onCancel={queue.cancel}
        onPlaySolo={() => window.open("/unlimited", "_blank", "noopener")}
      />
    );
  }

  return (
    <div className="mx-auto flex w-full max-w-md flex-col gap-5 sm:gap-6">
      <label className="flex flex-col gap-2">
        <span className="eyebrow">Your nickname</span>
        <input
          className="field field-lg"
          value={name}
          maxLength={NAME_MAX}
          placeholder="Player"
          enterKeyHint="done"
          autoComplete="nickname"
          onChange={(event) => setName(event.target.value)}
          onBlur={() => persistName()}
        />
      </label>

      <div className="flex flex-col gap-2.5">
        <button
          type="button"
          className="btn btn-primary btn-lg min-h-12 w-full"
          disabled={busy}
          onClick={() => void createRoom()}
        >
          Create private room
        </button>
        <button
          type="button"
          className="btn btn-secondary btn-lg min-h-12 w-full"
          disabled={busy}
          onClick={() => {
            persistName();
            queue.join();
          }}
        >
          Quick match
        </button>
      </div>

      <div className="relative py-1 text-center">
        <span className="absolute inset-x-0 top-1/2 h-px bg-hairline" aria-hidden="true" />
        <span className="relative bg-canvas px-3 text-caption text-mute">or join a code</span>
      </div>

      <JoinByCode onJoin={(code) => void joinCode(code)} busy={busy} />

      {error || queue.error ? (
        <p className="rounded-md bg-tone-wrong/10 px-3 py-2 text-center text-body-sm text-tone-wrong" role="alert">
          {error ?? queue.error}
        </p>
      ) : null}
    </div>
  );
}
