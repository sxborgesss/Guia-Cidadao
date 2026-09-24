import Link from "next/link";
import { notFound } from "next/navigation";

interface PageProps {
    params: Promise<{ id: string }>;
}

interface ServiceDetail {
    id: string;
    name: string;
    category: "Saúde" | "Educação" | "Transporte" | "Infraestrutura";
    esfera: "Municipal" | "Estadual" | "Federal";
    address: string;
    schedule: string;
    phone: string;
    averageRating: number;
    totalReviews: number;
    indicators: {
        atendimento: number;
        espera: number;
        infraestrutura: number;
    };
    reviews: Array<{
        id: string;
        author: string;
        isAnonimo: boolean;
        date: string;
        notaGeral: number;
        notas: {
            atendimento: number;
            espera: number;
            infraestrutura: number;
        };
        relato: string | null;
    }>;
}

// Integração Real de Avaliações + Médias Dinâmicas
async function getServiceData(id: string): Promise<ServiceDetail | null> {

    // 1. DADOS DA UNIDADE (Ainda fixos, será o nosso próximo passo no backend)
    const baseService = {
        id,
        name: id === "usf-403-norte"
            ? "Unidade de Saúde da Família (USF) 403 Norte"
            : "Unidade de Pronto Atendimento (UPA) Norte",
        category: "Saúde" as const,
        esfera: "Municipal" as const,
        address: "ARNO 41, Alameda 02, APM 05 - Palmas, TO",
        schedule: "Segunda a Sexta, das 07h00 às 19h00",
        phone: "(63) 3212-7800",
    };

    try {
        // 2. BUSCA AS AVALIAÇÕES REAIS NO POSTGRESQL (via NestJS)
        const response = await fetch(`http://localhost:3001/reviews/service/${id}`, {
            cache: 'no-store' // Garante que temos sempre a média mais recente
        });

        if (!response.ok) {
            throw new Error("Erro ao buscar avaliações no backend");
        }

        const reviewsDaBD = await response.json();

        // 3. MAPEAR OS DADOS DA BD PARA O FORMATO DO FRONTEND
        const formattedReviews = reviewsDaBD.map((rev: any) => {
            const dataFomatada = new Date(rev.created_at).toLocaleDateString('pt-BR', {
                day: 'numeric', month: 'long', year: 'numeric'
            });

            return {
                id: rev.id,
                author: rev.isAnonimo ? "Cidadão Anônimo" : rev.user?.nome || "Cidadão",
                isAnonimo: rev.isAnonimo,
                date: dataFomatada,
                notaGeral: rev.notaGeral,
                notas: {
                    atendimento: rev.notaAtendimento,
                    espera: rev.notaEspera,
                    infraestrutura: rev.notaInfraestrutura
                },
                relato: rev.relato,
            };
        });

        // 4. CÁLCULO DAS MÉDIAS DINÂMICAS 🚀
        const totalReviews = formattedReviews.length;
        let avgGeral = 0, avgAtendimento = 0, avgEspera = 0, avgInfraestrutura = 0;

        if (totalReviews > 0) {
            avgGeral = formattedReviews.reduce((acc: number, curr: any) => acc + curr.notaGeral, 0) / totalReviews;
            avgAtendimento = formattedReviews.reduce((acc: number, curr: any) => acc + curr.notas.atendimento, 0) / totalReviews;
            avgEspera = formattedReviews.reduce((acc: number, curr: any) => acc + curr.notas.espera, 0) / totalReviews;
            avgInfraestrutura = formattedReviews.reduce((acc: number, curr: any) => acc + curr.notas.infraestrutura, 0) / totalReviews;
        }

        return {
            ...baseService,
            averageRating: avgGeral,
            totalReviews,
            indicators: {
                atendimento: avgAtendimento,
                espera: avgEspera,
                infraestrutura: avgInfraestrutura
            },
            reviews: formattedReviews
        };

    } catch (error) {
        console.error("Erro:", error);
        // Fallback seguro caso o backend esteja desligado
        return {
            ...baseService,
            averageRating: 0, totalReviews: 0,
            indicators: { atendimento: 0, espera: 0, infraestrutura: 0 },
            reviews: []
        };
    }
}

