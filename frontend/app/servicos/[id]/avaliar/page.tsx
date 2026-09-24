"use client";

import { use, useState, useId } from "react";
import Link from "next/link";

interface PageProps {
    params: Promise<{ id: string }>;
}

const CRITERIOS_FEEDPALMAS = [
    {
        id: "atendimento",
        label: "Atendimento Humano",
        descricao: "Cortesia, presteza e clareza das orientações dos servidores",
        icone: "👥",
    },
    {
        id: "espera",
        label: "Tempo de Espera",
        descricao: "Agilidade da triagem e tempo decorrido na fila",
        icone: "⏱️",
    },
    {
        id: "infraestrutura",
        label: "Infraestrutura e Acessibilidade",
        descricao: "Limpeza, climatização, assentos e condições do prédio",
        icone: "🏢",
    },
] as const;

type CriterioKey = (typeof CRITERIOS_FEEDPALMAS)[number]["id"];

export default function PaginaAvaliacaoFeedPalmas({ params }: PageProps) {
    const { id } = use(params);
    const formId = useId();

    const [notaGeral, setNotaGeral] = useState<number>(0);
    const [hoverGeral, setHoverGeral] = useState<number>(0);
    const [notas, setNotas] = useState<Record<CriterioKey, number>>({
        atendimento: 0,
        espera: 0,
        infraestrutura: 0,
    });
    const [relato, setRelato] = useState<string>("");
    const [isAnonimo, setIsAnonimo] = useState<boolean>(true);
    const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
    const [isSubmitted, setIsSubmitted] = useState<boolean>(false);
    const [erroValidacao, setErroValidacao] = useState<string | null>(null);

    const handleNotaCriterio = (criterio: CriterioKey, valor: number) => {
        setNotas((prev) => ({ ...prev, [criterio]: valor }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (notaGeral === 0) {
            setErroValidacao("Selecione a nota geral de 1 a 5 estrelas.");
            return;
        }

        if (notas.atendimento === 0 || notas.espera === 0 || notas.infraestrutura === 0) {
            setErroValidacao("Avalie os 3 critérios objetivos (atendimento, espera e infraestrutura).");
            return;
        }

        setErroValidacao(null);
        setIsSubmitting(true);

        try {
            const payload = {
                serviceId: id,
                notaGeral,
                notaAtendimento: notas.atendimento,
                notaEspera: notas.espera,
                notaInfraestrutura: notas.infraestrutura,
                relato: relato.trim() ? relato.trim() : null,
                isAnonimo,
            };

            const token = localStorage.getItem("token");
            if (!token) {
                setErroValidacao("Sessão expirada ou não iniciada. Por favor, faça login para avaliar.");
                setIsSubmitting(false);
                return;
            }


            const response = await fetch("http://localhost:3001/reviews", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify(payload),
            });

            if (!response.ok) {
                throw new Error("Falha ao gravar avaliação");
            }

            setIsSubmitted(true);
        } catch {
            setErroValidacao("Erro ao conectar ao servidor. Verifique se o backend está a correr na porta 3001.");
        } finally {
            setIsSubmitting(false);
        }
    };

    if (isSubmitted) {
        return (
            <main className="mx-auto max-w-xl px-4 py-20 text-center">
                <div className="rounded-3xl border border-border bg-surface p-10 shadow-elevated">
                    <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-leaf-light text-leaf text-3xl">
                        ✓
                    </div>
                    <span className="inline-block rounded-full bg-leaf-light px-3.5 py-1 text-xs font-bold uppercase tracking-wider text-leaf">
                        FeedPalmas • Manifestação Registrada
                    </span>
                    <h1 className="mt-4 text-3xl font-extrabold text-foreground">
                        Avaliação Enviada com Sucesso!
                    </h1>
                    <p className="mt-3 text-sm text-foreground-muted leading-relaxed">
                        Seu relato sobre a unidade <strong>{id}</strong> foi gravado no banco de dados e está disponível
                        para consulta pública.
                    </p>
                    <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
                        <Link
                            href="/"
                            className="inline-flex h-11 items-center justify-center rounded-xl bg-brand px-6 text-sm font-semibold text-brand-contrast hover:bg-brand-hover shadow-sm transition"
                        >
                            Voltar ao Início
                        </Link>
                        <Link
                            href={`/servicos/${id}`}
                            className="inline-flex h-11 items-center justify-center rounded-xl border border-border bg-surface px-6 text-sm font-semibold text-foreground hover:bg-surface-muted transition"
                        >
                            Ver Painel da Unidade
                        </Link>
                    </div>
                </div>
            </main>
        );
    }

    return (
        <main className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
            <div className="mb-8">
                <Link
                    href={`/servicos/${id}`}
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-brand hover:text-brand-hover transition mb-3"
                >
                    ← Voltar à unidade
                </Link>
                <div className="flex flex-wrap items-center gap-2">
                    <span className="rounded-full bg-brand-light px-3 py-0.5 text-xs font-bold text-brand">
                        Guia Cidadão: FeedPalmas
                    </span>
                    <span className="text-xs font-medium text-foreground-muted">• Unidade: {id}</span>
                </div>
                <h1 className="mt-2 text-3xl sm:text-4xl font-extrabold tracking-tight text-foreground">
                    Avaliação de Desempenho do Serviço
                </h1>
                <p className="mt-1 text-sm text-foreground-muted">
                    Controle social e participação cidadã nos órgãos públicos de Palmas (TO).
                </p>
            </div>

            {erroValidacao && (
                <div className="mb-6 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm font-medium text-red-800">
                    ⚠️ {erroValidacao}
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
                {/* Nota Geral */}
                <section className="rounded-3xl border border-border bg-surface p-6 sm:p-8 shadow-card">
                    <label className="block text-base font-bold text-foreground mb-1">
                        Nota Geral de Satisfação <span className="text-red-500">*</span>
                    </label>
                    <p className="text-xs text-foreground-muted mb-6">
                        Classifique a sua experiência global de 1 a 5 estrelas.
                    </p>

                    <div className="flex flex-wrap items-center gap-2.5">
                        {[1, 2, 3, 4, 5].map((star) => {
                            const active = (hoverGeral || notaGeral) >= star;
                            return (
                                <button
                                    type="button"
                                    key={star}
                                    onClick={() => setNotaGeral(star)}
                                    onMouseEnter={() => setHoverGeral(star)}
                                    onMouseLeave={() => setHoverGeral(0)}
                                    className={`flex h-14 w-14 items-center justify-center rounded-2xl border text-3xl transition-all duration-150 transform hover:scale-105 focus:outline-none ${
                                        active
                                            ? "bg-sun-light border-amber-300 text-amber-500 shadow-sm"
                                            : "bg-background border-border text-foreground-subtle hover:border-border-strong"
                                    }`}
                                    aria-label={`${star} estrelas`}
                                >
                                    ★
                                </button>
                            );
                        })}

                        <span className="ml-3 text-sm font-bold text-foreground">
                            {notaGeral === 5 && "⭐ Excelente"}
                            {notaGeral === 4 && "👍 Bom"}
                            {notaGeral === 3 && "😐 Regular"}
                            {notaGeral === 2 && "⚠️ Ruim"}
                            {notaGeral === 1 && "🚫 Péssimo"}
                        </span>
                    </div>
                </section>

                {/* Critérios Oficiais */}
                <section className="rounded-3xl border border-border bg-surface p-6 sm:p-8 shadow-card space-y-6">
                    <div>
                        <h2 className="text-base font-bold text-foreground">
                            Critérios Objetivos Obrigatórios
                        </h2>
                        <p className="text-xs text-foreground-muted">
                            Métricas quantitativas para o Painel de Transparência da cidade.
                        </p>
                    </div>

                    <div className="space-y-4">
                        {CRITERIOS_FEEDPALMAS.map((c) => (
                            <div
                                key={c.id}
                                className="rounded-2xl border border-border bg-surface-subtle p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                            >
                                <div>
                                    <div className="flex items-center gap-2">
                                        <span className="text-xl">{c.icone}</span>
                                        <span className="text-sm font-bold text-foreground">{c.label}</span>
                                    </div>
                                    <p className="mt-0.5 text-xs text-foreground-muted">{c.descricao}</p>
                                </div>

                                <div className="flex items-center gap-1.5 w-full sm:w-56">
                                    {[1, 2, 3, 4, 5].map((lvl) => {
                                        const isSelected = notas[c.id] === lvl;
                                        return (
                                            <button
                                                type="button"
                                                key={lvl}
                                                onClick={() => handleNotaCriterio(c.id, lvl)}
                                                className={`h-9 flex-1 rounded-xl text-xs font-bold border transition ${
                                                    isSelected
                                                        ? "bg-brand text-brand-contrast border-brand shadow-sm"
                                                        : "bg-surface border-border text-foreground-muted hover:border-brand"
                                                }`}
                                            >
                                                {lvl}
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>
                        ))}
                    </div>
                </section>

                {/* Relato Textual */}
                <section className="rounded-3xl border border-border bg-surface p-6 sm:p-8 shadow-card space-y-4">
                    <div>
                        <label htmlFor={`${formId}-relato`} className="block text-base font-bold text-foreground">
                            Relato Opinativo (Opcional)
                        </label>
                        <p className="text-xs text-foreground-muted">
                            Conte detalhes do atendimento recebido. Comentários estão sujeitos a moderação comunitária.
                        </p>
                    </div>

                    <textarea
                        id={`${formId}-relato`}
                        rows={4}
                        value={relato}
                        onChange={(e) => setRelato(e.target.value)}
                        placeholder="Exemplo: Cheguei às 08h na unidade. A triagem foi ágil, porém a sala de espera estava sem assentos suficientes..."
                        className="w-full rounded-2xl border border-border bg-background p-4 text-sm text-foreground placeholder:text-foreground-muted focus:border-brand focus:bg-surface focus:outline-none focus:ring-2 focus:ring-brand/20 transition"
                    />

                    <div className="pt-2 border-t border-border">
                        <label className="flex items-center gap-3 cursor-pointer">
                            <input
                                type="checkbox"
                                checked={isAnonimo}
                                onChange={(e) => setIsAnonimo(e.target.checked)}
                                className="h-4 w-4 rounded border-border text-brand focus:ring-brand"
                            />
                            <span className="text-xs text-foreground-muted">
                                <strong>Preservar privacidade:</strong> Exibir meu nome publicamente como <em>"Cidadão Anônimo"</em> (em conformidade com a LGPD).
                            </span>
                        </label>
                    </div>
                </section>

                <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full h-14 rounded-2xl bg-brand text-brand-contrast font-bold text-base shadow-elevated hover:bg-brand-hover active:scale-[0.99] disabled:opacity-50 transition"
                >
                    {isSubmitting ? "A enviar ao FeedPalmas..." : "Publicar Avaliação"}
                </button>
            </form>
        </main>
    );
}