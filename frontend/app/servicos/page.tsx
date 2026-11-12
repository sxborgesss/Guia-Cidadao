
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { API_URL } from "@/lib/api";

interface PublicService {
    id: string;
    nome: string;
    categoria: string;
    endereco: string;
    mediaNota: number | string;
    totalAvaliacoes: number | string;
}

const CATEGORIAS_INFO: Record<
    string,
    { name: string; icon: string }
> = {
    saude: { name: "Saúde Pública", icon: "🏥" },
    educacao: { name: "Educação Básica", icon: "🏫" },
    transporte: { name: "Transporte e Vias", icon: "🚌" },
    zeladoria: { name: "Zeladoria e Limpeza", icon: "🧹" },
};

function converterNumero(
    valor: number | string | null | undefined,
): number {
    if (valor === null || valor === undefined || valor === "") {
        return 0;
    }

    const numero = Number(valor);

    return Number.isFinite(numero) ? numero : 0;
}

function normalizarTexto(valor: string) {
    return valor
        .trim()
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "");
}

function formatarCategoria(categoria: string) {
    const categoriaNormalizada = normalizarTexto(categoria);

    return (
        CATEGORIAS_INFO[categoriaNormalizada]?.name ??
        categoria
    );
}

export default function PaginaServicos() {
    const [servicos, setServicos] = useState<PublicService[]>([]);
    const [carregando, setCarregando] = useState(true);
    const [termoBusca, setTermoBusca] = useState("");
    const [erro, setErro] = useState<string | null>(null);

    useEffect(() => {
        let ativo = true;

        async function carregar() {
            try {
                const res = await fetch(`${API_URL}/services`, {
                    method: "GET",
                    cache: "no-store",
                });

                if (!res.ok) {
                    throw new Error(
                        "Não foi possível carregar os serviços públicos.",
                    );
                }

                const dados: PublicService[] = await res.json();

                if (!Array.isArray(dados)) {
                    throw new Error(
                        "A API retornou um formato inválido de serviços.",
                    );
                }

                if (ativo) {
                    setServicos(dados);
                }
            } catch (error) {
                if (ativo) {
                    setErro(
                        error instanceof Error
                            ? error.message
                            : "Erro ao procurar serviços públicos.",
                    );
                }
            } finally {
                if (ativo) {
                    setCarregando(false);
                }
            }
        }

        carregar();

        return () => {
            ativo = false;
        };
    }, []);

    const servicosFiltrados = servicos.filter((servico) => {
        const termo = normalizarTexto(termoBusca);

        return (
            normalizarTexto(servico.nome).includes(termo) ||
            normalizarTexto(servico.endereco).includes(termo) ||
            normalizarTexto(servico.categoria).includes(termo)
        );
    });

    return (
        <main className="mx-auto max-w-7xl space-y-10 px-4 py-8 sm:px-6 lg:px-8">

            {/* Apresentação e pesquisa */}
            <section className="flex flex-col items-center rounded-3xl border border-border bg-surface px-6 py-9 text-center shadow-card sm:px-10 sm:py-12">

                <span className="mb-4 inline-flex items-center gap-2 rounded-full bg-brand-light px-3.5 py-1 text-xs font-semibold text-brand">
                    <span className="h-2 w-2 rounded-full bg-brand" />
                    Guia Cidadão
                </span>

                <h1 className="max-w-3xl text-3xl font-black tracking-tight text-foreground sm:text-4xl">
                    Encontre serviços públicos em Palmas
                </h1>

                <p className="mt-4 max-w-2xl text-sm leading-relaxed text-foreground-muted sm:text-base">
                    Consulte unidades e serviços públicos, conheça suas
                    informações e acompanhe as avaliações dos cidadãos.
                </p>

                <div className="mt-7 w-full max-w-2xl">
                    <input
                        type="text"
                        value={termoBusca}
                        onChange={(event) =>
                            setTermoBusca(event.target.value)
                        }
                        placeholder="Buscar por nome, endereço ou categoria..."
                        aria-label="Pesquisar serviços públicos"
                        className="h-12 w-full rounded-xl border border-border bg-background px-4 text-sm text-foreground shadow-sm transition placeholder:text-foreground-muted focus:outline-none focus:ring-2 focus:ring-brand"
                    />
                </div>
            </section>

            {/* Catálogo de serviços */}
            <section className="space-y-6">

                <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
                    <div>
                        <h2 className="text-2xl font-bold tracking-tight text-foreground">
                            Serviços públicos cadastrados
                        </h2>

                        <p className="mt-1 text-sm text-foreground-muted">
                            Encontre informações e avaliações das unidades disponíveis.
                        </p>
                    </div>

                    {!carregando && !erro && (
                        <span className="text-sm font-medium text-foreground-muted">
                            {servicosFiltrados.length} resultado(s)
                        </span>
                    )}
                </div>

                {erro && (
                    <div
                        role="alert"
                        className="rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm font-medium text-rose-700"
                    >
                        {erro}
                    </div>
                )}

                {carregando ? (
                    <div className="rounded-2xl border border-border bg-surface p-8 text-center">
                        <p className="text-sm text-foreground-muted">
                            Carregando serviços públicos...
                        </p>
                    </div>
                ) : servicosFiltrados.length === 0 ? (
                    <div className="rounded-2xl border border-border bg-surface p-10 text-center">
                        <span className="text-3xl">🔎</span>

                        <h3 className="mt-3 font-semibold text-foreground">
                            {termoBusca
                                ? "Nenhum serviço encontrado"
                                : "Nenhum serviço cadastrado"}
                        </h3>

                        <p className="mt-2 text-sm text-foreground-muted">
                            {termoBusca
                                ? "Tente pesquisar utilizando outro nome, endereço ou categoria."
                                : "Ainda não existem serviços disponíveis no catálogo."}
                        </p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
                        {servicosFiltrados.map((servico) => {
                            const quantidadeAvaliacoes = Math.max(
                                0,
                                converterNumero(servico.totalAvaliacoes),
                            );

                            const mediaNota = converterNumero(
                                servico.mediaNota,
                            );

                            const temAvaliacoes =
                                quantidadeAvaliacoes > 0;

                            const categoriaNormalizada =
                                normalizarTexto(servico.categoria);

                            const icone =
                                CATEGORIAS_INFO[categoriaNormalizada]?.icon ??
                                "🏛️";

                            return (
                                <article
                                    key={servico.id}
                                    className="flex flex-col justify-between rounded-2xl border border-border bg-surface p-6 shadow-card transition hover:-translate-y-1 hover:shadow-hover"
                                >
                                    <div>
                                        <span className="inline-flex items-center gap-2 rounded-full bg-brand-light px-3 py-1 text-xs font-semibold text-brand">
                                            <span>{icone}</span>
                                            {formatarCategoria(servico.categoria)}
                                        </span>

                                        <h3 className="mt-4 text-lg font-bold leading-snug text-foreground">
                                            {servico.nome}
                                        </h3>

                                        <p className="mt-2 text-sm text-foreground-muted">
                                            {servico.endereco ||
                                                "Endereço não informado"}
                                        </p>
                                    </div>

                                    <div className="mt-6 flex items-center justify-between gap-3 border-t border-border pt-4">
                                        <div className="flex items-center gap-1.5">
                                            {temAvaliacoes ? (
                                                <>
                                                    <span className="text-xl text-amber-500">
                                                        ★
                                                    </span>

                                                    <span className="text-base font-bold text-foreground">
                                                        {mediaNota.toFixed(1)}
                                                    </span>

                                                    <span className="text-xs text-foreground-muted">
                                                        ({quantidadeAvaliacoes} avaliações)
                                                    </span>
                                                </>
                                            ) : (
                                                <span className="text-xs text-foreground-muted">
                                                    Ainda sem avaliações
                                                </span>
                                            )}
                                        </div>

                                        <Link
                                            href={`/servicos/${servico.id}/avaliar`}
                                            className="inline-flex h-9 shrink-0 items-center justify-center rounded-lg bg-brand px-4 text-xs font-semibold text-brand-contrast transition hover:bg-brand-hover"
                                        >
                                            Avaliar
                                        </Link>
                                    </div>
                                </article>
                            );
                        })}
                    </div>
                )}
            </section>
        </main>
    );
}
