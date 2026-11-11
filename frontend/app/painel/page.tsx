
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { API_URL } from "@/lib/api";

interface PublicService {
    id: string;
    nome: string;
    categoria: string;
    endereco: string;
    mediaNota: number;
    totalAvaliacoes: number;
}

interface ReviewData {
    id: string;
    nota: number;
    comentario: string;
    created_at: string;
    service_id: string;
    isAnonimo?: boolean;
}

interface ServiceStats extends PublicService {
    quantidade: number;
    media: number;
}

interface CategoryStats {
    categoria: string;
    quantidade: number;
    media: number;
}

interface MonthStats {
    label: string;
    quantidade: number;
}

const nomesCategorias: Record<string, string> = {
    saude: "Saúde",
    educacao: "Educação",
    transporte: "Transporte",
    zeladoria: "Zeladoria",
};

function formatarCategoria(categoria: string) {
    return (
        nomesCategorias[categoria?.toLowerCase()] ||
        categoria ||
        "Outros"
    );
}

export default function PainelTransparenciaPage() {
    const [servicos, setServicos] = useState<PublicService[]>([]);
    const [avaliacoes, setAvaliacoes] = useState<ReviewData[]>([]);
    const [carregando, setCarregando] = useState(true);
    const [erro, setErro] = useState<string | null>(null);
    const [atualizar, setAtualizar] = useState(0);

    useEffect(() => {
        let ativo = true;

        async function carregarDados() {
            setCarregando(true);
            setErro(null);

            try {
                // 1. Buscar todos os serviços cadastrados.
                const responseServicos = await fetch(
                    `${API_URL}/services`,
                    { cache: "no-store" }
                );

                if (!responseServicos.ok) {
                    throw new Error(
                        "Não foi possível carregar os serviços públicos."
                    );
                }

                const dadosServicos: PublicService[] =
                    await responseServicos.json();

                const listaServicos = Array.isArray(dadosServicos)
                    ? dadosServicos
                    : [];

                // 2. Buscar as avaliações reais de cada serviço.
                const resultados = await Promise.all(
                    listaServicos.map(async (servico) => {
                        const response = await fetch(
                            `${API_URL}/reviews/service/${servico.id}`,
                            { cache: "no-store" }
                        );

                        if (!response.ok) {
                            throw new Error(
                                `Não foi possível carregar as avaliações de ${servico.nome}.`
                            );
                        }

                        const dados: ReviewData[] = await response.json();

                        return Array.isArray(dados)
                            ? dados.map((review) => ({
                                  ...review,
                                  service_id: servico.id,
                              }))
                            : [];
                    })
                );

                if (!ativo) return;

                setServicos(listaServicos);
                setAvaliacoes(resultados.flat());
            } catch (error) {
                if (ativo) {
                    setErro(
                        error instanceof Error
                            ? error.message
                            : "Erro ao carregar os dados de transparência."
                    );
                }
            } finally {
                if (ativo) {
                    setCarregando(false);
                }
            }
        }

        carregarDados();

        return () => {
            ativo = false;
        };
    }, [atualizar]);

    // Estatísticas gerais.
    const totalServicos = servicos.length;
    const totalAvaliacoes = avaliacoes.length;

    const somaNotas = avaliacoes.reduce(
        (soma, review) => soma + Number(review.nota),
        0
    );

    const mediaGeral =
        totalAvaliacoes > 0
            ? (somaNotas / totalAvaliacoes).toFixed(1)
            : "—";

    const totalAnonimas = avaliacoes.filter(
        (review) => review.isAnonimo
    ).length;

    const percentualAnonimas =
        totalAvaliacoes > 0
            ? ((totalAnonimas / totalAvaliacoes) * 100).toFixed(0)
            : "0";

    // Estatísticas individuais dos serviços.
    const estatisticasServicos: ServiceStats[] = servicos.map(
        (servico) => {
            const reviewsDoServico = avaliacoes.filter(
                (review) => review.service_id === servico.id
            );

            const quantidade = reviewsDoServico.length;

            const soma = reviewsDoServico.reduce(
                (total, review) => total + Number(review.nota),
                0
            );

            return {
                ...servico,
                quantidade,
                media: quantidade > 0 ? soma / quantidade : 0,
            };
        }
    );

    const servicosAvaliados = estatisticasServicos.filter(
        (servico) => servico.quantidade > 0
    );

    const rankingMelhores = [...servicosAvaliados]
        .sort((a, b) => b.media - a.media)
        .slice(0, 5);

    const rankingPiores = [...servicosAvaliados]
        .sort((a, b) => a.media - b.media)
        .slice(0, 5);

    // Estatísticas por categoria.
    const categorias: CategoryStats[] = Array.from(
        new Set(servicos.map((servico) => servico.categoria))
    ).map((categoria) => {
        const servicosDaCategoria = servicos.filter(
            (servico) => servico.categoria === categoria
        );

        const ids = servicosDaCategoria.map(
            (servico) => servico.id
        );

        const reviewsDaCategoria = avaliacoes.filter(
            (review) => ids.includes(review.service_id)
        );

        const quantidade = reviewsDaCategoria.length;

        const soma = reviewsDaCategoria.reduce(
            (total, review) => total + Number(review.nota),
            0
        );

        return {
            categoria: formatarCategoria(categoria),
            quantidade,
            media: quantidade > 0 ? soma / quantidade : 0,
        };
    }).sort((a, b) => b.quantidade - a.quantidade);

    const maiorQuantidadeCategoria = Math.max(
        1,
        ...categorias.map((categoria) => categoria.quantidade)
    );

    // Evolução mensal: últimos seis meses.
    const meses: MonthStats[] = Array.from(
        { length: 6 },
        (_, index) => {
            const agora = new Date();

            const data = new Date(
                agora.getFullYear(),
                agora.getMonth() - (5 - index),
                1
            );

            const quantidade = avaliacoes.filter((review) => {
                const dataReview = new Date(review.created_at);

                return (
                    dataReview.getMonth() === data.getMonth() &&
                    dataReview.getFullYear() === data.getFullYear()
                );
            }).length;

            return {
                label: data.toLocaleDateString("pt-BR", {
                    month: "short",
                }),
                quantidade,
            };
        }
    );

    const maiorQuantidadeMes = Math.max(
        1,
        ...meses.map((mes) => mes.quantidade)
    );

    if (carregando) {
        return (
            <main className="mx-auto flex min-h-[60vh] max-w-7xl items-center justify-center px-4">
                <p className="text-sm font-semibold text-slate-500">
                    Carregando dados de transparência...
                </p>
            </main>
        );
    }

    return (
        <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">

            {/* Cabeçalho */}
            <div className="mb-8 flex flex-col justify-between gap-4 border-b border-slate-200 pb-6 sm:flex-row sm:items-center">
                <div>
                    <span className="rounded-md bg-sky-100 px-2.5 py-1 text-xs font-bold text-sky-700">
                        Dados públicos
                    </span>

                    <h1 className="mt-3 text-2xl font-extrabold text-slate-900 sm:text-3xl">
                        Painel de Transparência
                    </h1>

                    <p className="mt-2 max-w-2xl text-sm text-slate-500">
                        Acompanhe os indicadores de satisfação e as avaliações
                        dos equipamentos públicos cadastrados no Guia Cidadão.
                    </p>
                </div>

                <div className="flex flex-wrap gap-3">
                    <button
                        type="button"
                        onClick={() => setAtualizar((valor) => valor + 1)}
                        className="h-10 rounded-lg border border-slate-200 bg-white px-4 text-xs font-semibold text-slate-700 transition hover:bg-slate-50"
                    >
                        Atualizar dados
                    </button>

                    <Link
                        href="/servicos"
                        className="inline-flex h-10 items-center rounded-lg bg-sky-600 px-4 text-xs font-semibold text-white transition hover:bg-sky-700"
                    >
                        Explorar serviços
                    </Link>
                </div>
            </div>

            {erro && (
                <div className="mb-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm font-medium text-red-700">
                    {erro}
                </div>
            )}

            {/* Indicadores gerais */}
            <section className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
                <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
                    <p className="text-xs font-semibold uppercase text-slate-500">
                        Serviços cadastrados
                    </p>

                    <p className="mt-3 text-3xl font-bold text-slate-900">
                        {totalServicos}
                    </p>

                    <p className="mt-2 text-xs text-slate-500">
                        Equipamentos públicos monitorados
                    </p>
                </div>

                <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
                    <p className="text-xs font-semibold uppercase text-slate-500">
                        Avaliações registradas
                    </p>

                    <p className="mt-3 text-3xl font-bold text-slate-900">
                        {totalAvaliacoes}
                    </p>

                    <p className="mt-2 text-xs text-slate-500">
                        Manifestações da comunidade
                    </p>
                </div>

                <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
                    <p className="text-xs font-semibold uppercase text-slate-500">
                        Média geral de satisfação
                    </p>

                    <p className="mt-3 text-3xl font-bold text-slate-900">
                        {mediaGeral}
                        {totalAvaliacoes > 0 && (
                            <span className="ml-1 text-base text-slate-400">
                                / 5
                            </span>
                        )}
                    </p>

                    <p className="mt-2 text-xs text-slate-500">
                        Calculada a partir das notas recebidas
                    </p>
                </div>

                <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
                    <p className="text-xs font-semibold uppercase text-slate-500">
                        Avaliações anônimas
                    </p>

                    <p className="mt-3 text-3xl font-bold text-sky-600">
                        {totalAnonimas}
                    </p>

                    <p className="mt-2 text-xs text-slate-500">
                        {percentualAnonimas}% do total registrado
                    </p>
                </div>
            </section>

            {/* Ranking */}
            <section className="mb-8 grid grid-cols-1 gap-6 lg:grid-cols-2">

                {/* Melhores avaliações */}
                <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
                    <h2 className="text-lg font-bold text-slate-800">
                        Serviços mais bem avaliados
                    </h2>

                    <p className="mt-1 text-xs text-slate-500">
                        Ordenados pela média das notas recebidas.
                    </p>

                    {rankingMelhores.length === 0 ? (
                        <p className="mt-6 text-sm text-slate-500">
                            Ainda não existem serviços avaliados.
                        </p>
                    ) : (
                        <div className="mt-5 space-y-4">
                            {rankingMelhores.map((servico, index) => (
                                <div
                                    key={servico.id}
                                    className="flex items-center justify-between gap-4 border-b border-slate-100 pb-3 last:border-0"
                                >
                                    <div className="flex min-w-0 items-center gap-3">
                                        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-sky-50 text-sm font-bold text-sky-700">
                                            {index + 1}
                                        </span>

                                        <div className="min-w-0">
                                            <p className="truncate text-sm font-bold text-slate-800">
                                                {servico.nome}
                                            </p>

                                            <p className="text-xs text-slate-500">
                                                {servico.quantidade} avaliações
                                            </p>
                                        </div>
                                    </div>

                                    <span className="shrink-0 font-bold text-amber-500">
                                        ★ {servico.media.toFixed(1)}
                                    </span>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Menores avaliações */}
                <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
                    <h2 className="text-lg font-bold text-slate-800">
                        Serviços que precisam de atenção
                    </h2>

                    <p className="mt-1 text-xs text-slate-500">
                        Serviços com menores médias de avaliação.
                    </p>

                    {rankingPiores.length === 0 ? (
                        <p className="mt-6 text-sm text-slate-500">
                            Ainda não existem serviços avaliados.
                        </p>
                    ) : (
                        <div className="mt-5 space-y-4">
                            {rankingPiores.map((servico, index) => (
                                <div
                                    key={servico.id}
                                    className="flex items-center justify-between gap-4 border-b border-slate-100 pb-3 last:border-0"
                                >
                                    <div className="flex min-w-0 items-center gap-3">
                                        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-amber-50 text-sm font-bold text-amber-700">
                                            {index + 1}
                                        </span>

                                        <div className="min-w-0">
                                            <p className="truncate text-sm font-bold text-slate-800">
                                                {servico.nome}
                                            </p>

                                            <p className="text-xs text-slate-500">
                                                {servico.quantidade} avaliações
                                            </p>
                                        </div>
                                    </div>

                                    <span className="shrink-0 font-bold text-slate-700">
                                        ★ {servico.media.toFixed(1)}
                                    </span>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </section>

            {/* Análise por categoria */}
            <section className="mb-8 rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
                <h2 className="text-lg font-bold text-slate-800">
                    Avaliações por categoria
                </h2>

                <p className="mt-1 text-xs text-slate-500">
                    Distribuição das manifestações por área de serviço público.
                </p>

                {categorias.length === 0 ? (
                    <p className="mt-6 text-sm text-slate-500">
                        Nenhuma categoria cadastrada.
                    </p>
                ) : (
                    <div className="mt-6 space-y-5">
                        {categorias.map((categoria) => (
                            <div key={categoria.categoria}>
                                <div className="mb-2 flex justify-between gap-3">
                                    <span className="text-sm font-semibold text-slate-700">
                                        {categoria.categoria}
                                    </span>

                                    <span className="text-xs text-slate-500">
                                        {categoria.quantidade} avaliações
                                        {categoria.quantidade > 0 &&
                                            ` · Média ${categoria.media.toFixed(1)}`}
                                    </span>
                                </div>

                                <div className="h-3 overflow-hidden rounded-full bg-slate-100">
                                    <div
                                        className="h-full rounded-full bg-sky-500 transition-all"
                                        style={{
                                            width: `${
                                                (categoria.quantidade /
                                                    maiorQuantidadeCategoria) *
                                                100
                                            }%`,
                                        }}
                                    />
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </section>

            {/* Evolução mensal */}
            <section className="mb-8 rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
                <h2 className="text-lg font-bold text-slate-800">
                    Evolução das avaliações
                </h2>

                <p className="mt-1 text-xs text-slate-500">
                    Quantidade de avaliações recebidas nos últimos seis meses.
                </p>

                <div className="mt-8 flex h-52 items-end justify-around gap-3 border-b border-slate-200 pb-2">
                    {meses.map((mes) => {
                        const altura =
                            mes.quantidade > 0
                                ? Math.max(
                                      8,
                                      (mes.quantidade / maiorQuantidadeMes) * 100
                                  )
                                : 0;

                        return (
                            <div
                                key={mes.label + mes.quantidade}
                                className="flex h-full flex-1 flex-col items-center justify-end gap-2"
                            >
                                <span className="text-xs font-semibold text-slate-600">
                                    {mes.quantidade}
                                </span>

                                <div
                                    className="w-full max-w-12 rounded-t-lg bg-sky-500 transition-all"
                                    style={{
                                        height: `${altura}%`,
                                        minHeight:
                                            mes.quantidade > 0 ? "6px" : "0",
                                    }}
                                />

                                <span className="text-xs capitalize text-slate-500">
                                    {mes.label}
                                </span>
                            </div>
                        );
                    })}
                </div>
            </section>

            {/* Lista de serviços */}
            <section className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
                <h2 className="text-lg font-bold text-slate-800">
                    Panorama dos serviços públicos
                </h2>

                <p className="mt-1 text-xs text-slate-500">
                    Consulte os dados individuais dos equipamentos cadastrados.
                </p>

                {estatisticasServicos.length === 0 ? (
                    <p className="mt-6 text-sm text-slate-500">
                        Nenhum serviço cadastrado.
                    </p>
                ) : (
                    <div className="mt-5 overflow-x-auto">
                        <table className="w-full min-w-[600px] text-left text-sm">
                            <thead className="border-b border-slate-200 bg-slate-50 text-xs uppercase text-slate-500">
                                <tr>
                                    <th className="px-4 py-3">Serviço</th>
                                    <th className="px-4 py-3">Categoria</th>
                                    <th className="px-4 py-3 text-center">
                                        Avaliações
                                    </th>
                                    <th className="px-4 py-3 text-center">
                                        Média
                                    </th>
                                    <th className="px-4 py-3 text-right">
                                        Consulta
                                    </th>
                                </tr>
                            </thead>

                            <tbody className="divide-y divide-slate-100">
                                {estatisticasServicos.map((servico) => (
                                    <tr key={servico.id}>
                                        <td className="px-4 py-3 font-semibold text-slate-800">
                                            {servico.nome}
                                        </td>

                                        <td className="px-4 py-3 text-slate-600">
                                            {formatarCategoria(servico.categoria)}
                                        </td>

                                        <td className="px-4 py-3 text-center text-slate-600">
                                            {servico.quantidade}
                                        </td>

                                        <td className="px-4 py-3 text-center font-bold text-slate-800">
                                            {servico.quantidade > 0
                                                ? servico.media.toFixed(1) + "/5"
                                                : "Sem avaliações"}
                                        </td>

                                        <td className="px-4 py-3 text-right">
                                            <Link
                                                href={`/servicos/${servico.id}`}
                                                className="text-xs font-semibold text-sky-600 hover:underline"
                                            >
                                                Ver serviço
                                            </Link>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </section>

            {/* Rodapé informativo */}
            <p className="mt-6 text-center text-xs text-slate-400">
                Indicadores calculados a partir das avaliações registradas no Guia Cidadão.
                Os dados são atualizados ao consultar ou atualizar o painel.
            </p>
        </main>
    );
}
