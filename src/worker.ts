import { handle } from "@astrojs/cloudflare/handler";
import type { ExecutionContext, WorkerEnv } from "cloudflare:workers";
import { DUEL_ENABLED } from "./consts";
import { routeDuel } from "./server/duel/routes";

export { DuelRoom } from "./server/duel/DuelRoom";
export { Matchmaker } from "./server/duel/Matchmaker";

const DUEL_PATH = /^\/(?:duel(?:\/|$)|admin\/duel\/?$|api\/duel\/|api\/admin\/duel\/?$)/;

export default {
  async fetch(request: Request, env: WorkerEnv, ctx: ExecutionContext) {
    const url = new URL(request.url);
    if (!DUEL_ENABLED) {
      if (DUEL_PATH.test(url.pathname)) return notFound(env, url);
    } else {
      const duel = await routeDuel(request, env, url);
      if (duel) return duel;
    }
    return handle(request, env as never, ctx as never);
  },
};

async function notFound(env: WorkerEnv, url: URL): Promise<Response> {
  const page = await env.ASSETS.fetch(new URL("/404.html", url));
  return new Response(page.body, { status: 404, headers: page.headers });
}
