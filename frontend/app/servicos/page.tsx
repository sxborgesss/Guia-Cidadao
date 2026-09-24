"use client";

import {useState, useMemo} from "react";
import Link from "next/link";
import MapaPalmas, {UnidadePublicaMapa} from "@/app/components/MapaPalmas";

// Mock de dados (No futuro: GET /services)
const UNIDADES_MOCK: UnidadePublicaMapa[] = [
    {
        id: "usf-403-norte",
        name: "Unidade de Saúde da Família (USF) 403 Norte",
        category: "Saúde",
        esfera: "Municipal",
        latitude: -10.1652,
        longitude: -48.3308,
        averageRating: 4.2,
    },
    {
        id: "upa-norte",
        name: "Unidade de Pronto Atendimento (UPA) Norte",
        category: "Saúde",
        esfera: "Municipal",
        latitude: -10.1550,
        longitude: -48.3200,
        averageRating: 3.5,
    },
    {
        id: "hgp-central",
        name: "Hospital Geral de Palmas (HGP)",
        category: "Saúde",
        esfera: "Estadual",
        latitude: -10.1989,
        longitude: -48.3189,
        averageRating: 3.1,
    },
    {
        id: "ifto-palmas",
        name: "Instituto Federal do Tocantins (IFTO)",
        category: "Educação",
        esfera: "Federal",
        latitude: -10.2001,
        longitude: -48.3615,
        averageRating: 4.8,
    },
    {
        id: "estacao-araguaia",
        name: "Estação de Integração Araguaia",
        category: "Transporte",
        esfera: "Municipal",
        latitude: -10.2220,
        longitude: -48.3330,
        averageRating: 3.4,
    },
    {
        id: "detran-to",
        name: "DETRAN - Sede Estadual",
        category: "Infraestrutura",
        esfera: "Estadual",
        latitude: -10.1830,
        longitude: -48.3330,
        averageRating: 2.8,
    },
];

export default function PaginaServicos() {
    const [busca, setBusca] = useState("");
    const [esferaFiltro, setEsferaFiltro] = useState<string>("TODAS");
    const [categoriaFiltro, setCategoriaFiltro] = useState<string>("TODAS");

    const unidadesFiltradas = useMemo(() => {
        return UNIDADES_MOCK.filter((u) => {
            const matchBusca = u.name.toLowerCase().includes(busca.toLowerCase());
            const matchEsfera = esferaFiltro === "TODAS" || u.esfera.toUpperCase() === esferaFiltro;
            const matchCategoria = categoriaFiltro === "TODAS" || u.category.toUpperCase() === categoriaFiltro;
            return matchBusca && matchEsfera && matchCategoria;
        });
    }, [busca, esferaFiltro, categoriaFiltro]);

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
                            <option value="SAÚDE">🏥 Saúde</option>
                            <option value="EDUCAÇÃO">🏫 Educação</option>
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
                {/* A div que envolve o mapa dá-lhe um corte arredondado perfeito */}
                <div className="rounded-2xl overflow-hidden border border-border">
                    <MapaPalmas unidades={unidadesFiltradas}/>
                </div>
                <div className="mt-3 text-center text-xs font-medium text-foreground-muted">
                    Mostrando {unidadesFiltradas.length} unidade(s) no mapa interativo
                </div>
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

                {unidadesFiltradas.length === 0 ? (
                    <div
                        className="rounded-3xl border border-dashed border-border bg-surface py-20 text-center shadow-card">
                        <span className="text-4xl">🔍</span>
                        <h3 className="mt-4 text-base font-bold text-foreground">Nenhuma unidade encontrada</h3>
                        <p className="text-sm text-foreground-muted mt-1">Tente ajustar os termos de pesquisa ou os
                            filtros aplicados.</p>
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
                            // Cores dinâmicas para as esferas baseadas nos badges da Home
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
                      <span
                          className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider ${badgeColors}`}>
                        {unidade.esfera}
                      </span>
                                            <span
                                                className="text-[11px] font-semibold uppercase tracking-wider text-foreground-muted flex items-center gap-1">
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