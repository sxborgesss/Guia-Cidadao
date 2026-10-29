"use client";

import { useState, useEffect } from "react";
import MapaPalmas, { UnidadePublicaMapa } from "@/app/components/MapaPalmas";

export default function PaginaServicosComMapa() {
    const [esferaFiltro, setEsferaFiltro] = useState<string>("TODAS");
    const [unidades, setUnidades] = useState<UnidadePublicaMapa[]>([]);
    const [carregando, setCarregando] = useState<boolean>(true);

    useEffect(() => {
        // Substitua pelo URL base correto da sua API em produção, se necessário
        fetch("http://localhost:3001/services")
            .then((resposta) => resposta.json())
            .then((dados) => {
                // Mapeamento das colunas do banco (PublicService) para as propriedades do mapa
                const unidadesMapeadas: UnidadePublicaMapa[] = dados.map((item: any) => {

                    // Formata a categoria do banco para o padrão visual do mapa
                    let categoriaFormatada = "Infraestrutura";
                    if (item.categoria === 'saude') categoriaFormatada = "Saúde";
                    if (item.categoria === 'educacao') categoriaFormatada = "Educação";
                    if (item.categoria === 'transporte') categoriaFormatada = "Transporte";

                    return {
                        id: item.id,
                        name: item.nome,
                        category: categoriaFormatada as any,
                        esfera: item.esfera || "Municipal", // Fallback caso a coluna esfera ainda não exista no banco
                        latitude: Number(item.latitude),
                        longitude: Number(item.longitude),
                        averageRating: Number(item.mediaNota),
                    };
                });
                setUnidades(unidadesMapeadas);
            })
            .catch((erro) => console.error("Erro ao buscar as unidades:", erro))
            .finally(() => setCarregando(false));
    }, []);

    const unidadesFiltradas = unidades.filter((u) =>
        esferaFiltro === "TODAS" ? true : u.esfera.toUpperCase() === esferaFiltro
    );

    return (
        <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8 space-y-8">
            <div>
                <span className="text-xs font-bold uppercase tracking-wider text-sky-700">
                  Geolocalização Cívica
                </span>
                <h1 className="mt-1 text-3xl font-extrabold text-slate-900">
                    Postos e Unidades em Palmas (TO)
                </h1>
                <p className="text-sm text-slate-600">
                    Localize no mapa os postos de saúde, escolas e estações de transporte municipal, estadual e federal.
                </p>
            </div>

            {/* Filtros por Esfera Governamental */}
            <div className="flex flex-wrap gap-2">
                {["TODAS", "MUNICIPAL", "ESTADUAL", "FEDERAL"].map((esfera) => (
                    <button
                        key={esfera}
                        onClick={() => setEsferaFiltro(esfera)}
                        className={`rounded-xl px-4 py-2 text-xs font-bold transition border ${
                            esferaFiltro === esfera
                                ? "bg-sky-600 text-white border-sky-600 shadow-sm"
                                : "bg-white text-slate-600 border-slate-200 hover:border-sky-300"
                        }`}
                    >
                        {esfera === "TODAS" ? "Todas as Esferas" : `Esfera ${esfera}`}
                    </button>
                ))}
            </div>

            {/* Renderização condicional do Mapa ou do Loading */}
            {carregando ? (
                <div className="flex h-[480px] w-full items-center justify-center rounded-3xl border border-sky-100 bg-white text-sm text-slate-500 shadow-sm">
                    <div className="flex items-center gap-2">
                        <span className="h-4 w-4 animate-spin rounded-full border-2 border-sky-600 border-t-transparent" />
                        A carregar unidades da base de dados...
                    </div>
                </div>
            ) : (
                <MapaPalmas unidades={unidadesFiltradas} />
            )}
        </main>
    );
}