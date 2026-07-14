// Instagram public-media resolver.
//
// Given a public post / reel / IGTV URL, this returns the direct CDN URLs for
// the underlying photo(s) and video(s) so they can be downloaded. It uses only
// public, no-login endpoints:
//
//   1. The mobile web API  /api/v1/media/{id}/info/  (needs the public
//      `x-ig-app-id`). Richest response — handles carousels and video reliably.
//   2. The embed page      /p/{shortcode}/embed/captioned/  as a fallback.
//
// Instagram aggressively rate-limits / blocks datacenter IPs and changes these
// surfaces often, so callers must handle the "could not resolve" case
// gracefully. Nothing here bypasses privacy: private accounts return nothing.

export type IgMediaItem = {
  type: "image" | "video";
  /** Direct CDN URL of the full-resolution file. */
  url: string;
  /** Poster/thumbnail (for videos, or a lower-res image preview). */
  thumbnail?: string;
  width?: number;
  height?: number;
};

export type IgResult = {
  shortcode: string;
  author?: { username?: string; fullName?: string; avatar?: string };
  caption?: string;
  items: IgMediaItem[];
};

const DESKTOP_UA =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 " +
  "(KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36";

// Public web app id used by instagram.com itself for anonymous GraphQL/API hits.
const IG_APP_ID = "936619743392459";

const SHORTCODE_ALPHABET =
  "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_";

/**
 * Extract the shortcode from any Instagram post/reel/tv URL.
 * Supports /p/, /reel/, /reels/, /tv/ and optional trailing segments / query.
 */
export function extractShortcode(input: string): string | null {
  if (!input) return null;
  const trimmed = input.trim();
  // Bare shortcode pasted directly.
  if (/^[A-Za-z0-9_-]{5,20}$/.test(trimmed) && !trimmed.includes("/")) {
    return trimmed;
  }
  let url: URL;
  try {
    url = new URL(trimmed.startsWith("http") ? trimmed : `https://${trimmed}`);
  } catch {
    return null;
  }
  if (!/(^|\.)instagram\.com$/.test(url.hostname)) return null;
  const m = url.pathname.match(/\/(?:p|reel|reels|tv)\/([A-Za-z0-9_-]+)/);
  return m ? m[1] : null;
}

/** Convert an Instagram shortcode to its numeric media id (pk). */
function shortcodeToMediaId(shortcode: string): string | null {
  let id = BigInt(0);
  const base = BigInt(64);
  for (const ch of shortcode) {
    const value = SHORTCODE_ALPHABET.indexOf(ch);
    if (value === -1) return null;
    id = id * base + BigInt(value);
  }
  return id.toString();
}

/** Whitelist of hosts we are willing to proxy a download from. */
export function isInstagramCdnHost(hostname: string): boolean {
  return (
    hostname === "cdninstagram.com" ||
    hostname === "fbcdn.net" ||
    hostname.endsWith(".cdninstagram.com") ||
    hostname.endsWith(".fbcdn.net")
  );
}

/* -------------------------------------------------------------------------- */
/* Method 1: mobile web media info API                                        */
/* -------------------------------------------------------------------------- */

type Candidate = { url: string; width?: number; height?: number };

