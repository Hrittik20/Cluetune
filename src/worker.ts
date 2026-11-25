import { handle } from "@astrojs/cloudflare/handler";
import type { ExecutionContext, WorkerEnv } from "cloudflare:workers";
import { routeDuel } from "./server/duel/routes";

export { DuelRoom } from "./server/duel/DuelRoom";
export { Matchmaker } from "./server/duel/Matchmaker";

export default {
  async fetch(request: Request, env: WorkerEnv, ctx: ExecutionContext) {
    const duel = await routeDuel(request, env, new URL(request.url));
    if (duel) return duel;
    return handle(request, env as never, ctx as never);
  },
};
