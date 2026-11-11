
"use client";

import { useEffect, useState, type FormEvent } from "react";
import Link from "next/link";
import { API_URL } from "@/lib/api";

export default function RecuperarSenhaPage() {
    const [token, setToken] = useState("");
    const [email, setEmail] = useState("");
    const [novaSenha, setNovaSenha] = useState("");
    const [confirmarSenha, setConfirmarSenha] = useState("");

    const [carregando, setCarregando] = useState(false);
    const [mensagem, setMensagem] = useState("");
    const [erro, setErro] = useState("");
    const [concluido, setConcluido] = useState(false);
    const [senhaRedefinida, setSenhaRedefinida] = useState(false);

    useEffect(() => {
        const parametros = new URLSearchParams(window.location.search);
        const tokenUrl = parametros.get("token");

        if (tokenUrl) {
            setToken(tokenUrl);
        }
    }, []);

    const requisitos = [
        {
            texto: "Entre 8 e 64 caracteres",
            valido: novaSenha.length >= 8 && novaSenha.length <= 64,
        },
        {
            texto: "Uma letra maiúscula",
            valido: /[A-Z]/.test(novaSenha),
        },
        {
            texto: "Uma letra minúscula",
            valido: /[a-z]/.test(novaSenha),
        },
        {
            texto: "Pelo menos um número",
            valido: /\d/.test(novaSenha),
        },
        {
            texto: "Um caractere especial (!@#$...)",
            valido: /[^A-Za-z0-9\s]/.test(novaSenha),
        },
        {
            texto: "Não conter espaços",
            valido: novaSenha.length > 0 && !/\s/.test(novaSenha),
        },
    ];

    const senhaValida = requisitos.every(
        (requisito) => requisito.valido
    );

    const senhasCoincidem =
        confirmarSenha.length > 0 && novaSenha === confirmarSenha;

    async function solicitarRecuperacao(e: FormEvent<HTMLFormElement>) {
        e.preventDefault();

        setErro("");
        setMensagem("");
        setCarregando(true);

        try {
            const response = await fetch(
                `${API_URL}/auth/forgot-password`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({ email }),
                }
            );

            const data = await response.json();

            if (!response.ok) {
                throw new Error(
                    Array.isArray(data.message)
                        ? data.message.join(", ")
                        : data.message ||
                          "Não foi possível solicitar a recuperação."
                );
            }

            setConcluido(true);
            setMensagem(
                "Se esse e-mail estiver cadastrado, você receberá as instruções para redefinir sua senha. Verifique também a caixa de spam."
            );
        } catch (error: unknown) {
            setErro(
                error instanceof Error
                    ? error.message
                    : "Ocorreu um erro. Tente novamente."
            );
        } finally {
            setCarregando(false);
        }
    }

    async function redefinirSenha(e: FormEvent<HTMLFormElement>) {
        e.preventDefault();

        setErro("");
        setMensagem("");

        if (!senhaValida) {
            setErro("Sua senha ainda não atende a todos os requisitos.");
            return;
        }

        if (!senhasCoincidem) {
            setErro("As senhas não coincidem.");
            return;
        }

        setCarregando(true);

        try {
            const response = await fetch(
                `${API_URL}/auth/reset-password`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        token,
                        novaSenha,
                    }),
                }
            );

            const data = await response.json();

            if (!response.ok) {
                throw new Error(
                    Array.isArray(data.message)
                        ? data.message.join(", ")
                        : data.message ||
                          "Não foi possível redefinir sua senha."
                );
            }

            setSenhaRedefinida(true);
            setMensagem("Sua senha foi redefinida com sucesso!");
        } catch (error: unknown) {
            setErro(
                error instanceof Error
                    ? error.message
                    : "Ocorreu um erro. Tente novamente."
            );
        } finally {
            setCarregando(false);
        }
    }

    return (
        <main className="flex min-h-[calc(100vh-4rem)] items-center justify-center p-4">
            <div className="w-full max-w-md rounded-3xl border border-sky-100 bg-white p-8 shadow-elevated">

                <div className="mb-8 text-center">
                    <Link
                        href="/"
                        className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-sky-50 text-sky-600 transition-transform hover:scale-105"
                    >
                        <span className="text-2xl font-bold">G</span>
                    </Link>

                    <h1 className="text-2xl font-extrabold tracking-tight text-slate-900">
                        {token ? "Nova senha" : "Recuperar senha"}
                    </h1>

                    <p className="mt-2 text-sm text-slate-500">
                        {token
                            ? "Cadastre uma nova senha para sua conta no Guia Cidadão."
                            : "Informe seu e-mail para receber o link de recuperação."}
                    </p>
                </div>

                {erro && (
                    <div className="mb-6 rounded-xl border border-rose-200 bg-rose-50 p-3 text-center text-sm font-medium text-rose-800">
                        ⚠️ {erro}
                    </div>
                )}

                {mensagem && (
                    <div className="mb-6 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-center text-sm font-medium text-emerald-800">
                        {mensagem}
                    </div>
                )}

                {!token && !concluido && (
                    <form
                        onSubmit={solicitarRecuperacao}
                        className="space-y-5"
                    >
                        <div>
                            <label
                                htmlFor="email"
                                className="mb-1.5 block text-sm font-bold text-slate-700"
                            >
                                Endereço de e-mail
                            </label>

                            <input
                                id="email"
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="cidadao@exemplo.com"
                                autoComplete="email"
                                required
                                className="w-full rounded-xl border border-slate-200 bg-slate-50/50 p-3 text-sm text-slate-800 placeholder:text-slate-400 transition focus:border-sky-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-sky-100"
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={carregando}
                            className="h-12 w-full cursor-pointer rounded-xl bg-sky-600 text-sm font-bold text-white shadow-sm transition hover:bg-sky-700 active:scale-[0.99] disabled:opacity-50"
                        >
                            {carregando
                                ? "Enviando..."
                                : "Enviar link de recuperação"}
                        </button>
                    </form>
                )}

                {token && !senhaRedefinida && (
                    <form
                        onSubmit={redefinirSenha}
                        className="space-y-5"
                    >
                        <div>
                            <label
                                htmlFor="novaSenha"
                                className="mb-1.5 block text-sm font-bold text-slate-700"
                            >
                                Nova senha
                            </label>

                            <input
                                id="novaSenha"
                                type="password"
                                value={novaSenha}
                                onChange={(e) => setNovaSenha(e.target.value)}
                                placeholder="Digite sua nova senha"
                                autoComplete="new-password"
                                maxLength={64}
                                required
                                className="w-full rounded-xl border border-slate-200 bg-slate-50/50 p-3 text-sm text-slate-800 placeholder:text-slate-400 transition focus:border-sky-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-sky-100"
                            />
                        </div>

                        <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                            <p className="mb-3 text-sm font-bold text-slate-700">
                                Requisitos da senha
                            </p>

                            <div className="space-y-2">
                                {requisitos.map((requisito, index) => (
                                    <div
                                        key={index}
                                        className={`flex items-center gap-2 text-sm ${
                                            requisito.valido
                                                ? "text-emerald-700"
                                                : "text-slate-500"
                                        }`}
                                    >
                                        <span className="font-bold">
                                            {requisito.valido ? "✓" : "○"}
                                        </span>

                                        <span>{requisito.texto}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div>
                            <label
                                htmlFor="confirmarSenha"
                                className="mb-1.5 block text-sm font-bold text-slate-700"
                            >
                                Confirmar nova senha
                            </label>

                            <input
                                id="confirmarSenha"
                                type="password"
                                value={confirmarSenha}
                                onChange={(e) =>
                                    setConfirmarSenha(e.target.value)
                                }
                                placeholder="Digite novamente sua senha"
                                autoComplete="new-password"
                                maxLength={64}
                                required
                                className="w-full rounded-xl border border-slate-200 bg-slate-50/50 p-3 text-sm text-slate-800 placeholder:text-slate-400 transition focus:border-sky-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-sky-100"
                            />

                            {confirmarSenha.length > 0 && (
                                <p
                                    className={`mt-2 text-xs font-medium ${
                                        senhasCoincidem
                                            ? "text-emerald-700"
                                            : "text-rose-600"
                                    }`}
                                >
                                    {senhasCoincidem
                                        ? "✓ As senhas coincidem"
                                        : "✗ As senhas não coincidem"}
                                </p>
                            )}
                        </div>

                        <button
                            type="submit"
                            disabled={
                                carregando ||
                                !senhaValida ||
                                !senhasCoincidem
                            }
                            className="h-12 w-full cursor-pointer rounded-xl bg-sky-600 text-sm font-bold text-white shadow-sm transition hover:bg-sky-700 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-40"
                        >
                            {carregando
                                ? "Salvando..."
                                : "Redefinir senha"}
                        </button>
                    </form>
                )}

                {senhaRedefinida && (
                    <Link
                        href="/login"
                        className="flex h-12 w-full items-center justify-center rounded-xl bg-sky-600 text-sm font-bold text-white shadow-sm transition hover:bg-sky-700"
                    >
                        Ir para o login
                    </Link>
                )}

                <div className="mt-8 text-center text-sm text-slate-500">
                    <Link
                        href="/login"
                        className="font-bold text-sky-600 transition hover:text-sky-800 hover:underline"
                    >
                        Voltar para o login
                    </Link>
                </div>
            </div>
        </main>
    );
}
