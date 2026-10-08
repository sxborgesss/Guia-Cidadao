"use client";

import { useState } from "react";
import Link from "next/link";

export default function PaginaLogin() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [erro, setErro] = useState<string | null>(null);

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

            const token = data.access_token || data.accessToken;
            if (token) {
                localStorage.setItem("token", token);
            }
            if (data.user) {
                localStorage.setItem("user", JSON.stringify(data.user));
            }

            if (data.user?.role === "ADMIN") {
                window.location.href = "/admin";
            } else if (data.user?.role === "GESTOR") {
                window.location.href = "/gestor";
            } else {
                window.location.href = "/";
            }
        } catch (err: any) {
            setErro(err.message || "Ocorreu um erro ao tentar iniciar sessão. Tente novamente.");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <main className="flex min-h-[calc(100vh-4rem)] items-center justify-center p-4">
            <div className="w-full max-w-md rounded-3xl border border-sky-100 bg-white p-8 shadow-elevated">
                {/* Cabeçalho do Login */}
                <div className="mb-8 text-center">
                    <Link href="/" className="inline-flex items-center justify-center h-12 w-12 rounded-2xl bg-sky-50 text-sky-600 mb-4 transition-transform hover:scale-105">
                        <span className="text-2xl font-bold">G</span>
                    </Link>
                    <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
                        Bem-vindo ao Guia Cidadão
                    </h1>
                    <p className="mt-2 text-sm text-slate-500">
                        Aceda à sua conta no FeedPalmas para gerir as suas avaliações.
                    </p>
                </div>

                {/* Mensagem de Erro */}
                {erro && (
                    <div className="mb-6 rounded-xl border border-rose-200 bg-coral-light p-3 text-sm font-medium text-rose-800 text-center">
                        ⚠️ {erro}
                    </div>
                )}

                {/* Formulário */}
                <form onSubmit={handleLogin} className="space-y-5">
                    <div>
                        <label htmlFor="email" className="block text-sm font-bold text-slate-700 mb-1.5">
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
                            className="w-full rounded-xl border border-slate-200 bg-slate-50/50 p-3 text-sm text-slate-800 placeholder:text-slate-400 focus:border-sky-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-sky-100 transition"
                        />
                    </div>

                    <div>
                        <div className="flex items-center justify-between mb-1.5">
                            <label htmlFor="password" className="block text-sm font-bold text-slate-700">
                                Palavra-passe
                            </label>
                            <Link
                                href="/recuperar-senha"
                                className="text-xs font-semibold text-sky-600 hover:text-sky-800 transition"
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
                            className="w-full rounded-xl border border-slate-200 bg-slate-50/50 p-3 text-sm text-slate-800 placeholder:text-slate-400 focus:border-sky-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-sky-100 transition"
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className="mt-2 w-full h-12 rounded-xl bg-sky-600 text-white font-bold text-sm shadow-sm hover:bg-sky-700 active:scale-[0.99] disabled:opacity-50 transition cursor-pointer"
                    >
                        {isSubmitting ? "A iniciar sessão..." : "Entrar na Plataforma"}
                    </button>
                </form>

                {/* Rodapé do Formulário */}
                <div className="mt-8 text-center text-sm text-slate-500">
                    Ainda não tem conta cívica?{" "}
                    <Link
                        href="/registro"
                        className="font-bold text-sky-600 hover:text-sky-800 hover:underline transition"
                    >
                        Registe-se aqui
                    </Link>
                </div>
            </div>
        </main>
    );
}