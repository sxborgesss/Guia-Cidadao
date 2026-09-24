"use client";

import { useEffect, useState } from "react";
import { Geist, Geist_Mono } from "next/font/google";
import Link from "next/link";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

interface UserData {
  id: string;
  nome: string;
  email: string;
  role: string;
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [user, setUser] = useState<UserData | null>(null);

  useEffect(() => {
    const carregarUsuario = () => {
      const storedUser = localStorage.getItem("user");
      if (storedUser) {
        try {
          setUser(JSON.parse(storedUser));
        } catch {
          setUser(null);
        }
      } else {
        setUser(null);
      }
    };

    carregarUsuario();
    window.addEventListener("storage", carregarUsuario);
    return () => window.removeEventListener("storage", carregarUsuario);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
    window.location.href = "/login";
  };

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

            <div className="flex items-center gap-3">
              <Link
                href="/servicos"
                className="hidden sm:inline-flex h-9 items-center justify-center rounded-lg border border-border px-3.5 text-xs font-semibold hover:bg-surface-muted transition-colors"
              >
                Explorar Postos
              </Link>

              {user ? (
                <div className="flex items-center gap-3">
                  {user.role === "ADMIN" && (
                    <Link
                      href="/admin"
                      className="inline-flex h-9 items-center justify-center rounded-lg bg-slate-900 px-3.5 text-xs font-semibold text-white shadow-sm hover:bg-slate-800 transition-colors"
                    >
                      Painel Admin
                    </Link>
                  )}
                  <div className="flex flex-col text-right">
                    <span className="text-xs font-bold leading-tight">{user.nome}</span>
                    <span className="text-[10px] font-semibold text-brand tracking-wider">{user.role}</span>
                  </div>
                  <button
                    type="button"
                    onClick={handleLogout}
                    className="inline-flex h-9 items-center justify-center rounded-lg border border-rose-200 bg-rose-50 px-3 text-xs font-semibold text-rose-700 hover:bg-rose-100 transition-colors cursor-pointer"
                  >
                    Sair
                  </button>
                </div>
              ) : (
                <Link
                  href="/login"
                  className="inline-flex h-9 items-center justify-center rounded-lg bg-brand px-4 text-xs font-semibold text-brand-contrast hover:bg-brand-hover active:bg-brand-pressed shadow-sm transition-colors"
                >
                  Entrar
                </Link>
              )}
            </div>
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