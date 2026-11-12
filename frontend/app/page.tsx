
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
    infraestrutura: { name: "Infraestrutura", icon: "🏗️" },
};

function converterNumero(valor: number | string | null | undefined): number {
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

function obterBadgeStatus(nota: number) {
    if (nota >= 4.0) {
        return {
            rotulo: "Excelente",
            classe:
                "bg-emerald-500/10 text-emerald-600 border-emerald-500/20",
        };
    }

    if (nota >= 3.0) {
        return {
            rotulo: "Regular",
            classe:
                "bg-amber-500/10 text-amber-600 border-amber-500/20",
        };
    }

    return {
        rotulo: "Atenção",
        classe:
            "bg-rose-500/10 text-rose-600 border-rose-500/20",
    };
}

export default function Home() {
    const [servicos, setServicos] = useState<PublicService[]>([]);
    const [carregando, setCarregando] = useState(true);
    const [termoBusca, setTermoBusca] = useState("");
    const [erro, setErro] = useState<string | null>(null);
    const [roleUsuario, setRoleUsuario] = useState<string | null>(null);

    useEffect(() => {
        const usuarioSalvo = localStorage.getItem("user");
        const token = localStorage.getItem("token");

        if (usuarioSalvo && token) {
            try {
                const usuario = JSON.parse(usuarioSalvo);
                setRoleUsuario(usuario.role ?? null);
            } catch {
                setRoleUsuario(null);
            }
        }
    }, []);

    useEffect(() => {
        let ativo = true;

        async function carregar() {
            try {
                const res = await fetch(
                    `${API_URL}/services`,
                    {
                        method: "GET",
                        cache: "no-store",
                    },
                );

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


    // Pesquisa de serviços
    const servicosFiltrados = servicos.filter((servico) => {
        const termo = normalizarTexto(termoBusca);

        return (
            normalizarTexto(servico.nome).includes(termo) ||
            normalizarTexto(servico.endereco).includes(termo) ||
            normalizarTexto(servico.categoria).includes(termo)
        );
    });

    return (
        <main className="mx-auto max-w-7xl space-y-16 px-4 py-10 sm:px-6 lg:px-8">
            {/* 1. Apresentação */}
            <section className="relative flex flex-col items-center overflow-hidden rounded-3xl border border-border bg-surface p-8 text-center shadow-card sm:p-14">
                <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-brand-light px-3.5 py-1 text-xs font-semibold text-brand">
                    <span className="h-2 w-2 animate-pulse rounded-full bg-brand" />
                    Painel Cidadão 2026 em Tempo Real
                </div>

                <h1 className="max-w-3xl text-3xl font-black tracking-tight text-foreground sm:text-5xl">
                    O seu olhar transforma os serviços públicos da cidade
                </h1>

                <p className="mt-4 max-w-2xl text-base text-foreground-muted sm:text-lg">
                    Avalie infraestrutura, atendimento e qualidade de postos
                    e equipamentos públicos. Suas avaliações ajudam a
                    orientar a gestão e a comunidade.
                </p>

                <div className="mt-8 flex w-full max-w-2xl flex-col gap-2.5">
                    <input
                        type="text"
                        value={termoBusca}
                        onChange={(event) =>
                            setTermoBusca(event.target.value)
                        }
                        placeholder="Procure por nome, endereço ou categoria..."
                        aria-label="Pesquisar serviços públicos"
                        className="h-12 w-full rounded-xl border border-border bg-background px-4 text-sm text-foreground shadow-sm transition placeholder:text-foreground-muted focus:outline-none focus:ring-2 focus:ring-brand"
                    />
                </div>
            </section>

            {/* 3. Catálogo */}
            <section className="space-y-6">
                <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
                    <div>
                        <h2 className="text-2xl font-bold tracking-tight text-foreground">
                            Equipamentos públicos
                        </h2>

                        <p className="text-sm text-foreground-muted">
                            Unidades oficiais de atendimento catalogadas
                        </p>
                    </div>

                    {!carregando && (
                        <span className="text-xs font-semibold text-foreground-muted">
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
                    <p className="text-sm text-foreground-muted">
                        Carregando serviços públicos...
                    </p>
                ) : servicosFiltrados.length === 0 ? (
                    <div className="rounded-2xl border border-border bg-surface p-8 text-center text-foreground-muted">
                        {termoBusca
                            ? "Nenhum serviço corresponde à sua pesquisa."
                            : "Nenhum equipamento público encontrado. Cadastre novas unidades através do Painel Administrativo."}
                    </div>
                ) : (
                    <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                        {servicosFiltrados.map((servico) => {
                            const quantidadeAvaliacoes = Math.max(
                                0,
                                converterNumero(
                                    servico.totalAvaliacoes,
                                ),
                            );

                            const mediaNota = converterNumero(
                                servico.mediaNota,
                            );

                            const temAvaliacoes =
                                quantidadeAvaliacoes > 0;

                            const badge = temAvaliacoes
                                ? obterBadgeStatus(mediaNota)
                                : null;

                            const categoriaFormatada =
                                formatarCategoria(servico.categoria);

                            const icone =
                                CATEGORIAS_INFO[
                                    normalizarTexto(servico.categoria)
                                ]?.icon ?? "🏛️";

                            return (
                                <article
                                    key={servico.id}
                                    className="flex flex-col justify-between rounded-2xl border border-border bg-surface p-6 shadow-card transition hover:shadow-hover"
                                >
                                    <div>
                                        <div className="flex items-center justify-between gap-2">
                                            <span className="text-[11px] font-semibold uppercase tracking-wider text-foreground-muted">
                                                {icone}{" "}
                                                {categoriaFormatada}
                                            </span>

                                            {badge ? (
                                                <span
                                                    className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-semibold ${badge.classe}`}
                                                >
                                                    {badge.rotulo}
                                                </span>
                                            ) : (
                                                <span className="inline-flex items-center rounded-full border border-border bg-background px-2 py-0.5 text-[10px] font-semibold text-foreground-muted">
                                                    Sem avaliações
                                                </span>
                                            )}
                                        </div>

                                        <h3 className="mt-3 text-lg font-bold leading-snug text-foreground">
                                            {servico.nome}
                                        </h3>

                                        <p className="mt-1 text-xs text-foreground-muted">
                                            {servico.endereco}
                                        </p>
                                    </div>

                                    <div className="mt-6 flex items-center justify-between border-t border-border pt-4">
                                        <div className="flex items-baseline gap-1">
                                            {temAvaliacoes ? (
                                                <>
                                                    <span className="text-xl font-black text-amber-500">
                                                        ★
                                                    </span>

                                                    <span className="text-base font-extrabold text-foreground">
                                                        {mediaNota.toFixed(1)}
                                                    </span>

                                                    <span className="text-xs text-foreground-muted">
                                                        ({quantidadeAvaliacoes})
                                                    </span>
                                                </>
                                            ) : (
                                                <span className="text-xs font-medium text-foreground-muted">
                                                    Ainda não avaliado
                                                </span>
                                            )}
                                        </div>

                                        {roleUsuario === null && (
                                            <Link
                                                href={`/registro?origem=avaliacao&servico=${encodeURIComponent(servico.id)}`}
                                                className="inline-flex h-9 items-center justify-center rounded-lg bg-brand px-3 text-xs font-semibold text-brand-contrast transition hover:bg-brand-hover"
                                            >
                                                Avaliar
                                            </Link>
                                        )}

                                        {roleUsuario === "CIDADAO" && (
                                            <Link
                                                href={`/servicos/${servico.id}/avaliar`}
                                                className="inline-flex h-9 items-center justify-center rounded-lg bg-brand px-3 text-xs font-semibold text-brand-contrast transition hover:bg-brand-hover"
                                            >
                                                Avaliar
                                            </Link>
                                        )}
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
