// Instagram public-media resolver.
//
// Given a public post / reel / IGTV URL, this returns the direct CDN URLs for
// the underlying photo(s) and video(s) so they can be downloaded. It only ever
// touches public, no-login surfaces. Private accounts return nothing.
//
// The hard part is that Instagram rate-limits / blocks datacenter IPs (which is
// what serverless hosts like Vercel use). To cope, each strategy is tried both
// directly and through a keyless "reader" proxy that fetches from a different
// IP pool, which is usually enough to get past the block. For guaranteed
// reliability you can also point IG_RESOLVER_URL at a cobalt-compatible API.

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

// Public web app id used by instagram.com itself for anonymous API hits.
const IG_APP_ID = "936619743392459";

const SHORTCODE_ALPHABET =
  "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_";

// Optional external resolver (cobalt-compatible: POST {url} -> {url|picker}).
// Set this in the Vercel project env for rock-solid reliability.
const IG_RESOLVER_URL = process.env.IG_RESOLVER_URL;
const IG_RESOLVER_KEY = process.env.IG_RESOLVER_KEY;

/**
 * Extract the shortcode from any Instagram post/reel/tv URL.
 * Supports /p/, /reel/, /reels/, /tv/ and optional trailing segments / query.
 */
export function extractShortcode(input: string): string | null {
  if (!input) return null;
  const trimmed = input.trim();
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
/* Fetch helpers (direct + reader-proxy fallbacks to dodge IP blocks)         */
/* -------------------------------------------------------------------------- */

// Reader proxies fetch the target from their own (non-datacenter) IPs and hand
// us back the raw response, which usually gets past Instagram's block on
// serverless IPs. Tried in order until one yields usable data.
function proxied(targetUrl: string): { url: string; headers?: Record<string, string> }[] {
  return [
    { url: targetUrl }, // direct first (fast path when not blocked)
    { url: `https://r.jina.ai/${targetUrl}`, headers: { "x-respond-with": "html" } },
    { url: `https://api.allorigins.win/raw?url=${encodeURIComponent(targetUrl)}` },
    { url: `https://corsproxy.io/?url=${encodeURIComponent(targetUrl)}` },
  ];
}

async function fetchText(targetUrl: string, extra?: Record<string, string>): Promise<string | null> {
  for (const attempt of proxied(targetUrl)) {
    try {
      const res = await fetch(attempt.url, {
        headers: {
          "User-Agent": DESKTOP_UA,
          "Accept-Language": "en-US,en;q=0.9",
          ...extra,
          ...attempt.headers,
        },
        cache: "no-store",
        signal: AbortSignal.timeout(15000),
      });
      if (!res.ok) continue;
      const text = await res.text();
      if (text && text.length > 100) return text;
    } catch {
      // try the next proxy
    }
  }
  return null;
}

/* -------------------------------------------------------------------------- */
/* Strategy 1: mobile web media info API (richest — carousels + video)        */
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
    return { type: "video", url: video.url, thumbnail: image?.url, width: video.width, height: video.height };
  }
  if (!image?.url) return null;
  return { type: "image", url: image.url, width: image.width, height: image.height };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function apiPostToResult(post: any, shortcode: string): IgResult | null {
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

async function fetchViaApi(shortcode: string): Promise<IgResult | null> {
  const mediaId = shortcodeToMediaId(shortcode);
  if (!mediaId) return null;
  const text = await fetchText(
    `https://www.instagram.com/api/v1/media/${mediaId}/info/`,
    {
      "x-ig-app-id": IG_APP_ID,
      "X-IG-WWW-Claim": "0",
      Accept: "*/*",
      Referer: `https://www.instagram.com/p/${shortcode}/`,
    },
  );
  if (!text) return null;
  try {
    const data = JSON.parse(text);
    const post = data?.items?.[0];
    if (post) return apiPostToResult(post, shortcode);
  } catch {
    // not JSON (proxy returned an HTML error page) — fall through
  }
  return null;
}

/* -------------------------------------------------------------------------- */
/* Strategy 2: embed page scrape (works from more IPs than the API)           */
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

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function gqlMediaToResult(media: any, shortcode: string): IgResult | null {
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
  if (!items.length) return null;
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

function parseEmbedHtml(html: string, shortcode: string): IgResult | null {
  // 1) The embed HTML carries a JSON blob under "contextJSON" (double-escaped).
  const ctx = html.match(/"contextJSON":\s*"((?:\\.|[^"\\])*)"/);
  if (ctx) {
    try {
      const jsonText = JSON.parse(`"${ctx[1]}"`) as string;
      const parsed = JSON.parse(jsonText);
      const media = parsed?.gql_data?.shortcode_media ?? parsed?.shortcode_media;
      if (media) {
        const result = gqlMediaToResult(media, shortcode);
        if (result) return result;
      }
    } catch {
      // fall through
    }
  }

  // 2) Newer shape: window.__additionalDataLoaded('extra', { ... })
  const add = html.match(/__additionalDataLoaded\([^,]+,\s*({[\s\S]+?})\);/);
  if (add) {
    try {
      const parsed = JSON.parse(add[1]);
      const media = parsed?.graphql?.shortcode_media ?? parsed?.shortcode_media;
      if (media) {
        const result = gqlMediaToResult(media, shortcode);
        if (result) return result;
      }
    } catch {
      // fall through
    }
  }

  // 3) Last resort: pull raw media URLs straight out of the markup.
  const videoMatch = html.match(/"video_url":"([^"]+)"/);
  if (videoMatch) {
    const url = JSON.parse(`"${videoMatch[1]}"`);
    const poster = html.match(/"display_url":"([^"]+)"/);
    return {
      shortcode,
      items: [
        { type: "video", url, thumbnail: poster ? JSON.parse(`"${poster[1]}"`) : undefined },
      ],
    };
  }
  const img = html.match(/class="EmbeddedMediaImage"[^>]*src="([^"]+)"/);
  if (img) {
    return { shortcode, items: [{ type: "image", url: img[1].replace(/&amp;/g, "&") }] };
  }
  const disp = html.match(/"display_url":"([^"]+)"/);
  if (disp) {
    return { shortcode, items: [{ type: "image", url: JSON.parse(`"${disp[1]}"`) }] };
  }
  return null;
}

