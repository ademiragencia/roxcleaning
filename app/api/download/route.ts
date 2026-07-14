import { type NextRequest, NextResponse } from "next/server";
import { isInstagramCdnHost } from "@/lib/instagram";

// Proxies a single Instagram-CDN file back to the browser as an attachment.
// This solves three problems at once: the CDN blocks cross-origin fetches,
// direct links open in a new tab instead of downloading, and the file name
// would otherwise be an opaque hash.
export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

const DESKTOP_UA =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 " +
  "(KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36";

export async function GET(request: NextRequest) {
  const target = request.nextUrl.searchParams.get("url");
  const filename =
    request.nextUrl.searchParams.get("filename") || "instagram-download";

  if (!target) {
    return NextResponse.json({ error: "Missing url" }, { status: 400 });
  }

  let parsed: URL;
  try {
    parsed = new URL(target);
  } catch {
    return NextResponse.json({ error: "Invalid url" }, { status: 400 });
  }

  // Hard SSRF guard: only ever fetch from Instagram's own CDN over https.
  if (parsed.protocol !== "https:" || !isInstagramCdnHost(parsed.hostname)) {
    return NextResponse.json({ error: "Host not allowed" }, { status: 403 });
  }

  const upstream = await fetch(parsed.toString(), {
    headers: { "User-Agent": DESKTOP_UA, Referer: "https://www.instagram.com/" },
    cache: "no-store",
  });

  if (!upstream.ok || !upstream.body) {
    return NextResponse.json(
      { error: "Could not fetch the file" },
      { status: 502 },
    );
  }

  const contentType =
    upstream.headers.get("content-type") || "application/octet-stream";
  const safeName = filename.replace(/[^\w.\-]+/g, "_").slice(0, 120);

  const headers = new Headers({
    "Content-Type": contentType,
    "Content-Disposition": `attachment; filename="${safeName}"`,
    "Cache-Control": "no-store",
  });
  const length = upstream.headers.get("content-length");
  if (length) headers.set("Content-Length", length);

  return new NextResponse(upstream.body, { status: 200, headers });
}
