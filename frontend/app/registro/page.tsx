
"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { API_URL } from "@/lib/api";

export default function PaginaRegistro() {
    const [nome, setNome] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [erro, setErro] = useState<string | null>(null);
    const [sucesso, setSucesso] = useState(false);

    const requisitos = [
        {
            texto: "Entre 8 e 64 caracteres",
            valido: password.length >= 8 && password.length <= 64,
        },
        {
            texto: "Uma letra maiúscula",
            valido: /[A-Z]/.test(password),
        },
        {
            texto: "Uma letra minúscula",
            valido: /[a-z]/.test(password),
        },
        {
            texto: "Pelo menos um número",
            valido: /\d/.test(password),
        },
        {
            texto: "Um caractere especial (!@#$...)",
            valido: /[^A-Za-z0-9\s]/.test(password),
        },
        {
            texto: "Não conter espaços",
            valido: password.length > 0 && !/\s/.test(password),
        },
    ];

    const senhaValida = requisitos.every(
        (requisito) => requisito.valido
    );

    const senhasCoincidem =
        confirmPassword.length > 0 &&
        password === confirmPassword;

    const handleRegister = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setErro(null);

        if (!senhaValida) {
            setErro("A senha ainda não atende a todos os requisitos.");
            return;
        }

        if (!senhasCoincidem) {
            setErro("As senhas não coincidem.");
            return;
        }

        setIsSubmitting(true);

        try {
            const response = await fetch(
                `${API_URL}/auth/register`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        nome,
                        email,
                        senha: password,
                    }),
                }
            );

            const errorData = await response.json().catch(() => ({}));

            if (!response.ok) {
                const mensagem = Array.isArray(errorData.message)
                    ? errorData.message.join(", ")
                    : errorData.message;

                throw new Error(
                    mensagem || "Erro ao criar conta."
                );
            }

            setSucesso(true);
        } catch (err: unknown) {
            setErro(
                err instanceof Error
                    ? err.message
                    : "Ocorreu um erro ao criar sua conta. Tente novamente."
            );
        } finally {
            setIsSubmitting(false);
        }
    };

    if (sucesso) {
        return (
            <main className="flex min-h-[calc(100vh-4rem)] items-center justify-center p-4">
                <div className="w-full max-w-md rounded-3xl border border-sky-100 bg-white p-10 text-center shadow-elevated">
                    <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-leaf-light text-leaf text-3xl">
                        ✓
                    </div>

                    <h1 className="mt-4 text-2xl font-extrabold text-slate-900 tracking-tight">
                        Conta Criada!
                    </h1>

                    <p className="mt-3 text-sm text-slate-600 leading-relaxed">
                        Bem-vindo ao Guia Cidadão,{" "}
                        <strong>{nome}</strong>. Sua conta foi
                        registrada com sucesso e você já pode
                        começar a avaliar os serviços da cidade.
                    </p>

                    <div className="mt-8">
                        <Link
                            href="/login"
                            className="inline-flex h-12 w-full items-center justify-center rounded-xl bg-sky-600 px-6 text-sm font-bold text-white shadow-sm hover:bg-sky-700 transition"
                        >
                            Ir para o login
                        </Link>
                    </div>
                </div>
            </main>
        );
    }

    return (
        <main className="flex min-h-[calc(100vh-4rem)] items-center justify-center p-4">
            <div className="my-8 w-full max-w-md rounded-3xl border border-sky-100 bg-white p-8 shadow-elevated">

                <div className="mb-8 text-center">
                    <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
                        Criar Conta
                    </h1>

                    <p className="mt-2 text-sm text-slate-500">
                        Junte-se ao Guia Cidadão e ajude a transformar
                        a gestão pública de Palmas.
                    </p>
                </div>

                {erro && (
                    <div className="mb-6 rounded-xl border border-rose-200 bg-coral-light p-3 text-sm font-medium text-rose-800 text-center">
                        ⚠️ {erro}
                    </div>
                )}

                <form onSubmit={handleRegister} className="space-y-5">

                    <div>
                        <label
                            htmlFor="nome"
                            className="mb-1.5 block text-sm font-bold text-slate-700"
                        >
                            Nome Completo
                        </label>

                        <input
                            id="nome"
                            type="text"
                            value={nome}
                            onChange={(e) => setNome(e.target.value)}
                            placeholder="Ex: João Cidadão"
                            autoComplete="name"
                            required
                            className="w-full rounded-xl border border-slate-200 bg-slate-50/50 p-3 text-sm text-slate-800 placeholder:text-slate-400 focus:border-sky-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-sky-100 transition"
                        />
                    </div>

                    <div>
                        <label
                            htmlFor="email"
                            className="mb-1.5 block text-sm font-bold text-slate-700"
                        >
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
                        <label
                            htmlFor="password"
                            className="mb-1.5 block text-sm font-bold text-slate-700"
                        >
                            Senha
                        </label>

                        <input
                            id="password"
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="Crie uma senha forte"
                            autoComplete="new-password"
                            maxLength={64}
                            required
                            className="w-full rounded-xl border border-slate-200 bg-slate-50/50 p-3 text-sm text-slate-800 placeholder:text-slate-400 focus:border-sky-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-sky-100 transition"
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
                            htmlFor="confirmPassword"
                            className="mb-1.5 block text-sm font-bold text-slate-700"
                        >
                            Confirmar Senha
                        </label>

                        <input
                            id="confirmPassword"
                            type="password"
                            value={confirmPassword}
                            onChange={(e) =>
                                setConfirmPassword(e.target.value)
                            }
                            placeholder="Digite novamente sua senha"
                            autoComplete="new-password"
                            maxLength={64}
                            required
                            className="w-full rounded-xl border border-slate-200 bg-slate-50/50 p-3 text-sm text-slate-800 placeholder:text-slate-400 focus:border-sky-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-sky-100 transition"
                        />

                        {confirmPassword.length > 0 && (
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

                    <div className="flex items-start gap-3 pt-2 pb-2">
                        <input
                            id="lgpd"
                            type="checkbox"
                            required
                            className="mt-1 h-4 w-4 cursor-pointer rounded border-slate-300 text-sky-600 focus:ring-sky-500"
                        />

                        <label
                            htmlFor="lgpd"
                            className="cursor-pointer text-[11px] text-slate-500 leading-relaxed"
                        >
                            Compreendo e aceito que meus dados serão
                            processados de acordo com a{" "}
                            <strong>Política de Privacidade</strong> e a
                            LGPD, garantindo meu direito ao anonimato
                            nas avaliações públicas.
                        </label>
                    </div>

                    <button
                        type="submit"
                        disabled={
                            isSubmitting ||
                            !senhaValida ||
                            !senhasCoincidem
                        }
                        className="h-12 w-full rounded-xl bg-sky-600 text-sm font-bold text-white shadow-sm hover:bg-sky-700 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-40 transition"
                    >
                        {isSubmitting
                            ? "Criando conta..."
                            : "Criar Conta"}
                    </button>
                </form>

                <div className="mt-8 border-t border-slate-100 pt-6 text-center text-sm text-slate-500">
                    Já tem uma conta?{" "}

                    <Link
                        href="/login"
                        className="font-bold text-sky-600 hover:text-sky-800 hover:underline transition"
                    >
                        Iniciar sessão
                    </Link>
                </div>
            </div>
        </main>
    );
}
