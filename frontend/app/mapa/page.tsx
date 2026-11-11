
"use client";

import { useEffect, useMemo, useState } from "react";
import MapaPalmas, {
    UnidadePublicaMapa,
} from "@/app/components/MapaPalmas";
import { API_URL } from "@/lib/api";

interface ServicoApi {
    id: string;
    nome: string;
    categoria?: string | null;
    esfera?: string | null;
    latitude?: number | string | null;
    longitude?: number | string | null;
    mediaNota?: number | string | null;
    totalAvaliacoes?: number | string | null;
}

function converterCoordenada(
    valor: number | string | null | undefined,
): number | null {
    if (valor === null || valor === undefined || valor === "") {
        return null;
    }

    const numero = Number(valor);

    return Number.isFinite(numero) ? numero : null;
}

function coordenadasValidas(
    latitude: number,
    longitude: number,
): boolean {
    return (
        latitude >= -90 &&
        latitude <= 90 &&
        longitude >= -180 &&
        longitude <= 180
    );
}

function formatarCategoria(
    categoria?: string | null,
): UnidadePublicaMapa["category"] {
    const categoriaNormalizada = (categoria ?? "")
        .trim()
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "");

    switch (categoriaNormalizada) {
        case "saude":
            return "Saúde";
        case "educacao":
            return "Educação";
        case "transporte":
            return "Transporte";
        case "zeladoria":
            return "Zeladoria";
        case "infraestrutura":
            return "Infraestrutura";
        default:
            return "Infraestrutura";
    }
}

function formatarEsfera(
    esfera?: string | null,
): UnidadePublicaMapa["esfera"] {
    const esferaNormalizada = (esfera ?? "Municipal")
        .trim()
        .toLowerCase();

    switch (esferaNormalizada) {
        case "estadual":
            return "Estadual";
        case "federal":
            return "Federal";
        case "municipal":
        default:
            return "Municipal";
    }
}

