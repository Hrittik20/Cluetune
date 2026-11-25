import { useEffect, useState } from "react";

export interface DuelAudio {
  /** Blob URLs by round, null until that clip has fully downloaded. */
  sources: (string | null)[];
  loaded: number;
  total: number;
  /** Every clip is local, so a step can start without a network stall. */
  ready: boolean;
  failed: boolean;
}

const EMPTY: DuelAudio = { sources: [], loaded: 0, total: 0, ready: false, failed: false };

/**
 * Downloads every clip of a match before the countdown. Both players then
 * start each step from local memory, which is what keeps "first correct"
 * about ears rather than about whose connection buffered faster. Blob URLs
 * are same-origin, so `useAudioClip` also gets a CORS-clean analyser.
 */
export function useDuelAudio(clips: string[]): DuelAudio {
  const [state, setState] = useState<DuelAudio>(EMPTY);
  const key = clips.join("|");

  useEffect(() => {
    const clips = key ? key.split("|") : [];
    if (!clips.length) {
      setState(EMPTY);
      return;
    }

    const controller = new AbortController();
    const urls: string[] = [];
    const sources: (string | null)[] = clips.map(() => null);
    setState({ sources: [...sources], loaded: 0, total: clips.length, ready: false, failed: false });

    // Rounds in order, so round one is playable first even on a slow line.
    void (async () => {
      let loaded = 0;
      for (const [index, clip] of clips.entries()) {
        try {
          const response = await fetchWithRetry(clip, controller.signal);
          const url = URL.createObjectURL(await response.blob());
          urls.push(url);
          sources[index] = url;
          loaded += 1;
          setState({ sources: [...sources], loaded, total: clips.length, ready: loaded === clips.length, failed: false });
        } catch {
          if (controller.signal.aborted) return;
          // Fall back to streaming that clip rather than blocking the match.
          sources[index] = clip;
          loaded += 1;
          setState({ sources: [...sources], loaded, total: clips.length, ready: loaded === clips.length, failed: true });
        }
      }
    })();

    return () => {
      controller.abort();
      for (const url of urls) URL.revokeObjectURL(url);
    };
  }, [key]);

  return state;
}

async function fetchWithRetry(url: string, signal: AbortSignal, attempts = 2): Promise<Response> {
  let lastError: unknown;
  for (let i = 0; i < attempts; i++) {
    try {
      const response = await fetch(url, { signal });
      if (response.ok) return response;
      lastError = new Error(`HTTP ${response.status}`);
    } catch (error) {
      if (signal.aborted) throw error;
      lastError = error;
    }
  }
  throw lastError;
}
