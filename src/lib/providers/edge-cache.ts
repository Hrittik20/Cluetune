/**
 * Cloudflare's per-colo HTTP cache. Unlike `TtlCache` it is shared by every
 * isolate in a colo, so one successful provider lookup serves everyone nearby
 * instead of each cold isolate hitting Deezer again. A no-op outside Workers
 * and on workers.dev, where the Cache API does not persist.
 */
const ORIGIN = "https://edge-cache.cluetune.com";

function edgeCache(): Cache | null {
  const store = (globalThis as { caches?: CacheStorage & { default?: Cache } }).caches;
  return store?.default ?? null;
}

function keyFor(key: string): Request {
  return new Request(`${ORIGIN}/${key}`);
}

export async function readEdge(key: string): Promise<Response | null> {
  const cache = edgeCache();
  if (!cache) return null;
  try {
    return (await cache.match(keyFor(key))) ?? null;
  } catch {
    return null;
  }
}

/** Stores a copy of `response` for `ttlSeconds` and returns a response the caller can still send. */
export async function writeEdge(key: string, response: Response, ttlSeconds: number): Promise<Response> {
  const cache = edgeCache();
  if (!cache || !response.ok) return response;

  const stored = new Response(response.clone().body, response);
  stored.headers.set("cache-control", `public, max-age=${ttlSeconds}`);
  try {
    await cache.put(keyFor(key), stored);
  } catch {
    // Caching is an optimisation; never fail the request over it.
  }
  return response;
}
