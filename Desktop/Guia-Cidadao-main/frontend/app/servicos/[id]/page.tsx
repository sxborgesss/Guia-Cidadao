import Link from "next/link";
import { notFound } from "next/navigation";

// Tipagem baseada no DER do FeedPalmas (services, reviews, responses)
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
        // RF05: Relação 1:1 com a tabela 'responses'
        response?: {
            author: string;
            role: string;
            date: string;
            content: string;
        };
    }>;
}

// Simulação de consulta ao PostgreSQL via API NestJS
async function getServiceData(id: string): Promise<ServiceDetail | null> {
    // Mock representativo de Palmas para renderização
    return {
        id,
        name: id === "usf-403-norte"
            ? "Unidade de Saúde da Família (USF) 403 Norte"
            : "Unidade de Pronto Atendimento (UPA) Norte",
        category: "Saúde",
        esfera: "Municipal",
        address: "ARNO 41, Alameda 02, APM 05 - Palmas, TO",
        schedule: "Segunda a Sexta, das 07h00 às 19h00",
        phone: "(63) 3212-7800",
        averageRating: 4.2,
        totalReviews: 87,
        indicators: {
            atendimento: 4.5,
            espera: 3.4,
            infraestrutura: 4.1,
        },
        reviews: [
            {
                id: "rev-1",
                author: "Cidadão Anónimo",
                isAnonimo: true,
                date: "21 de Setembro de 2026",
                notaGeral: 4,
                notas: { atendimento: 5, espera: 3, infraestrutura: 4 },
                relato:
                    "O acolhimento da receção e a consulta médica foram exemplares. Contudo, a triagem demorou cerca de 45 minutos devido à fila inicial da manhã.",
                response: {
                    author: "Coordenação de Regulação Municipal",
                    role: "Gestor Credenciado • Secretaria Municipal de Saúde",
                    date: "22 de Setembro de 2026",
                    content:
                        "Agradecemos o contributo. Informamos que a partir do próximo mês reforçaremos a equipa de enfermagem na triagem entre as 07h e as 09h para mitigar os picos de espera.",
                },
            },
            {
                id: "rev-2",
                author: "Mariana Costa",
                isAnonimo: false,
                date: "18 de Setembro de 2026",
                notaGeral: 5,
                notas: { atendimento: 5, espera: 5, infraestrutura: 5 },
                relato: "Farmácia básica abastecida com todos os medicamentos prescritos. Ambiente limpo e com ar condicionado a funcionar perfeitamente.",
            },
        ],
    };
}

