
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { API_URL } from "@/lib/api";

interface UserData {
    id: string;
    nome: string;
    email: string;
    role: string;
}

interface ServiceData {
    id: string;
    nome: string;
}

interface ReviewData {
    id: string;
    nota: number;
    comentario: string;
    service_id: string;
    isAnonimo?: boolean;
    created_at: string;
    service?: {
        id: string;
        nome: string;
    };
    user?: {
        nome?: string;
    };
    respostaInstitucional?: {
        id: string;
        resposta: string;
        created_at: string;
    } | null;
}

function formatarData(data: string) {
    if (!data) return "Data não disponível";

    const dataFormatada = new Date(data);

    if (Number.isNaN(dataFormatada.getTime())) {
        return "Data não disponível";
    }

    return dataFormatada.toLocaleDateString("pt-BR", {
        day: "2-digit",
        month: "long",
        year: "numeric",
    });
}

export default function GestorPage() {
    const router = useRouter();

    const [user, setUser] = useState<UserData | null>(null);
    const [reviews, setReviews] = useState<ReviewData[]>([]);
    const [servicos, setServicos] = useState<ServiceData[]>([]);
    const [respostas, setRespostas] = useState<Record<string, string>>({});
    const [carregando, setCarregando] = useState(true);
    const [erro, setErro] = useState<string | null>(null);
    const [mensagens, setMensagens] = useState<
        Record<string, { tipo: "erro" | "sucesso"; texto: string }>
    >({});
    const [enviando, setEnviando] = useState<string | null>(null);
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

                // Busca avaliações e serviços vinculados em paralelo.
                const headers = {
                    Authorization: `Bearer ${token}`,
                };

                const [responseReviews, responseServicos] =
                    await Promise.all([
                        fetch(
                            `${API_URL}/reviews/gestor/minhas`,
                            {
                                method: "GET",
                                headers,
                            }
                        ),
                        fetch(
                            `${API_URL}/users/gestor/meus-servicos`,
                            {
                                method: "GET",
                                headers,
                            }
                        ),
                    ]);

                if (
                    responseReviews.status === 401 ||
                    responseServicos.status === 401
                ) {
                    throw new Error(
                        "Sua sessão expirou. Entre novamente."
                    );
                }

                if (
                    responseReviews.status === 403 ||
                    responseServicos.status === 403
                ) {
                    throw new Error(
                        "Você não possui permissão para acessar esta área."
                    );
                }

                if (!responseReviews.ok || !responseServicos.ok) {
                    throw new Error(
                        "Não foi possível carregar os dados do painel."
                    );
                }

                const [dadosReviews, dadosServicos] = await Promise.all([
                    responseReviews.json(),
                    responseServicos.json(),
                ]);

                if (!ativo) return;

                setReviews(
                    Array.isArray(dadosReviews) ? dadosReviews : []
                );

                setServicos(
                    Array.isArray(dadosServicos) ? dadosServicos : []
                );
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

    async function enviarResposta(reviewId: string) {
        const resposta = (respostas[reviewId] || "").trim();
        const token = localStorage.getItem("token");

        if (!resposta) {
            setMensagens((anteriores) => ({
                ...anteriores,
                [reviewId]: {
                    tipo: "erro",
                    texto: "Digite uma resposta antes de enviar.",
                },
            }));

            return;
        }

        if (!token) {
            router.replace("/login");
            return;
        }

        setEnviando(reviewId);

        setMensagens((anteriores) => {
            const novas = { ...anteriores };
            delete novas[reviewId];
            return novas;
        });

        try {
            const response = await fetch(
                `${API_URL}/reviews/${reviewId}/responder`,
                {
                    method: "POST",
                    headers: {
                        Authorization: `Bearer ${token}`,
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({ resposta }),
                }
            );

            if (!response.ok) {
                let mensagem = "Não foi possível enviar a resposta.";

                try {
                    const dados = await response.json();

                    if (typeof dados.message === "string") {
                        mensagem = dados.message;
                    } else if (Array.isArray(dados.message)) {
                        mensagem = dados.message.join(" ");
                    }
                } catch {
                    // Mantém a mensagem padrão caso a resposta não seja JSON.
                }

                throw new Error(mensagem);
            }

            setRespostas((anteriores) => ({
                ...anteriores,
                [reviewId]: "",
            }));

            setMensagens((anteriores) => ({
                ...anteriores,
                [reviewId]: {
                    tipo: "sucesso",
                    texto: "Resposta institucional publicada com sucesso!",
                },
            }));

            setAtualizar((valor) => valor + 1);
        } catch (error) {
            setMensagens((anteriores) => ({
                ...anteriores,
                [reviewId]: {
                    tipo: "erro",
                    texto:
                        error instanceof Error
                            ? error.message
                            : "Erro inesperado ao enviar a resposta.",
                },
            }));
        } finally {
            setEnviando(null);
        }
    }

    const totalAvaliacoes = reviews.length;

    const mediaAvaliacoes =
        totalAvaliacoes > 0
            ? (
                reviews.reduce(
                    (soma, review) => soma + review.nota,
                    0
                ) / totalAvaliacoes
            ).toFixed(1)
            : "0.0";

    const totalRespondidas = reviews.filter(
        (review) => Boolean(review.respostaInstitucional?.id)
    ).length;

    const totalPendentes = totalAvaliacoes - totalRespondidas;

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

            {/* Erro geral */}
            {erro && (
                <div className="mb-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm font-medium text-red-700">
                    {erro}
                </div>
            )}

            {/* Indicadores */}
            <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">

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
                        Respondidas
                    </span>

                    <p className="mt-2 text-3xl font-bold text-emerald-600">
                        {totalRespondidas}
                    </p>

                    <span className="text-xs font-medium text-slate-500">
                        Respostas institucionais publicadas
                    </span>
                </div>

                <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
                    <span className="text-xs font-semibold uppercase text-slate-500">
                        Pendentes
                    </span>

                    <p className="mt-2 text-3xl font-bold text-amber-600">
                        {totalPendentes}
                    </p>

                    <span className="text-xs font-medium text-slate-500">
                        Aguardando resposta institucional
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
                                As avaliações dos serviços vinculados aparecerão
                                aqui quando forem cadastradas.
                            </p>
                        </div>
                    )}

                    <div className="space-y-4">
                        {reviews.map((review) => {
                            const jaRespondida = Boolean(
                                review.respostaInstitucional?.id
                            );

                            return (
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

                                    {/* Resposta institucional já publicada */}
                                    {jaRespondida ? (
                                        <div className="mt-4 rounded-xl border border-emerald-100 bg-emerald-50 p-4">
                                            <div className="flex flex-wrap items-center justify-between gap-2">
                                                <h4 className="text-sm font-bold text-emerald-800">
                                                    Resposta institucional
                                                </h4>

                                                <span className="rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-semibold text-emerald-700">
                                                    Respondida
                                                </span>
                                            </div>

                                            <p className="mt-3 text-sm leading-relaxed text-slate-700">
                                                {review.respostaInstitucional?.resposta}
                                            </p>

                                            <p className="mt-3 text-xs text-slate-500">
                                                Respondida em{" "}
                                                {formatarData(
                                                    review.respostaInstitucional!.created_at
                                                )}
                                            </p>
                                        </div>
                                    ) : (
                                        /* Formulário de resposta */
                                        <div className="mt-4 rounded-xl border border-amber-100 bg-amber-50 p-4">
                                            <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                                                <h4 className="text-sm font-bold text-slate-800">
                                                    Responder avaliação
                                                </h4>

                                                <span className="rounded-full bg-amber-100 px-2.5 py-1 text-xs font-semibold text-amber-700">
                                                    Pendente
                                                </span>
                                            </div>

                                            <textarea
                                                value={respostas[review.id] || ""}
                                                onChange={(event) =>
                                                    setRespostas((anteriores) => ({
                                                        ...anteriores,
                                                        [review.id]: event.target.value,
                                                    }))
                                                }
                                                placeholder="Escreva uma resposta institucional ao cidadão..."
                                                rows={3}
                                                maxLength={2000}
                                                className="w-full resize-y rounded-lg border border-slate-200 bg-white p-3 text-sm text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-sky-400 focus:ring-2 focus:ring-sky-100"
                                            />

                                            <div className="mt-2 flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
                                                <span className="text-xs text-slate-400">
                                                    {(respostas[review.id] || "").length}/2000 caracteres
                                                </span>

                                                <button
                                                    type="button"
                                                    onClick={() => enviarResposta(review.id)}
                                                    disabled={
                                                        enviando === review.id ||
                                                        !(respostas[review.id] || "").trim()
                                                    }
                                                    className="rounded-lg bg-sky-600 px-4 py-2 text-xs font-bold text-white transition hover:bg-sky-700 disabled:cursor-not-allowed disabled:opacity-50"
                                                >
                                                    {enviando === review.id
                                                        ? "Enviando..."
                                                        : "Publicar resposta"}
                                                </button>
                                            </div>

                                            {mensagens[review.id] && (
                                                <p
                                                    className={`mt-3 text-xs font-semibold ${
                                                        mensagens[review.id].tipo === "sucesso"
                                                            ? "text-emerald-700"
                                                            : "text-red-600"
                                                    }`}
                                                >
                                                    {mensagens[review.id].texto}
                                                </p>
                                            )}
                                        </div>
                                    )}
                                </article>
                            );
                        })}
                    </div>
                </section>

                {/* Todos os serviços vinculados */}
                <aside className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
                    <h2 className="text-lg font-bold text-slate-800">
                        Meus serviços
                    </h2>

                    <p className="mt-2 text-sm text-slate-500">
                        Todos os serviços vinculados à sua conta.
                    </p>

                    {servicos.length === 0 ? (
                        <p className="mt-6 rounded-xl bg-slate-50 p-4 text-sm text-slate-500">
                            Nenhum serviço vinculado à sua conta.
                        </p>
                    ) : (
                        <div className="mt-5 space-y-3">
                            {servicos.map((servico) => {
                                const quantidade = reviews.filter(
                                    (review) =>
                                        (review.service?.id ?? review.service_id) === servico.id
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
                </aside>

            </div>
        </main>
    );
}
