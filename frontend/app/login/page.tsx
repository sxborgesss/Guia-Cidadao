"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function PaginaLogin() {
    const router = useRouter();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [erro, setErro] = useState<string | null>(null);

    const [isCheckingAuth, setIsCheckingAuth] = useState(true);

    useEffect(() => {
        const token = localStorage.getItem("token");
        // Verifica se o token existe e não é a palavra "undefined"
        if (token && token !== "undefined") {
            router.push("/");
        } else {
            setIsCheckingAuth(false);
        }
    }, [router]);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setErro(null);

        if (!email || !password) {
            setErro("Por favor, preencha todos os campos.");
            return;
        }

        setIsSubmitting(true);

        try {
            const response = await fetch("http://localhost:3001/auth/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, senha: password }),
            });

            if (!response.ok) {
                throw new Error("Credenciais inválidas");
            }

            const data = await response.json();

            // 👇 CORREÇÃO CRUCIAL 1: Aceita access_token (NestJS) ou accessToken
            const tokenReal = data.access_token || data.accessToken;

            if (!tokenReal) {
                throw new Error("Erro interno: Token não foi gerado pelo servidor.");
            }

            localStorage.setItem("token", tokenReal);

            // 👇 CORREÇÃO CRUCIAL 2: Avisa o MenuAuth para mudar o botão para "Sair"
            window.dispatchEvent(new Event("authChange"));

            router.push("/");
        } catch (err: any) {
            setErro(err.message || "Ocorreu um erro ao tentar iniciar sessão. Tente novamente.");
        } finally {
            setIsSubmitting(false);
        }
    };

    if (isCheckingAuth) {
        return (
            <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center p-4">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-brand/20 border-t-brand"></div>
            </div>
        );
    }

    return (
        <main className="flex min-h-[calc(100vh-4rem)] items-center justify-center p-4">
            <div className="w-full max-w-md rounded-3xl border border-border bg-surface p-8 shadow-card text-foreground">

                <div className="mb-8 text-center">
                    <Link href="/" className="inline-flex items-center justify-center h-12 w-12 rounded-2xl bg-brand-light text-brand mb-4 transition-transform hover:scale-105">
                        <span className="text-2xl font-bold">G</span>
                    </Link>
                    <h1 className="text-2xl font-extrabold tracking-tight">
                        Bem-vindo ao Guia Cidadão
                    </h1>
                    <p className="mt-2 text-sm text-foreground-muted">
                        Aceda à sua conta no FeedPalmas para gerir as suas avaliações.
                    </p>
                </div>

                {erro && (
                    <div className="mb-6 rounded-xl border border-red-200 bg-red-50 p-3 text-sm font-medium text-red-800 text-center">
                        ⚠️ {erro}
                    </div>
                )}

                <form onSubmit={handleLogin} className="space-y-5">
                    <div>
                        <label htmlFor="email" className="block text-sm font-bold mb-1.5">
                            Endereço de E-mail
                        </label>
                        <input
                            id="email"
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="cidadao@exemplo.com"
                            autoComplete="email"
                            required
                            className="w-full rounded-xl border border-border bg-background p-3 text-sm placeholder:text-foreground-muted focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20 transition"
                        />
                    </div>

                    <div>
                        <div className="flex items-center justify-between mb-1.5">
                            <label htmlFor="password" className="block text-sm font-bold">
                                Palavra-passe
                            </label>
                            <Link
                                href="/recuperar-senha"
                                className="text-xs font-semibold text-brand hover:underline transition"
                                tabIndex={-1}
                            >
                                Esqueceu-se?
                            </Link>
                        </div>
                        <input
                            id="password"
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="••••••••"
                            autoComplete="current-password"
                            required
                            className="w-full rounded-xl border border-border bg-background p-3 text-sm placeholder:text-foreground-muted focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20 transition"
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className="mt-2 w-full h-12 rounded-xl bg-brand text-brand-contrast font-bold text-sm shadow-sm hover:bg-brand-hover active:scale-[0.99] disabled:opacity-50 transition"
                    >
                        {isSubmitting ? "A iniciar sessão..." : "Entrar na Plataforma"}
                    </button>
                </form>

                <div className="mt-8 text-center text-sm text-foreground-muted">
                    Ainda não tem conta cívica?{" "}
                    <Link
                        href="/registro"
                        className="font-bold text-brand hover:underline transition"
                    >
                        Registe-se aqui
                    </Link>
                </div>
            </div>
        </main>
    );
}