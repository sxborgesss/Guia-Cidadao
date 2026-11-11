"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { API_URL } from "@/lib/api";

interface Avaliacao {
    id: string;
    nota: number;
    comentario: string;
    isAnonimo?: boolean;
    created_at: string;
    service?: {
        id: string;
        nome: string;
    };
    respostaInstitucional?: {
        resposta: string;
        created_at: string;
    } | null;
}

type StatusManifestacao =
    | "RECEBIDA"
    | "EM_ANALISE"
    | "RESPONDIDA"
    | "ENCERRADA";

interface Manifestacao {
    id: string;
    protocolo: string;
    tipo: string;
    assunto: string;
    descricao: string;
    status: StatusManifestacao;
    resposta: string | null;
    created_at: string;
    updated_at: string;
}

function formatarData(data?: string) {
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

function formatarStatus(status: StatusManifestacao) {
    const nomes: Record<StatusManifestacao, string> = {
        RECEBIDA: "Recebida",
        EM_ANALISE: "Em análise",
        RESPONDIDA: "Respondida",
        ENCERRADA: "Encerrada",
    };

    return nomes[status] ?? status;
}

function classesStatus(status: StatusManifestacao) {
    const classes: Record<StatusManifestacao, string> = {
        RECEBIDA: "bg-blue-100 text-blue-800",
        EM_ANALISE: "bg-amber-100 text-amber-800",
        RESPONDIDA: "bg-emerald-100 text-emerald-800",
        ENCERRADA: "bg-slate-200 text-slate-700",
    };

    return classes[status] ?? "bg-slate-100 text-slate-700";
}

function formatarTipo(tipo: string) {
    const nomes: Record<string, string> = {
        RECLAMACAO: "Reclamação",
        DENUNCIA: "Denúncia",
        SUGESTAO: "Sugestão",
        ELOGIO: "Elogio",
        SOLICITACAO: "Solicitação",
    };

    return nomes[tipo] ?? tipo;
}

export default function MinhaAreaPage() {
    const router = useRouter();

    const [avaliacoes, setAvaliacoes] = useState<Avaliacao[]>([]);
    const [manifestacoes, setManifestacoes] = useState<Manifestacao[]>([]);

    const [carregandoPerfil, setCarregandoPerfil] = useState(true);
    const [carregandoAvaliacoes, setCarregandoAvaliacoes] =
        useState(true);
    const [carregandoManifestacoes, setCarregandoManifestacoes] =
        useState(true);

    const [erroAvaliacoes, setErroAvaliacoes] = useState("");
    const [erroOuvidoria, setErroOuvidoria] = useState("");

    useEffect(() => {
        let ativo = true;

        async function carregarAvaliacoes(token: string) {
            try {
                const response = await fetch(
                    `${API_URL}/reviews/minhas`,
                    {
                        method: "GET",
                        headers: {
                            Authorization: `Bearer ${token}`,
                        },
                    },
                );

                if (!response.ok) {
                    throw new Error(
                        response.status === 401
                            ? "Sua sessão expirou. Entre novamente."
                            : "Não foi possível carregar suas avaliações.",
                    );
                }

                const dados: Avaliacao[] = await response.json();

                if (ativo) {
                    setAvaliacoes(
                        Array.isArray(dados) ? dados : [],
                    );
                }
            } catch (error) {
                if (ativo) {
                    setErroAvaliacoes(
                        error instanceof Error
                            ? error.message
                            : "Ocorreu um erro ao carregar suas avaliações.",
                    );
                }
            } finally {
                if (ativo) {
                    setCarregandoAvaliacoes(false);
                }
            }
        }

        async function carregarManifestacoes(token: string) {
            try {
                const response = await fetch(
                    `${API_URL}/ouvidoria/minhas`,
                    {
                        method: "GET",
                        headers: {
                            Authorization: `Bearer ${token}`,
                        },
                    },
                );

                if (!response.ok) {
                    throw new Error(
                        response.status === 401
                            ? "Sua sessão expirou. Entre novamente."
                            : "Não foi possível carregar suas manifestações da Ouvidoria.",
                    );
                }

                const dados: Manifestacao[] = await response.json();

                if (ativo) {
                    setManifestacoes(
                        Array.isArray(dados) ? dados : [],
                    );
                }
            } catch (error) {
                if (ativo) {
                    setErroOuvidoria(
                        error instanceof Error
                            ? error.message
                            : "Ocorreu um erro ao carregar suas manifestações.",
                    );
                }
            } finally {
                if (ativo) {
                    setCarregandoManifestacoes(false);
                }
            }
        }

        async function inicializar() {
            const token = localStorage.getItem("token");
            const usuarioSalvo = localStorage.getItem("user");

            if (!token || !usuarioSalvo) {
                router.replace("/login");
                return;
            }

            try {
                const usuario = JSON.parse(usuarioSalvo);

                if (usuario.role !== "CIDADAO") {
                    router.replace("/");
                    return;
                }

                if (!ativo) return;

                setCarregandoPerfil(false);

                // As duas consultas são independentes.
                // Uma falha não impede a outra de carregar.
                await Promise.all([
                    carregarAvaliacoes(token),
                    carregarManifestacoes(token),
                ]);
            } catch {
                if (ativo) {
                    setErroAvaliacoes(
                        "Não foi possível validar sua sessão.",
                    );
                    setErroOuvidoria(
                        "Não foi possível validar sua sessão.",
                    );
                    setCarregandoPerfil(false);
                    setCarregandoAvaliacoes(false);
                    setCarregandoManifestacoes(false);
                }
            }
        }

        inicializar();

        return () => {
            ativo = false;
        };
    }, [router]);

    if (carregandoPerfil) {
        return (
            <main className="flex min-h-[60vh] items-center justify-center">
                <p className="text-sm font-semibold text-slate-500">
                    Verificando sua sessão...
                </p>
            </main>
        );
    }

    return (
        <main className="mx-auto max-w-5xl space-y-12 px-4 py-10 sm:px-6">
            {/* Cabeçalho */}
            <section>
                <span className="text-sm font-bold text-sky-600">
                    ÁREA DO CIDADÃO
                </span>

                <h1 className="mt-2 text-3xl font-extrabold text-slate-900">
                    Minha Área
                </h1>

                <p className="mt-2 text-slate-600">
                    Acompanhe suas atividades no Guia Cidadão, consulte suas
                    avaliações e acompanhe suas manifestações na Ouvidoria.
                </p>
            </section>

            {/* Minhas avaliações */}
            <section>
                <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
                    <div>
                        <h2 className="text-2xl font-extrabold text-slate-900">
                            Minhas avaliações
                        </h2>

                        <p className="mt-1 text-sm text-slate-500">
                            Histórico das avaliações realizadas nos serviços
                            públicos.
                        </p>
                    </div>

                    <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-600">
                        {avaliacoes.length}{" "}
                        {avaliacoes.length === 1
                            ? "avaliação"
                            : "avaliações"}
                    </span>
                </div>

                {carregandoAvaliacoes && (
                    <p className="rounded-xl bg-slate-50 p-5 text-sm text-slate-500">
                        Carregando suas avaliações...
                    </p>
                )}

                {!carregandoAvaliacoes && erroAvaliacoes && (
                    <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
                        {erroAvaliacoes}
                    </div>
                )}

                {!carregandoAvaliacoes &&
                    !erroAvaliacoes &&
                    avaliacoes.length === 0 && (
                        <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center">
                            <h3 className="text-lg font-bold text-slate-800">
                                Você ainda não realizou avaliações
                            </h3>

                            <p className="mt-2 text-sm text-slate-500">
                                Explore os serviços públicos e compartilhe
                                sua experiência.
                            </p>

                            <Link
                                href="/servicos"
                                className="mt-5 inline-flex rounded-xl bg-sky-600 px-5 py-3 text-sm font-bold text-white transition hover:bg-sky-700"
                            >
                                Explorar serviços
                            </Link>
                        </div>
                    )}

                {!carregandoAvaliacoes &&
                    !erroAvaliacoes &&
                    avaliacoes.length > 0 && (
                        <div className="space-y-5">
                            {avaliacoes.map((avaliacao) => (
                                <article
                                    key={avaliacao.id}
                                    className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
                                >
                                    <div className="flex flex-wrap items-start justify-between gap-3">
                                        <div>
                                            <h3 className="text-lg font-bold text-slate-900">
                                                {avaliacao.service?.nome ??
                                                    "Serviço não identificado"}
                                            </h3>

                                            <p className="mt-1 text-sm text-slate-500">
                                                Avaliada em{" "}
                                                {formatarData(
                                                    avaliacao.created_at,
                                                )}
                                            </p>
                                        </div>

                                        <span className="rounded-lg bg-amber-50 px-3 py-2 text-sm font-bold text-amber-700">
                                            ★ {avaliacao.nota}/5
                                        </span>
                                    </div>

                                    <p className="mt-4 whitespace-pre-wrap text-sm leading-6 text-slate-700">
                                        {avaliacao.comentario}
                                    </p>

                                    {avaliacao.isAnonimo && (
                                        <p className="mt-3 text-xs font-semibold text-slate-500">
                                            <span className="mr-1">🔒</span>
                                            Avaliação publicada anonimamente
                                        </p>
                                    )}

                                    {avaliacao.respostaInstitucional ? (
                                        <div className="mt-5 rounded-xl border border-sky-100 bg-sky-50 p-4">
                                            <h4 className="text-sm font-bold text-sky-900">
                                                Resposta da instituição
                                            </h4>

                                            <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-slate-700">
                                                {
                                                    avaliacao
                                                        .respostaInstitucional
                                                        .resposta
                                                }
                                            </p>

                                            <p className="mt-2 text-xs text-slate-500">
                                                Respondida em{" "}
                                                {formatarData(
                                                    avaliacao
                                                        .respostaInstitucional
                                                        .created_at,
                                                )}
                                            </p>
                                        </div>
                                    ) : (
                                        <p className="mt-4 text-xs text-slate-500">
                                            A instituição ainda não respondeu
                                            a esta avaliação.
                                        </p>
                                    )}
                                </article>
                            ))}
                        </div>
                    )}
            </section>

            {/* Minhas manifestações */}
            <section>
                <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
                    <div>
                        <h2 className="text-2xl font-extrabold text-slate-900">
                            Minhas manifestações
                        </h2>

                        <p className="mt-1 text-sm text-slate-600">
                            Acompanhe suas solicitações enviadas à Ouvidoria
                            e consulte as respostas da administração.
                        </p>
                    </div>

                    <Link
                        href="/ouvidoria"
                        className="inline-flex items-center justify-center rounded-lg bg-sky-600 px-4 py-2.5 text-xs font-bold text-white transition hover:bg-sky-700"
                    >
                        Nova manifestação
                    </Link>
                </div>

                {carregandoManifestacoes && (
                    <p className="rounded-xl bg-slate-50 p-5 text-sm text-slate-500">
                        Carregando suas manifestações...
                    </p>
                )}

                {!carregandoManifestacoes && erroOuvidoria && (
                    <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
                        {erroOuvidoria}

                        <p className="mt-2 text-xs">
                            Suas avaliações continuam disponíveis na seção
                            acima.
                        </p>
                    </div>
                )}

                {!carregandoManifestacoes &&
                    !erroOuvidoria &&
                    manifestacoes.length === 0 && (
                        <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center">
                            <h3 className="text-lg font-bold text-slate-800">
                                Você ainda não possui manifestações
                            </h3>

                            <p className="mt-2 text-sm text-slate-500">
                                Quando enviar uma manifestação à Ouvidoria,
                                poderá acompanhar o andamento por aqui.
                            </p>

                            <Link
                                href="/ouvidoria"
                                className="mt-5 inline-flex rounded-xl bg-sky-600 px-5 py-3 text-sm font-bold text-white transition hover:bg-sky-700"
                            >
                                Acessar Ouvidoria
                            </Link>
                        </div>
                    )}

                {!carregandoManifestacoes &&
                    !erroOuvidoria &&
                    manifestacoes.length > 0 && (
                        <div className="space-y-4">
                            {manifestacoes.map((manifestacao) => (
                                <article
                                    key={manifestacao.id}
                                    className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
                                >
                                    <div className="flex flex-wrap items-start justify-between gap-3">
                                        <div>
                                            <h3 className="text-lg font-bold text-slate-900">
                                                {manifestacao.assunto}
                                            </h3>

                                            <p className="mt-1 break-all font-mono text-sm text-slate-500">
                                                Protocolo:{" "}
                                                {manifestacao.protocolo}
                                            </p>
                                        </div>

                                        <span
                                            className={`rounded-lg px-3 py-2 text-xs font-bold ${classesStatus(manifestacao.status)}`}
                                        >
                                            {formatarStatus(manifestacao.status)}
                                        </span>
                                    </div>

                                    <div className="mt-4 grid gap-3 sm:grid-cols-2">
                                        <div>
                                            <p className="text-xs font-semibold uppercase text-slate-400">
                                                Tipo
                                            </p>

                                            <p className="mt-1 text-sm font-semibold text-slate-800">
                                                {formatarTipo(manifestacao.tipo)}
                                            </p>
                                        </div>

                                        <div>
                                            <p className="text-xs font-semibold uppercase text-slate-400">
                                                Data de abertura
                                            </p>

                                            <p className="mt-1 text-sm text-slate-700">
                                                {formatarData(
                                                    manifestacao.created_at,
                                                )}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="mt-4">
                                        <h4 className="text-sm font-bold text-slate-800">
                                            Descrição
                                        </h4>

                                        <p className="mt-1 whitespace-pre-wrap text-sm leading-6 text-slate-600">
                                            {manifestacao.descricao}
                                        </p>
                                    </div>

                                    {manifestacao.resposta ? (
                                        <div className="mt-5 rounded-xl border border-emerald-200 bg-emerald-50 p-4">
                                            <h4 className="text-sm font-bold text-emerald-900">
                                                Resposta da administração
                                            </h4>

                                            <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-slate-700">
                                                {manifestacao.resposta}
                                            </p>
                                        </div>
                                    ) : (
                                        <p className="mt-4 rounded-lg bg-slate-50 p-3 text-xs text-slate-500">
                                            Sua manifestação ainda não possui
                                            uma resposta. Você poderá
                                            acompanhar a atualização por aqui.
                                        </p>
                                    )}
                                </article>
                            ))}
                        </div>
                    )}
            </section>
        </main>
    );
}