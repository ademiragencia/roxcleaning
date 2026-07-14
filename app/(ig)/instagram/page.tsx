import type { Metadata } from "next";
import { Downloader } from "@/components/ig/Downloader";

export const metadata: Metadata = {
  title: "Baixar Vídeos do Instagram Online Grátis — Reels, Fotos e Stories",
  description:
    "Baixe vídeos, reels, fotos e IGTV do Instagram em alta qualidade (HD), grátis e sem instalar programas. Cole o link e faça o download no celular ou PC.",
};

/* --------------------------------- Icons --------------------------------- */

function LinkIcon({ className = "" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M10 13a5 5 0 0 0 7.07 0l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
      <path d="M14 11a5 5 0 0 0-7.07 0l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
    </svg>
  );
}
function ClipboardIcon({ className = "" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="8" y="2" width="8" height="4" rx="1" />
      <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
    </svg>
  );
}
function SaveIcon({ className = "" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 3v12m0 0l-4-4m4 4l4-4" />
      <path d="M4 17v2a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-2" />
    </svg>
  );
}
function BoltIcon({ className = "" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M13 2L3 14h7l-1 8 10-12h-7l1-8z" />
    </svg>
  );
}
function ShieldIcon({ className = "" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 3l7 3v5c0 4.5-3 8-7 10-4-2-7-5.5-7-10V6l7-3z" />
      <path d="M9 12l2 2 4-4" />
    </svg>
  );
}
function HdIcon({ className = "" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="5" width="20" height="14" rx="2" />
      <path d="M6 9v6M6 12h3M9 9v6M14 9v6h1.5a2.5 2.5 0 0 0 0-5H14z" />
    </svg>
  );
}
function DeviceIcon({ className = "" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="4" width="14" height="12" rx="1" />
      <rect x="15" y="9" width="6" height="11" rx="1" />
      <path d="M3 20h9" />
    </svg>
  );
}
function FreeIcon({ className = "" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="9" />
      <path d="M15 9.5C15 8 13.5 7.5 12 7.5S9 8.2 9 9.5c0 2.5 6 1.5 6 4 0 1.3-1.3 2-3 2s-3-.7-3-2M12 6v1.5M12 15.5V17" />
    </svg>
  );
}

/* --------------------------------- Data ---------------------------------- */

const MEDIA_TYPES = ["Reels", "Vídeos", "Fotos", "IGTV", "Carrossel"];

const STEPS = [
  {
    icon: LinkIcon,
    title: "Copie o link",
    desc: "Abra o Instagram, toque nos três pontinhos do post, reel ou vídeo e escolha “Copiar link”.",
  },
  {
    icon: ClipboardIcon,
    title: "Cole aqui",
    desc: "Volte para esta página e cole o link no campo acima usando o botão “Colar”.",
  },
  {
    icon: SaveIcon,
    title: "Baixe a mídia",
    desc: "Clique em “Baixar” e salve o vídeo ou a foto em alta qualidade no seu aparelho.",
  },
];

const FEATURES = [
  { icon: HdIcon, title: "Alta qualidade (HD)", desc: "Baixe na melhor resolução que o Instagram disponibiliza, sem perda de qualidade." },
  { icon: FreeIcon, title: "100% grátis", desc: "Downloads ilimitados, sem cadastro, sem login e sem pagar nada." },
  { icon: BoltIcon, title: "Rápido e simples", desc: "É só colar o link e baixar. Todo o processo leva poucos segundos." },
  { icon: DeviceIcon, title: "Funciona em tudo", desc: "Celular Android, iPhone, tablet ou computador — direto pelo navegador." },
  { icon: ShieldIcon, title: "Seguro e privado", desc: "Não salvamos os seus links nem os arquivos baixados nos nossos servidores." },
  { icon: SaveIcon, title: "Fotos e vídeos", desc: "Suporta posts, reels, IGTV e carrosséis com várias fotos e vídeos." },
];