export default async function DetalhesServicoPage({ params }: PageProps) {
    const { id } = await params;
    const service = await getServiceData(id);

    if (!service) {
        notFound();
    }

    // Estilos dinâmicos baseados na esfera governamental
    const esferaBadges = {
        Municipal: "bg-sky-100 text-sky-800 border-sky-200",
        Estadual: "bg-emerald-100 text-emerald-800 border-emerald-200",
        Federal: "bg-indigo-100 text-indigo-800 border-indigo-200",
    }[service.esfera];

    return (
        <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8 space-y-10">
            {/* Navegação Superior */}
            <div>
                <Link
                    href="/servicos"
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-sky-700 hover:text-sky-900 transition mb-4"
                >
                    ← Voltar ao catálogo de serviços
                </Link>

                {/* Cabeçalho da Unidade (Identificação) */}
                <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between rounded-3xl border border-sky-100 bg-white p-6 sm:p-10 shadow-card">
                    <div className="space-y-3">
                        <div className="flex flex-wrap items-center gap-2">
              <span className={`rounded-md border px-2.5 py-0.5 text-xs font-bold uppercase tracking-wider ${esferaBadges}`}>
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
                            <span>⏰ {service.schedule}</span>
                            <span>📞 {service.phone}</span>
                        </div>
                    </div>

                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 border-t lg:border-t-0 lg:border-l border-slate-100 pt-4 lg:pt-0 lg:pl-8">
                        <div className="text-center sm:text-left">
                            <div className="flex items-center gap-1.5">
                                <span className="text-3xl font-black text-amber-400">★</span>
                                <span className="text-3xl font-extrabold text-slate-900">
                  {service.averageRating.toFixed(1)}
                </span>
                                <span className="text-xs text-slate-400 font-semibold self-end pb-1">
                  / 5.0
                </span>
                            </div>
                            <p className="text-xs text-slate-500">{service.totalReviews} avaliações validadas</p>
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

            {/* Indicadores Multicritério (RF06 - Painel de Transparência) */}
            <section className="space-y-4">
                <h2 className="text-xl font-bold text-slate-900">
                    Desempenho por Eixo de Avaliação
                </h2>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                    <div className="rounded-2xl border border-sky-100 bg-white p-5 shadow-card">
                        <div className="flex items-center justify-between text-xs text-slate-500">
                            <span className="font-semibold uppercase tracking-wide">Atendimento Humano</span>
                            <span className="text-lg">👥</span>
                        </div>
                        <div className="mt-3 flex items-baseline gap-2">
              <span className="text-2xl font-black text-slate-900">
                {service.indicators.atendimento.toFixed(1)}
              </span>
                            <span className="text-xs text-slate-400">/ 5.0</span>
                        </div>
                        <div className="mt-2 h-2 w-full rounded-full bg-slate-100 overflow-hidden">
                            <div
                                className="h-full bg-sky-500 rounded-full"
                                style={{ width: `${(service.indicators.atendimento / 5) * 100}%` }}
                            />
                        </div>
                    </div>

                    <div className="rounded-2xl border border-sky-100 bg-white p-5 shadow-card">
                        <div className="flex items-center justify-between text-xs text-slate-500">
                            <span className="font-semibold uppercase tracking-wide">Tempo de Espera</span>
                            <span className="text-lg">⏱️</span>
                        </div>
                        <div className="mt-3 flex items-baseline gap-2">
              <span className="text-2xl font-black text-slate-900">
                {service.indicators.espera.toFixed(1)}
              </span>
                            <span className="text-xs text-slate-400">/ 5.0</span>
                        </div>
                        <div className="mt-2 h-2 w-full rounded-full bg-slate-100 overflow-hidden">
                            <div
                                className="h-full bg-amber-400 rounded-full"
                                style={{ width: `${(service.indicators.espera / 5) * 100}%` }}
                            />
                        </div>
                    </div>

                    <div className="rounded-2xl border border-sky-100 bg-white p-5 shadow-card">
                        <div className="flex items-center justify-between text-xs text-slate-500">
                            <span className="font-semibold uppercase tracking-wide">Infraestrutura</span>
                            <span className="text-lg">🏢</span>
                        </div>
                        <div className="mt-3 flex items-baseline gap-2">
              <span className="text-2xl font-black text-slate-900">
                {service.indicators.infraestrutura.toFixed(1)}
              </span>
                            <span className="text-xs text-slate-400">/ 5.0</span>
                        </div>
                        <div className="mt-2 h-2 w-full rounded-full bg-slate-100 overflow-hidden">
                            <div
                                className="h-full bg-emerald-500 rounded-full"
                                style={{ width: `${(service.indicators.infraestrutura / 5) * 100}%` }}
                            />
                        </div>
                    </div>
                </div>
            </section>

            {/* Mural Público de Manifestações e Respostas Oficiais (RF04, RF05, RF07) */}
            <section className="space-y-6">
                <div className="flex items-center justify-between border-b border-slate-200 pb-4">
                    <div>
                        <h2 className="text-xl font-bold text-slate-900">
                            Voz da População
                        </h2>
                        <p className="text-xs text-slate-500 mt-1">
                            Relatos cívicos submetidos por utentes e cidadãos de Palmas
                        </p>
                    </div>
                    <span className="rounded-full bg-sky-50 px-3 py-1 text-xs font-semibold text-sky-700">
            {service.reviews.length} relatos
          </span>
                </div>

                <div className="space-y-6">
                    {service.reviews.map((rev) => (
                        <article
                            key={rev.id}
                            className="rounded-3xl border border-sky-100 bg-white p-6 shadow-card space-y-4"
                        >
                            {/* Cabeçalho do Relato */}
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2">
                                <div className="flex items-center gap-3">
                  <span className="flex h-10 w-10 items-center justify-center rounded-full bg-sky-100 text-sm font-bold text-sky-800">
                    {rev.isAnonimo ? "CA" : rev.author.charAt(0)}
                  </span>
                                    <div>
                                        <h3 className="text-sm font-bold text-slate-900 leading-tight">
                                            {rev.author}
                                        </h3>
                                        <span className="text-xs text-slate-400">
                      {rev.date}
                    </span>
                                    </div>
                                </div>

                                <div className="flex items-center gap-4">
                                    <div className="flex items-center text-amber-400 text-lg">
                                        {"★".repeat(rev.notaGeral)}
                                        {"☆".repeat(5 - rev.notaGeral)}
                                    </div>
                                    {/* RF07: Moderação Comunitária */}
                                    <button
                                        type="button"
                                        title="Denunciar conteúdo impróprio"
                                        className="text-xs font-medium text-slate-400 hover:text-rose-500 transition flex items-center gap-1"
                                    >
                                        <span>🚩</span> <span className="hidden sm:inline">Denunciar</span>
                                    </button>
                                </div>
                            </div>

                            {/* Critérios do Relato (Desdobramento) */}
                            <div className="flex flex-wrap gap-2 text-xs">
                <span className="rounded-md bg-slate-50 border border-slate-200 px-2.5 py-1 text-slate-600 font-medium">
                  Atendimento: <strong className="text-slate-900">{rev.notas.atendimento}/5</strong>
                </span>
                                <span className="rounded-md bg-slate-50 border border-slate-200 px-2.5 py-1 text-slate-600 font-medium">
                  Espera: <strong className="text-slate-900">{rev.notas.espera}/5</strong>
                </span>
                                <span className="rounded-md bg-slate-50 border border-slate-200 px-2.5 py-1 text-slate-600 font-medium">
                  Estrutura: <strong className="text-slate-900">{rev.notas.infraestrutura}/5</strong>
                </span>
                            </div>

                            {/* Texto Opinativo */}
                            {rev.relato && (
                                <p className="text-sm text-slate-700 leading-relaxed">
                                    "{rev.relato}"
                                </p>
                            )}

                            {/* RF05: Bloco de Resposta Institucional Oficial (1:1) */}
                            {rev.response && (
                                <div className="mt-5 rounded-2xl border-l-4 border-l-sky-500 bg-sky-50 p-5 space-y-2">
                                    <div className="flex flex-col sm:flex-row sm:items-center justify-between text-xs text-slate-600 gap-2">
                    <span className="font-bold text-sky-900 flex items-center gap-1.5">
                      <span className="text-base">🏛️</span> {rev.response.author}
                    </span>
                                        <span className="text-slate-500 font-medium">
                      Respondido a {rev.response.date}
                    </span>
                                    </div>
                                    <span className="inline-block rounded bg-sky-100 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-sky-800">
                    {rev.response.role}
                  </span>
                                    <p className="text-sm text-slate-800 leading-relaxed mt-2">
                                        {rev.response.content}
                                    </p>
                                </div>
                            )}
                        </article>
                    ))}
                </div>
            </section>
        </main>
    );
}