export default async function DetalhesServicoPage({ params }: PageProps) {
    const { id } = await params;
    const service = await getServiceData(id);

    if (!service) {
        notFound();
    }

    return (
        <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8 space-y-10">
            {/* Navegação Superior */}
            <div>
                <Link
                    href="/servicos"
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-brand hover:text-brand-hover transition mb-4"
                >
                    ← Voltar ao catálogo de serviços
                </Link>

                {/* Cabeçalho da Unidade (Identificação) */}
                <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between rounded-3xl border border-border bg-surface p-6 sm:p-10 shadow-card">
                    <div className="space-y-3">
                        <div className="flex flex-wrap items-center gap-2">
                            <span className="rounded-md bg-brand-light text-brand px-2.5 py-0.5 text-xs font-bold uppercase tracking-wider">
                                Esfera {service.esfera}
                            </span>
                            <span className="rounded-md border border-border bg-background px-2.5 py-0.5 text-xs font-bold uppercase tracking-wider text-foreground-muted">
                                {service.category}
                            </span>
                        </div>

                        <h1 className="text-2xl sm:text-4xl font-extrabold text-foreground tracking-tight">
                            {service.name}
                        </h1>

                        <div className="flex flex-wrap gap-y-1 gap-x-4 text-xs text-foreground-muted font-medium">
                            <span>📍 {service.address}</span>
                            <span>⏰ {service.schedule}</span>
                            <span>📞 {service.phone}</span>
                        </div>
                    </div>

                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 border-t lg:border-t-0 lg:border-l border-border pt-4 lg:pt-0 lg:pl-8">
                        <div className="text-center sm:text-left">
                            <div className="flex items-center gap-1.5">
                                <span className="text-3xl font-black text-amber-500">★</span>
                                <span className="text-3xl font-extrabold text-foreground">
                                    {service.averageRating > 0 ? service.averageRating.toFixed(1) : "0.0"}
                                </span>
                                <span className="text-xs text-foreground-muted font-semibold self-end pb-1">
                                    / 5.0
                                </span>
                            </div>
                            <p className="text-xs text-foreground-muted">{service.totalReviews} avaliações validadas</p>
                        </div>

                        <Link
                            href={`/servicos/${service.id}/avaliar`}
                            className="inline-flex h-12 w-full sm:w-auto items-center justify-center rounded-2xl bg-brand px-6 text-sm font-bold text-brand-contrast shadow-elevated hover:bg-brand-hover transition transform active:scale-95"
                        >
                            + Avaliar este Serviço
                        </Link>
                    </div>
                </div>
            </div>

            {/* Indicadores Multicritério */}
            <section className="space-y-4">
                <h2 className="text-xl font-bold text-foreground">
                    Desempenho por Eixo de Avaliação
                </h2>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                    <div className="rounded-2xl border border-border bg-surface p-5 shadow-card">
                        <div className="flex items-center justify-between text-xs text-foreground-muted">
                            <span className="font-semibold uppercase tracking-wide">Atendimento Humano</span>
                            <span className="text-lg">👥</span>
                        </div>
                        <div className="mt-3 flex items-baseline gap-2">
                            <span className="text-2xl font-black text-foreground">
                                {service.indicators.atendimento > 0 ? service.indicators.atendimento.toFixed(1) : "0.0"}
                            </span>
                            <span className="text-xs text-foreground-muted">/ 5.0</span>
                        </div>
                        <div className="mt-2 h-2 w-full rounded-full bg-background overflow-hidden">
                            <div
                                className="h-full bg-brand rounded-full transition-all duration-500"
                                style={{ width: `${(service.indicators.atendimento / 5) * 100}%` }}
                            />
                        </div>
                    </div>

                    <div className="rounded-2xl border border-border bg-surface p-5 shadow-card">
                        <div className="flex items-center justify-between text-xs text-foreground-muted">
                            <span className="font-semibold uppercase tracking-wide">Tempo de Espera</span>
                            <span className="text-lg">⏱️</span>
                        </div>
                        <div className="mt-3 flex items-baseline gap-2">
                            <span className="text-2xl font-black text-foreground">
                                {service.indicators.espera > 0 ? service.indicators.espera.toFixed(1) : "0.0"}
                            </span>
                            <span className="text-xs text-foreground-muted">/ 5.0</span>
                        </div>
                        <div className="mt-2 h-2 w-full rounded-full bg-background overflow-hidden">
                            <div
                                className="h-full bg-sun rounded-full transition-all duration-500"
                                style={{ width: `${(service.indicators.espera / 5) * 100}%` }}
                            />
                        </div>
                    </div>

                    <div className="rounded-2xl border border-border bg-surface p-5 shadow-card">
                        <div className="flex items-center justify-between text-xs text-foreground-muted">
                            <span className="font-semibold uppercase tracking-wide">Infraestrutura</span>
                            <span className="text-lg">🏢</span>
                        </div>
                        <div className="mt-3 flex items-baseline gap-2">
                            <span className="text-2xl font-black text-foreground">
                                {service.indicators.infraestrutura > 0 ? service.indicators.infraestrutura.toFixed(1) : "0.0"}
                            </span>
                            <span className="text-xs text-foreground-muted">/ 5.0</span>
                        </div>
                        <div className="mt-2 h-2 w-full rounded-full bg-background overflow-hidden">
                            <div
                                className="h-full bg-leaf rounded-full transition-all duration-500"
                                style={{ width: `${(service.indicators.infraestrutura / 5) * 100}%` }}
                            />
                        </div>
                    </div>
                </div>
            </section>

            {/* Mural Público de Manifestações */}
            <section className="space-y-6">
                <div className="flex items-center justify-between border-b border-border pb-4">
                    <div>
                        <h2 className="text-xl font-bold text-foreground">
                            Voz da População
                        </h2>
                        <p className="text-xs text-foreground-muted mt-1">
                            Relatos cívicos submetidos por utentes e cidadãos de Palmas
                        </p>
                    </div>
                    <span className="rounded-full bg-brand-light px-3 py-1 text-xs font-semibold text-brand">
                        {service.reviews.length} relatos
                    </span>
                </div>

                <div className="space-y-6">
                    {service.reviews.length === 0 ? (
                        <div className="rounded-3xl border border-dashed border-border bg-surface py-12 text-center text-foreground-muted">
                            <p>Ainda não existem avaliações para este serviço.</p>
                            <p className="text-sm mt-1">Seja o primeiro cidadão a partilhar a sua experiência!</p>
                        </div>
                    ) : (
                        service.reviews.map((rev) => (
                            <article
                                key={rev.id}
                                className="rounded-3xl border border-border bg-surface p-6 shadow-card space-y-4"
                            >
                                {/* Cabeçalho do Relato */}
                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2">
                                    <div className="flex items-center gap-3">
                                        <span className="flex h-10 w-10 items-center justify-center rounded-full bg-brand-light text-sm font-bold text-brand">
                                            {rev.isAnonimo ? "CA" : rev.author.charAt(0)}
                                        </span>
                                        <div>
                                            <h3 className="text-sm font-bold text-foreground leading-tight">
                                                {rev.author}
                                            </h3>
                                            <span className="text-xs text-foreground-muted">
                                                {rev.date}
                                            </span>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-4">
                                        <div className="flex items-center text-sun text-lg">
                                            {"★".repeat(rev.notaGeral)}
                                            {"☆".repeat(5 - rev.notaGeral)}
                                        </div>
                                        <button
                                            type="button"
                                            title="Denunciar conteúdo impróprio"
                                            className="text-xs font-medium text-foreground-subtle hover:text-coral transition flex items-center gap-1"
                                        >
                                            <span>🚩</span> <span className="hidden sm:inline">Denunciar</span>
                                        </button>
                                    </div>
                                </div>

                                {/* Critérios do Relato */}
                                <div className="flex flex-wrap gap-2 text-xs">
                                    <span className="rounded-md bg-background border border-border px-2.5 py-1 text-foreground-muted font-medium">
                                        Atendimento: <strong className="text-foreground">{rev.notas.atendimento}/5</strong>
                                    </span>
                                    <span className="rounded-md bg-background border border-border px-2.5 py-1 text-foreground-muted font-medium">
                                        Espera: <strong className="text-foreground">{rev.notas.espera}/5</strong>
                                    </span>
                                    <span className="rounded-md bg-background border border-border px-2.5 py-1 text-foreground-muted font-medium">
                                        Estrutura: <strong className="text-foreground">{rev.notas.infraestrutura}/5</strong>
                                    </span>
                                </div>

                                {/* Texto Opinativo */}
                                {rev.relato && (
                                    <p className="text-sm text-foreground leading-relaxed">
                                        "{rev.relato}"
                                    </p>
                                )}
                            </article>
                        ))
                    )}
                </div>
            </section>
        </main>
    );
}