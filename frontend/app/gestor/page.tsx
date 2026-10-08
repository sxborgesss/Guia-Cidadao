"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

interface UserData {
    id: string;
    nome: string;
    email: string;
    role: string;
}

export default function GestorPage() {
    const router = useRouter();

    const [user, setUser] = useState<UserData | null>(null);
    const [carregando, setCarregando] = useState(true);

    useEffect(() => {
        const rawUser = localStorage.getItem("user");
        const token = localStorage.getItem("token");

        if (!rawUser || !token) {
            router.push("/login");
            return;
        }

        try {
            const parsedUser: UserData = JSON.parse(rawUser);

            if (parsedUser.role !== "GESTOR") {
                alert("Acesso restrito a gestores.");
                router.push("/");
                return;
            }

            setUser(parsedUser);
        } catch {
            router.push("/login");
        } finally {
            setCarregando(false);
        }
    }, [router]);

    if (carregando) {
        return (
            <div className="flex min-h-[60vh] items-center justify-center">
                <p className="text-sm font-semibold text-slate-500">
                    Verificando permissões...
                </p>
            </div>
        );
    }

    return (
        <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">

            {/* Cabeçalho */}
            <div className="mb-8 flex flex-col justify-between gap-4 border-b border-slate-200 pb-6 sm:flex-row sm:items-center">
                <div>
                    <div className="flex items-center gap-2">
                        <span className="rounded-md bg-sky-100 px-2.5 py-0.5 text-xs font-bold text-sky-700">
                            Área do Gestor
                        </span>

                        <span className="text-xs font-medium text-slate-500">
                            FeedPalmas v1.0
                        </span>
                    </div>

                    <h1 className="mt-2 text-2xl font-extrabold text-slate-900 sm:text-3xl">
                        Painel do Gestor
                    </h1>

                    <p className="text-sm text-slate-600">
                        Bem-vindo,{" "}
                        <span className="font-bold text-slate-800">
                            {user?.nome}
                        </span>
                    </p>
                </div>

                <Link
                    href="/"
                    className="inline-flex h-9 items-center justify-center rounded-lg border border-slate-200 bg-white px-4 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                >
                    Voltar ao Site Público
                </Link>
            </div>

            {/* Cards */}
            <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-3">

                <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
                    <span className="text-xs font-semibold uppercase text-slate-500">
                        Meu perfil
                    </span>

                    <p className="mt-2 text-lg font-bold text-slate-800">
                        Gestor
                    </p>

                    <span className="text-xs text-sky-600 font-medium">
                        Acesso institucional
                    </span>
                </div>

                <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
                    <span className="text-xs font-semibold uppercase text-slate-500">
                        Avaliações
                    </span>

                    <p className="mt-2 text-2xl font-bold text-slate-800">
                        0
                    </p>

                    <span className="text-xs text-amber-600 font-medium">
                        Aguardando análise
                    </span>
                </div>

                <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
                    <span className="text-xs font-semibold uppercase text-slate-500">
                        Respostas
                    </span>

                    <p className="mt-2 text-2xl font-bold text-slate-800">
                        0
                    </p>

                    <span className="text-xs text-emerald-600 font-medium">
                        Respostas realizadas
                    </span>
                </div>

            </div>

            {/* Área principal */}
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">

                <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
                    <h2 className="text-lg font-bold text-slate-800">
                        Avaliações dos serviços
                    </h2>

                    <p className="mt-2 text-sm text-slate-500">
                        Aqui serão exibidas as avaliações dos cidadãos
                        relacionadas aos serviços públicos administrados.
                    </p>

                    <button
                        type="button"
                        className="mt-5 rounded-xl bg-sky-600 px-5 py-2.5 text-sm font-bold text-white hover:bg-sky-700"
                    >
                        Ver avaliações
                    </button>
                </div>

                <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
                    <h2 className="text-lg font-bold text-slate-800">
                        Respostas institucionais
                    </h2>

                    <p className="mt-2 text-sm text-slate-500">
                        Área destinada às respostas oficiais aos comentários
                        realizados pelos cidadãos.
                    </p>

                    <button
                        type="button"
                        className="mt-5 rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-sm font-bold text-slate-700 hover:bg-slate-50"
                    >
                        Gerenciar respostas
                    </button>
                </div>

            </div>

        </main>
    );
}