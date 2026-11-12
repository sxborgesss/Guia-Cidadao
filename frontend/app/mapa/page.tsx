
"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import MapaPalmas, {
    UnidadePublicaMapa,
} from "@/app/components/MapaPalmas";
import { API_URL } from "@/lib/api";

interface ServicoApi {
    id: string;
    nome: string;
    categoria?: string | null;
    endereco?: string | null;
    esfera?: string | null;
    latitude?: number | string | null;
    longitude?: number | string | null;
    mediaNota?: number | string | null;
    totalAvaliacoes?: number | string | null;
}

function converterNumero(
    valor: number | string | null | undefined,
): number | null {
    if (valor === null || valor === undefined || valor === "") {
        return null;
    }

    const numero = Number(valor);
    return Number.isFinite(numero) ? numero : null;
}

function formatarCategoria(categoria?: string | null): string {
    const normalizada = (categoria ?? "")
        .trim()
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "");

    const categorias: Record<string, string> = {
        saude: "Saúde",
        educacao: "Educação",
        transporte: "Transporte",
        zeladoria: "Zeladoria",
    };

    return categorias[normalizada] ?? "Não categorizado";
}

function formatarEsfera(esfera?: string | null): string {
    const normalizada = (esfera ?? "Municipal").trim().toLowerCase();

    if (normalizada === "estadual") return "Estadual";
    if (normalizada === "federal") return "Federal";

    return "Municipal";
}

