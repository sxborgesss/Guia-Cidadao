"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

interface Avaliacao {
    id: string;
    nota: number;
    comentario: string;
    isAnonimo: boolean;
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

interface Manifestacao {
    id: string;
    protocolo: string;
    tipo: string;
    assunto: string;
    descricao: string;
    status: "RECEBIDA" | "EM_ANALISE" | "RESPONDIDA" | "ENCERRADA";
    resposta: string | null;
    created_at: string;
    updated_at: string;
}

export default function MinhaAreaPage() {
    const router = useRouter();

    const [avaliacoes, setAvaliacoes] = useState<Avaliacao[]>([]);
    const [carregando, setCarregando] = useState(true);
    const [erro, setErro] = useState("");
    const [manifestacoes, setManifestacoes] = useState<Manifestacao[]>([]);
    const [carregandoManifestacoes, setCarregandoManifestacoes] = useState(true);
    const [erroOuvidoria, setErroOuvidoria] = useState("");

    useEffect(() => {
        async function carregarAvaliacoes() {
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

                const response = await fetch(
                    "http://localhost:3001/reviews/minhas",
                    {
                        method: "GET",
                        headers: {
                            Authorization: `Bearer ${token}`,
                        },
                    },
                );

                if (!response.ok) {
                    throw new Error(
                        "Não foi possível carregar suas avaliações.",
                    );
                }

                const dados: Avaliacao[] = await response.json();

                setAvaliacoes(Array.isArray(dados) ? dados : []);

                const respostaOuvidoria = await fetch(
                    "http://localhost:3001/ouvidoria/minhas",
                    {
                        method: "GET",
                        headers: {
                            Authorization: `Bearer ${token}`,
                        },
                    },
                );

                if (!respostaOuvidoria.ok) {
                    throw new Error(
                        "Não foi possível carregar suas manifestações da Ouvidoria.",
                    );
                }

                const dadosOuvidoria: Manifestacao[] = await respostaOuvidoria.json();

                setManifestacoes(
                    Array.isArray(dadosOuvidoria) ? dadosOuvidoria : [],
                );
            } catch (error) {
                setErro(
                    error instanceof Error
                        ? error.message
                        : "Ocorreu um erro ao carregar suas avaliações.",
                );
            } finally {
                setCarregando(false);
            }
        }

        carregarAvaliacoes();
    }, [router]);

    if (carregando) {
        return (
            <main className="flex min-h-[60vh] items-center justify-center">
                <p className="text-slate-500">
                    Carregando suas avaliações...
                </p>
            </main>
        );
    }

