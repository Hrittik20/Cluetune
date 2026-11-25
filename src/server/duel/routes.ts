import type { WorkerEnv } from "cloudflare:workers";
import { matchmakerStub, ROOM_ID_PATTERN, roomStub } from "./stubs";

/**
 * Duel HTTP and websocket routes. Handled in the worker entry ahead of Astro
 * because websocket upgrades have to reach the Durable Objects untouched.
 * Returns null for anything that isn't a Duel route.
 */
export async function routeDuel(request: Request, env: WorkerEnv, url: URL): Promise<Response | null> {
  const path = url.pathname;
  if (!path.startsWith("/api/duel/")) return null;

  const isUpgrade = request.headers.get("upgrade") === "websocket";
  if (isUpgrade && !sameOrigin(request, url)) return new Response("Forbidden.", { status: 403 });

  const room = path.match(/^\/api\/duel\/room\/([^/]+)$/);
  if (room) {
    if (!isUpgrade || !ROOM_ID_PATTERN.test(room[1]!)) return notFound();
    return roomStub(env, room[1]!).fetch(request);
  }

  if (path === "/api/duel/queue") {
    if (!isUpgrade) return notFound();
    return matchmakerStub(env).fetch(request);
  }

  if (path === "/api/duel/rooms" && request.method === "POST") {
    const ip = request.headers.get("cf-connecting-ip") ?? "local";
    const allowed = (await env.RESULT_LIMITER?.limit({ key: `duel-room:${ip}` }))?.success ?? true;
    if (!allowed) return json({ error: "Too many rooms. Try again in a minute." }, 429);
    return json(await matchmakerStub(env).createRoom());
  }

  const code = path.match(/^\/api\/duel\/rooms\/([A-Za-z]{4})$/);
  if (code && request.method === "GET") {
    const roomId = await matchmakerStub(env).lookup(code[1]!);
    return roomId ? json({ roomId }) : json({ error: "No room with that code." }, 404);
  }

  const audio = path.match(/^\/api\/duel\/audio\/([^/]+)\/([a-f0-9]{32})$/);
  if (audio && request.method === "GET") {
    if (!ROOM_ID_PATTERN.test(audio[1]!)) return notFound();
    return streamAudio(request, await roomStub(env, audio[1]!).audioSource(audio[2]!));
  }

  return notFound();
}

/** Streams the preview without ever exposing its provider URL to the client. */
async function streamAudio(request: Request, previewUrl: string | null): Promise<Response> {
  if (!previewUrl) return notFound();

  const range = request.headers.get("range");
  const upstream = await fetch(previewUrl, range ? { headers: { range } } : undefined);
  if (!upstream.ok && upstream.status !== 206) return new Response("Audio unavailable.", { status: 502 });

  const headers = new Headers({ "cache-control": "private, max-age=3600" });
  for (const name of ["content-type", "content-length", "content-range", "accept-ranges"]) {
    const value = upstream.headers.get(name);
    if (value) headers.set(name, value);
  }
  return new Response(upstream.body, { status: upstream.status, headers });
}

function sameOrigin(request: Request, url: URL): boolean {
  const origin = request.headers.get("origin");
  if (!origin) return true;
  try {
    return new URL(origin).host === url.host;
  } catch {
    return false;
  }
}

function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "content-type": "application/json; charset=utf-8", "cache-control": "no-store" },
  });
}

function notFound(): Response {
  return new Response("Not found.", { status: 404 });
}
