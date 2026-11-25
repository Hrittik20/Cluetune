import { env } from "cloudflare:workers";

/**
 * Shared gate for `/admin/duel` and `/api/admin/duel`. Missing or wrong token
 * must look like a 404 so the route cannot be discovered by probing.
 */
export function authorizeAdmin(request: Request, url: URL): boolean {
  const expected = env.ADMIN_TOKEN;
  if (!expected) return false;
  const provided = request.headers.get("x-admin-token") ?? url.searchParams.get("token") ?? "";
  return timingSafeEqual(provided, expected);
}

function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let mismatch = 0;
  for (let i = 0; i < a.length; i++) mismatch |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return mismatch === 0;
}
