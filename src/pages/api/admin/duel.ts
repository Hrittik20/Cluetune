import type { APIRoute } from "astro";
import { env } from "cloudflare:workers";
import { authorizeAdmin } from "../../../server/duel/adminAuth";
import { matchmakerStub } from "../../../server/duel/stubs";

export const prerender = false;

/**
 * Admin-only Duel stats. Wrong or missing token returns 404 so the endpoint
 * is indistinguishable from a missing route. Set ADMIN_TOKEN with
 * `wrangler secret put ADMIN_TOKEN` (or `.dev.vars` locally).
 */
export const GET: APIRoute = async ({ request, url }) => {
  if (!authorizeAdmin(request, url)) return new Response("Not found.", { status: 404 });

  try {
    const stats = await matchmakerStub(env).stats();
    return new Response(JSON.stringify(stats), {
      headers: {
        "content-type": "application/json; charset=utf-8",
        "cache-control": "no-store",
      },
    });
  } catch {
    return new Response("Not found.", { status: 404 });
  }
};