export default function PaginaServicosComMapa() {
    const [esferaFiltro, setEsferaFiltro] = useState("TODAS");

    const [unidades, setUnidades] = useState<UnidadePublicaMapa[]>([]);
    const [totalServicos, setTotalServicos] = useState(0);
    const [totalSemLocalizacao, setTotalSemLocalizacao] = useState(0);

    const [carregando, setCarregando] = useState(true);
    const [erro, setErro] = useState<string | null>(null);

    useEffect(() => {
        let ativo = true;

        async function carregarServicos() {
            setCarregando(true);
            setErro(null);

            try {
                const resposta = await fetch(
                    `${API_URL}/services`,
                    {
                        method: "GET",
                        cache: "no-store",
                    },
                );

                if (!resposta.ok) {
                    throw new Error(
                        "Não foi possível consultar os serviços públicos.",
                    );
                }

                const dados: ServicoApi[] = await resposta.json();

                if (!Array.isArray(dados)) {
                    throw new Error(
                        "A API retornou um formato inesperado de serviços.",
                    );
                }

                const unidadesMapeadas: UnidadePublicaMapa[] = [];
                let semLocalizacao = 0;

                dados.forEach((item) => {
                    const latitude = converterCoordenada(item.latitude);
                    const longitude = converterCoordenada(item.longitude);

                    if (latitude === null || longitude === null) {
                        semLocalizacao++;
                        return;
                    }

                    if (!coordenadasValidas(latitude, longitude)) {
                        semLocalizacao++;
                        return;
                    }

                    const totalAvaliacoes = Number(
                        item.totalAvaliacoes ?? 0,
                    );

                    const mediaNota =
                        totalAvaliacoes > 0
                            ? Number(item.mediaNota ?? 0)
                            : 0;

                    unidadesMapeadas.push({
                        id: item.id,
                        name: item.nome,
                        category: formatarCategoria(item.categoria),
                        esfera: formatarEsfera(item.esfera),
                        latitude,
                        longitude,
                        averageRating: Number.isFinite(mediaNota)
                            ? mediaNota
                            : 0,
                    });
                });

                if (!ativo) return;

                setUnidades(unidadesMapeadas);
                setTotalServicos(dados.length);
                setTotalSemLocalizacao(semLocalizacao);
            } catch (error) {
                if (!ativo) return;

                setErro(
                    error instanceof Error
                        ? error.message
                        : "Erro inesperado ao carregar o mapa.",
                );
            } finally {
                if (ativo) {
                    setCarregando(false);
                }
            }
        }

        carregarServicos();

        return () => {
            ativo = false;
        };
    }, []);

    const unidadesFiltradas = useMemo(() => {
        if (esferaFiltro === "TODAS") {
            return unidades;
        }

        return unidades.filter(
            (unidade) =>
                unidade.esfera.toUpperCase() === esferaFiltro,
        );
    }, [unidades, esferaFiltro]);

    const esferas = [
        { valor: "TODAS", texto: "Todas as esferas" },
        { valor: "MUNICIPAL", texto: "Municipal" },
        { valor: "ESTADUAL", texto: "Estadual" },
        { valor: "FEDERAL", texto: "Federal" },
    ];

    return (
        <main className="mx-auto max-w-7xl space-y-8 px-4 py-10 sm:px-6 lg:px-8">
            <section>
                <span className="text-xs font-bold uppercase tracking-wider text-sky-700">
                    Geolocalização Cívica
                </span>

                <h1 className="mt-1 text-3xl font-extrabold text-slate-900">
                    Postos e Unidades em Palmas (TO)
                </h1>

                <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">
                    Localize serviços públicos municipais, estaduais e
                    federais. Consulte sua localização e encontre informações
                    sobre cada unidade.
                </p>
            </section>

            <section className="grid gap-4 sm:grid-cols-3">
                <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                    <p className="text-xs font-bold uppercase tracking-wide text-slate-500">
                        Serviços cadastrados
                    </p>

                    <p className="mt-2 text-3xl font-extrabold text-slate-900">
                        {carregando ? "—" : totalServicos}
                    </p>
                </div>

                <div className="rounded-2xl border border-emerald-100 bg-emerald-50 p-5">
                    <p className="text-xs font-bold uppercase tracking-wide text-emerald-700">
                        Localizados no mapa
                    </p>

                    <p className="mt-2 text-3xl font-extrabold text-emerald-800">
                        {carregando ? "—" : unidades.length}
                    </p>
                </div>

                <div className="rounded-2xl border border-amber-100 bg-amber-50 p-5">
                    <p className="text-xs font-bold uppercase tracking-wide text-amber-700">
                        Sem localização válida
                    </p>

                    <p className="mt-2 text-3xl font-extrabold text-amber-800">
                        {carregando ? "—" : totalSemLocalizacao}
                    </p>
                </div>
            </section>

            <section>
                <div className="mb-3">
                    <h2 className="text-sm font-bold text-slate-800">
                        Filtrar por esfera administrativa
                    </h2>
                </div>

                <div className="flex flex-wrap gap-2">
                    {esferas.map((esfera) => (
                        <button
                            key={esfera.valor}
                            type="button"
                            onClick={() => setEsferaFiltro(esfera.valor)}
                            className={`rounded-xl border px-4 py-2.5 text-xs font-bold transition ${
                                esferaFiltro === esfera.valor
                                    ? "border-sky-600 bg-sky-600 text-white shadow-sm"
                                    : "border-slate-200 bg-white text-slate-600 hover:border-sky-300 hover:text-sky-700"
                            }`}
                        >
                            {esfera.texto}
                        </button>
                    ))}
                </div>
            </section>

            {erro && (
                <div
                    role="alert"
                    className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm font-medium text-red-700"
                >
                    {erro}
                </div>
            )}

            {carregando ? (
                <div className="flex h-[480px] w-full items-center justify-center rounded-3xl border border-sky-100 bg-white text-sm text-slate-500 shadow-sm">
                    <div className="flex items-center gap-2">
                        <span className="h-4 w-4 animate-spin rounded-full border-2 border-sky-600 border-t-transparent" />
                        Carregando unidades da base de dados...
                    </div>
                </div>
            ) : !erro && unidadesFiltradas.length > 0 ? (
                <MapaPalmas unidades={unidadesFiltradas} />
            ) : !erro ? (
                <div className="flex min-h-[300px] flex-col items-center justify-center rounded-3xl border border-dashed border-slate-300 bg-slate-50 p-8 text-center">
                    <h2 className="text-lg font-bold text-slate-800">
                        Nenhum serviço localizado
                    </h2>

                    <p className="mt-2 max-w-lg text-sm leading-6 text-slate-500">
                        Não existem serviços com coordenadas válidas para
                        esta esfera administrativa. Tente selecionar outra
                        esfera ou verifique os cadastros.
                    </p>
                </div>
            ) : null}

            {!carregando && !erro && totalSemLocalizacao > 0 && (
                <div className="rounded-xl border border-amber-200 bg-amber-50 p-4">
                    <p className="text-sm font-bold text-amber-900">
                        Alguns serviços não aparecem no mapa
                    </p>

                    <p className="mt-1 text-sm leading-6 text-amber-800">
                        {totalSemLocalizacao} de {totalServicos} serviços
                        estão sem coordenadas válidas. O cadastro desses
                        locais precisa ser atualizado pelo administrador
                        para que eles apareçam no mapa.
                    </p>
                </div>
            )}

            {!carregando && !erro && (
                <section className="rounded-2xl border border-slate-200 bg-white p-5">
                    <h2 className="text-sm font-bold text-slate-800">
                        Sobre os dados exibidos
                    </h2>

                    <p className="mt-2 text-sm leading-6 text-slate-600">
                        O mapa apresenta os serviços que possuem latitude e
                        longitude cadastradas corretamente. Serviços sem
                        localização não são posicionados para evitar
                        marcadores incorretos.
                    </p>

                    <p className="mt-2 text-xs text-slate-500">
                        Exibindo {unidadesFiltradas.length} de{" "}
                        {unidades.length} serviços localizados no mapa.
                    </p>
                </section>
            )}
        </main>
    );
}
