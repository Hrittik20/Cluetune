import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { CLOSING_MS, STEP_LADDER_MS, STEP_MS } from "../../lib/duel/protocol";
import { safeNickname } from "../../lib/duel/nickname";
import { buildDuelShareText, duelRoomUrl, renderDuelShareCard } from "../../lib/duel/share";
import { shareOrCopy } from "../../lib/share";
import { loadState } from "../../lib/storage";
import { GuessInput } from "../game/GuessInput";
import { useAudioClip } from "../game/useAudioClip";
import { VinylPlayer } from "../game/VinylPlayer";
import { EmoteBar, EmoteToasts } from "./DuelEmotes";
import { CountdownScreen, LoadingScreen, PrivateLobby } from "./DuelLobbyScreens";
import { DuelResult } from "./DuelResult";
import { DuelReveal } from "./DuelReveal";
import { DuelScoreboard } from "./DuelScoreboard";
import { DuelTimer } from "./DuelTimer";
import { DualTileStrip, OwnTiles } from "./DuelTiles";
import { useDuelAudio } from "./useDuelAudio";
import { useDuelSocket } from "./useDuelSocket";

const NAME_KEY = "cluetune:duel-name";

export interface DuelShellProps {
  roomId: string;
  code?: string | null;
  bot?: boolean;
}