async function fetchViaEmbed(shortcode: string): Promise<IgResult | null> {
  const html = await fetchText(
    `https://www.instagram.com/p/${shortcode}/embed/captioned/`,
  );
  if (!html) return null;
  return parseEmbedHtml(html, shortcode);
}

/* -------------------------------------------------------------------------- */
/* Strategy 3: optional external cobalt-compatible resolver                   */
/* -------------------------------------------------------------------------- */

async function fetchViaResolver(originalUrl: string, shortcode: string): Promise<IgResult | null> {
  if (!IG_RESOLVER_URL) return null;
  try {
    const res = await fetch(IG_RESOLVER_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        ...(IG_RESOLVER_KEY ? { Authorization: `Api-Key ${IG_RESOLVER_KEY}` } : {}),
      },
      body: JSON.stringify({ url: originalUrl }),
      cache: "no-store",
      signal: AbortSignal.timeout(20000),
    });
    if (!res.ok) return null;
    const data = await res.json();
    // cobalt: { status, url } | { status: "picker", picker: [{type,url,thumb}] }
    const items: IgMediaItem[] = [];
    if (Array.isArray(data?.picker)) {
      for (const p of data.picker) {
        items.push({ type: p.type === "video" ? "video" : "image", url: p.url, thumbnail: p.thumb });
      }
    } else if (typeof data?.url === "string") {
      const isVideo = /\.mp4|video/i.test(data.url) || data?.status === "redirect";
      items.push({ type: isVideo ? "video" : "image", url: data.url });
    } else if (Array.isArray(data?.items)) {
      // our own shape passthrough
      return { shortcode, ...data } as IgResult;
    }
    if (items.length) return { shortcode, items };
  } catch {
    // ignore
  }
  return null;
}

/* -------------------------------------------------------------------------- */

export class InstagramError extends Error {
  constructor(
    message: string,
    public readonly code: "invalid_url" | "not_found" | "private_or_blocked",
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
  const normalizedUrl = `https://www.instagram.com/p/${shortcode}/`;

  const strategies: Array<() => Promise<IgResult | null>> = [
    () => fetchViaResolver(input.startsWith("http") ? input : normalizedUrl, shortcode),
    () => fetchViaApi(shortcode),
    () => fetchViaEmbed(shortcode),
  ];

  for (const run of strategies) {
    try {
      const result = await run();
      if (result?.items.length) return result;
    } catch {
      // try the next strategy
    }
  }

  throw new InstagramError(
    "Could not fetch this post. It may be private, deleted, or Instagram is " +
      "temporarily blocking automated requests. Try again in a moment.",
    "private_or_blocked",
  );
}
