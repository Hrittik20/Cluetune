/**
 * Per-instance TTL cache. Serverless means this is a warm-start optimisation,
 * not a shared cache — it exists to keep a single instance from re-querying
 * iTunes for the same track on every request during a burst.
 *
 * Swap for a durable KV store before this sees real traffic.
 */
interface Entry<T> {
  value: T;
  expiresAt: number;
}

export class TtlCache<T> {
  private readonly store = new Map<string, Entry<T>>();

  constructor(
    private readonly ttlMs: number,
    private readonly maxEntries = 500,
  ) {}

  get(key: string): T | undefined {
    const entry = this.store.get(key);
    if (!entry) return undefined;

    if (entry.expiresAt < Date.now()) {
      this.store.delete(key);
      return undefined;
    }

    // Refresh insertion order so the eviction below stays roughly LRU.
    this.store.delete(key);
    this.store.set(key, entry);
    return entry.value;
  }

  set(key: string, value: T): void {
    if (this.store.size >= this.maxEntries) {
      const oldest = this.store.keys().next();
      if (!oldest.done) this.store.delete(oldest.value);
    }
    this.store.set(key, { value, expiresAt: Date.now() + this.ttlMs });
  }

  async wrap(key: string, produce: () => Promise<T>): Promise<T> {
    const hit = this.get(key);
    if (hit !== undefined) return hit;

    const value = await produce();
    this.set(key, value);
    return value;
  }

  /** Like wrap, but skips the cache when `cacheable` is false (provider errors, empty misses). */
  async wrapIf(key: string, produce: () => Promise<T>, cacheable: (value: T) => boolean): Promise<T> {
    const hit = this.get(key);
    if (hit !== undefined) return hit;

    const value = await produce();
    if (cacheable(value)) this.set(key, value);
    return value;
  }
}

/** Fetch with a hard timeout so one slow provider cannot stall the chain. */
export async function fetchWithTimeout(
  url: string,
  init: RequestInit = {},
  timeoutMs = 3500,
): Promise<Response> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const headers = new Headers(init.headers);
    if (!headers.has("User-Agent")) {
      // Workers send no default UA and Apple 403s those. A browser-like UA
      // is what the Search API sees from Vercel/Node.
      headers.set(
        "User-Agent",
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36",
      );
    }
    const response = await fetch(url, { ...init, headers, signal: controller.signal });
    if (!response.ok) console.warn(`provider ${response.status} ${url}`);
    return response;
  } catch (error) {
    console.warn(`provider fail ${url}`);
    throw error;
  } finally {
    clearTimeout(timer);
  }
}
