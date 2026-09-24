"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function PaginaRegisto() {
    const router = useRouter();

    // Estados do formulário
    const [nome, setNome] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");

    // Estados de feedback
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [erro, setErro] = useState<string | null>(null);
    const [sucesso, setSucesso] = useState(false);

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();
        setErro(null);

        // Validação básica de palavras-passe
        if (password !== confirmPassword) {
            setErro("As palavras-passe não coincidem. Verifique e tente novamente.");
            return;
        }

        if (password.length < 6) {
            setErro("A palavra-passe deve ter pelo menos 6 caracteres.");
            return;
        }

        setIsSubmitting(true);

        try {
            // Aqui fará a integração com o seu backend NestJS (POST /auth/register)

            const response = await fetch("http://localhost:3001/auth/register", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    nome: nome,
                    email: email,
                    senha: password
                }),            });

            if (!response.ok) {
              const errorData = await response.json();
              throw new Error(errorData.message || "Erro ao criar conta.");
            }


            // Simulação de tempo de carregamento da API
            await new Promise((resolve) => setTimeout(resolve, 800));

            // Mostrar ecrã de sucesso
            setSucesso(true);

        } catch (err: any) {
            setErro(err.message || "Ocorreu um erro ao criar a sua conta. Tente novamente.");
        } finally {
            setIsSubmitting(false);
        }
    };

    // Ecrã de Sucesso
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
                        Bem-vindo ao FeedPalmas, <strong>{nome}</strong>. A sua conta foi registada com sucesso e já pode começar a avaliar os serviços da cidade.
                    </p>
                    <div className="mt-8">
                        <Link
                            href="/login"
                            className="inline-flex h-12 w-full items-center justify-center rounded-xl bg-sky-600 px-6 text-sm font-bold text-white shadow-sm hover:bg-sky-700 transition"
                        >
                            Ir para o Início de Sessão
                        </Link>
                    </div>
                </div>
            </main>
        );
    }

    // Formulário de Registo
    return (
        <main className="flex min-h-[calc(100vh-4rem)] items-center justify-center p-4">
            <div className="w-full max-w-md rounded-3xl border border-sky-100 bg-white p-8 shadow-elevated my-8">

                {/* Cabeçalho */}
                <div className="mb-8 text-center">
                    <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
                        Criar Conta
                    </h1>
                    <p className="mt-2 text-sm text-slate-500">
                        Junte-se ao Guia Cidadão e ajude a transformar a gestão pública de Palmas.
                    </p>
                </div>

                {/* Mensagem de Erro */}
                {erro && (
                    <div className="mb-6 rounded-xl border border-rose-200 bg-coral-light p-3 text-sm font-medium text-rose-800 text-center">
                        ⚠️ {erro}
                    </div>
                )}

                {/* Formulário */}
                <form onSubmit={handleRegister} className="space-y-5">
                    <div>
                        <label htmlFor="nome" className="block text-sm font-bold text-slate-700 mb-1.5">
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
                        <label htmlFor="password" className="block text-sm font-bold text-slate-700 mb-1.5">
                            Palavra-passe
                        </label>
                        <input
                            id="password"
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="Mínimo de 6 caracteres"
                            autoComplete="new-password"
                            required
                            minLength={6}
                            className="w-full rounded-xl border border-slate-200 bg-slate-50/50 p-3 text-sm text-slate-800 placeholder:text-slate-400 focus:border-sky-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-sky-100 transition"
                        />
                    </div>

                    <div>
                        <label htmlFor="confirmPassword" className="block text-sm font-bold text-slate-700 mb-1.5">
                            Confirmar Palavra-passe
                        </label>
                        <input
                            id="confirmPassword"
                            type="password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            placeholder="Repita a palavra-passe"
                            autoComplete="new-password"
                            required
                            minLength={6}
                            className="w-full rounded-xl border border-slate-200 bg-slate-50/50 p-3 text-sm text-slate-800 placeholder:text-slate-400 focus:border-sky-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-sky-100 transition"
                        />
                    </div>

                    {/* Consentimento LGPD (Requisito Documentado) */}
                    <div className="flex items-start gap-3 pt-2 pb-2">
                        <input
                            id="lgpd"
                            type="checkbox"
                            required
                            className="mt-1 h-4 w-4 rounded border-slate-300 text-sky-600 focus:ring-sky-500 cursor-pointer"
                        />
                        <label htmlFor="lgpd" className="text-[11px] text-slate-500 leading-relaxed cursor-pointer">
                            Compreendo e aceito que os meus dados serão processados de acordo com a <strong>Política de Privacidade</strong> e <strong>LGPD</strong>, garantindo o meu direito ao anonimato nas avaliações públicas.
                        </label>
                    </div>

                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full h-12 rounded-xl bg-sky-600 text-white font-bold text-sm shadow-sm hover:bg-sky-700 active:scale-[0.99] disabled:opacity-50 transition"
                    >
                        {isSubmitting ? "A criar conta..." : "Registar Conta"}
                    </button>
                </form>

                {/* Rodapé do Formulário */}
                <div className="mt-8 text-center text-sm text-slate-500 border-t border-slate-100 pt-6">
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
