import Link from "next/link";

interface ServiceItem {
    id: string;
    name: string;
    category: string;
    department: string;
    location: string;
    rating: number;
    totalReviews: number;
    statusBadge: "Excelente" | "Atenção" | "Regular";
}

const METRICAS_CIDADE = [
    { label: "Serviços Monitorados", valor: "142", sub: "em 32 bairros" },
    { label: "Feedbacks Enviados", valor: "12.840", sub: "este mês" },
    { label: "Índice de Resolutividade", valor: "78.4%", sub: "respostas em < 7 dias" },
    { label: "Média Geral Municipal", valor: "3.9 / 5.0", sub: "índice de satisfação" },
];

const CATEGORIAS = [
    { id: "saude", name: "Saúde Pública", icon: "🏥", count: 38 },
    { id: "transporte", name: "Transporte e Vias", icon: "🚌", count: 24 },
    { id: "educacao", name: "Educação Básica", icon: "🏫", count: 42 },
    { id: "zeladoria", name: "Zeladoria e Coleta", icon: "🧹", count: 19 },
    { id: "seguranca", name: "Segurança e Trânsito", icon: "🛡️", count: 11 },
    { id: "assistencia", name: "Assistência Social", icon: "🤝", count: 8 },
];

const SERVICOS_DESTAQUE: ServiceItem[] = [
    {
        id: "ubs-regiao-norte",
        name: "Unidade de Saúde da Família (USF) Norte",
        category: "Saúde",
        department: "Secretaria de Saúde",
        location: "Setor Norte",
        rating: 4.4,
        totalReviews: 312,
        statusBadge: "Excelente",
    },
    {
        id: "upa-central",
        name: "UPA 24h - Unidade de Pronto Atendimento",
        category: "Saúde",
        department: "Secretaria de Saúde",
        location: "Centro",
        rating: 2.7,
        totalReviews: 840,
        statusBadge: "Atenção",
    },
    {
        id: "coleta-urbana",
        name: "Coleta Domiciliar e Limpeza Pública",
        category: "Zeladoria",
        department: "Secretaria de Infraestrutura",
        location: "Todos os Bairros",
        rating: 3.8,
        totalReviews: 420,
        statusBadge: "Regular",
    },
];

const RECENT_FEEDBACKS = [
    {
        author: "Cidadão Anônimo",
        service: "USF Norte",
        rating: 5,
        date: "Há 2 horas",
        comment: "Médico atencioso e medicação entregue no ato. A sala de espera estava limpa e com ar condicionado funcionando perfeitamente.",
    },
    {
        author: "Maria S.",
        service: "UPA 24h",
        rating: 2,
        date: "Há 4 horas",
        comment: "Tempo de espera superior a 3 horas na triagem de classificação amarela. Poucos médicos atendendo na ala pediátrica.",
    },
];