export default function DuelShell({ roomId, code = null, bot = false }: DuelShellProps) {
  const playerId = useMemo(() => loadState().playerId, []);
  const name = useMemo(() => {
    try {
      return safeNickname(localStorage.getItem(NAME_KEY) ?? "");
    } catch {
      return "Player";
    }
  }, []);

  const socket = useDuelSocket({ roomId, playerId, name, bot });
  const { snapshot, connection, clips, audioMatch, emotes, error, toLocal, serverNow } = socket;
  const audio = useDuelAudio(snapshot && audioMatch === snapshot.match ? clips : []);
  const readySent = useRef(0);

  const [copied, setCopied] = useState(false);
  const [sharing, setSharing] = useState(false);
  const [scratchKey, setScratchKey] = useState(0);
  const lastTileCount = useRef(0);

  const clipSrc =
    snapshot && audioMatch === snapshot.match ? (audio.sources[snapshot.round] ?? clips[snapshot.round] ?? null) : null;
  const clip = useAudioClip(clipSrc);
  const unlockedMs = snapshot?.unlockedMs ?? 0;
  const totalMs = STEP_LADDER_MS[STEP_LADDER_MS.length - 1]!;

  useEffect(() => {
    if (!snapshot || snapshot.phase !== "loading") return;
    if (!audio.ready || audioMatch !== snapshot.match) return;
    if (readySent.current === snapshot.match) return;
    readySent.current = snapshot.match;
    socket.ready(snapshot.match);
  }, [snapshot, audio.ready, audioMatch, socket]);

  useEffect(() => {
    if (!snapshot) return;
    if (snapshot.phase !== "step" && snapshot.phase !== "closing") return;
    if (!clip.canPlay || !snapshot.stepStartedAt) return;
    clip.play(snapshot.unlockedMs, 0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [snapshot?.phase, snapshot?.step, snapshot?.stepStartedAt, snapshot?.unlockedMs, clip.canPlay, clipSrc]);

  useEffect(() => {
    const tiles = snapshot?.yourTiles ?? [];
    if (tiles.length > lastTileCount.current) {
      const last = tiles.at(-1);
      if (last && last.verdict !== "correct") setScratchKey((n) => n + 1);
    }
    lastTileCount.current = tiles.length;
  }, [snapshot?.yourTiles]);

  const roomUrl =
    typeof window !== "undefined"
      ? code
        ? `${window.location.origin}/duel/r/${code}`
        : window.location.href
      : code
        ? duelRoomUrl(code)
        : "";

  const copyInvite = async () => {
    try {
      await navigator.clipboard.writeText(roomUrl);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  };

  const shareResult = async () => {
    if (!snapshot?.result) return;
    setSharing(true);
    try {
      const text = buildDuelShareText(snapshot, roomUrl || undefined);
      const blob = await renderDuelShareCard(snapshot);
      const files = blob ? [new File([blob], "cluetune-duel.png", { type: "image/png" })] : undefined;
      await shareOrCopy({ title: "Cluetune Duel", text, url: roomUrl || undefined, files });
    } finally {
      setSharing(false);
    }
  };

  if (connection === "connecting" && !snapshot) {
    return <StatusCard title="Connecting…" body="Opening the room." />;
  }

  if (error && (error.code === "opponent-missing" || !snapshot)) {
    return (
      <StatusCard title={error.code === "opponent-missing" ? "Rival didn’t show" : "Couldn’t join"} body={error.message}>
        <a href="/duel" className="btn btn-primary btn-lg w-full max-w-xs">
          Back to lobby
        </a>
      </StatusCard>
    );
  }

  if (!snapshot) {
    return <StatusCard title="Reconnecting…" body="Hold on — finding your seat again." />;
  }

  const them = snapshot.players[snapshot.you === 0 ? 1 : 0];
  const names: [string, string] = [
    snapshot.players[0]?.name ?? "Player 1",
    snapshot.players[1]?.name ?? "Player 2",
  ];
  const lastReveal = snapshot.history.at(-1);
  const countdownSeconds =
    snapshot.phase === "countdown" && snapshot.deadline
      ? Math.max(1, Math.ceil((toLocal(snapshot.deadline) - Date.now()) / 1000))
      : 0;

  const nextUnlock =
    snapshot.phase === "step" && snapshot.step < STEP_LADDER_MS.length
      ? Math.round((STEP_LADDER_MS[snapshot.step]! - unlockedMs) / 1000)
      : null;

  const playing = snapshot.phase === "step" || snapshot.phase === "closing";
  const timerDuration = snapshot.phase === "closing" ? CLOSING_MS : STEP_MS;

  return (
    <div className="relative mx-auto flex w-full max-w-xl flex-col gap-3 sm:gap-5">
      <EmoteToasts emotes={emotes} you={snapshot.you} />

      {snapshot.phase !== "lobby" ? (
        <div className="sticky top-14 z-10 -mx-1 sm:static sm:mx-0 sm:top-auto">
          <DuelScoreboard snapshot={snapshot} />
        </div>
      ) : null}

      {connection === "reconnecting" ? (
        <p className="rounded-md bg-tone-close/15 px-3 py-2 text-center text-caption text-tone-close">
          Connection dropped — reconnecting…
        </p>
      ) : null}
      {error ? <p className="text-center text-body-sm text-tone-wrong">{error.message}</p> : null}

      {snapshot.phase === "lobby" ? (
        <PrivateLobby code={snapshot.code ?? code} roomUrl={roomUrl} onCopy={() => void copyInvite()} copied={copied} />
      ) : null}

      {snapshot.phase === "loading" ? <LoadingScreen loaded={audio.loaded} total={audio.total || clips.length} /> : null}

      {snapshot.phase === "countdown" ? <CountdownScreen seconds={countdownSeconds} /> : null}

      {playing ? (
        <div className="flex flex-col gap-3 sm:gap-4">
          <DuelTimer
            deadline={snapshot.deadline}
            toLocal={toLocal}
            durationMs={timerDuration}
            label={snapshot.phase === "closing" ? "Last chance" : `Step ${snapshot.step} · ${Math.round(unlockedMs / 1000)}s clip`}
          />

          <div className="relative mx-auto w-full max-w-[11rem] sm:max-w-[15rem]">
            <VinylPlayer
              playing={clip.playing}
              positionMs={clip.positionMs}
              unlockedMs={unlockedMs}
              totalMs={totalMs}
              readLevels={clip.readLevels}
              scratchKey={scratchKey}
              revealArtwork={false}
            />
            <button
              type="button"
              className="btn btn-secondary btn-sm absolute -bottom-1 left-1/2 min-h-10 -translate-x-1/2 px-4"
              onClick={() => (clip.playing ? clip.pause() : clip.play(unlockedMs))}
            >
              {clip.playing ? "Pause" : "Replay"}
            </button>
          </div>

          <div className="pt-3">
            <DualTileStrip yours={snapshot.yourTiles} theirs={them?.tiles ?? []} step={snapshot.step} />
          </div>

          {/* Sticky action dock above the mobile tab bar */}
          <div className="sticky bottom-[calc(3.75rem+env(safe-area-inset-bottom,0px))] z-10 -mx-4 mt-1 border-t border-hairline bg-canvas/95 px-4 py-3 backdrop-blur-md sm:static sm:mx-0 sm:mt-2 sm:border-0 sm:bg-transparent sm:px-0 sm:py-0 sm:backdrop-blur-none md:bottom-0">
            {!snapshot.canAct ? (
              <p className="mb-2 text-center text-caption text-mute">
                {snapshot.yourTiles.some((t) => t.step === snapshot.step)
                  ? "Waiting for rival…"
                  : "Listening…"}
              </p>
            ) : null}
            <GuessInput
              disabled={!snapshot.canAct}
              onCommit={socket.guess}
              onSkip={socket.skip}
              nextUnlockSeconds={nextUnlock}
              attemptsLeft={snapshot.canAct ? 1 : 0}
              skipLabel={snapshot.phase === "closing" ? "Pass" : nextUnlock ? `Skip (+${nextUnlock}s)` : "Skip"}
            />
            <div className="mt-2 sm:mt-3">
              <EmoteBar onEmote={socket.emote} />
            </div>
            {snapshot.yourTiles.length > 0 ? (
              <div className="mt-2 hidden sm:block">
                <OwnTiles tiles={snapshot.yourTiles} />
              </div>
            ) : null}
          </div>
        </div>
      ) : null}

      {snapshot.phase === "reveal" && lastReveal ? (
        <div className="flex flex-col gap-4 sm:gap-5">
          <DuelReveal summary={lastReveal} you={snapshot.you} names={names} />
          <div className="flex flex-wrap justify-center gap-2">
            {clipSrc ? (
              <button type="button" className="btn btn-secondary" onClick={() => clip.play(totalMs)}>
                Replay clip
              </button>
            ) : null}
          </div>
          <EmoteBar onEmote={socket.emote} />
        </div>
      ) : null}

      {snapshot.phase === "ended" ? (
        <DuelResult snapshot={snapshot} onRematch={socket.rematch} onShare={() => void shareResult()} sharing={sharing} />
      ) : null}

      <p className="sr-only" aria-live="polite">
        {snapshot.phase} · server {serverNow()}
      </p>
    </div>
  );
}

function StatusCard({
  title,
  body,
  children,
}: {
  title: string;
  body: string;
  children?: ReactNode;
}) {
  return (
    <div className="mx-auto flex max-w-md flex-col items-center gap-4 px-2 py-10 text-center">
      <h2 className="text-display-sm text-ink">{title}</h2>
      <p className="text-body-sm text-body">{body}</p>
      {children}
    </div>
  );
}
