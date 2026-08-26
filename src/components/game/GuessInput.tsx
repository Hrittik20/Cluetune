import { useCallback, useEffect, useId, useMemo, useRef, useState } from "react";
import { scoreSuggestion } from "../../lib/matching";
import type { SearchSuggestion } from "../../lib/types";

export interface GuessInputProps {
  disabled?: boolean;
  onCommit: (label: string) => void;
  onSkip: () => void;
  /** Seconds the next skip or wrong guess would unlock, or null on the last attempt. */
  nextUnlockSeconds: number | null;
  attemptsLeft: number;
  /** Overrides the default “Skip (+Ns)” / “Give Up” label (Lyrics Guess). */
  skipLabel?: string;
}

const DEBOUNCE_MS = 160;

/**
 * The guess box. Implemented as an ARIA combobox rather than a datalist so the
 * option list can show artist, title and year together and stay keyboard
 * navigable on every browser.
 */
export function GuessInput({
  disabled,
  onCommit,
  onSkip,
  nextUnlockSeconds,
  attemptsLeft,
  skipLabel: skipLabelProp,
}: GuessInputProps) {
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState<SearchSuggestion[]>([]);
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const [loading, setLoading] = useState(false);
  /** The query `suggestions` actually belongs to. Empty until a search lands. */
  const [settledQuery, setSettledQuery] = useState("");

  const inputRef = useRef<HTMLInputElement | null>(null);
  const listRef = useRef<HTMLUListElement | null>(null);
  const blurTimer = useRef<number | null>(null);

  const listId = useId();
  const optionId = useCallback((index: number) => `${listId}-option-${index}`, [listId]);

  useEffect(() => {
    const trimmed = query.trim();

    if (trimmed.length < 2) {
      setSuggestions([]);
      setSettledQuery("");
      setLoading(false);
      return;
    }

    const controller = new AbortController();
    // Every state write below is gated on this. Without it, the aborted
    // request's `finally` resolves *after* the next effect has already set
    // loading to true, clearing it while the newer request is still in flight —
    // which surfaces as "No matches" flashing over live results mid-type.
    let superseded = false;
    setLoading(true);

    const timer = window.setTimeout(async () => {
      try {
        const response = await fetch(`/api/search?q=${encodeURIComponent(trimmed)}`, {
          signal: controller.signal,
        });
        if (!response.ok) throw new Error("search failed");

        const data = (await response.json()) as { suggestions?: SearchSuggestion[] };
        const ranked = (data.suggestions ?? []).filter((suggestion) => scoreSuggestion(trimmed, suggestion) > 0);
        if (superseded) return;

        setSuggestions(ranked);
        setActiveIndex(-1);
      } catch {
        if (!superseded) setSuggestions([]);
      } finally {
        if (!superseded) {
          setSettledQuery(trimmed);
          setLoading(false);
        }
      }
    }, DEBOUNCE_MS);

    return () => {
      superseded = true;
      controller.abort();
      window.clearTimeout(timer);
    };
  }, [query]);

  // The "no matches" state is gated on a *completed* search for exactly this
  // query, not on `loading`. `loading` is set from an effect, so it is still
  // false during the render the keystroke triggers — long enough to paint an
  // empty-state flash over results that are about to arrive.
  const trimmedQuery = query.trim();
  const showList =
    open && (suggestions.length > 0 || (trimmedQuery.length >= 2 && settledQuery === trimmedQuery));

  const labelFor = useCallback(
    (suggestion: SearchSuggestion) => `${suggestion.artist} — ${suggestion.title}`,
    [],
  );

  const commit = useCallback(
    (label: string) => {
      const value = label.trim();
      if (!value) return;

      onCommit(value);
      setQuery("");
      setSuggestions([]);
      setSettledQuery("");
      setActiveIndex(-1);
      setOpen(false);
    },
    [onCommit],
  );

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "ArrowDown" || event.key === "ArrowUp") {
      event.preventDefault();
      if (!suggestions.length) return;

      setOpen(true);
      setActiveIndex((previous) => {
        const delta = event.key === "ArrowDown" ? 1 : -1;
        const next = previous + delta;
        if (next < 0) return suggestions.length - 1;
        if (next >= suggestions.length) return 0;
        return next;
      });
      return;
    }

    if (event.key === "Enter") {
      event.preventDefault();
      const active = suggestions[activeIndex];
      commit(active ? labelFor(active) : query);
      return;
    }

    if (event.key === "Escape") {
      if (open) {
        event.preventDefault();
        setOpen(false);
        setActiveIndex(-1);
      }
    }
  };

  // Keep the highlighted option inside the scroll viewport.
  useEffect(() => {
    if (activeIndex < 0) return;
    const node = listRef.current?.children[activeIndex] as HTMLElement | undefined;
    node?.scrollIntoView({ block: "nearest" });
  }, [activeIndex]);

  useEffect(
    () => () => {
      if (blurTimer.current) window.clearTimeout(blurTimer.current);
    },
    [],
  );

  const skipLabel = useMemo(() => {
    if (skipLabelProp) return skipLabelProp;
    if (nextUnlockSeconds == null) return "Give Up";
    return `Skip (+${nextUnlockSeconds}s)`;
  }, [skipLabelProp, nextUnlockSeconds]);

  return (
    <div className="relative w-full">
      <label htmlFor={`${listId}-input`} className="sr-only">
        Guess the song or artist
      </label>

      <div className="flex flex-col gap-2 sm:flex-row">
        <div className="relative flex-1 min-w-0">
          <input
            ref={inputRef}
            id={`${listId}-input`}
            type="text"
            role="combobox"
            aria-expanded={showList}
            aria-controls={listId}
            aria-autocomplete="list"
            aria-activedescendant={activeIndex >= 0 ? optionId(activeIndex) : undefined}
            aria-describedby={`${listId}-hint`}
            // Song titles are not dictionary words and are not worth
            // autofilling from a saved profile.
            autoComplete="off"
            spellCheck={false}
            enterKeyHint="done"
            disabled={disabled}
            className="field field-lg pr-11"
            placeholder="Know it? Start typing…"
            value={query}
            onChange={(event) => {
              setQuery(event.target.value);
              setOpen(true);
            }}
            onFocus={() => setOpen(true)}
            onBlur={() => {
              // Deferred so a mousedown on an option still registers.
              blurTimer.current = window.setTimeout(() => setOpen(false), 120);
            }}
            onKeyDown={handleKeyDown}
          />

          {loading ? (
            <span
              aria-hidden="true"
              className="absolute right-4 top-1/2 size-4 -translate-y-1/2 animate-spin rounded-full border-2 border-hairline border-t-ink"
            />
          ) : null}
        </div>

        <div className="flex min-w-0 shrink-0 gap-2 sm:shrink-0">
          <button type="button" className="btn btn-secondary btn-lg min-w-0 flex-1 sm:flex-none" onClick={onSkip} disabled={disabled}>
            {skipLabel}
          </button>
          <button
            type="button"
            className="btn btn-primary btn-lg min-w-0 flex-1 sm:flex-none"
            onClick={() => commit(suggestions[activeIndex] ? labelFor(suggestions[activeIndex]!) : query)}
            disabled={disabled || !query.trim()}
          >
            Submit
          </button>
        </div>
      </div>

      <p id={`${listId}-hint`} className="mt-2 text-caption text-mute">
        {attemptsLeft} {attemptsLeft === 1 ? "attempt" : "attempts"} left. Artist name alone won’t win it, but it counts as
        close.
      </p>

      {showList ? (
        <ul
          ref={listRef}
          id={listId}
          role="listbox"
          aria-label="Song suggestions"
          className="card-raised absolute z-30 mt-2 max-h-72 w-full overflow-y-auto overscroll-contain p-1"
        >
          {suggestions.length === 0 ? (
            <li className="px-4 py-3 text-body-sm text-mute">
              No matches. You can still submit what you typed.
            </li>
          ) : (
            suggestions.map((suggestion, index) => (
              <li
                key={suggestion.id}
                id={optionId(index)}
                role="option"
                aria-selected={index === activeIndex}
                className={`flex cursor-pointer items-baseline gap-2 rounded-md px-3 py-2.5 text-left ${
                  index === activeIndex ? "bg-canvas-soft-2 text-ink" : "text-body"
                }`}
                onMouseEnter={() => setActiveIndex(index)}
                onMouseDown={(event) => {
                  // Prevents the input blurring before the click lands.
                  event.preventDefault();
                  commit(labelFor(suggestion));
                }}
              >
                <span className="min-w-0 flex-1 truncate text-body-sm">
                  <span className="font-medium text-ink">{suggestion.title}</span>
                  <span className="text-mute"> · {suggestion.artist}</span>
                </span>
                {suggestion.year ? (
                  <span className="tabular shrink-0 text-caption text-mute">{suggestion.year}</span>
                ) : null}
              </li>
            ))
          )}
        </ul>
      ) : null}
    </div>
  );
}
