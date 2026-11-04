
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

interface ReviewData {
    id: string;
    nota: number;
    comentario: string;
    service_id: string;
    user_id: string;
    created_at: string;
    service?: {
        id: string;
        nome: string;
    };
    user?: {
        id: string;
        nome: string;
    };
}

function formatarData(data: string) {
    if (!data) return "Data não disponível";

    return new Date(data).toLocaleDateString("pt-BR", {
        day: "2-digit",
        month: "long",
        year: "numeric",
    });
}

export default function GestorPage() {
    const router = useRouter();

    const [user, setUser] = useState<UserData | null>(null);
    const [reviews, setReviews] = useState<ReviewData[]>([]);
    const [carregando, setCarregando] = useState(true);
    const [erro, setErro] = useState<string | null>(null);
    const [atualizar, setAtualizar] = useState(0);

    useEffect(() => {
        let ativo = true;

        async function carregarPainel() {
            setCarregando(true);
            setErro(null);

            const rawUser = localStorage.getItem("user");
            const token = localStorage.getItem("token");

            if (!rawUser || !token) {
                router.replace("/login");
                return;
            }

            try {
                const parsedUser: UserData = JSON.parse(rawUser);

                if (parsedUser.role !== "GESTOR") {
                    router.replace("/");
                    return;
                }

                if (ativo) {
                    setUser(parsedUser);
                }

                const response = await fetch(
                    "http://localhost:3001/reviews/gestor/minhas",
                    {
                        method: "GET",
                        headers: {
                            Authorization: `Bearer ${token}`,
                        },
                    }
                );

                if (!response.ok) {
                    if (response.status === 401) {
                        throw new Error(
                            "Sua sessão expirou. Entre novamente."
                        );
                    }

                    if (response.status === 403) {
                        throw new Error(
                            "Você não possui permissão para acessar esta área."
                        );
                    }

                    throw new Error(
                        "Não foi possível carregar as avaliações."
                    );
                }

                const dados: ReviewData[] = await response.json();

                if (!ativo) return;

                setReviews(Array.isArray(dados) ? dados : []);

            } catch (error) {
                if (ativo) {
                    setErro(
                        error instanceof Error
                            ? error.message
                            : "Erro inesperado ao carregar o painel."
                    );
                }
            } finally {
                if (ativo) {
                    setCarregando(false);
                }
            }
        }

        carregarPainel();

        return () => {
            ativo = false;
        };
    }, [router, atualizar]);

    const totalAvaliacoes = reviews.length;

    const mediaAvaliacoes =
        totalAvaliacoes > 0
            ? (
                reviews.reduce((soma, review) => soma + review.nota, 0) /
                totalAvaliacoes
            ).toFixed(1)
            : "0.0";

    const servicosComAvaliacoes = Array.from(
        new Map(
            reviews
                .filter((review) => review.service)
                .map((review) => [
                    review.service!.id,
                    review.service!,
                ])
        ).values()
    );

    if (carregando) {
        return (
            <main className="flex min-h-[60vh] items-center justify-center">
                <p className="text-sm font-semibold text-slate-500">
                    Carregando painel do gestor...
                </p>
            </main>
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
                            Guia Cidadão
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

            {/* Mensagem de erro */}
            {erro && (
                <div className="mb-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm font-medium text-red-700">
                    {erro}
                </div>
            )}

            {/* Indicadores */}
            <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">

                <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
                    <span className="text-xs font-semibold uppercase text-slate-500">
                        Meu perfil
                    </span>

                    <p className="mt-2 text-lg font-bold text-slate-800">
                        Gestor
                    </p>

                    <span className="text-xs font-medium text-sky-600">
                        Acesso institucional
                    </span>
                </div>

                <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
                    <span className="text-xs font-semibold uppercase text-slate-500">
                        Avaliações recebidas
                    </span>

                    <p className="mt-2 text-3xl font-bold text-slate-800">
                        {totalAvaliacoes}
                    </p>

                    <span className="text-xs font-medium text-slate-500">
                        Nos serviços vinculados
                    </span>
                </div>

                <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
                    <span className="text-xs font-semibold uppercase text-slate-500">
                        Média das notas
                    </span>

                    <p className="mt-2 text-3xl font-bold text-slate-800">
                        {mediaAvaliacoes}
                        <span className="ml-1 text-lg text-amber-500">
                            ★
                        </span>
                    </p>

                    <span className="text-xs font-medium text-slate-500">
                        Média geral das avaliações recebidas
                    </span>
                </div>

                <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
                    <span className="text-xs font-semibold uppercase text-slate-500">
                        Serviços avaliados
                    </span>

                    <p className="mt-2 text-3xl font-bold text-slate-800">
                        {servicosComAvaliacoes.length}
                    </p>

                    <span className="text-xs font-medium text-slate-500">
                        Com avaliações recebidas
                    </span>
                </div>

            </div>

            {/* Conteúdo principal */}
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">

                {/* Avaliações */}
                <section
                    id="avaliacoes"
                    className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm lg:col-span-2"
                >
                    <div className="mb-6 flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
                        <div>
                            <h2 className="text-lg font-bold text-slate-800">
                                Avaliações recebidas
                            </h2>

                            <p className="mt-1 text-sm text-slate-500">
                                Manifestações dos cidadãos sobre seus serviços.
                            </p>
                        </div>

                        <button
                            type="button"
                            onClick={() => setAtualizar((valor) => valor + 1)}
                            className="rounded-lg border border-slate-200 px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50"
                        >
                            Atualizar avaliações
                        </button>
                    </div>

                    {totalAvaliacoes === 0 && !erro && (
                        <div className="rounded-xl bg-slate-50 p-8 text-center">
                            <p className="font-semibold text-slate-700">
                                Nenhuma avaliação recebida.
                            </p>

                            <p className="mt-2 text-sm text-slate-500">
                                As avaliações dos serviços vinculados
                                aparecerão aqui quando forem cadastradas.
                            </p>
                        </div>
                    )}

                    <div className="space-y-4">
                        {reviews.map((review) => (
                            <article
                                key={review.id}
                                className="rounded-xl border border-slate-200 p-4 transition hover:border-sky-200"
                            >
                                <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-start">

                                    <div>
                                        <h3 className="font-bold text-slate-800">
                                            {review.service?.nome ??
                                                "Serviço público"}
                                        </h3>

                                        <p className="mt-1 text-xs text-slate-500">
                                            Avaliação de{" "}
                                            {review.user?.nome ?? "Cidadão"}
                                        </p>
                                    </div>

                                    <div className="flex items-center gap-1">
                                        <span className="font-bold text-amber-500">
                                            ★
                                        </span>

                                        <span className="text-sm font-bold text-slate-800">
                                            {review.nota}/5
                                        </span>
                                    </div>

                                </div>

                                <p className="mt-4 text-sm leading-relaxed text-slate-700">
                                    {review.comentario}
                                </p>

                                <div className="mt-4 border-t border-slate-100 pt-3">
                                    <span className="text-xs text-slate-400">
                                        Publicada em{" "}
                                        {formatarData(review.created_at)}
                                    </span>
                                </div>
                            </article>
                        ))}
                    </div>
                </section>

                {/* Serviços vinculados com avaliações */}
                <aside className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
                    <h2 className="text-lg font-bold text-slate-800">
                        Serviços avaliados
                    </h2>

                    <p className="mt-2 text-sm text-slate-500">
                        Serviços vinculados à sua conta que já receberam avaliações.
                    </p>

                    {servicosComAvaliacoes.length === 0 ? (
                        <p className="mt-6 rounded-xl bg-slate-50 p-4 text-sm text-slate-500">
                            Nenhum serviço com avaliações no momento.
                        </p>
                    ) : (
                        <div className="mt-5 space-y-3">
                            {servicosComAvaliacoes.map((servico) => {
                                const quantidade = reviews.filter(
                                    (review) =>
                                        review.service?.id === servico.id
                                ).length;

                                return (
                                    <div
                                        key={servico.id}
                                        className="rounded-xl border border-slate-200 p-4"
                                    >
                                        <p className="font-bold text-slate-800">
                                            {servico.nome}
                                        </p>

                                        <p className="mt-1 text-xs text-slate-500">
                                            {quantidade}{" "}
                                            {quantidade === 1
                                                ? "avaliação"
                                                : "avaliações"}
                                        </p>
                                    </div>
                                );
                            })}
                        </div>
                    )}

                    <div className="mt-6 rounded-xl bg-sky-50 p-4">
                        <h3 className="text-sm font-bold text-sky-800">
                            Respostas institucionais
                        </h3>

                        <p className="mt-2 text-xs leading-relaxed text-sky-700">
                            A funcionalidade de respostas oficiais será
                            implementada na próxima etapa do projeto.
                        </p>
                    </div>
                </aside>

            </div>

        </main>
    );
}
