"use client";

import { useState } from "react";
import MapaPalmas, { UnidadePublicaMapa } from "@/app/components/MapaPalmas";

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
        name: "Instituto Federal do Tocantins (IFTO) - Campus Palmas",
        category: "Educação",
        esfera: "Federal",
        latitude: -10.2001,
        longitude: -48.3615,
        averageRating: 4.8,
    },
    {
        id: "estacao-araguaia",
        name: "Estação de Integração de Ônibus Araguaia",
        category: "Transporte",
        esfera: "Municipal",
        latitude: -10.2220,
        longitude: -48.3330,
        averageRating: 3.4,
    },
];

export default function PaginaServicosComMapa() {
    const [esferaFiltro, setEsferaFiltro] = useState<string>("TODAS");

    const unidadesFiltradas = UNIDADES_MOCK.filter((u) =>
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

            {/* Filtros por Esfera Governamental (RF01) */}
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

            {/* Mapa Interativo OpenStreetMap (RF02) */}
            <MapaPalmas unidades={unidadesFiltradas} />
        </main>
    );
}