const FAQ = [
  {
    q: "Como baixar vídeos do Instagram?",
    a: "Copie o link do post ou reel no aplicativo do Instagram, cole o link no campo no topo desta página e clique em “Baixar”. O vídeo aparecerá pronto para salvar no seu dispositivo.",
  },
  {
    q: "É grátis? Preciso me cadastrar?",
    a: "Sim, é totalmente grátis e você não precisa criar conta nem fazer login. Basta colar o link e baixar quantas vezes quiser.",
  },
  {
    q: "Dá para baixar fotos e carrosséis?",
    a: "Sim. Além de vídeos e reels, você pode baixar fotos individuais e posts em carrossel — cada foto ou vídeo aparece com o seu próprio botão de download.",
  },
  {
    q: "Funciona no celular (Android e iPhone)?",
    a: "Funciona em qualquer aparelho com navegador. No iPhone, os arquivos são salvos no app Arquivos ou na galeria; no Android, normalmente na pasta Downloads.",
  },
  {
    q: "Consigo baixar de perfis privados?",
    a: "Não. Só é possível baixar mídias de perfis e posts públicos. Conteúdo de contas privadas não fica disponível, respeitando a privacidade dos usuários.",
  },
  {
    q: "A qualidade do vídeo é mantida?",
    a: "Sim. Entregamos sempre a maior resolução disponibilizada pelo próprio Instagram, sem recompressão adicional.",
  },
];

/* -------------------------------- Sections -------------------------------- */

function SiteHeader() {
  return (
    <header className="absolute inset-x-0 top-0 z-20">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-5 sm:px-6">
        <a href="/instagram" className="flex items-center gap-2 text-white">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/15 backdrop-blur-sm">
            <SaveIcon className="h-5 w-5" />
          </span>
          <span className="text-lg font-extrabold tracking-tight">BaixaGram</span>
        </a>
        <nav className="hidden gap-6 text-sm font-medium text-white/90 sm:flex">
          <a href="#como" className="transition-colors hover:text-white">Como baixar</a>
          <a href="#recursos" className="transition-colors hover:text-white">Recursos</a>
          <a href="#faq" className="transition-colors hover:text-white">Dúvidas</a>
        </nav>
      </div>
    </header>
  );
}

