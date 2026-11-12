
"use client";

import { useEffect, useState } from "react";
import {
    MapContainer,
    TileLayer,
    Marker,
    Popup,
    useMap,
} from "react-leaflet";
import L from "leaflet";
import Link from "next/link";
import "leaflet/dist/leaflet.css";

const customIcon = L.icon({
    iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
    iconRetinaUrl:
        "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
    shadowUrl:
        "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41],
});

export interface UnidadePublicaMapa {
    id: string;
    name: string;
    address: string;
    category: string;
    esfera: string;
    latitude: number;
    longitude: number;
    averageRating: number;
    totalAvaliacoes: number;
}

interface MapaInnerProps {
    unidades: UnidadePublicaMapa[];
    unidadeSelecionadaId?: string | null;
}

interface CentralizarMapaProps {
    unidade?: UnidadePublicaMapa;
}

function CentralizarMapa({ unidade }: CentralizarMapaProps) {
    const mapa = useMap();

    useEffect(() => {
        if (unidade) {
            mapa.flyTo(
                [unidade.latitude, unidade.longitude],
                16,
                { duration: 0.8 },
            );
        }
    }, [unidade, mapa]);

    return null;
}

export default function MapaPalmasInner({
                                            unidades,
                                            unidadeSelecionadaId,
                                        }: MapaInnerProps) {
    const [roleUsuario, setRoleUsuario] = useState<string | null>(null);

    const PALMAS_CENTER: [number, number] = [-10.1844, -48.3336];

    useEffect(() => {
        function carregarPerfil() {
            const token = localStorage.getItem("token");
            const usuarioSalvo = localStorage.getItem("user");

            if (!token || !usuarioSalvo) {
                setRoleUsuario(null);
                return;
            }

            try {
                const usuario = JSON.parse(usuarioSalvo);
                setRoleUsuario(usuario.role ?? null);
            } catch {
                setRoleUsuario(null);
            }
        }

        carregarPerfil();
        window.addEventListener("storage", carregarPerfil);

        return () => {
            window.removeEventListener("storage", carregarPerfil);
        };
    }, []);

    const unidadesValidas = unidades.filter((item) => {
        return (
            Number.isFinite(item.latitude) &&
            Number.isFinite(item.longitude) &&
            item.latitude >= -90 &&
            item.latitude <= 90 &&
            item.longitude >= -180 &&
            item.longitude <= 180
        );
    });

    const unidadeSelecionada = unidadesValidas.find(
        (item) => item.id === unidadeSelecionadaId,
    );

    return (
        <div className="h-[520px] w-full overflow-hidden rounded-3xl border border-slate-200 shadow-sm">
            <MapContainer
                center={PALMAS_CENTER}
                zoom={12}
                scrollWheelZoom={true}
                className="h-full w-full"
            >
                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />

                <CentralizarMapa unidade={unidadeSelecionada} />

                {unidadesValidas.map((item) => {
                    const visitante = roleUsuario === null;
                    const cidadao = roleUsuario === "CIDADAO";

                    const linkAvaliacao = visitante
                        ? `/registro?origem=avaliacao&servico=${encodeURIComponent(item.id)}`
                        : `/servicos/${item.id}/avaliar`;

                    return (
                        <Marker
                            key={item.id}
                            position={[item.latitude, item.longitude]}
                            icon={customIcon}
                        >
                            <Popup className="font-sans">
                                <div className="min-w-[200px] p-1">
                                    <div className="flex flex-wrap gap-1">
                                        <span className="rounded-md bg-sky-100 px-2 py-1 text-[10px] font-bold text-sky-800">
                                            {item.category}
                                        </span>

                                        <span className="rounded-md bg-slate-100 px-2 py-1 text-[10px] font-bold text-slate-600">
                                            {item.esfera}
                                        </span>
                                    </div>

                                    <h4 className="mt-2 text-sm font-bold leading-snug text-slate-900">
                                        {item.name}
                                    </h4>

                                    <p className="mt-1 text-xs leading-5 text-slate-500">
                                        {item.address}
                                    </p>

                                    <div className="mt-2">
                                        <span className="text-xs font-bold text-amber-600">
                                            ★ {item.averageRating.toFixed(1)}
                                        </span>

                                        <span className="ml-1 text-xs text-slate-500">
                                            ({item.totalAvaliacoes} avaliações)
                                        </span>
                                    </div>

                                    {(visitante || cidadao) && (
                                        <Link
                                            href={linkAvaliacao}
                                            className="mt-3 inline-block rounded-lg bg-sky-600 px-4 py-2 text-sm font-semibold
                                            !text-white transition-colors hover:bg-sky-700"
                                        >
                                            Avaliar unidade
                                        </Link>
                                    )}

                                    {roleUsuario === "GESTOR" && (
                                        <p className="mt-3 text-xs text-slate-500">
                                            Consulte as avaliações no painel do gestor.
                                        </p>
                                    )}

                                    {roleUsuario === "ADMIN" && (
                                        <Link
                                            href="/admin/servicos"
                                            className="mt-3 inline-block text-xs font-bold text-sky-700 hover:underline"
                                        >
                                            Gerenciar serviços
                                        </Link>
                                    )}
                                </div>
                            </Popup>
                        </Marker>
                    );
                })}
            </MapContainer>
        </div>
    );
}
