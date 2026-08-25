import { useEffect, useId, useState } from "react";
import { ALL_DECADES, ALL_GENRES, DIFFICULTY_LABELS, GENRE_LABELS } from "../../lib/catalog";
import type { Decade, Difficulty, Genre, ModeFilters } from "../../lib/types";

export interface FilterBarProps {
  filters: ModeFilters;
  onChange: (filters: ModeFilters) => void;
  /** Round count the current filters can draw from, for the empty-state warning. */
  matchCount?: number;
}

/**
 * Genre / decade / obscurity controls for Unlimited.
 *
 * State is mirrored into the query string so a filtered session is a link —
 * "all K-pop, 2020s, deep cuts only" is shareable without an account, which is
 * the cheap version of a curated playlist.
 */
export function FilterBar({ filters, onChange, matchCount }: FilterBarProps) {
  const [open, setOpen] = useState(false);
  const panelId = useId();

  useEffect(() => {
    const params = new URLSearchParams(location.search);

    setParam(params, "genres", filters.genres.join(","));
    setParam(params, "decades", filters.decades.join(","));
    setParam(params, "dmin", filters.difficulty[0] === 1 ? "" : String(filters.difficulty[0]));
    setParam(params, "dmax", filters.difficulty[1] === 5 ? "" : String(filters.difficulty[1]));

    const query = params.toString();
    history.replaceState(null, "", query ? `${location.pathname}?${query}` : location.pathname);
  }, [filters]);

  const activeCount =
    filters.genres.length +
    filters.decades.length +
    (filters.difficulty[0] !== 1 || filters.difficulty[1] !== 5 ? 1 : 0);

  const toggle = <T extends string>(list: T[], value: T): T[] =>
    list.includes(value) ? list.filter((item) => item !== value) : [...list, value];

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          className="btn btn-secondary btn-sm"
          aria-expanded={open}
          aria-controls={panelId}
          onClick={() => setOpen((previous) => !previous)}
        >
          Filters
          {activeCount > 0 ? (
            <span className="tabular rounded-full bg-ink px-1.5 text-caption text-on-primary">
              {activeCount}
            </span>
          ) : null}
        </button>

        {activeCount > 0 ? (
          <button
            type="button"
            className="btn btn-ghost btn-sm"
            onClick={() => onChange({ genres: [], decades: [], difficulty: [1, 5] })}
          >
            Reset
          </button>
        ) : null}

        {matchCount != null ? (
          <p className="tabular text-caption text-mute" aria-live="polite">
            {matchCount} {matchCount === 1 ? "track" : "tracks"} in the pool
          </p>
        ) : null}
      </div>

      <div id={panelId} hidden={!open} className="card-soft flex flex-col gap-5 p-5">
        <fieldset className="flex flex-col gap-2.5">
          <legend className="eyebrow mb-1">Genre</legend>
          <div className="flex flex-wrap gap-2">
            {ALL_GENRES.map((genre) => (
              <Chip
                key={genre}
                label={GENRE_LABELS[genre]}
                pressed={filters.genres.includes(genre)}
                onClick={() => onChange({ ...filters, genres: toggle<Genre>(filters.genres, genre) })}
              />
            ))}
          </div>
        </fieldset>

        <fieldset className="flex flex-col gap-2.5">
          <legend className="eyebrow mb-1">Decade</legend>
          <div className="flex flex-wrap gap-2">
            {ALL_DECADES.map((decade) => (
              <Chip
                key={decade}
                label={decade}
                pressed={filters.decades.includes(decade)}
                onClick={() => onChange({ ...filters, decades: toggle<Decade>(filters.decades, decade) })}
              />
            ))}
          </div>
        </fieldset>

        <fieldset className="flex flex-col gap-2.5">
          <legend className="eyebrow mb-1">Obscurity</legend>
          <div className="flex flex-wrap gap-2">
            {([1, 2, 3, 4, 5] as Difficulty[]).map((level) => {
              const [min, max] = filters.difficulty;
              return (
                <Chip
                  key={level}
                  label={DIFFICULTY_LABELS[level]}
                  pressed={level >= min && level <= max}
                  onClick={() => onChange({ ...filters, difficulty: expandRange(filters.difficulty, level) })}
                />
              );
            })}
          </div>
        </fieldset>
      </div>
    </div>
  );
}

function Chip({ label, pressed, onClick }: { label: string; pressed: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      aria-pressed={pressed}
      onClick={onClick}
      className={[
        "rounded-full px-3.5 py-2 text-body-sm transition-colors duration-150",
        pressed
          ? "bg-ink text-on-primary"
          : "bg-canvas-soft-2 text-body shadow-level-1 hover:text-ink",
      ].join(" ")}
    >
      {label}
    </button>
  );
}

/**
 * Clicking a level widens or narrows the window rather than toggling a set, so
 * the range always stays contiguous and can never select nothing.
 */
function expandRange([min, max]: [Difficulty, Difficulty], level: Difficulty): [Difficulty, Difficulty] {
  if (level < min) return [level, max];
  if (level > max) return [min, level];
  if (level === min && level === max) return [1, 5];
  if (level === min) return [(min + 1) as Difficulty, max];
  if (level === max) return [min, (max - 1) as Difficulty];
  return [level, level];
}

function setParam(params: URLSearchParams, key: string, value: string) {
  if (value) params.set(key, value);
  else params.delete(key);
}
