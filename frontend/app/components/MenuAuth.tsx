"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function MenuAuth() {
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [mounted, setMounted] = useState(false);
    const router = useRouter();

    useEffect(() => {
        setMounted(true); // Garante que só renderiza após montar no cliente (evita erros do Next.js)

        // Verifica se existe um token JWT guardado
        const token = localStorage.getItem("token");
        if (token) {
            setIsLoggedIn(true);
        }
    }, []);

    const handleLogout = () => {
        // Apaga o token e atualiza o estado para "deslogado"
        localStorage.removeItem("token");
        setIsLoggedIn(false);
        router.push("/login");
    };

    // Placeholder invisível enquanto o Next.js carrega o estado (evita ecrã a saltar)
    if (!mounted) return <div className="h-9 w-24 animate-pulse rounded-lg bg-slate-100"></div>;

    return (
        <div className="flex items-center gap-3">
            <Link
                href="/servicos"
                className="hidden sm:inline-flex h-9 items-center justify-center rounded-lg border border-border px-3.5 text-xs font-semibold hover:bg-surface-muted transition-colors"
            >
                Explorar Postos
            </Link>

            {isLoggedIn ? (
                <>
                    <Link
                        href="/avaliar"
                        className="inline-flex h-9 items-center justify-center rounded-lg bg-brand px-4 text-xs font-semibold text-brand-contrast hover:bg-brand-hover active:bg-brand-pressed shadow-sm transition-colors"
                    >
                        + Avaliar
                    </Link>
                    <button
                        onClick={handleLogout}
                        className="inline-flex h-9 items-center justify-center rounded-lg border border-rose-200 bg-rose-50 px-4 text-xs font-semibold text-rose-600 hover:bg-rose-100 transition-colors"
                    >
                        Sair
                    </button>
                </>
            ) : (
                <Link
                    href="/login"
                    className="inline-flex h-9 items-center justify-center rounded-lg bg-brand px-4 text-xs font-semibold text-brand-contrast hover:bg-brand-hover active:bg-brand-pressed shadow-sm transition-colors"
                >
                    Entrar
                </Link>
            )}
        </div>
    );
}