function bestCandidate(candidates?: Candidate[]): Candidate | undefined {
  if (!candidates?.length) return undefined;
  return candidates.reduce((a, b) => ((b.width ?? 0) > (a.width ?? 0) ? b : a));
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function itemToMedia(node: any): IgMediaItem | null {
  const image = bestCandidate(node?.image_versions2?.candidates);
  if (node?.media_type === 2 && Array.isArray(node?.video_versions)) {
    const video = bestCandidate(node.video_versions);
    if (!video?.url) return null;
    return {
      type: "video",
      url: video.url,
      thumbnail: image?.url,
      width: video.width,
      height: video.height,
    };
  }
  if (!image?.url) return null;
  return { type: "image", url: image.url, width: image.width, height: image.height };
}

async function fetchViaApi(shortcode: string): Promise<IgResult | null> {
  const mediaId = shortcodeToMediaId(shortcode);
  if (!mediaId) return null;
  const res = await fetch(
    `https://www.instagram.com/api/v1/media/${mediaId}/info/`,
    {
      headers: {
        "User-Agent": DESKTOP_UA,
        "x-ig-app-id": IG_APP_ID,
        "Accept-Language": "en-US,en;q=0.9",
        Referer: `https://www.instagram.com/p/${shortcode}/`,
      },
      cache: "no-store",
    },
  );
  if (!res.ok) return null;
  const data = await res.json().catch(() => null);
  const post = data?.items?.[0];
  if (!post) return null;

  let items: IgMediaItem[] = [];
  if (post.media_type === 8 && Array.isArray(post.carousel_media)) {
    items = post.carousel_media
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .map((child: any) => itemToMedia(child))
      .filter(Boolean) as IgMediaItem[];
  } else {
    const single = itemToMedia(post);
    if (single) items = [single];
  }
  if (!items.length) return null;

  return {
    shortcode,
    author: {
      username: post.user?.username,
      fullName: post.user?.full_name,
      avatar: post.user?.profile_pic_url,
    },
    caption: post.caption?.text,
    items,
  };
}

/* -------------------------------------------------------------------------- */
/* Method 2: embed page scrape                                                */
/* -------------------------------------------------------------------------- */

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function gqlNodeToMedia(node: any): IgMediaItem | null {
  if (!node) return null;
  if (node.is_video && node.video_url) {
    return { type: "video", url: node.video_url, thumbnail: node.display_url };
  }
  const resources: Candidate[] = (node.display_resources ?? []).map(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (r: any) => ({ url: r.src, width: r.config_width, height: r.config_height }),
  );
  const best = bestCandidate(resources);
  const url = best?.url ?? node.display_url;
  if (!url) return null;
  return { type: "image", url, width: best?.width, height: best?.height };
}

async function fetchViaEmbed(shortcode: string): Promise<IgResult | null> {
  const res = await fetch(
    `https://www.instagram.com/p/${shortcode}/embed/captioned/`,
    {
      headers: {
        "User-Agent": DESKTOP_UA,
        "Accept-Language": "en-US,en;q=0.9",
      },
      cache: "no-store",
    },
  );
  if (!res.ok) return null;
  const html = await res.text();

  // The embed HTML carries a JSON blob under "contextJSON" (double-escaped).
  const ctx = html.match(/"contextJSON":\s*"((?:\\.|[^"\\])*)"/);
  if (ctx) {
    try {
      const jsonText = JSON.parse(`"${ctx[1]}"`) as string;
      const parsed = JSON.parse(jsonText);
      const media = parsed?.gql_data?.shortcode_media;
      if (media) {
        let items: IgMediaItem[] = [];
        const children = media.edge_sidecar_to_children?.edges;
        if (Array.isArray(children) && children.length) {
          items = children
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            .map((e: any) => gqlNodeToMedia(e.node))
            .filter(Boolean) as IgMediaItem[];
        } else {
          const single = gqlNodeToMedia(media);
          if (single) items = [single];
        }
        if (items.length) {
          return {
            shortcode,
            author: {
              username: media.owner?.username,
              fullName: media.owner?.full_name,
              avatar: media.owner?.profile_pic_url,
            },
            caption: media.edge_media_to_caption?.edges?.[0]?.node?.text,
            items,
          };
        }
      }
    } catch {
      // fall through to the plain-image heuristic below
    }
  }

  // Last resort: a public single image is present as an <img> in the markup.
  const img = html.match(/class="EmbeddedMediaImage"[^>]*src="([^"]+)"/);
  if (img) {
    const url = img[1].replace(/&amp;/g, "&");
    return { shortcode, items: [{ type: "image", url }] };
  }
  return null;
}

/* -------------------------------------------------------------------------- */

export class InstagramError extends Error {
  constructor(
    message: string,
    public readonly code:
      | "invalid_url"
      | "not_found"
      | "private_or_blocked",
  ) {
    super(message);
    this.name = "InstagramError";
  }
}

/** Resolve any public Instagram post/reel/tv URL to its downloadable media. */
export async function resolveInstagram(input: string): Promise<IgResult> {
  const shortcode = extractShortcode(input);
  if (!shortcode) {
    throw new InstagramError(
      "That doesn't look like an Instagram post, reel or IGTV link.",
      "invalid_url",
    );
  }

  const methods = [fetchViaApi, fetchViaEmbed];
  for (const method of methods) {
    try {
      const result = await method(shortcode);
      if (result?.items.length) return result;
    } catch {
      // try the next method
    }
  }

  throw new InstagramError(
    "Could not fetch this post. It may be private, deleted, or Instagram is " +
      "temporarily blocking automated requests. Try again in a moment.",
    "private_or_blocked",
  );
}
