import { MAX_ATTEMPTS } from "../../lib/game";

export interface GameShellSkeletonProps {
  showFilters?: boolean;
  lyricsMode?: boolean;
  message?: string;
}

/**
 * Reserves the same vertical space as the live game shell so the loading →
 * ready transition does not shift the page (CLS).
 */
export function GameShellSkeleton({
  showFilters = false,
  lyricsMode = false,
  message = "Cueing up a track…",
}: GameShellSkeletonProps) {
  return (
    <div className="flex flex-col gap-3 sm:gap-5" role="status" aria-live="polite" aria-busy="true">
      <div className="flex flex-col items-center gap-3 sm:gap-4">
        <div className="flex w-full max-w-md items-center justify-center gap-2 sm:gap-3">
          <div className="btn btn-primary btn-lg min-w-0 flex-1 animate-pulse bg-canvas-soft-2 sm:min-w-40 sm:flex-none" />
          <div className="btn btn-secondary btn-icon size-11 animate-pulse bg-canvas-soft-2" />
        </div>

        <div
          className="aspect-square w-[min(100%,11rem)] animate-pulse rounded-full bg-canvas-soft-2 sm:w-full sm:max-w-[min(52vw,15rem)]"
          aria-hidden="true"
        />

        {lyricsMode ? (
          <div className="card-soft flex w-full flex-col gap-3 p-6">
            <div className="h-4 w-3/4 animate-pulse rounded bg-canvas-soft-2" />
            <div className="h-4 w-full animate-pulse rounded bg-canvas-soft-2" />
            <div className="h-4 w-5/6 animate-pulse rounded bg-canvas-soft-2" />
          </div>
        ) : (
          <div className="h-3 w-full animate-pulse rounded-full bg-canvas-soft-2" aria-hidden="true" />
        )}
      </div>

      <div className="flex flex-col gap-2">
        <div className="flex flex-col gap-2 sm:flex-row">
          <div className="field field-lg h-12 flex-1 animate-pulse bg-canvas-soft-2" />
          <div className="flex gap-2">
            <div className="btn btn-secondary btn-lg h-12 min-w-24 flex-1 animate-pulse bg-canvas-soft-2 sm:flex-none" />
            <div className="btn btn-primary btn-lg h-12 min-w-24 flex-1 animate-pulse bg-canvas-soft-2 sm:flex-none" />
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
            <span className="h-3 flex-1 animate-pulse rounded bg-canvas-soft-2" />
          </li>
        ))}
      </ol>

      {showFilters ? (
        <div className="flex flex-wrap gap-2 pt-1" aria-hidden="true">
          <div className="h-11 w-28 animate-pulse rounded-full bg-canvas-soft-2" />
          <div className="h-11 w-24 animate-pulse rounded-full bg-canvas-soft-2" />
          <div className="h-11 w-32 animate-pulse rounded-full bg-canvas-soft-2" />
        </div>
      ) : null}
    </div>
  );
}