export default function PaginaServicosComMapa() {
    const [unidades, setUnidades] = useState<UnidadePublicaMapa[]>([]);
    const [esferaFiltro, setEsferaFiltro] = useState("TODAS");
    const [categoriaFiltro, setCategoriaFiltro] = useState("TODAS");
    const [termoBusca, setTermoBusca] = useState("");
    const [unidadeSelecionada, setUnidadeSelecionada] = useState<string | null>(null);
    const [roleUsuario, setRoleUsuario] = useState<string | null>(null);

    const [carregando, setCarregando] = useState(true);
    const [erro, setErro] = useState<string | null>(null);
    const [totalSemLocalizacao, setTotalSemLocalizacao] = useState(0);

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

        async function carregarServicos() {
            setCarregando(true);
            setErro(null);

            try {
                const resposta = await fetch(`${API_URL}/services`, {
                    method: "GET",
                    cache: "no-store",
                });

                if (!resposta.ok) {
                    throw new Error("Não foi possível carregar os serviços públicos.");
                }

                const dados: ServicoApi[] = await resposta.json();

                if (!Array.isArray(dados)) {
                    throw new Error("A API retornou um formato inesperado.");
                }

                const unidadesMapeadas: UnidadePublicaMapa[] = [];
                let semLocalizacao = 0;

                dados.forEach((item) => {
                    const latitude = converterNumero(item.latitude);
                    const longitude = converterNumero(item.longitude);

                    if (
                        latitude === null ||
                        longitude === null ||
                        latitude < -90 ||
                        latitude > 90 ||
                        longitude < -180 ||
                        longitude > 180
                    ) {
                        semLocalizacao++;
                        return;
                    }

                    const totalAvaliacoes = Number(item.totalAvaliacoes ?? 0);
                    const mediaNota =
                        totalAvaliacoes > 0
                            ? Number(item.mediaNota ?? 0)
                            : 0;

                    unidadesMapeadas.push({
                        id: item.id,
                        name: item.nome,
                        address: item.endereco ?? "Endereço não informado",
                        category: formatarCategoria(item.categoria),
                        esfera: formatarEsfera(item.esfera),
                        latitude,
                        longitude,
                        averageRating: Number.isFinite(mediaNota)
                            ? mediaNota
                            : 0,
                        totalAvaliacoes: Number.isFinite(totalAvaliacoes)
                            ? totalAvaliacoes
                            : 0,
                    });
                });

                if (!ativo) return;

                setUnidades(unidadesMapeadas);
                setTotalSemLocalizacao(semLocalizacao);
            } catch (error) {
                if (!ativo) return;

                setErro(
                    error instanceof Error
                        ? error.message
                        : "Ocorreu um erro ao carregar o mapa.",
                );
            } finally {
                if (ativo) setCarregando(false);
            }
        }

        carregarServicos();

        return () => {
            ativo = false;
        };
    }, []);

    const categorias = useMemo(() => {
        return Array.from(
            new Set(unidades.map((unidade) => unidade.category)),
        ).sort();
    }, [unidades]);

    const unidadesFiltradas = useMemo(() => {
        const termo = termoBusca.trim().toLowerCase();

        return unidades.filter((unidade) => {
            const correspondeEsfera =
                esferaFiltro === "TODAS" ||
                unidade.esfera.toUpperCase() === esferaFiltro;

            const correspondeCategoria =
                categoriaFiltro === "TODAS" ||
                unidade.category === categoriaFiltro;

            const correspondeBusca =
                !termo ||
                unidade.name.toLowerCase().includes(termo) ||
                unidade.address.toLowerCase().includes(termo) ||
                unidade.category.toLowerCase().includes(termo);

            return (
                correspondeEsfera &&
                correspondeCategoria &&
                correspondeBusca
            );
        });
    }, [unidades, esferaFiltro, categoriaFiltro, termoBusca]);

    const unidadeSelecionadaObjeto = unidadesFiltradas.find(
        (unidade) => unidade.id === unidadeSelecionada,
    );

    const esferas = [
        { valor: "TODAS", texto: "Todas" },
        { valor: "MUNICIPAL", texto: "Municipal" },
        { valor: "ESTADUAL", texto: "Estadual" },
        { valor: "FEDERAL", texto: "Federal" },
    ];

    const linkPainel =
        roleUsuario === "ADMIN"
            ? "/admin/servicos"
            : roleUsuario === "GESTOR"
                ? "/gestor"
                : null;

    return (
        <main className="mx-auto max-w-7xl space-y-7 px-4 py-8 sm:px-6 lg:px-8">

            {/* Apresentação */}
            <section className="flex flex-col justify-between gap-5 md:flex-row md:items-end">
                <div>
                    <span className="text-xs font-bold uppercase tracking-wider text-sky-700">
                        Geolocalização cívica
                    </span>

                    <h1 className="mt-2 text-3xl font-extrabold tracking-tight text-slate-900">
                        Mapa de serviços públicos
                    </h1>

                    <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
                        Encontre unidades públicas em Palmas, consulte
                        informações e conheça a avaliação dos cidadãos.
                    </p>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                    <span className="rounded-full border border-sky-100 bg-white px-4 py-2 text-sm font-semibold text-slate-700">
                        {carregando
                            ? "Carregando unidades..."
                            : `${unidadesFiltradas.length} unidades encontradas`}
                    </span>

                    {linkPainel && (
                        <Link
                            href={linkPainel}
                            className="rounded-xl bg-sky-600 px-4 py-2.5 text-sm font-bold text-white transition hover:bg-sky-700"
                        >
                            {roleUsuario === "ADMIN"
                                ? "Gerenciar serviços"
                                : "Painel do gestor"}
                        </Link>
                    )}
                </div>
            </section>

            {/* Filtros */}
            <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <div className="grid gap-5 md:grid-cols-2">

                    <div>
                        <label className="mb-2 block text-sm font-bold text-slate-800">
                            Buscar unidade
                        </label>

                        <input
                            type="search"
                            value={termoBusca}
                            onChange={(event) => setTermoBusca(event.target.value)}
                            placeholder="Nome, endereço ou categoria..."
                            className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-800 outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-100"
                        />
                    </div>

                    <div>
                        <label className="mb-2 block text-sm font-bold text-slate-800">
                            Categoria do serviço
                        </label>

                        <select
                            value={categoriaFiltro}
                            onChange={(event) => setCategoriaFiltro(event.target.value)}
                            className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-800 outline-none focus:border-sky-500"
                        >
                            <option value="TODAS">Todas as categorias</option>

                            {categorias.map((categoria) => (
                                <option key={categoria} value={categoria}>
                                    {categoria}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>

                <div className="mt-5">
                    <p className="mb-2 text-sm font-bold text-slate-800">
                        Esfera administrativa
                    </p>

                    <div className="flex flex-wrap gap-2">
                        {esferas.map((esfera) => (
                            <button
                                key={esfera.valor}
                                type="button"
                                onClick={() => setEsferaFiltro(esfera.valor)}
                                className={`rounded-xl border px-4 py-2.5 text-xs font-bold transition ${
                                    esferaFiltro === esfera.valor
                                        ? "border-sky-600 bg-sky-600 text-white"
                                        : "border-slate-200 bg-white text-slate-600 hover:border-sky-300 hover:text-sky-700"
                                }`}
                            >
                                {esfera.texto}
                            </button>
                        ))}
                    </div>
                </div>
            </section>

            {/* Erro */}
            {erro && (
                <div
                    role="alert"
                    className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm font-medium text-red-700"
                >
                    {erro}
                </div>
            )}

            {/* Mapa */}
            {carregando ? (
                <div className="flex h-[520px] items-center justify-center rounded-3xl border border-sky-100 bg-white text-sm text-slate-500">
                    <span className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-sky-600 border-t-transparent" />
                    Carregando unidades...
                </div>
            ) : !erro && unidadesFiltradas.length > 0 ? (
                <section className="space-y-3">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                        <h2 className="text-lg font-bold text-slate-900">
                            Unidades no mapa
                        </h2>

                        <p className="text-xs text-slate-500">
                            Selecione um marcador ou uma unidade da lista para consultar sua localização.
                        </p>
                    </div>

                    <MapaPalmas
                        unidades={unidadesFiltradas}
                        unidadeSelecionadaId={unidadeSelecionada}
                    />
                </section>
            ) : !erro ? (
                <div className="flex min-h-[260px] flex-col items-center justify-center rounded-3xl border border-dashed border-slate-300 bg-white p-8 text-center">
                    <h2 className="text-lg font-bold text-slate-800">
                        Nenhuma unidade encontrada
                    </h2>

                    <p className="mt-2 max-w-lg text-sm leading-6 text-slate-500">
                        Não encontramos serviços com os filtros selecionados.
                        Experimente alterar a categoria, a esfera ou a busca.
                    </p>

                    <button
                        type="button"
                        onClick={() => {
                            setEsferaFiltro("TODAS");
                            setCategoriaFiltro("TODAS");
                            setTermoBusca("");
                            setUnidadeSelecionada(null);
                        }}
                        className="mt-4 text-sm font-bold text-sky-700 hover:underline"
                    >
                        Limpar filtros
                    </button>
                </div>
            ) : null}

            {/* Lista de unidades */}
            {!carregando && !erro && unidadesFiltradas.length > 0 && (
                <section className="space-y-4">
                    <div>
                        <h2 className="text-xl font-bold text-slate-900">
                            Unidades disponíveis
                        </h2>
                        <p className="mt-1 text-sm text-slate-500">
                            Consulte os dados de cada serviço e acesse sua avaliação.
                        </p>
                    </div>

                    <div className="grid gap-4 md:grid-cols-2">
                        {unidadesFiltradas.map((unidade) => (
                            <article
                                key={unidade.id}
                                className={`rounded-2xl border bg-white p-5 transition ${
                                    unidadeSelecionada === unidade.id
                                        ? "border-sky-500 shadow-md"
                                        : "border-slate-200 shadow-sm hover:border-sky-200"
                                }`}
                            >
                                <div className="flex flex-wrap items-center gap-2">
                                    <span className="rounded-full bg-sky-50 px-3 py-1 text-xs font-bold text-sky-700">
                                        {unidade.category}
                                    </span>

                                    <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
                                        {unidade.esfera}
                                    </span>
                                </div>

                                <h3 className="mt-3 text-base font-bold text-slate-900">
                                    {unidade.name}
                                </h3>

                                <p className="mt-2 text-sm leading-5 text-slate-500">
                                    {unidade.address}
                                </p>

                                <div className="mt-4 flex items-center justify-between gap-3">
                                    <div>
                                        <p className="text-sm font-bold text-amber-600">
                                            ★ {unidade.averageRating.toFixed(1)}
                                        </p>
                                        <p className="text-xs text-slate-500">
                                            {unidade.totalAvaliacoes} avaliações
                                        </p>
                                    </div>

                                    <button
                                        type="button"
                                        onClick={() =>
                                            setUnidadeSelecionada(unidade.id)
                                        }
                                        className="rounded-lg border border-sky-200 px-3 py-2 text-xs font-bold text-sky-700 transition hover:bg-sky-50"
                                    >
                                        Ver no mapa
                                    </button>
                                </div>

                                <div className="mt-4 border-t border-slate-100 pt-4">
                                    {roleUsuario === null && (
                                        <Link
                                            href={`/registro?origem=avaliacao&servico=${encodeURIComponent(unidade.id)}`}
                                            className="inline-flex rounded-xl bg-sky-600 px-4 py-2.5 text-sm font-bold text-white transition hover:bg-sky-700"
                                        >
                                            Avaliar serviço
                                        </Link>
                                    )}

                                    {roleUsuario === "CIDADAO" && (
                                        <Link
                                            href={`/servicos/${unidade.id}/avaliar`}
                                            className="inline-flex rounded-xl bg-sky-600 px-4 py-2.5 text-sm font-bold text-white transition hover:bg-sky-700"
                                        >
                                            Avaliar serviço
                                        </Link>
                                    )}

                                    {(roleUsuario === "GESTOR" ||
                                        roleUsuario === "ADMIN") && (
                                        <p className="text-xs text-slate-500">
                                            {roleUsuario === "GESTOR"
                                                ? "Consulte as avaliações pelo painel do gestor."
                                                : "O gerenciamento dos serviços está disponível no painel administrativo."}
                                        </p>
                                    )}
                                </div>
                            </article>
                        ))}
                    </div>
                </section>
            )}

            {/* Informação complementar */}
            {!carregando && !erro && totalSemLocalizacao > 0 && (
                <p className="text-xs leading-5 text-slate-500">
                    {totalSemLocalizacao} serviço(s) não aparecem no mapa porque
                    ainda não possuem coordenadas válidas cadastradas.
                </p>
            )}

            <p className="text-center text-xs text-slate-400">
                Os dados apresentados são provenientes do cadastro de serviços do Guia Cidadão.
            </p>
        </main>
    );
}
