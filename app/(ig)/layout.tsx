import type { Metadata } from "next";
import { Poppins } from "next/font/google";
import "../globals.css";
import { SITE_URL } from "@/lib/site";

const poppins = Poppins({
  weight: ["400", "500", "600", "700", "800"],
  subsets: ["latin"],
  variable: "--font-poppins",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: "Baixar Vídeos do Instagram Online Grátis — Reels, Fotos e Stories | InstaBaixar",
  description:
    "Baixe vídeos, reels, fotos e IGTV do Instagram em alta qualidade (HD), grátis e sem programas. Cole o link e faça o download direto no celular ou computador.",
  keywords: [
    "baixar vídeo instagram",
    "download instagram",
    "baixar reels",
    "baixar fotos instagram",
    "instagram downloader",
    "salvar vídeo instagram",
  ],
  alternates: { canonical: "/instagram" },
  icons: {
    icon: [{ url: "/ig-favicon.svg", type: "image/svg+xml" }],
  },
  openGraph: {
    type: "website",
    locale: "pt_BR",
    title: "Baixar Vídeos do Instagram Online Grátis — Reels, Fotos e Stories",
    description:
      "Cole o link e baixe vídeos, reels, fotos e IGTV do Instagram em HD, grátis e sem instalar nada.",
    url: `${SITE_URL}/instagram`,
  },
  twitter: { card: "summary_large_image" },
};

export default function InstagramLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" className={`${poppins.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col bg-white">{children}</body>
    </html>
  );
}
