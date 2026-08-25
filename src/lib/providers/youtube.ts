import { TtlCache, fetchWithTimeout } from "./cache";
import { hasYouTubeKey, serverEnv } from "./env";

/**
 * YouTube Data API v3 lookup, used to attach an embeddable video to a track.
 *
 * Scope note, because this one has a real compliance edge:
 *
 * The IFrame Player API terms require the player to be visible, at least
 * 200x200px, and not obscured. A guess-the-song clip needs the opposite — the
 * player has to be hidden or the title card gives the answer away instantly.
 * Those two requirements cannot both be satisfied, and hidden-player Heardle
 * clones are exactly what got the originals taken down.
 *
 * So YouTube is wired up for the REVEAL step only: once the round is over and
 * the answer is on screen, the full track plays in a visible, compliant,
 * fully-branded embed. Clip audio comes from the licensed preview providers.
 *
 * `ALLOW_YOUTUBE_CLIP_FALLBACK` exists as an explicit, off-by-default escape
 * hatch. Turning it on is a legal decision, not an engineering one.
 */

const SEARCH_URL = "https://www.googleapis.com/youtube/v3/search";

export interface YouTubeMatch {
  videoId: string;
  title: string;
  channel: string;
  thumbnailUrl?: string;
}

const cache = new TtlCache<YouTubeMatch | null>(24 * 60 * 60_000);

export function youtubeClipFallbackEnabled(): boolean {
  return serverEnv("ALLOW_YOUTUBE_CLIP_FALLBACK") === "true";
}

export async function findYouTubeVideo(title: string, artist: string): Promise<YouTubeMatch | null> {
  if (!hasYouTubeKey()) return null;

  const key = serverEnv("YOUTUBE_API_KEY")!;
  const query = `${artist} ${title} official audio`;

  return cache.wrap(query.toLowerCase(), async () => {
    const url =
      `${SEARCH_URL}?part=snippet&type=video&maxResults=1&videoEmbeddable=true` +
      `&videoCategoryId=10&q=${encodeURIComponent(query)}&key=${key}`;

    try {
      const response = await fetchWithTimeout(url);
      if (!response.ok) return null;

      const data = (await response.json()) as {
        items?: {
          id?: { videoId?: string };
          snippet?: { title?: string; channelTitle?: string; thumbnails?: { high?: { url: string } } };
        }[];
      };

      const item = data.items?.[0];
      if (!item?.id?.videoId) return null;

      return {
        videoId: item.id.videoId,
        title: item.snippet?.title ?? "",
        channel: item.snippet?.channelTitle ?? "",
        thumbnailUrl: item.snippet?.thumbnails?.high?.url,
      };
    } catch {
      return null;
    }
  });
}

export function youtubeWatchUrl(videoId: string): string {
  return `https://www.youtube.com/watch?v=${videoId}`;
}

export function youtubeEmbedUrl(videoId: string): string {
  const params = new URLSearchParams({
    rel: "0",
    modestbranding: "1",
    playsinline: "1",
  });
  return `https://www.youtube-nocookie.com/embed/${videoId}?${params}`;
}
