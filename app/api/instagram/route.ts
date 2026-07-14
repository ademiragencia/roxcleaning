import { type NextRequest, NextResponse } from "next/server";
import { InstagramError, resolveInstagram } from "@/lib/instagram";

// These handlers hit Instagram on demand — never prerender or cache.
export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 30;

async function handle(url: string | null) {
  if (!url) {
    return NextResponse.json(
      { error: "Cole o link de um post, reel ou vídeo do Instagram." },
      { status: 400 },
    );
  }
  try {
    const result = await resolveInstagram(url);
    return NextResponse.json(result, {
      headers: { "Cache-Control": "no-store" },
    });
  } catch (err) {
    if (err instanceof InstagramError) {
      const status = err.code === "invalid_url" ? 400 : 404;
      const message =
        err.code === "invalid_url"
          ? "Esse link não parece ser de um post, reel ou vídeo do Instagram."
          : "Não foi possível obter esta mídia. O perfil pode ser privado, o post foi removido, ou o Instagram está bloqueando o acesso automático no momento. Tente novamente em instantes.";
      return NextResponse.json({ error: message }, { status });
    }
    return NextResponse.json(
      { error: "Ocorreu um erro inesperado. Tente novamente." },
      { status: 500 },
    );
  }
}

export async function GET(request: NextRequest) {
  return handle(request.nextUrl.searchParams.get("url"));
}

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);
  return handle(typeof body?.url === "string" ? body.url : null);
}
