import { useId } from "react";
import { MAX_ATTEMPTS } from "../../lib/game";
import { VINYL_DISC_CLASS } from "../../lib/vinylUi";

export interface GameShellSkeletonProps {
  showFilters?: boolean;
  lyricsMode?: boolean;
  message?: string;
}

/**
 * Reserves the same vertical space as the live game shell so the loading →
 * ready transition does not shift the page (CLS).
 *
 * Vinyl is an SVG (LCP-eligible). A CSS-gradient div does not count as LCP,
 * so lab was waiting for the hydrated canvas (~8s) instead.
 */
export function GameShellSkeleton({
  showFilters = false,
  lyricsMode = false,
  message = "Cueing up a track…",
}: GameShellSkeletonProps) {
  const gradId = `ctVinyl-${useId().replace(/:/g, "")}`;

  return (
    <div className="flex flex-col gap-2.5 sm:gap-5" role="status" aria-live="polite" aria-busy="true">
      <div className="flex flex-col items-center gap-2.5 sm:gap-4">
        <div className="order-1 flex w-full max-w-md items-center justify-center gap-2 sm:gap-3 md:order-2">
          <div className="btn btn-primary btn-lg min-w-0 flex-1 bg-canvas-soft-2 shadow-level-2 sm:min-w-40 sm:flex-none" />
          <div className="btn btn-secondary btn-icon size-11 bg-canvas-soft-2" />
        </div>

        <svg
          className={`order-2 md:order-1 ${VINYL_DISC_CLASS}`}
          viewBox="0 0 176 176"
          aria-hidden="true"
          focusable="false"
        >
          <defs>
            <radialGradient id={gradId} cx="50%" cy="45%" r="50%">
              <stop offset="0%" stopColor="#151519" />
              <stop offset="28%" stopColor="#151519" />
              <stop offset="55%" stopColor="#0d0d10" />
              <stop offset="100%" stopColor="#08080a" />
            </radialGradient>
          </defs>
          <circle cx="88" cy="88" r="87" fill={`url(#${gradId})`} stroke="rgba(255,255,255,0.08)" />
          <circle cx="88" cy="88" r="28" fill="#0a0a0c" stroke="rgba(255,255,255,0.06)" />
          <circle cx="88" cy="88" r="5" fill="#1a1a1f" />
        </svg>

        {lyricsMode ? (
          <div className="card-soft flex w-full flex-col gap-3 p-6">
            <div className="h-4 w-3/4 rounded bg-canvas-soft-2" />
            <div className="h-4 w-full rounded bg-canvas-soft-2" />
            <div className="h-4 w-5/6 rounded bg-canvas-soft-2" />
          </div>
        ) : (
          <div className="h-3 w-full rounded-full bg-canvas-soft-2" aria-hidden="true" />
        )}
      </div>

      <div className="flex flex-col gap-2">
        <div className="flex flex-col gap-2 sm:flex-row">
          <div className="field field-lg h-12 flex-1 bg-canvas-soft-2" />
          <div className="flex gap-2">
            <div className="btn btn-secondary btn-lg h-12 min-w-24 flex-1 bg-canvas-soft-2 sm:flex-none" />
            <div className="btn btn-primary btn-lg h-12 min-w-24 flex-1 bg-canvas-soft-2 sm:flex-none" />
          </div>
        </div>
        <p className="text-caption text-mute">{message}</p>
      </div>

      <ol className="flex flex-col gap-1.5" aria-hidden="true">
        {Array.from({ length: MAX_ATTEMPTS }, (_, index) => (
          <li
            key={index}
            className="flex min-h-9 items-center gap-3 rounded-md border border-dashed border-hairline px-3 sm:h-10"
          >
            <span className="w-6 shrink-0 font-mono text-caption text-mute">{index + 1}</span>
            <span className="h-3 flex-1 rounded bg-canvas-soft-2" />
          </li>
        ))}
      </ol>

      {showFilters ? (
        <div className="flex flex-wrap gap-2 pt-1" aria-hidden="true">
          <div className="h-11 w-28 rounded-full bg-canvas-soft-2" />
          <div className="h-11 w-24 rounded-full bg-canvas-soft-2" />
          <div className="h-11 w-32 rounded-full bg-canvas-soft-2" />
        </div>
      ) : null}
    </div>
  );
}
