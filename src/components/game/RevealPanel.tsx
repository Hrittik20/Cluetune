import { useCallback, useMemo, useState } from "react";
import { MAX_ATTEMPTS, type RoundState } from "../../lib/game";
import { buildShareText, challengeFromRound, challengeUrl, modeLabel } from "../../lib/share";
import type { AudioSource, GuessVerdict } from "../../lib/types";
import { ShareCard } from "./ShareCard";
import type { ShareCardOptions } from "./renderShareCard";

export interface RevealPanelProps {
  state: RoundState;
  source: AudioSource | null;
  /** Peak history captured during play, for the share card waveform. */
  waveform: number[];
  puzzle?: number;
  /** Countdown string for daily; omitted in every other mode. */
  countdown?: string;
  onNext?: () => void;
  nextLabel?: string;
}

/**
 * The reveal. Deliberately does three jobs in one screen: confirm the answer,
 * give the player somewhere to go next, and make the result worth sending to
 * someone — in that order of visual weight.
 */
export function RevealPanel({
  state,
  source,
  waveform,
  puzzle,
  countdown,
  onNext,
  nextLabel = "Next Round",
}: RevealPanelProps) {
  const { track, status } = state;
  const won = status === "won";
  const [copied, setCopied] = useState(false);

  const seconds = Math.max(
    0,
    Math.round(((state.endedAt ?? Date.now()) - (state.startedAt ?? Date.now())) / 1000),
  );

  const challenge = useMemo(
    () => challengeUrl(challengeFromRound(state), typeof location !== "undefined" ? location.origin : undefined),
    [state],
  );

  const shareText = useMemo(
    () => buildShareText({ state, puzzle, challenge }),
    [state, puzzle, challenge],
  );

  const cardOptions = useMemo<ShareCardOptions>(
    () => ({
      headline: puzzle != null ? `${modeLabel(state.mode)} #${puzzle}` : modeLabel(state.mode),
      result: won ? `${state.guesses.length}/${MAX_ATTEMPTS}` : `X/${MAX_ATTEMPTS}`,
      title: track.title,
      artist: track.artist,
      artworkUrl: source?.artworkUrl,
      verdicts: state.guesses.map((guess) => guess.verdict as GuessVerdict),
      seconds,
      waveform,
      won,
      footer: "cluetune.com",
      seed: track.id,
    }),
    [puzzle, state, track, source, seconds, waveform, won],
  );

  const copyChallenge = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(challenge);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2400);
    } catch {
      setCopied(false);
    }
  }, [challenge]);

  const searchQuery = encodeURIComponent(`${track.artist} ${track.title}`);

  return (
    <section className="animate-rise flex flex-col gap-8" aria-live="polite">
      <header className="flex flex-col items-center gap-3 text-center">
        <p className="eyebrow">{won ? "Solved" : "Revealed"}</p>
        <h2 className="text-display-lg text-ink">
          {won ? `Got it in ${state.guesses.length}.` : "That one got away."}
        </h2>
        <p className="text-body-md text-body">
          {won
            ? `${seconds}s from first play to answer.`
            : `The clip ran all ${MAX_ATTEMPTS} rungs without a match.`}
        </p>
      </header>

      <div className="card flex flex-col items-center gap-5 p-6 sm:flex-row sm:items-center sm:gap-6 sm:p-8">
        {source?.artworkUrl ? (
          <img
            src={source.artworkUrl}
            alt={`Album artwork for ${track.album} by ${track.artist}`}
            width={160}
            height={160}
            loading="lazy"
            className="size-32 shrink-0 rounded-lg object-cover shadow-level-2 sm:size-40"
          />
        ) : (
          <div
            aria-hidden="true"
            className="size-32 shrink-0 rounded-lg bg-linear-135 from-[#007cf0] via-[#7928ca] to-[#ff0080] shadow-level-2 sm:size-40"
          />
        )}

        <div className="flex min-w-0 flex-1 flex-col gap-2 text-center sm:text-left">
          <h3 className="text-display-md text-ink" translate="no">
            {track.title}
          </h3>
          <p className="text-body-lg text-body" translate="no">
            {track.artist}
          </p>
          <p className="text-body-sm text-mute">
            {track.album} · {track.year}
          </p>

          <div className="mt-2 flex flex-wrap justify-center gap-2 sm:justify-start">
            <a
              className="btn btn-secondary btn-sm"
              href={`https://open.spotify.com/search/${searchQuery}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              Spotify
            </a>
            <a
              className="btn btn-secondary btn-sm"
              href={`https://music.apple.com/search?term=${searchQuery}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              Apple Music
            </a>
            <a
              className="btn btn-secondary btn-sm"
              href={`https://www.youtube.com/results?search_query=${searchQuery}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              YouTube
            </a>
          </div>

          {source ? (
            <p className="mt-1 text-caption text-mute">{source.attribution}</p>
          ) : null}
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-[auto_1fr] md:items-start">
        <ShareCard options={cardOptions} shareText={shareText} shareUrl={challenge} />

        <div className="flex flex-col gap-4">
          <div className="card-soft flex flex-col gap-3 p-5">
            <h3 className="text-display-sm text-ink">Challenge a friend</h3>
            <p className="text-body-sm text-body">
              Sends them this exact clip. No account, no app — they play it in the browser and get scored
              against your {won ? `${state.guesses.length}/${MAX_ATTEMPTS}` : "attempt"}.
            </p>
            <div className="flex flex-col gap-2 sm:flex-row">
              <input
                readOnly
                value={challenge}
                aria-label="Challenge link"
                onFocus={(event) => event.currentTarget.select()}
                className="field h-10 min-w-0 flex-1 px-4 font-mono text-caption"
              />
              <button type="button" className="btn btn-secondary btn-md shrink-0" onClick={copyChallenge}>
                {copied ? "Copied" : "Copy Link"}
              </button>
            </div>
          </div>

          {countdown ? (
            <div className="card-soft flex items-center justify-between gap-4 p-5">
              <div>
                <p className="eyebrow">Next daily</p>
                <p className="tabular mt-1 text-display-sm text-ink">{countdown}</p>
              </div>
              <a className="btn btn-primary btn-md" href="/">
                Play Unlimited
              </a>
            </div>
          ) : null}

          {onNext ? (
            <button type="button" className="btn btn-primary btn-lg w-full" onClick={onNext}>
              {nextLabel}
            </button>
          ) : null}
        </div>
      </div>
    </section>
  );
}