    return (
        <main className="mx-auto max-w-5xl px-4 py-10 sm:px-6">
            <div className="mb-8">
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
            </div>

            {erro && (
                <div className="mb-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
                    {erro}
                </div>
            )}

            <h2 className="mb-5 text-2xl font-extrabold text-slate-900">
                Minhas avaliações
            </h2>

            {!erro && avaliacoes.length === 0 && (
                <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center">
                    <h2 className="text-lg font-bold text-slate-800">
                        Você ainda não realizou avaliações
                    </h2>

                    <p className="mt-2 text-sm text-slate-500">
                        Explore os serviços públicos e compartilhe sua
                        experiência.
                    </p>

                    <Link
                        href="/servicos"
                        className="mt-5 inline-flex rounded-xl bg-sky-600 px-5 py-3 text-sm font-bold text-white transition hover:bg-sky-700"
                    >
                        Explorar serviços
                    </Link>
                </div>
            )}

            <div className="space-y-5">
                {avaliacoes.map((avaliacao) => (
                    <article
                        key={avaliacao.id}
                        className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
                    >
                        <div className="flex flex-wrap items-start justify-between gap-3">
                            <div>
                                <h2 className="text-lg font-bold text-slate-900">
                                    {avaliacao.service?.nome ??
                                        "Serviço não identificado"}
                                </h2>

                                <p className="mt-1 text-sm text-slate-500">
                                    Avaliada em{" "}
                                    {new Date(
                                        avaliacao.created_at,
                                    ).toLocaleDateString("pt-BR")}
                                </p>
                            </div>

                            <span className="rounded-lg bg-amber-50 px-3 py-2 text-sm font-bold text-amber-700">
                                ★ {avaliacao.nota}/5
                            </span>
                        </div>

                        <p className="mt-4 text-sm leading-6 text-slate-700">
                            {avaliacao.comentario}
                        </p>

                        {avaliacao.isAnonimo && (
                            <p className="mt-3 text-xs font-semibold text-slate-500">
                                Avaliação publicada anonimamente
                            </p>
                        )}

                        {avaliacao.respostaInstitucional && (
                            <div className="mt-5 rounded-xl border border-sky-100 bg-sky-50 p-4">
                                <h3 className="text-sm font-bold text-sky-900">
                                    Resposta da instituição
                                </h3>

                                <p className="mt-2 text-sm leading-6 text-slate-700">
                                    {avaliacao.respostaInstitucional.resposta}
                                </p>

                                <p className="mt-2 text-xs text-slate-500">
                                    Respondida em{" "}
                                    {new Date(
                                        avaliacao.respostaInstitucional.created_at,
                                    ).toLocaleDateString("pt-BR")}
                                </p>
                            </div>
                        )}

                        {!avaliacao.respostaInstitucional && (
                            <p className="mt-4 text-xs text-slate-500">
                                A instituição ainda não respondeu a esta
                                avaliação.
                            </p>
                        )}
                    </article>
                ))}
            </div>
            <div className="mb-10">
                <h2 className="mb-2 text-2xl font-extrabold text-slate-900">
                    Minhas manifestações
                </h2>

                <p className="mb-5 text-sm text-slate-600">
                    Acompanhe suas solicitações enviadas à Ouvidoria e consulte
                    as respostas da administração.
                </p>

                {carregandoManifestacoes ? (
                    <p className="text-sm text-slate-500">
                        Carregando suas manifestações...
                    </p>
                ) : erroOuvidoria ? (
                    <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
                        {erroOuvidoria}
                    </div>
                ) : manifestacoes.length === 0 ? (
                    <div className="rounded-2xl border border-slate-200 bg-white p-6 text-center">
                        <h3 className="font-bold text-slate-800">
                            Você ainda não possui manifestações
                        </h3>

                        <p className="mt-2 text-sm text-slate-500">
                            Quando você enviar uma manifestação à Ouvidoria,
                            poderá acompanhar o andamento por aqui.
                        </p>
                    </div>
                ) : (
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

                                        <p className="mt-1 text-sm text-slate-500">
                                            Protocolo: {manifestacao.protocolo}
                                        </p>
                                    </div>

                                    <span className="rounded-lg bg-sky-50 px-3 py-2 text-xs font-bold text-sky-700">
                                        {manifestacao.status.replace("_", " ")}
                                    </span>
                                </div>

                                <div className="mt-4 space-y-2 text-sm text-slate-600">
                                    <p>
                                        <strong>Tipo:</strong> {manifestacao.tipo}
                                    </p>

                                    <p>
                                        <strong>Data de abertura:</strong>{" "}
                                        {new Date(
                                            manifestacao.created_at,
                                        ).toLocaleDateString("pt-BR")}
                                    </p>
                                </div>

                                <div className="mt-4">
                                    <h4 className="text-sm font-bold text-slate-800">
                                        Descrição
                                    </h4>

                                    <p className="mt-1 text-sm leading-6 text-slate-600">
                                        {manifestacao.descricao}
                                    </p>
                                </div>

                                {manifestacao.resposta ? (
                                    <div className="mt-5 rounded-xl border border-sky-100 bg-sky-50 p-4">
                                        <h4 className="text-sm font-bold text-sky-900">
                                            Resposta da administração
                                        </h4>

                                        <p className="mt-2 text-sm leading-6 text-slate-700">
                                            {manifestacao.resposta}
                                        </p>
                                    </div>
                                ) : (
                                    <p className="mt-4 text-xs text-slate-500">
                                        Sua manifestação ainda não possui uma resposta.
                                    </p>
                                )}
                            </article>
                        ))}
                    </div>
                )}
            </div>
        </main>
    );
}