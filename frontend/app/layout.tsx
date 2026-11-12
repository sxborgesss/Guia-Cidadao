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
            const token = localStorage.getItem("token");
            const storedUser = localStorage.getItem("user");

            if (token && storedUser) {
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

        return () =>
            window.removeEventListener("storage", carregarUsuario);
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
                            <Link
                                href="/"
                                className="flex items-center gap-2.5"
                            >
                                <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand text-lg font-bold text-brand-contrast shadow-sm">
                                    G
                                </span>

                                <div className="flex flex-col">
                                    <span className="text-base font-extrabold leading-none tracking-tight">
                                        Guia Cidadão
                                    </span>

                                    <span className="text-[10px] font-semibold uppercase tracking-wider text-foreground-muted">
                                        Controle Social
                                    </span>
                                </div>
                            </Link>

                            <nav className="hidden items-center gap-5 text-sm font-medium text-foreground-muted md:flex">
                                <Link
                                    href="/servicos"
                                    className="transition-colors hover:text-foreground"
                                >
                                    Serviços
                                </Link>

                                <Link
                                    href="/mapa"
                                    className="transition-colors hover:text-foreground"
                                >
                                    Mapa
                                </Link>

                                {(user?.role === "ADMIN" || user?.role === "GESTOR") && (
                                    <Link
                                        href="/painel"
                                        className="transition-colors hover:text-foreground"
                                    >
                                        Painel de Transparência
                                    </Link>
                                )}

                                <Link
                                    href="/ouvidoria"
                                    className="transition-colors hover:text-foreground"
                                >
                                    Ouvidoria Aberta
                                </Link>
                            </nav>
                        </div>

                        <div className="flex items-center gap-3">
                            <Link
                                href="/servicos"
                                className="hidden h-9 items-center justify-center rounded-lg border border-border px-3.5 text-xs font-semibold transition-colors hover:bg-surface-muted sm:inline-flex"
                            >
                                Explorar Postos
                            </Link>

                            {user ? (
                                <div className="flex items-center gap-3">
                                    {user.role === "CIDADAO" && (
                                        <Link
                                            href="/minha-area"
                                            className="inline-flex h-9 items-center justify-center rounded-lg border border-border px-3.5 text-xs font-semibold transition-colors hover:bg-surface-muted"
                                        >
                                            Minha Área
                                        </Link>
                                    )}

                                    {user.role === "GESTOR" && (
                                        <Link
                                            href="/gestor"
                                            className="inline-flex h-9 items-center justify-center rounded-lg bg-slate-900 px-3.5 text-xs font-semibold text-white shadow-sm transition-colors hover:bg-slate-800"
                                        >
                                            Painel do Gestor
                                        </Link>
                                    )}

                                    {user.role === "ADMIN" && (
                                        <>
                                            <Link
                                                href="/admin"
                                                className="inline-flex h-9 items-center justify-center rounded-lg bg-slate-900 px-3.5 text-xs font-semibold text-white shadow-sm transition-colors hover:bg-slate-800"
                                            >
                                                Painel Admin
                                            </Link>

                                            <Link
                                                href="/admin/servicos"
                                                className="inline-flex h-9 items-center justify-center rounded-lg border border-blue-200 bg-blue-50 px-3.5 text-xs font-semibold text-blue-800 transition-colors hover:bg-blue-100"
                                            >
                                                Editar serviços
                                            </Link>
                                        </>
                                    )}

                                    <div className="hidden flex-col text-right sm:flex">
                                        <span className="text-xs font-bold leading-tight">
                                            {user.nome}
                                        </span>

                                        <span className="text-[10px] font-semibold tracking-wider text-brand">
                                            {user.role}
                                        </span>
                                    </div>

                                    <button
                                        type="button"
                                        onClick={handleLogout}
                                        className="inline-flex h-9 cursor-pointer items-center justify-center rounded-lg border border-rose-200 bg-rose-50 px-3 text-xs font-semibold text-rose-700 transition-colors hover:bg-rose-100"
                                    >
                                        Sair
                                    </button>
                                </div>
                            ) : (
                                <Link
                                    href="/login"
                                    className="inline-flex h-9 items-center justify-center rounded-lg bg-brand px-4 text-xs font-semibold text-brand-contrast shadow-sm transition-colors hover:bg-brand-hover active:bg-brand-pressed"
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
                <footer className="mt-16 border-t border-border bg-surface">
                    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
                        <div className="flex flex-col items-center justify-between gap-4 text-center sm:flex-row sm:text-left">
                            <div className="flex flex-col gap-1">
                                <p className="text-sm font-semibold text-foreground">
                                    Guia Cidadão – Iniciativa de Dados Abertos e Participação Social
                                </p>

                                <p className="text-xs text-foreground-muted">
                                    Plataforma independente de utilidade pública focada na melhoria da gestão pública municipal.
                                </p>
                            </div>

                            <div className="flex flex-wrap justify-center gap-4 text-xs font-medium text-foreground-muted">
                                <Link
                                    href="/termos"
                                    className="hover:underline"
                                >
                                    Termos e Moderação
                                </Link>

                                <Link
                                    href="/privacidade"
                                    className="hover:underline"
                                >
                                    LGPD & Privacidade
                                </Link>

                                <Link
                                    href="/api"
                                    className="hover:underline"
                                >
                                    Dados Abertos (API)
                                </Link>
                            </div>
                        </div>
                    </div>
                </footer>
            </body>
        </html>
    );
}