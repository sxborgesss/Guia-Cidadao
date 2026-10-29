"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import MapaPalmas, { UnidadePublicaMapa } from "@/app/components/MapaPalmas";

export default function PaginaServicos() {
    const [busca, setBusca] = useState("");
    const [esferaFiltro, setEsferaFiltro] = useState<string>("TODAS");
    const [categoriaFiltro, setCategoriaFiltro] = useState<string>("TODAS");

    // Estados para armazenar os dados dinâmicos do banco e o estado de carregamento
    const [unidadesBD, setUnidadesBD] = useState<UnidadePublicaMapa[]>([]);
    const [carregando, setCarregando] = useState<boolean>(true);
    const [erroRequisicao, setErroRequisicao] = useState<string | null>(null);

    useEffect(() => {
        // Certifique-se que o NestJS (backend) está a rodar na porta 3001 e tem o CORS ativado
        fetch("http://localhost:3001/services")
            .then((resposta) => {
                if (!resposta.ok) {
                    throw new Error("Falha na resposta do servidor");
                }
                return resposta.json();
            })
            .then((dados) => {
                // Mapeamento dos dados do banco para o formato esperado pelo mapa e listagem
                const unidadesMapeadas: UnidadePublicaMapa[] = dados.map((item: any) => {
                    let categoriaFormatada = "Infraestrutura";
                    if (item.categoria === 'saude') categoriaFormatada = "Saúde";
                    if (item.categoria === 'educacao') categoriaFormatada = "Educação";
                    if (item.categoria === 'transporte') categoriaFormatada = "Transporte";

                    return {
                        id: item.id,
                        name: item.nome,
                        category: categoriaFormatada as any,
                        // Utilizamos fallbacks para dados em falta enquanto a estrutura do banco não é totalmente atualizada
                        esfera: item.esfera || "Municipal",
                        latitude: Number(item.latitude) || -10.1844,
                        longitude: Number(item.longitude) || -48.3336,
                        averageRating: Number(item.mediaNota) || 0,
                    };
                });
                setUnidadesBD(unidadesMapeadas);
            })
            .catch((erro) => {
                console.error("Erro ao buscar as unidades:", erro);
                setErroRequisicao(erro.message);
            })
            .finally(() => setCarregando(false));
    }, []);

    const unidadesFiltradas = useMemo(() => {
        return unidadesBD.filter((u) => {
            const matchBusca = u.name.toLowerCase().includes(busca.toLowerCase());
            const matchEsfera = esferaFiltro === "TODAS" || u.esfera.toUpperCase() === esferaFiltro;
            // Para as categorias, a variável vem formatada ("Saúde", "Educação"), é preciso comparar em maiúsculas
            let catOriginalUpper = u.category.toUpperCase();
            if (catOriginalUpper === "SAÚDE") catOriginalUpper = "SAUDE";
            if (catOriginalUpper === "EDUCAÇÃO") catOriginalUpper = "EDUCACAO";

            const matchCategoria = categoriaFiltro === "TODAS" || catOriginalUpper === categoriaFiltro.replace(/[ÁÉÍÓÚ]/g, (match) => {
                const map = { 'Á': 'A', 'É': 'E', 'Í': 'I', 'Ó': 'O', 'Ú': 'U' };
                return map[match as keyof typeof map];
            });

            return matchBusca && matchEsfera && matchCategoria;
        });
    }, [busca, esferaFiltro, categoriaFiltro, unidadesBD]);

    return (
        <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8 space-y-12">

            {/* 1. Hero com Campo de Busca e Filtros (Inspirado na Home) */}
            <section
                className="relative overflow-hidden rounded-3xl bg-surface border border-border p-8 sm:p-12 shadow-card text-center flex flex-col items-center">
                <div
                    className="inline-flex items-center gap-2 rounded-full bg-brand-light px-3.5 py-1 text-xs font-semibold text-brand mb-6">
                    Catálogo Geral
                </div>

                <h1 className="max-w-3xl text-3xl font-black tracking-tight sm:text-4xl text-foreground">
                    Serviços e Unidades Públicas
                </h1>

                <p className="mt-4 max-w-2xl text-base text-foreground-muted">
                    Explore os postos de atendimento de Palmas. Utilize o mapa interativo ou os filtros abaixo para
                    encontrar a unidade que deseja consultar ou avaliar.
                </p>

                {/* Barra de Pesquisa e Filtros */}
                <div className="mt-8 flex w-full max-w-4xl flex-col md:flex-row gap-3">
                    <div className="relative flex-1">
                        <input
                            type="text"
                            placeholder="Procurar por nome do posto, escola ou hospital..."
                            value={busca}
                            onChange={(e) => setBusca(e.target.value)}
                            className="w-full h-12 rounded-xl border border-border bg-background px-4 text-sm text-foreground placeholder:text-foreground-muted focus:outline-none focus:ring-2 focus:ring-brand shadow-sm transition"
                        />
                    </div>

                    <div className="flex gap-3">
                        <select
                            value={categoriaFiltro}
                            onChange={(e) => setCategoriaFiltro(e.target.value)}
                            className="h-12 rounded-xl border border-border bg-background px-4 text-sm font-medium text-foreground focus:outline-none focus:ring-2 focus:ring-brand shadow-sm cursor-pointer"
                        >
                            <option value="TODAS">Todas as Categorias</option>
                            <option value="SAUDE">🏥 Saúde</option>
                            <option value="EDUCACAO">🏫 Educação</option>
                            <option value="TRANSPORTE">🚌 Transporte</option>
                            <option value="INFRAESTRUTURA">🏢 Infraestrutura</option>
                        </select>

                        <select
                            value={esferaFiltro}
                            onChange={(e) => setEsferaFiltro(e.target.value)}
                            className="h-12 rounded-xl border border-border bg-background px-4 text-sm font-medium text-foreground focus:outline-none focus:ring-2 focus:ring-brand shadow-sm cursor-pointer"
                        >
                            <option value="TODAS">Todas as Esferas</option>
                            <option value="MUNICIPAL">Municipal</option>
                            <option value="ESTADUAL">Estadual</option>
                            <option value="FEDERAL">Federal</option>
                        </select>
                    </div>
                </div>
            </section>

            {/* 2. Mapa Interativo Cívico */}
            <section className="rounded-3xl border border-border bg-surface p-4 shadow-card">
                <div className="rounded-2xl overflow-hidden border border-border">
                    {carregando ? (
                        <div className="flex h-[480px] w-full items-center justify-center bg-background text-sm text-foreground-muted">
                            <span className="h-4 w-4 mr-2 animate-spin rounded-full border-2 border-brand border-t-transparent" />
                            A carregar unidades da base de dados...
                        </div>
                    ) : erroRequisicao ? (
                        <div className="flex h-[480px] w-full flex-col items-center justify-center bg-rose-50 text-rose-600 text-sm">
                            <span className="text-2xl mb-2">⚠️</span>
                            Não foi possível carregar o mapa. Verifique se o servidor backend está a rodar.
                        </div>
                    ) : (
                        <MapaPalmas unidades={unidadesFiltradas}/>
                    )}
                </div>

                {!carregando && !erroRequisicao && (
                    <div className="mt-3 text-center text-xs font-medium text-foreground-muted">
                        Mostrando {unidadesFiltradas.length} unidade(s) no mapa interativo
                    </div>
                )}
            </section>

            {/* 3. Lista de Cartões (Inspirado no "Serviços em Foco" da Home) */}
            <section className="space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="text-2xl font-bold tracking-tight text-foreground">Lista de Unidades</h2>
                        <p className="text-sm text-foreground-muted">
                            Postos encontrados consoante os seus filtros
                        </p>
                    </div>
                </div>

                {carregando ? (
                    <div className="py-20 text-center text-foreground-muted">A carregar lista de unidades...</div>
                ) : unidadesFiltradas.length === 0 ? (
                    <div className="rounded-3xl border border-dashed border-border bg-surface py-20 text-center shadow-card">
                        <span className="text-4xl">🔍</span>
                        <h3 className="mt-4 text-base font-bold text-foreground">Nenhuma unidade encontrada</h3>
                        <p className="text-sm text-foreground-muted mt-1">Tente ajustar os termos de pesquisa ou os filtros aplicados.</p>
                        <button
                            onClick={() => {
                                setBusca("");
                                setCategoriaFiltro("TODAS");
                                setEsferaFiltro("TODAS");
                            }}
                            className="mt-6 inline-flex h-10 items-center justify-center rounded-xl bg-brand-light px-4 text-sm font-bold text-brand hover:bg-brand/20 transition-colors"
                        >
                            Limpar todos os filtros
                        </button>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
                        {unidadesFiltradas.map((unidade) => {
                            const badgeColors = {
                                Municipal: "bg-sky-500/10 text-sky-600 dark:text-sky-400 border-sky-500/20",
                                Estadual: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20",
                                Federal: "bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/20",
                            }[unidade.esfera] || "bg-slate-500/10 text-slate-600 border-slate-500/20";

                            return (
                                <div
                                    key={unidade.id}
                                    className="flex flex-col justify-between rounded-2xl border border-border bg-surface p-6 shadow-card hover:shadow-hover transition"
                                >
                                    <div>
                                        <div className="flex items-center justify-between gap-2 mb-3">
                                            <span className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider ${badgeColors}`}>
                                                {unidade.esfera}
                                            </span>
                                            <span className="text-[11px] font-semibold uppercase tracking-wider text-foreground-muted flex items-center gap-1">
                                                {unidade.category === "Saúde" && "🏥"}
                                                {unidade.category === "Educação" && "🏫"}
                                                {unidade.category === "Transporte" && "🚌"}
                                                {unidade.category === "Infraestrutura" && "🏢"}
                                                {unidade.category}
                                            </span>
                                        </div>

                                        <h3 className="text-lg font-bold text-foreground leading-snug">
                                            {unidade.name}
                                        </h3>
                                    </div>

                                    <div className="mt-6 flex items-center justify-between border-t border-border pt-4">
                                        <div className="flex items-baseline gap-1">
                                            <span className="text-xl font-black text-amber-500">★</span>
                                            <span className="text-base font-extrabold text-foreground">
                                                {unidade.averageRating.toFixed(1)}
                                            </span>
                                        </div>

                                        <Link
                                            href={`/servicos/${unidade.id}`}
                                            className="inline-flex h-9 items-center justify-center rounded-lg bg-brand px-4 text-xs font-semibold text-brand-contrast hover:bg-brand-hover active:bg-brand-pressed transition"
                                        >
                                            Ver Detalhes
                                        </Link>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </section>
        </main>
    );
}