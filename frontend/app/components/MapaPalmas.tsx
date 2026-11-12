
"use client";

import dynamic from "next/dynamic";
import type { UnidadePublicaMapa } from "./MapaPalmasInner";

export type { UnidadePublicaMapa } from "./MapaPalmasInner";

const DynamicMapa = dynamic(() => import("./MapaPalmasInner"), {
    ssr: false,
    loading: () => (
        <div className="flex h-[520px] w-full items-center justify-center rounded-3xl border border-sky-100 bg-white text-sm text-slate-500">
            <div className="flex items-center gap-2">
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-sky-600 border-t-transparent" />
                Carregando mapa interativo de Palmas...
            </div>
        </div>
    ),
});

interface MapaPalmasProps {
    unidades: UnidadePublicaMapa[];
    unidadeSelecionadaId?: string | null;
}

export default function MapaPalmas({
                                       unidades,
                                       unidadeSelecionadaId,
                                   }: MapaPalmasProps) {
    return (
        <DynamicMapa
            unidades={unidades}
            unidadeSelecionadaId={unidadeSelecionadaId}
        />
    );
}
