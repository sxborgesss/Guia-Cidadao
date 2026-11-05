import Link from "next/link";
import { notFound } from "next/navigation";

interface PageProps {
    params: Promise<{ id: string }>;
}

interface ApiService {
    id: string;
    nome: string;
    categoria: string;
    esfera: string;
    endereco: string;
    mediaNota?: number | string;
    totalAvaliacoes?: number;
}

interface ApiReview {
    id: string;
    nota: number;
    comentario: string;
    created_at: string;
    user?: {
        id: string;
        nome: string;
    } | null;
    respostaInstitucional?: {
        id: string;
        resposta: string;
        created_at: string;
    } | null;
}

interface ServiceDetail {
    id: string;
    name: string;
    category: string;
    esfera: string;
    address: string;
    averageRating: number;
    totalReviews: number;
    reviews: ApiReview[];
}

const API_URL =
    process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

const categorias: Record<string, string> = {
    saude: "Saúde",
    educacao: "Educação",
    transporte: "Transporte",
    zeladoria: "Zeladoria",
    infraestrutura: "Infraestrutura",
};

const esferaBadges: Record<string, string> = {
    municipal: "bg-sky-100 text-sky-800 border-sky-200",
    estadual: "bg-emerald-100 text-emerald-800 border-emerald-200",
    federal: "bg-indigo-100 text-indigo-800 border-indigo-200",
};

function formatarCategoria(categoria: string) {
    return categorias[categoria?.toLowerCase()] ||
        categoria ||
        "Não informada";
}

function formatarData(data: string) {
    if (!data) return "Data não disponível";

    const dataFormatada = new Date(data);

    if (Number.isNaN(dataFormatada.getTime())) {
        return "Data não disponível";
    }

    return dataFormatada.toLocaleDateString("pt-BR", {
        day: "2-digit",
        month: "long",
        year: "numeric",
    });
}

async function getServiceData(
    id: string
): Promise<ServiceDetail | null> {
    // Buscar os serviços cadastrados na API.
    const servicesResponse = await fetch(
        `${API_URL}/services`,
        { cache: "no-store" }
    );

    if (!servicesResponse.ok) {
        throw new Error("Não foi possível consultar os serviços.");
    }

    const servicesData: ApiService[] =
        await servicesResponse.json();

    const service = servicesData.find(
        (item) => item.id === id
    );

    if (!service) {
        return null;
    }

    // Buscar as avaliações reais do serviço.
    const reviewsResponse = await fetch(
        `${API_URL}/reviews/service/${encodeURIComponent(id)}`,
        { cache: "no-store" }
    );

    if (!reviewsResponse.ok) {
        throw new Error("Não foi possível consultar as avaliações.");
    }

    const reviewsData: ApiReview[] =
        await reviewsResponse.json();

    const reviews = Array.isArray(reviewsData)
        ? reviewsData
        : [];

    // Calcular a média com base nas avaliações reais.
    const somaNotas = reviews.reduce(
        (soma, review) => soma + Number(review.nota),
        0
    );

    const averageRating =
        reviews.length > 0
            ? somaNotas / reviews.length
            : 0;

    return {
        id: service.id,
        name: service.nome,
        category: formatarCategoria(service.categoria),
        esfera: service.esfera || "Não informada",
        address: service.endereco || "Endereço não informado",
        averageRating,
        totalReviews: reviews.length,
        reviews,
    };
}

