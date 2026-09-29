import { lazy, Suspense, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { formatCountdown, localDateKey, msUntilLocalMidnight, puzzleNumber } from "../../lib/daily-time";
import { DEFAULT_FILTERS } from "../../lib/filters";
import {
  EMPTY_SESSION,
  accuracy,
  applyGuess,
  averageAttempts,
  createRound,
  ladderFor,
  recordRound,
  tilePattern,
  unlockedMs,
  type RoundState,
  type SessionStats,
} from "../../lib/game";
import {
  DRUNK_LEVEL_LABELS,
  DRUNK_START_LEVEL,
  DRUNK_MAX_LEVEL,
  buildDrunkFx,
  buzzFlavor,
  nextBuzzLevel,
  skipSoberingFlavor,
  type DrunkLevel,
} from "../../lib/audioFx";
import { judgeGuess } from "../../lib/matching";
import { getDailyRecord, getDrunkBuzz, getSession, loadState, putDrunkBuzz, putSession, recordDaily } from "../../lib/storage";
import type { GameMode, ModeFilters, ResolvedTrack } from "../../lib/types";
import { GameShellSkeleton } from "./GameShellSkeleton";
import { GuessInput } from "./GuessInput";
import { ClipLadderBar, GuessRows } from "./GuessRows";
import { LyricsBoard } from "./LyricsBoard";
import { SessionHud } from "./SessionHud";
import { VinylPlayer } from "./VinylPlayer";
import { useAudioClip } from "./useAudioClip";

const FilterBar = lazy(() => import("./FilterBar").then((module) => ({ default: module.FilterBar })));
const RevealPanel = lazy(() =>
  import("./RevealPanel").then((module) => ({ default: module.RevealPanel })),
);

type PrefetchPayload = {
  mode: string;
  date?: string;
  promise: Promise<{ rounds?: ResolvedTrack[]; error?: string }>;
};

function readPrefetchDateKey(): string | null {
  if (typeof window === "undefined") return null;
  const value = (window as Window & { __CLUETUNE_DATE__?: string }).__CLUETUNE_DATE__;
  return typeof value === "string" && value.length > 0 ? value : null;
}

function takePrefetchedRounds(
  mode: GameMode,
  dateKey: string | null,
): Promise<ResolvedTrack[]> | null {
  if (typeof window === "undefined") return null;
  const bag = window as Window & { __CLUETUNE_ROUND__?: PrefetchPayload };
  const payload = bag.__CLUETUNE_ROUND__;
  if (!payload || payload.mode !== mode) return null;
  if (mode === "daily" && payload.date && dateKey && payload.date !== dateKey) return null;
  bag.__CLUETUNE_ROUND__ = undefined;
  // A failed prefetch falls through to a normal fetch rather than an error screen.
  return payload.promise.then(
    (data) => (data.error ? [] : (data.rounds ?? [])),
    () => [],
  );
}

/** Server hiccups (provider rate limits, 5xx) and dropped connections are worth retrying. */
class RoundError extends Error {
  constructor(
    message: string,
    readonly retryable: boolean,
  ) {
    super(message);
  }
}

const RETRY_DELAYS_MS = [1500, 4000];

async function withRetry<T>(load: () => Promise<T>, signal?: AbortSignal): Promise<T> {
  for (let attempt = 0; ; attempt++) {
    try {
      return await load();
    } catch (error) {
      const delay = RETRY_DELAYS_MS[attempt];
      if (delay == null || signal?.aborted || !(error instanceof RoundError) || !error.retryable) throw error;
      await new Promise((resolve) => window.setTimeout(resolve, delay));
      if (signal?.aborted) throw new DOMException("Aborted", "AbortError");
    }
  }
}

export interface GameShellProps {
  mode: GameMode;
  /**
   * Daily only, and normally omitted. The puzzle resets at the player's local
   * midnight, which the server cannot know, so the date is resolved in the
   * browser unless a specific archive day is being replayed.
   */
  dateKey?: string;
  /** Gauntlet only. */
  pack?: string;
  packName?: string;
  /** Challenge links pin one specific track. */
  lockedTrackId?: string;
  challengerAttempt?: number;
  challengerSeconds?: number;
  challengerName?: string;
  showFilters?: boolean;
  /** Unlimited keeps queueing rounds; the rest stop when the queue drains. */
  continuous?: boolean;
}

const GAUNTLET_LENGTH = 5;

export default function GameShell(props: GameShellProps) {
  const {
    mode,
    dateKey: dateKeyProp,
    pack,
    packName,
    lockedTrackId,
    challengerAttempt,
    challengerSeconds,
    challengerName,
    showFilters = false,
    continuous = false,
  } = props;

  const [filters, setFilters] = useState<ModeFilters>(DEFAULT_FILTERS);
  const [queue, setQueue] = useState<ResolvedTrack[]>([]);
  const [current, setCurrent] = useState<ResolvedTrack | null>(null);
  const [round, setRound] = useState<RoundState | null>(null);
  const [session, setSession] = useState<SessionStats>(EMPTY_SESSION);
  const [status, setStatus] = useState<"loading" | "ready" | "error">("loading");
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [scratchKey, setScratchKey] = useState(0);
  const [countdown, setCountdown] = useState("");
  const [completedRounds, setCompletedRounds] = useState(0);
  const [reducedGlitch, setReducedGlitch] = useState(false);
  const [dateKey, setDateKey] = useState<string | null>(dateKeyProp ?? readPrefetchDateKey());
  const [buzzLevel, setBuzzLevel] = useState<DrunkLevel>(DRUNK_START_LEVEL);
  const [buzzNote, setBuzzNote] = useState<string | null>(null);

  const puzzle = dateKey ? puzzleNumber(dateKey) : undefined;

  /** Peak magnitudes captured while playing, for the share-card waveform. */
  const waveformRef = useRef<number[]>([]);
  const seenIdsRef = useRef<Set<string>>(new Set());

  const ladder = useMemo(() => ladderFor(mode), [mode]);
  const totalMs = ladder[ladder.length - 1]!;

  const drunkFx = useMemo(() => {
    if (mode !== "drunk" || !current) return null;
    // First listen is the most distorted; each miss/skip sobers the mix.
    // After the round ends, play the reveal clean.
    const attemptIndex =
      round?.status === "playing" ? round.guesses.length : DRUNK_MAX_LEVEL;
    return buildDrunkFx(buzzLevel, current.track.id, attemptIndex);
  }, [mode, buzzLevel, current, round?.status, round?.guesses.length]);

  const audio = useAudioClip(
    current?.source?.kind === "audio" ? current.source.ref : null,
    drunkFx,
  );

  // Resolve the puzzle date from the browser's calendar, not the server's.
  useEffect(() => {
    if (mode === "daily" && !dateKeyProp && !dateKey) setDateKey(localDateKey());
  }, [mode, dateKeyProp, dateKey]);

  // Restore per-mode session stats, preferences and saved filters on mount.
  useEffect(() => {
    const persisted = loadState();
    setSession(persisted.sessions[mode] ?? getSession(mode));
    setReducedGlitch(persisted.prefs.reducedGlitch);
    if (mode === "drunk") setBuzzLevel(getDrunkBuzz());

    if (!showFilters) return;
    const fromUrl = readFilters(new URLSearchParams(location.search));
    setFilters(fromUrl ?? persisted.prefs.filters ?? DEFAULT_FILTERS);
  }, [mode, showFilters]);

  const [poolCount, setPoolCount] = useState<number | undefined>(undefined);

  useEffect(() => {
    if (!showFilters) {
      setPoolCount(undefined);
      return;
    }
    let cancelled = false;
    void import("../../lib/catalog").then(({ filterCatalog }) => {
      if (!cancelled) setPoolCount(filterCatalog(filters).length);
    });
    return () => {
      cancelled = true;
    };
  }, [showFilters, filters]);

  const fetchRounds = useCallback(
    async (count: number, signal?: AbortSignal): Promise<ResolvedTrack[]> => {
      const filtersAreDefault =
        filters.genres.length === 0 &&
        filters.decades.length === 0 &&
        filters.difficulty[0] === DEFAULT_FILTERS.difficulty[0] &&
        filters.difficulty[1] === DEFAULT_FILTERS.difficulty[1];

      const prefetched =
        count <= 3 && !lockedTrackId && !pack && filtersAreDefault
          ? takePrefetchedRounds(mode, dateKey)
          : null;
      if (prefetched) {
        const rounds = await prefetched;
        if (signal?.aborted) throw new DOMException("Aborted", "AbortError");
        if (rounds.length) return rounds.slice(0, count);
      }

      const params = new URLSearchParams({ mode, count: String(count) });

      if (dateKey) params.set("date", dateKey);
      if (pack) params.set("pack", pack);
      if (lockedTrackId) params.set("track", lockedTrackId);

      if (showFilters) {
        if (filters.genres.length) params.set("genres", filters.genres.join(","));
        if (filters.decades.length) params.set("decades", filters.decades.join(","));
        params.set("dmin", String(filters.difficulty[0]));
        params.set("dmax", String(filters.difficulty[1]));
      }

      const exclude = [...seenIdsRef.current].slice(-30);
      if (exclude.length && !lockedTrackId) params.set("exclude", exclude.join(","));

      const controller = new AbortController();
      const timeout = window.setTimeout(() => controller.abort(), 20_000);
      if (signal) signal.addEventListener("abort", () => controller.abort(), { once: true });

      try {
        let response: Response;
        try {
          response = await fetch(`/api/round?${params}`, { signal: controller.signal });
        } catch (error) {
          if ((error as Error).name === "AbortError") throw error;
          throw new RoundError("Couldn't reach Cluetune. Check your connection and try again.", true);
        }

        const data = (await response.json().catch(() => ({}))) as { rounds?: ResolvedTrack[]; error?: string };
        if (!response.ok) {
          throw new RoundError(data.error ?? "Could not load a round.", response.status >= 500);
        }
        return data.rounds ?? [];
      } catch (error) {
        if ((error as Error).name === "AbortError") {
          if (signal?.aborted) throw error;
          throw new RoundError("Loading took too long. Check your connection and try again.", false);
        }
        throw error;
      } finally {
        window.clearTimeout(timeout);
      }
    },
    [mode, dateKey, pack, lockedTrackId, showFilters, filters],
  );

  // Initial load, and reload whenever the filter set changes.
  useEffect(() => {
    // Daily cannot fetch until the browser has told us what day it is.
    if (mode === "daily" && !dateKey) return;

    const controller = new AbortController();
    setStatus("loading");
    setErrorMessage("");

    void (async () => {
      try {
        const wanted = mode === "gauntlet" ? GAUNTLET_LENGTH : continuous ? 3 : 1;
        const rounds = await withRetry(() => fetchRounds(wanted, controller.signal), controller.signal);

        if (controller.signal.aborted) return;
        if (!rounds.length) throw new Error("No playable tracks matched. Try widening your filters.");

        const [first, ...rest] = rounds;
        waveformRef.current = [];
        seenIdsRef.current = new Set(rounds.map((entry) => entry.track.id));

        setQueue(rest);
        setCurrent(first!);
        setCompletedRounds(0);

        // Re-opening a day you already finished restores the reveal rather
        // than handing out a second attempt.
        const played = mode === "daily" && dateKey ? getDailyRecord(dateKey) : null;

        if (played && played.trackId === first!.track.id) {
          setRound({
            mode,
            track: first!.track,
            guesses: played.guesses,
            status: played.won ? "won" : "lost",
            startedAt: 0,
            endedAt: played.elapsedMs,
          });
        } else {
          setRound(createRound(mode, first!.track));
        }

        setStatus("ready");
      } catch (error) {
        if ((error as Error).name === "AbortError") return;
        setErrorMessage((error as Error).message);
        setStatus("error");
      }
    })();

    return () => controller.abort();
  }, [fetchRounds, mode, continuous, dateKey]);

  // Phones drop connections and background tabs; recover without a tap.
  useEffect(() => {
    if (status !== "error" || current) return;

    const retry = () => {
      if (document.visibilityState === "visible") setFilters((value) => ({ ...value }));
    };
    window.addEventListener("online", retry);
    document.addEventListener("visibilitychange", retry);
    return () => {
      window.removeEventListener("online", retry);
      document.removeEventListener("visibilitychange", retry);
    };
  }, [status, current]);

  // Daily countdown ticker.
  useEffect(() => {
    if (mode !== "daily") return;

    const update = () => setCountdown(formatCountdown(msUntilLocalMidnight()));
    update();
    const timer = window.setInterval(update, 1000);
    return () => window.clearInterval(timer);
  }, [mode]);

  // Sample the analyser while playing so the share card shows the real clip.
  useEffect(() => {
    if (!audio.playing) return;

    const timer = window.setInterval(() => {
      const levels = audio.readLevels();
      if (!levels) return;

      let peak = 0;
      for (const value of levels) peak = Math.max(peak, value);
      waveformRef.current.push(peak);
    }, 60);

    return () => window.clearInterval(timer);
  }, [audio.playing, audio.readLevels]);

  const unlocked = round ? unlockedMs(round) : ladder[0]!;
  const finished = round?.status === "won" || round?.status === "lost";

  const resolveRound = useCallback(
    (next: RoundState) => {
      setRound(next);

      if (next.status === "playing") {
        if (mode === "drunk") setBuzzNote(skipSoberingFlavor(next.guesses.length));
        return;
      }

      audio.pause();

      const updatedSession = recordRound(session, next);
      setSession(updatedSession);
      putSession(mode, updatedSession);
      setCompletedRounds((value) => value + 1);

      if (mode === "drunk") {
        const previous = buzzLevel;
        const updated = nextBuzzLevel(buzzLevel, next);
        setBuzzLevel(updated);
        putDrunkBuzz(updated);
        setBuzzNote(buzzFlavor(previous, updated));
      }

      if (mode === "daily" && dateKey) {
        recordDaily({
          dateKey,
          won: next.status === "won",
          attempt: next.status === "won" ? next.guesses.length : null,
          pattern: tilePattern(next),
          trackId: next.track.id,
          guesses: next.guesses,
          elapsedMs: (next.endedAt ?? 0) - (next.startedAt ?? 0),
        });
      }
    },
    [audio, session, mode, dateKey, buzzLevel],
  );

  const commitGuess = useCallback(
    (label: string) => {
      if (!round || round.status !== "playing") return;

      const verdict = judgeGuess(label, round.track);
      if (verdict !== "correct") setScratchKey((key) => key + 1);

      const next = applyGuess(round, { label, verdict, unlockedMs: unlocked }, Date.now());
      resolveRound(next);
      if (next.status === "playing") audio.extendLimit(unlockedMs(next));
    },
    [round, unlocked, resolveRound, audio],
  );

  const skip = useCallback(() => {
    if (!round || round.status !== "playing") return;

    setScratchKey((key) => key + 1);
    const next = applyGuess(round, { label: "Skipped", verdict: "skip", unlockedMs: unlocked }, Date.now());
    resolveRound(next);
    if (next.status === "playing") audio.extendLimit(unlockedMs(next));
  }, [round, unlocked, resolveRound, audio]);

  const advance = useCallback(async () => {
    setBuzzNote(null);
    const [next, ...rest] = queue;

    if (next) {
      setQueue(rest);
      waveformRef.current = [];
      setCurrent(next);
      setRound(createRound(mode, next.track));

      // Top the queue back up in the background so the next tap is instant.
      if (continuous && rest.length < 2) {
        void fetchRounds(3)
          .then((more) => setQueue((existing) => [...existing, ...more]))
          .catch(() => undefined);
      }
      return;
    }

    if (!continuous) return;

    setStatus("loading");
    try {
      const more = await withRetry(() => fetchRounds(3));
      const [first, ...remaining] = more;
      if (!first) throw new Error("No more playable tracks right now.");

      setQueue(remaining);
      waveformRef.current = [];
      setCurrent(first);
      setRound(createRound(mode, first.track));
      setStatus("ready");
    } catch (error) {
      setErrorMessage((error as Error).message);
      setStatus("error");
    }
  }, [queue, mode, continuous, fetchRounds]);

  const gauntletComplete = mode === "gauntlet" && completedRounds >= GAUNTLET_LENGTH;

  if (status === "loading" && !current) {
    return (
      <GameShellSkeleton showFilters={showFilters} lyricsMode={mode === "lyric-flip"} />
    );
  }

  if (status === "error" && !current) {
    return <ErrorState message={errorMessage} onRetry={() => setFilters({ ...filters })} />;
  }

  if (!round || !current) {
    return (
      <GameShellSkeleton showFilters={showFilters} lyricsMode={mode === "lyric-flip"} />
    );
  }

  const attemptIndex = round.guesses.length;
  const lyricsMode = mode === "lyric-flip";
  const nextUnlockSeconds =
    attemptIndex + 1 < ladder.length ? Math.round(ladder[attemptIndex + 1]! / 1000) : null;

  const lyrics = current.lyrics;
  const shownLyricLines = lyrics
    ? Math.min(lyrics.lines.length, (attemptIndex + 1) * lyrics.linesPerReveal)
    : 0;
  const remainingLyricLines = lyrics ? lyrics.lines.length - shownLyricLines : 0;
  const nextLyricBatch = lyrics ? Math.min(lyrics.linesPerReveal, remainingLyricLines) : 0;

  const skipLabel = lyricsMode
    ? nextUnlockSeconds == null
      ? "Give Up"
      : nextLyricBatch > 0
        ? `Skip (+${nextLyricBatch} line${nextLyricBatch === 1 ? "" : "s"})`
        : "Skip"
    : undefined;

  const showPlayer = Boolean(current.source) && (!lyricsMode || finished);
  const nextCtaLabel =
    mode === "gauntlet" ? `Round ${completedRounds + 1} of ${GAUNTLET_LENGTH}` : "Next Round";
  const showNextCta = finished && !gauntletComplete;

  return (
    <div className="flex flex-col gap-2.5 sm:gap-5">
      {challengerAttempt != null ? (
        <ChallengeBanner
          name={challengerName}
          attempt={challengerAttempt}
          seconds={challengerSeconds ?? 0}
        />
      ) : null}

      {mode === "gauntlet" ? (
        <GauntletProgress completed={completedRounds} total={GAUNTLET_LENGTH} packName={packName} />
      ) : null}

      {showPlayer ? (
        <div className="flex flex-col items-center gap-2.5 sm:gap-4">
          {showNextCta ? (
            <div className="flex flex-col items-center gap-1.5">
              {mode === "daily" ? (
                <a className="btn btn-primary btn-md h-11 px-6 shadow-level-2" href="/unlimited">
                  Play Unlimited
                  <ArrowIcon />
                </a>
              ) : (
                <button
                  type="button"
                  className="btn btn-primary btn-md h-11 px-6 shadow-level-2"
                  onClick={() => void advance()}
                >
                  {nextCtaLabel}
                  <ArrowIcon />
                </button>
              )}
              {mode === "drunk" && buzzNote ? (
                <p className="text-caption text-mute">{buzzNote}</p>
              ) : null}
            </div>
          ) : (
            // Mobile: Play first so the CTA clears the fold. Desktop: vinyl first.
            <div className="order-1 flex w-full max-w-md items-center justify-center gap-2 sm:gap-3 md:order-2">
              <button
                type="button"
                className="btn btn-primary btn-lg min-w-0 flex-1 shadow-level-2 sm:min-w-40 sm:flex-none"
                onClick={() => audio.toggle(unlocked)}
                disabled={!audio.ready && !audio.error}
              >
                {audio.playing ? "Pause" : `Play ${(unlocked / 1000).toFixed(0)}s`}
              </button>
              <button
                type="button"
                className="btn btn-secondary btn-icon"
                aria-label="Restart the clip from the beginning"
                onClick={() => audio.play(unlocked, 0)}
              >
                <RestartIcon />
              </button>
            </div>
          )}

          <div className={`flex w-full justify-center ${showNextCta ? "" : "order-2 md:order-1"}`}>
            <VinylPlayer
              playing={audio.playing}
              positionMs={audio.positionMs}
              unlockedMs={unlocked}
              totalMs={totalMs}
              readLevels={audio.readLevels}
              scratchKey={scratchKey}
              artworkUrl={current.source?.artworkUrl}
              revealArtwork={finished}
              reducedGlitch={reducedGlitch}
            />
          </div>

          {showNextCta ? (
            <div className="flex items-center justify-center gap-2">
              <button
                type="button"
                className="btn btn-secondary btn-icon"
                aria-label={audio.playing ? "Pause the clip" : "Replay the full clip"}
                onClick={() => audio.toggle(totalMs)}
                disabled={!audio.ready && !audio.error}
              >
                {audio.playing ? <PauseIcon /> : <PlayIcon />}
              </button>
              <button
                type="button"
                className="btn btn-secondary btn-icon"
                aria-label="Restart the clip from the beginning"
                onClick={() => audio.play(totalMs, 0)}
              >
                <RestartIcon />
              </button>
            </div>
          ) : null}

          {audio.error ? (
            <p role="status" className="order-3 text-body-sm text-tone-wrong">
              {audio.error}
            </p>
          ) : null}

          {mode === "drunk" && buzzNote && !showNextCta ? (
            <p className="order-3 text-caption text-mute">{buzzNote}</p>
          ) : null}

          {lyricsMode ? null : (
            <div className="order-3 w-full">
              <ClipLadderBar
                ladder={ladder}
                total={totalMs}
                unlockedMs={finished ? totalMs : unlocked}
                positionMs={audio.positionMs}
                attempt={Math.min(attemptIndex + 1, ladder.length)}
              />
            </div>
          )}
        </div>
      ) : current.source && lyricsMode ? (
        lyrics ? (
          <LyricsBoard lyrics={lyrics} attempt={attemptIndex} />
        ) : (
          <UnavailableState reason="No lyrics for this track." onSkip={advance} />
        )
      ) : (
        <UnavailableState reason={current.unavailableReason} onSkip={advance} />
      )}

      {lyricsMode && showPlayer && lyrics && finished ? (
        <LyricsBoard lyrics={lyrics} attempt={ladder.length - 1} />
      ) : null}

      {!finished ? (
        <>
          <GuessInput
            onCommit={commitGuess}
            onSkip={skip}
            nextUnlockSeconds={nextUnlockSeconds}
            attemptsLeft={ladder.length - attemptIndex}
            skipLabel={skipLabel}
          />
          <GuessRows
            guesses={round.guesses}
            ladder={ladder}
            activeIndex={attemptIndex}
            showBar={false}
            activeHint={lyricsMode ? "Reading the lyrics…" : undefined}
          />
        </>
      ) : (
        <>
          <GuessRows
            guesses={round.guesses}
            ladder={ladder}
            activeIndex={-1}
            showBar={false}
            activeHint={lyricsMode ? "Reading the lyrics…" : undefined}
          />
          <Suspense fallback={null}>
            <RevealPanel
              state={round}
              source={current.source}
              waveform={waveformRef.current}
              puzzle={puzzle}
              countdown={mode === "daily" ? countdown : undefined}
            />
          </Suspense>
        </>
      )}

      {gauntletComplete ? <GauntletSummary session={session} packName={packName} /> : null}

      {continuous ? (
        <SessionHud
          session={session}
          buzz={
            mode === "drunk"
              ? { level: buzzLevel, label: DRUNK_LEVEL_LABELS[buzzLevel] }
              : undefined
          }
        />
      ) : null}

      {showFilters ? (
        <Suspense fallback={null}>
          <FilterBar
            filters={filters}
            matchCount={poolCount}
            onChange={(next) => {
              setFilters(next);
              seenIdsRef.current = new Set();
            }}
          />
        </Suspense>
      ) : null}
    </div>
  );
}

function readFilters(params: URLSearchParams): ModeFilters | null {
  const genres = (params.get("genres") ?? "").split(",").filter(Boolean);
  const decades = (params.get("decades") ?? "").split(",").filter(Boolean);
  const min = Number.parseInt(params.get("dmin") ?? "", 10);
  const max = Number.parseInt(params.get("dmax") ?? "", 10);

  if (!genres.length && !decades.length && Number.isNaN(min) && Number.isNaN(max)) return null;

  return {
    genres: genres as ModeFilters["genres"],
    decades: decades as ModeFilters["decades"],
    difficulty: [
      (Number.isNaN(min) ? 1 : Math.min(5, Math.max(1, min))) as ModeFilters["difficulty"][0],
      (Number.isNaN(max) ? 3 : Math.min(5, Math.max(1, max))) as ModeFilters["difficulty"][1],
    ],
  };
}

function ErrorState({ message, onRetry }: { message: string; onRetry: () => void }) {
  return (
    <div className="card-soft flex flex-col items-center gap-4 p-10 text-center" role="alert">
      <h2 className="text-display-sm text-ink">No clip to play</h2>
      <p className="max-w-prose text-body-sm text-body">{message}</p>
      <button type="button" className="btn btn-primary btn-md" onClick={onRetry}>
        Try Again
      </button>
    </div>
  );
}

function UnavailableState({ reason, onSkip }: { reason?: string; onSkip: () => void }) {
  return (
    <div className="card-soft flex flex-col items-center gap-4 p-8 text-center" role="alert">
      <p className="text-body-md text-ink">{reason ?? "This track has no playable preview."}</p>
      <button type="button" className="btn btn-primary btn-md" onClick={onSkip}>
        Pick Another Track
      </button>
    </div>
  );
}

function ChallengeBanner({
  name,
  attempt,
  seconds,
}: {
  name?: string;
  attempt: number;
  seconds: number;
}) {
  const who = name ? name : "A friend";

  return (
    <div className="card-soft flex flex-wrap items-center justify-between gap-3 p-4">
      <p className="text-body-sm text-body">
        <span className="font-medium text-ink">{who}</span>{" "}
        {attempt > 0 ? (
          <>
            solved this in <span className="tabular text-ink">{attempt}</span>{" "}
            {attempt === 1 ? "try" : "tries"} · <span className="tabular">{seconds}s</span>
          </>
        ) : (
          "couldn’t get this one."
        )}
      </p>
      <span className="badge">Beat their score</span>
    </div>
  );
}

function GauntletProgress({
  completed,
  total,
  packName,
}: {
  completed: number;
  total: number;
  packName?: string;
}) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 sm:gap-4">
      <p className="eyebrow">{packName ? `${packName} gauntlet` : "Gauntlet"}</p>
      <ol className="flex gap-1.5" aria-label={`Round ${Math.min(completed + 1, total)} of ${total}`}>
        {Array.from({ length: total }, (_, index) => (
          <li
            key={index}
            className={`h-1.5 w-8 rounded-full ${index < completed ? "bg-tone-correct" : "bg-hairline"}`}
          />
        ))}
      </ol>
    </div>
  );
}

