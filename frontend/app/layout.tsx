import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Link from "next/link";
import "./globals.css";

// IMPORTAÇÃO DO NOVO COMPONENTE DE AUTENTICAÇÃO
import MenuAuth from "./components/MenuAuth";

const geistSans = Geist({
    variable: "--font-geist-sans",
    subsets: ["latin"],
});

const geistMono = Geist_Mono({
    variable: "--font-geist-mono",
    subsets: ["latin"],
});

export const metadata: Metadata = {
    title: "Guia Cidadão | Avaliação e Transparência dos Serviços Públicos",
    description:
        "Monitore, avalie e acompanhe o índice de satisfação dos serviços públicos da sua cidade de forma colaborativa e transparente.",
};

export default function RootLayout({
                                       children,
                                   }: {
    children: React.ReactNode;
}) {
    return (
        <html
            lang="pt-BR"
            className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
        >
        <body className="flex min-h-screen flex-col bg-background text-foreground">
        {/* Barra Superior Institucional */}
        <header className="sticky top-0 z-40 border-b border-border bg-surface/80 backdrop-blur-md">
            <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
                <div className="flex items-center gap-6">
                    <Link href="/" className="flex items-center gap-2.5">
                <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand text-brand-contrast font-bold text-lg shadow-sm">
                  G
                </span>
                        <div className="flex flex-col">
                  <span className="text-base font-extrabold tracking-tight leading-none">
                    Guia Cidadão
                  </span>
                            <span className="text-[10px] uppercase font-semibold tracking-wider text-foreground-muted">
                    Controle Social
                  </span>
                        </div>
                    </Link>

                    <nav className="hidden md:flex items-center gap-5 text-sm font-medium text-foreground-muted">
                        <Link href="/servicos" className="hover:text-foreground transition-colors">
                            Serviços
                        </Link>
                        <Link href="/mapa" className="hover:text-foreground transition-colors">
                            Mapa
                        </Link>
                        <Link href="/painel" className="hover:text-foreground transition-colors">
                            Painel de Transparência
                        </Link>
                        <Link href="/ouvidoria" className="hover:text-foreground transition-colors">
                            Ouvidoria Aberta
                        </Link>
                    </nav>
                </div>

                {/* COMPONENTE DINÂMICO DE LOGIN/LOGOUT */}
                <MenuAuth />

            </div>
        </header>

        {/* Conteúdo Dinâmico */}
        <div className="flex-1">{children}</div>

        {/* Rodapé Cívico e Transparência */}
        <footer className="border-t border-border bg-surface mt-16">
            <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
                    <div className="flex flex-col gap-1">
                        <p className="text-sm font-semibold text-foreground">
                            Guia Cidadão – Iniciativa de Dados Abertos e Participação Social
                        </p>
                        <p className="text-xs text-foreground-muted">
                            Plataforma independente de utilidade pública focada na melhoria da gestão pública municipal.
                        </p>
                    </div>
                    <div className="flex gap-4 text-xs font-medium text-foreground-muted">
                        <Link href="/termos" className="hover:underline">Termos e Moderação</Link>
                        <Link href="/privacidade" className="hover:underline">LGPD & Privacidade</Link>
                        <Link href="/api" className="hover:underline">Dados Abertos (API)</Link>
                    </div>
                </div>
            </div>
        </footer>
        </body>
        </html>
    );
}