function Hero() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-purple-700 via-pink-600 to-orange-500 pb-20 pt-28 sm:pb-28 sm:pt-36">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -left-24 -top-24 h-96 w-96 rounded-full bg-white/10 blur-3xl"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -bottom-32 -right-24 h-96 w-96 rounded-full bg-white/10 blur-3xl"
      />
      <div className="relative mx-auto max-w-3xl px-4 text-center sm:px-6">
        <h1 className="text-4xl font-extrabold leading-tight tracking-tight text-white sm:text-5xl">
          Baixar Vídeos do Instagram
        </h1>
        <p className="mx-auto mt-5 max-w-2xl text-lg leading-relaxed text-white/90">
          Baixe reels, vídeos, fotos e IGTV do Instagram em alta qualidade —
          grátis, rápido e sem instalar nenhum programa.
        </p>
        <div className="mt-9">
          <Downloader />
        </div>
        <ul className="mt-8 flex flex-wrap items-center justify-center gap-2">
          {MEDIA_TYPES.map((type) => (
            <li
              key={type}
              className="rounded-full bg-white/15 px-4 py-1.5 text-sm font-medium text-white backdrop-blur-sm"
            >
              {type}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

function HowTo() {
  return (
    <section id="como" className="scroll-mt-16 bg-white">
      <div className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
        <h2 className="text-center text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
          Como baixar em 3 passos
        </h2>
        <p className="mx-auto mt-4 max-w-2xl text-center text-gray-500">
          Sem cadastro e sem complicação. Do link ao download em segundos.
        </p>
        <ol className="mt-14 grid gap-8 md:grid-cols-3">
          {STEPS.map((step, i) => {
            const Icon = step.icon;
            return (
              <li key={step.title} className="relative rounded-3xl border border-gray-100 bg-gray-50/60 p-8">
                <span
                  aria-hidden="true"
                  className="absolute -top-5 left-8 flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-r from-purple-600 to-pink-500 text-lg font-bold text-white shadow-lg"
                >
                  {i + 1}
                </span>
                <span className="mt-2 flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-purple-600 shadow-sm">
                  <Icon className="h-6 w-6" />
                </span>
                <h3 className="mt-5 text-lg font-bold text-gray-900">{step.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-gray-500">{step.desc}</p>
              </li>
            );
          })}
        </ol>
      </div>
    </section>
  );
}

function Features() {
  return (
    <section id="recursos" className="scroll-mt-16 bg-gradient-to-b from-purple-50/60 to-white">
      <div className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
        <h2 className="text-center text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
          Por que usar o BaixaGram
        </h2>
        <p className="mx-auto mt-4 max-w-2xl text-center text-gray-500">
          O jeito mais simples de salvar o que você ama no Instagram.
        </p>
        <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((f) => {
            const Icon = f.icon;
            return (
              <div key={f.title} className="rounded-3xl border border-gray-100 bg-white p-7 shadow-sm">
                <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-purple-100 to-pink-100 text-purple-600">
                  <Icon className="h-6 w-6" />
                </span>
                <h3 className="mt-5 text-lg font-bold text-gray-900">{f.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-gray-500">{f.desc}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

function Faq() {
  return (
    <section id="faq" className="scroll-mt-16 bg-white">
      <div className="mx-auto max-w-3xl px-4 py-20 sm:px-6">
        <h2 className="text-center text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
          Perguntas frequentes
        </h2>
        <div className="mt-10 space-y-3">
          {FAQ.map((item) => (
            <details
              key={item.q}
              className="faq-item group rounded-2xl border border-gray-200 bg-gray-50/70 p-5 [&_summary]:list-none"
            >
              <summary className="flex cursor-pointer items-center justify-between gap-4 font-semibold text-gray-900">
                {item.q}
                <svg
                  className="faq-chevron h-5 w-5 shrink-0 text-purple-500 transition-transform"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M6 9l6 6 6-6" />
                </svg>
              </summary>
              <p className="mt-3 text-sm leading-relaxed text-gray-600">{item.a}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}

function SiteFooter() {
  return (
    <footer className="mt-auto bg-gray-900 text-gray-300">
      <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6">
        <div className="flex flex-col items-center gap-4 text-center">
          <div className="flex items-center gap-2 text-white">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-purple-600 to-pink-500">
              <SaveIcon className="h-5 w-5" />
            </span>
            <span className="text-lg font-extrabold">BaixaGram</span>
          </div>
          <p className="max-w-2xl text-sm leading-relaxed text-gray-400">
            O BaixaGram é uma ferramenta independente e não é afiliado,
            associado, autorizado ou endossado pelo Instagram ou pela Meta
            Platforms, Inc. Use apenas para baixar conteúdo próprio ou de
            domínio público. Respeite os direitos autorais e os termos de uso do
            Instagram. Todas as marcas pertencem aos seus respectivos donos.
          </p>
          <p className="text-xs text-gray-500">
            © {new Date().getFullYear()} BaixaGram — Ferramenta gratuita para download do Instagram.
          </p>
        </div>
      </div>
    </footer>
  );
}

/* --------------------------------- JSON-LD -------------------------------- */

function StructuredData() {
  const data = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebApplication",
        name: "BaixaGram",
        applicationCategory: "MultimediaApplication",
        operatingSystem: "Web",
        offers: { "@type": "Offer", price: "0", priceCurrency: "BRL" },
        description:
          "Baixe vídeos, reels, fotos e IGTV do Instagram em alta qualidade, grátis e sem instalar programas.",
      },
      {
        "@type": "FAQPage",
        mainEntity: FAQ.map((item) => ({
          "@type": "Question",
          name: item.q,
          acceptedAnswer: { "@type": "Answer", text: item.a },
        })),
      },
    ],
  };
  return (
    <script
      type="application/ld+json"
      // eslint-disable-next-line react/no-danger
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}

/* --------------------------------- Page ----------------------------------- */

export default function InstagramDownloaderPage() {
  return (
    <>
      <StructuredData />
      <SiteHeader />
      <Hero />
      <HowTo />
      <Features />
      <Faq />
      <SiteFooter />
    </>
  );
}
