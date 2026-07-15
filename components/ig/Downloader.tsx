"use client";

import { useState } from "react";
import type { IgResult } from "@/lib/instagram";

function downloadHref(url: string, filename: string): string {
  return `/api/download?url=${encodeURIComponent(url)}&filename=${encodeURIComponent(
    filename,
  )}`;
}

function fileName(result: IgResult, index: number, type: "image" | "video"): string {
  const user = (result.author?.username || "instagram").replace(/[^\w.-]+/g, "");
  const ext = type === "video" ? "mp4" : "jpg";
  const suffix = result.items.length > 1 ? `_${index + 1}` : "";
  return `${user}_${result.shortcode}${suffix}.${ext}`;
}

function SpinnerIcon({ className = "" }: { className?: string }) {
  return (
    <svg className={`animate-spin ${className}`} viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeOpacity="0.25" strokeWidth="4" />
      <path d="M12 2a10 10 0 0 1 10 10" stroke="currentColor" strokeWidth="4" strokeLinecap="round" />
    </svg>
  );
}

function DownloadIcon({ className = "" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 3v12m0 0l-4-4m4 4l4-4" />
      <path d="M4 17v2a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-2" />
    </svg>
  );
}

function PlayIcon({ className = "" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M8 5.14v13.72a1 1 0 0 0 1.5.86l11-6.86a1 1 0 0 0 0-1.72l-11-6.86A1 1 0 0 0 8 5.14z" />
    </svg>
  );
}

export function Downloader() {
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<IgResult | null>(null);

  async function handleSubmit(e?: React.FormEvent) {
    e?.preventDefault();
    const value = url.trim();
    if (!value || loading) return;
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const res = await fetch("/api/instagram", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: value }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data?.error || "Não foi possível baixar. Tente novamente.");
        return;
      }
      setResult(data as IgResult);
    } catch {
      setError("Falha de conexão. Verifique sua internet e tente novamente.");
    } finally {
      setLoading(false);
    }
  }

  async function handlePaste() {
    try {
      const text = await navigator.clipboard.readText();
      if (text) setUrl(text.trim());
    } catch {
      // Clipboard permission denied — user can paste manually.
    }
  }

  return (
    <div className="w-full">
      <form
        onSubmit={handleSubmit}
        className="flex flex-col gap-3 rounded-2xl bg-white p-3 shadow-2xl shadow-purple-900/20 sm:flex-row sm:items-center sm:rounded-full sm:p-2"
      >
        <div className="flex flex-1 items-center gap-2 rounded-full px-4">
          <input
            type="text"
            inputMode="url"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="Cole o link do Instagram aqui…"
            aria-label="Link do Instagram"
            className="w-full bg-transparent py-3 text-gray-800 placeholder:text-gray-400 focus:outline-none"
          />
          <button
            type="button"
            onClick={handlePaste}
            className="shrink-0 rounded-full px-3 py-1.5 text-sm font-semibold text-purple-600 transition-colors hover:bg-purple-50"
          >
            Colar
          </button>
        </div>
        <button
          type="submit"
          disabled={loading}
          className="inline-flex items-center justify-center gap-2 rounded-full bg-gradient-to-r from-purple-600 via-pink-500 to-orange-400 px-7 py-3.5 font-semibold text-white shadow-lg transition-transform hover:scale-[1.02] disabled:cursor-not-allowed disabled:opacity-70"
        >
          {loading ? (
            <>
              <SpinnerIcon className="h-5 w-5" />
              Buscando…
            </>
          ) : (
            <>
              <DownloadIcon className="h-5 w-5" />
              Baixar
            </>
          )}
        </button>
      </form>

      <p className="mt-3 text-center text-sm text-white/80">
        Exemplo: https://www.instagram.com/reel/Cxyz…/ — cole e clique em Baixar
      </p>

      {error && (
        <div
          role="alert"
          className="mx-auto mt-6 max-w-xl rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-700"
        >
          {error}
        </div>
      )}

      {result && <Result result={result} />}
    </div>
  );
}

function Result({ result }: { result: IgResult }) {
  return (
    <div className="mx-auto mt-8 max-w-2xl rounded-3xl bg-white p-5 text-left shadow-xl shadow-purple-900/10 sm:p-7">
      {(result.author?.username || result.caption) && (
        <div className="mb-5 flex items-center gap-3 border-b border-gray-100 pb-5">
          {result.author?.avatar && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={downloadHref(result.author.avatar, "avatar.jpg")}
              alt=""
              className="h-11 w-11 rounded-full object-cover"
            />
          )}
          <div className="min-w-0">
            {result.author?.username && (
              <p className="font-semibold text-gray-900">@{result.author.username}</p>
            )}
            {result.caption && (
              <p className="line-clamp-2 text-sm text-gray-500">{result.caption}</p>
            )}
          </div>
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2">
        {result.items.map((item, i) => (
          <div
            key={`${item.url}-${i}`}
            className="overflow-hidden rounded-2xl border border-gray-100 bg-gray-50"
          >
            <div className="relative aspect-square bg-gray-100">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={downloadHref(item.thumbnail || item.url, "preview.jpg")}
                alt={`Mídia ${i + 1}`}
                className="h-full w-full object-cover"
                loading="lazy"
              />
              <span className="absolute left-2 top-2 rounded-full bg-black/60 px-2.5 py-1 text-xs font-medium text-white">
                {item.type === "video" ? "Vídeo" : "Foto"}
              </span>
              {item.type === "video" && (
                <span className="absolute inset-0 flex items-center justify-center">
                  <span className="flex h-12 w-12 items-center justify-center rounded-full bg-black/50 text-white backdrop-blur-sm">
                    <PlayIcon className="h-5 w-5 pl-0.5" />
                  </span>
                </span>
              )}
            </div>
            <a
              href={downloadHref(item.url, fileName(result, i, item.type))}
              className="flex items-center justify-center gap-2 bg-gradient-to-r from-purple-600 via-pink-500 to-orange-400 py-3 font-semibold text-white transition-opacity hover:opacity-95"
            >
              <DownloadIcon className="h-4 w-4" />
              Baixar {item.type === "video" ? "vídeo" : "foto"}
              {result.items.length > 1 ? ` ${i + 1}` : ""}
            </a>
          </div>
        ))}
      </div>
    </div>
  );
}