export default async function DetalhesServicoPage({
    params,
}: PageProps) {
    const { id } = await params;

    let service: ServiceDetail | null;

    try {
        service = await getServiceData(id);
    } catch {
        return (
            <main className="mx-auto max-w-4xl px-4 py-16 text-center">
                <div className="rounded-3xl border border-red-100 bg-white p-10 shadow-card">
                    <h1 className="text-xl font-bold text-slate-900">
                        Não foi possível carregar o serviço.
                    </h1>

                    <p className="mt-3 text-sm text-slate-500">
                        Verifique se o servidor está funcionando
                        e tente novamente.
                    </p>

                    <Link
                        href="/servicos"
                        className="mt-6 inline-flex rounded-xl bg-sky-600 px-5 py-3 text-sm font-bold text-white hover:bg-sky-700"
                    >
                        Voltar aos serviços
                    </Link>
                </div>
            </main>
        );
    }

    if (!service) {
        notFound();
    }

    const esferaClass =
        esferaBadges[service.esfera.toLowerCase()] ||
        "bg-slate-100 text-slate-800 border-slate-200";

    return (
        <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8 space-y-10">

            {/* Navegação */}
            <div>
                <Link
                    href="/servicos"
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-sky-700 hover:text-sky-900 transition mb-4"
                >
                    ← Voltar ao catálogo de serviços
                </Link>

                {/* Cabeçalho do serviço */}
                <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between rounded-3xl border border-sky-100 bg-white p-6 sm:p-10 shadow-card">

                    <div className="space-y-3">
                        <div className="flex flex-wrap items-center gap-2">
                            <span
                                className={`rounded-md border px-2.5 py-0.5 text-xs font-bold uppercase tracking-wider ${esferaClass}`}
                            >
                                Esfera {service.esfera}
                            </span>

                            <span className="rounded-md bg-slate-100 px-2.5 py-0.5 text-xs font-bold uppercase tracking-wider text-slate-700">
                                {service.category}
                            </span>
                        </div>

                        <h1 className="text-2xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
                            {service.name}
                        </h1>

                        <div className="flex flex-wrap gap-y-1 gap-x-4 text-xs text-slate-500 font-medium">
                            <span>📍 {service.address}</span>
                        </div>
                    </div>

                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 border-t lg:border-t-0 lg:border-l border-slate-100 pt-4 lg:pt-0 lg:pl-8">
                        <div className="text-center sm:text-left">
                            <div className="flex items-center gap-1.5">
                                <span className="text-3xl font-black text-amber-400">
                                    ★
                                </span>

                                <span className="text-3xl font-extrabold text-slate-900">
                                    {service.averageRating.toFixed(1)}
                                </span>

                                <span className="text-xs text-slate-400 font-semibold self-end pb-1">
                                    / 5.0
                                </span>
                            </div>

                            <p className="text-xs text-slate-500">
                                {service.totalReviews}{" "}
                                {service.totalReviews === 1
                                    ? "avaliação"
                                    : "avaliações"}
                            </p>
                        </div>

                        <Link
                            href={`/servicos/${service.id}/avaliar`}
                            className="inline-flex h-12 w-full sm:w-auto items-center justify-center rounded-2xl bg-sky-600 px-6 text-sm font-bold text-white shadow-elevated hover:bg-sky-700 transition transform active:scale-95"
                        >
                            + Avaliar este Serviço
                        </Link>
                    </div>
                </div>
            </div>

            {/* Mural público de avaliações */}
            <section className="space-y-6">
                <div className="flex items-center justify-between border-b border-slate-200 pb-4 gap-4">
                    <div>
                        <h2 className="text-xl font-bold text-slate-900">
                            Voz da População
                        </h2>

                        <p className="text-xs text-slate-500 mt-1">
                            Avaliações e manifestações dos cidadãos.
                        </p>
                    </div>

                    <span className="rounded-full bg-sky-50 px-3 py-1 text-xs font-semibold text-sky-700 whitespace-nowrap">
                        {service.reviews.length}{" "}
                        {service.reviews.length === 1
                            ? "relato"
                            : "relatos"}
                    </span>
                </div>

                {service.reviews.length === 0 ? (
                    <div className="rounded-3xl border border-sky-100 bg-white p-10 text-center shadow-card">
                        <div className="text-4xl mb-4">💬</div>

                        <h3 className="text-lg font-bold text-slate-800">
                            Ainda não existem avaliações.
                        </h3>

                        <p className="mt-2 text-sm text-slate-500">
                            Seja o primeiro cidadão a avaliar este serviço
                            e contribuir para sua melhoria.
                        </p>

                        <Link
                            href={`/servicos/${service.id}/avaliar`}
                            className="mt-6 inline-flex rounded-xl bg-sky-600 px-5 py-3 text-sm font-bold text-white hover:bg-sky-700 transition"
                        >
                            Fazer primeira avaliação
                        </Link>
                    </div>
                ) : (
                    <div className="space-y-6">
                        {service.reviews.map((rev) => {
                            const nota = Math.min(
                                5,
                                Math.max(0, Math.round(Number(rev.nota)))
                            );

                            const autor =
                                rev.user?.nome?.trim() || "Cidadão";

                            return (
                                <article
                                    key={rev.id}
                                    className="rounded-3xl border border-sky-100 bg-white p-6 shadow-card space-y-4"
                                >
                                    {/* Cabeçalho da avaliação */}
                                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2">
                                        <div className="flex items-center gap-3">
                                            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-sky-100 text-sm font-bold text-sky-800">
                                                {autor.charAt(0).toUpperCase()}
                                            </span>

                                            <div>
                                                <h3 className="text-sm font-bold text-slate-900 leading-tight">
                                                    {autor}
                                                </h3>

                                                <span className="text-xs text-slate-400">
                                                    {formatarData(rev.created_at)}
                                                </span>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-2">
                                            <div className="flex items-center text-amber-400 text-lg">
                                                {"★".repeat(nota)}
                                                {"☆".repeat(5 - nota)}
                                            </div>

                                            <span className="text-xs font-bold text-slate-700">
                                                {nota}/5
                                            </span>
                                        </div>
                                    </div>

                                    {/* Comentário */}
                                    <p className="text-sm text-slate-700 leading-relaxed">
                                        {rev.comentario}
                                    </p>

                                    {/* Resposta institucional */}
                                    {rev.respostaInstitucional ? (
                                        <div className="mt-5 rounded-2xl border-l-4 border-l-sky-500 bg-sky-50 p-5 space-y-3">
                                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                                                <span className="font-bold text-sky-900 flex items-center gap-1.5 text-sm">
                                                    <span className="text-base">🏛️</span>
                                                    Resposta institucional
                                                </span>

                                                <span className="text-xs text-slate-500 font-medium">
                                                    Respondido em{" "}
                                                    {formatarData(
                                                        rev.respostaInstitucional.created_at
                                                    )}
                                                </span>
                                            </div>

                                            <p className="text-sm text-slate-800 leading-relaxed">
                                                {rev.respostaInstitucional.resposta}
                                            </p>
                                        </div>
                                    ) : (
                                        <div className="rounded-xl bg-slate-50 px-4 py-3">
                                            <span className="text-xs font-medium text-slate-500">
                                                Esta avaliação ainda não possui
                                                resposta institucional.
                                            </span>
                                        </div>
                                    )}
                                </article>
                            );
                        })}
                    </div>
                )}
            </section>
        </main>
    );
}