function GauntletSummary({ session, packName }: { session: SessionStats; packName?: string }) {
  const average = averageAttempts(session);

  return (
    <div className="card flex flex-col items-center gap-4 p-8 text-center">
      <p className="eyebrow">Gauntlet complete</p>
      <h2 className="text-display-lg text-ink">
        {session.wins} of {session.rounds} in the {packName ?? "pack"}.
      </h2>
      <p className="text-body-md text-body">
        {average ? `${average.toFixed(1)} guesses per win.` : "No wins this run."} Accuracy{" "}
        {Math.round(accuracy(session) * 100)}%.
      </p>
      <div className="mt-2 flex flex-wrap justify-center gap-2">
        <a className="btn btn-primary btn-md" href="/gauntlet">
          Pick Another Pack
        </a>
        <a className="btn btn-secondary btn-md" href="/unlimited">
          Play Unlimited
        </a>
      </div>
    </div>
  );
}

function ArrowIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M5 12h14M13 6l6 6-6 6"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function PlayIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M8 5.5v13L19 12 8 5.5Z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
    </svg>
  );
}

function PauseIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M7 5h3v14H7V5Zm7 0h3v14h-3V5Z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
    </svg>
  );
}

function RestartIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M3 12a9 9 0 1 0 3-6.7L3 8"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path d="M3 3v5h5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
