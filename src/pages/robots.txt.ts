import type { APIRoute } from "astro";
import { SITE } from "../consts";

export const prerender = true;

export const GET: APIRoute = () => {
  const sitemap = new URL("/sitemap.xml", SITE.url).href;
  const body = `User-agent: *
Allow: /
Disallow: /challenge/
Disallow: /og-card
Disallow: /api/

Sitemap: ${sitemap}
`;

  return new Response(body, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=3600",
    },
  });
};
