"use client";

import { useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import Link from "next/link";
import "leaflet/dist/leaflet.css";

// Correção dos ícones padrão do Leaflet no empacotamento do Next.js
const customIcon = L.icon({
    iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
    iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
    shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41],
});

export interface UnidadePublicaMapa {
    id: string;
    name: string;
    category: "Saúde" | "Educação" | "Transporte" | "Infraestrutura";
    esfera: "Municipal" | "Estadual" | "Federal";
    latitude: number;
    longitude: number;
    averageRating: number;
}

interface MapaInnerProps {
    unidades: UnidadePublicaMapa[];
}

export default function MapaPalmasInner({ unidades }: MapaInnerProps) {
    // Coordenadas centrais de Palmas (TO) - Praça dos Girassóis
    const PALMAS_CENTER: [number, number] = [-10.1844, -48.3336];

    return (
        <div className="h-[480px] w-full overflow-hidden rounded-3xl border border-sky-100 shadow-card">
            <MapContainer
                center={PALMAS_CENTER}
                zoom={13}
                scrollWheelZoom={false}
                className="h-full w-full"
            >
                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />

                {unidades.map((item) => (
                    <Marker
                        key={item.id}
                        position={[item.latitude, item.longitude]}
                        icon={customIcon}
                    >
                        <Popup className="font-sans">
                            <div className="p-1">
                <span className="inline-block rounded-md bg-sky-100 px-2 py-0.5 text-[10px] font-bold text-sky-800 uppercase">
                  {item.esfera} • {item.category}
                </span>
                                <h4 className="mt-1 text-sm font-bold text-slate-900 leading-snug">
                                    {item.name}
                                </h4>
                                <div className="mt-2 flex items-center justify-between text-xs">
                                    <span className="font-bold text-amber-500">★ {item.averageRating.toFixed(1)}</span>
                                    <Link
                                        href={`/servicos/${item.id}/avaliar`}
                                        className="font-semibold text-sky-600 hover:underline"
                                    >
                                        Avaliar Unidade →
                                    </Link>
                                </div>
                            </div>
                        </Popup>
                    </Marker>
                ))}
            </MapContainer>
        </div>
    );
}