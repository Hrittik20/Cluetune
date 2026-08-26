import type { APIRoute } from "astro";
import { SITE } from "../consts";
import { GENRE_PACKS } from "../lib/catalog";

export const prerender = true;

/**
 * Public, indexable routes only. Redirects, challenge links, API and error
 * pages stay out so crawlers spend budget on playable URLs.
 */
const PAGES: { path: string; changefreq: string; priority: string }[] = [
  { path: "/", changefreq: "daily", priority: "1.0" },
  { path: "/unlimited", changefreq: "weekly", priority: "0.9" },
  { path: "/sped-up", changefreq: "weekly", priority: "0.8" },
  { path: "/lyrics", changefreq: "weekly", priority: "0.8" },
  { path: "/gauntlet", changefreq: "weekly", priority: "0.8" },
  ...GENRE_PACKS.map((pack) => ({
    path: `/gauntlet/${pack.slug}`,
    changefreq: "monthly",
    priority: "0.5",
  })),
  { path: "/how-to-play", changefreq: "monthly", priority: "0.7" },
  { path: "/about", changefreq: "monthly", priority: "0.6" },
  { path: "/contact", changefreq: "monthly", priority: "0.5" },
  { path: "/privacy", changefreq: "yearly", priority: "0.4" },
  { path: "/terms", changefreq: "yearly", priority: "0.4" },
  { path: "/stats", changefreq: "monthly", priority: "0.3" },
];

export const GET: APIRoute = () => {
  const lastmod = new Date().toISOString().slice(0, 10);
  const urls = PAGES.map((page) => {
    const loc = new URL(page.path, SITE.url).href;
    return `  <url>
    <loc>${loc}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>${page.changefreq}</changefreq>
    <priority>${page.priority}</priority>
  </url>`;
  }).join("\n");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls}
</urlset>
`;

  return new Response(xml, {
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      "Cache-Control": "public, max-age=3600",
    },
  });
};