export default function Home() {
    return (
        <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8 space-y-16">
            {/* 1. Hero com Campo de Busca e Chamada Cívica */}
            <section className="relative overflow-hidden rounded-3xl bg-surface border border-border p-8 sm:p-14 shadow-card text-center flex flex-col items-center">
                <div className="inline-flex items-center gap-2 rounded-full bg-brand-light px-3.5 py-1 text-xs font-semibold text-brand mb-6">
                    <span className="h-2 w-2 rounded-full bg-brand animate-pulse" />
                    Painel Cidadão 2026 em Tempo Real
                </div>

                <h1 className="max-w-3xl text-3xl font-black tracking-tight sm:text-5xl text-foreground">
                    O seu olhar transforma os serviços públicos da cidade
                </h1>

                <p className="mt-4 max-w-2xl text-base sm:text-lg text-foreground-muted">
                    Avalie atendimento, tempo de espera e infraestrutura de postos de saúde, ônibus e escolas. Suas notas orientam a população e geram relatórios para a ouvidoria.
                </p>

                {/* Barra de Pesquisa Rápida */}
                <div className="mt-8 flex w-full max-w-2xl flex-col sm:flex-row gap-2.5">
                    <div className="relative flex-1">
                        <input
                            type="text"
                            placeholder="Digite o nome da UBS, escola, linha de ônibus ou bairro..."
                            className="w-full h-12 rounded-xl border border-border bg-background px-4 text-sm text-foreground placeholder:text-foreground-muted focus:outline-none focus:ring-2 focus:ring-brand shadow-sm transition"
                        />
                    </div>
                    <button
                        type="button"
                        className="h-12 rounded-xl bg-brand px-6 text-sm font-semibold text-brand-contrast hover:bg-brand-hover active:bg-brand-pressed shadow-sm transition"
                    >
                        Buscar Serviço
                    </button>
                </div>

                {/* Atalhos Rápidos */}
                <div className="mt-4 flex flex-wrap items-center justify-center gap-2 text-xs text-foreground-muted">
                    <span>Mais buscados:</span>
                    {["UPA 24h", "UBS Central", "Linha 010", "Zeladoria e Lixo"].map((tag) => (
                        <button
                            key={tag}
                            type="button"
                            className="rounded-md border border-border bg-surface-muted px-2 py-0.5 font-medium hover:border-brand transition"
                        >
                            {tag}
                        </button>
                    ))}
                </div>
            </section>

            {/* 2. Indicadores da Cidade (Cards de Estatísticas) */}
            <section className="grid grid-cols-2 gap-4 lg:grid-cols-4">
                {METRICAS_CIDADE.map((m) => (
                    <div
                        key={m.label}
                        className="rounded-2xl border border-border bg-surface p-5 shadow-card flex flex-col justify-between"
                    >
            <span className="text-xs font-semibold text-foreground-muted uppercase tracking-wider">
              {m.label}
            </span>
                        <div className="mt-3">
              <span className="text-2xl sm:text-3xl font-extrabold text-foreground tracking-tight">
                {m.valor}
              </span>
                            <p className="mt-0.5 text-xs text-foreground-muted">{m.sub}</p>
                        </div>
                    </div>
                ))}
            </section>

            {/* 3. Categorias de Serviços */}
            <section className="space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="text-2xl font-bold tracking-tight">Categorias de Serviços</h2>
                        <p className="text-sm text-foreground-muted">
                            Navegue pelos órgãos e secretarias de atendimento municipal
                        </p>
                    </div>
                    <Link href="/categorias" className="text-xs font-semibold text-brand hover:underline">
                        Todas as Categorias →
                    </Link>
                </div>

                <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
                    {CATEGORIAS.map((cat) => (
                        <Link
                            key={cat.id}
                            href={`/servicos?categoria=${cat.id}`}
                            className="group rounded-2xl border border-border bg-surface p-4 shadow-card hover:shadow-hover hover:border-brand/40 transition flex flex-col items-center text-center gap-2"
                        >
              <span className="text-3xl group-hover:scale-110 transition-transform">
                {cat.icon}
              </span>
                            <span className="text-sm font-semibold text-foreground">{cat.name}</span>
                            <span className="text-[11px] text-foreground-muted">
                {cat.count} unidades
              </span>
                        </Link>
                    ))}
                </div>
            </section>

            {/* 4. Serviços em Destaque & Ranking */}
            <section className="space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="text-2xl font-bold tracking-tight">Serviços em Foco</h2>
                        <p className="text-sm text-foreground-muted">
                            Postos com grande volume de movimentação e avaliações recentes
                        </p>
                    </div>
                    <Link href="/servicos" className="text-xs font-semibold text-brand hover:underline">
                        Ver Catálogo Geral →
                    </Link>
                </div>

                <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
                    {SERVICOS_DESTAQUE.map((servico) => {
                        const badgeColors = {
                            Excelente: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20",
                            Regular: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20",
                            Atenção: "bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20",
                        }[servico.statusBadge];

                        return (
                            <div
                                key={servico.id}
                                className="flex flex-col justify-between rounded-2xl border border-border bg-surface p-6 shadow-card hover:shadow-hover transition"
                            >
                                <div>
                                    <div className="flex items-center justify-between gap-2">
                    <span className="text-[11px] font-semibold uppercase tracking-wider text-foreground-muted">
                      {servico.category} • {servico.location}
                    </span>
                                        <span
                                            className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-semibold ${badgeColors}`}
                                        >
                      {servico.statusBadge}
                    </span>
                                    </div>

                                    <h3 className="mt-2 text-lg font-bold text-foreground leading-snug">
                                        {servico.name}
                                    </h3>
                                    <p className="mt-1 text-xs text-foreground-muted">{servico.department}</p>
                                </div>

                                <div className="mt-6 flex items-center justify-between border-t border-border pt-4">
                                    <div className="flex items-baseline gap-1">
                                        <span className="text-xl font-black text-amber-500">★</span>
                                        <span className="text-base font-extrabold text-foreground">
                      {servico.rating.toFixed(1)}
                    </span>
                                        <span className="text-xs text-foreground-muted">
                      ({servico.totalReviews})
                    </span>
                                    </div>

                                    <Link
                                        href={`/servicos/${servico.id}/avaliar`}
                                        className="inline-flex h-8 items-center justify-center rounded-lg bg-brand px-3 text-xs font-semibold text-brand-contrast hover:bg-brand-hover transition"
                                    >
                                        Avaliar
                                    </Link>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </section>

            {/* 5. Feed Cívico de Relatos Recentes */}
            <section className="rounded-3xl border border-border bg-surface p-6 sm:p-8 shadow-card space-y-6">
                <div>
                    <h2 className="text-xl font-bold tracking-tight">Voz do Cidadão (Últimos Relatos)</h2>
                    <p className="text-xs text-foreground-muted">
                        Transparência colaborativa auditada pela comunidade
                    </p>
                </div>

                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    {RECENT_FEEDBACKS.map((fb, idx) => (
                        <div
                            key={idx}
                            className="rounded-xl border border-border bg-background p-4 flex flex-col justify-between gap-3"
                        >
                            <div className="flex items-center justify-between text-xs text-foreground-muted">
                                <span className="font-semibold text-foreground">{fb.author}</span>
                                <span>{fb.date}</span>
                            </div>
                            <p className="text-sm text-foreground/90 italic leading-relaxed">
                                "{fb.comment}"
                            </p>
                            <div className="flex items-center justify-between text-xs pt-2 border-t border-border/50">
                                <span className="font-medium text-brand">{fb.service}</span>
                                <span className="font-bold text-amber-500">{"★".repeat(fb.rating)}</span>
                            </div>
                        </div>
                    ))}
                </div>
            </section>
        </main>
    );
}