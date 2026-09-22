"use client";

import { use, useState, useId } from "react";
import Link from "next/link";

interface PageProps {
    params: Promise<{ id: string }>;
}

interface CriterioAvaliacao {
    id: string;
    label: string;
    descricao: string;
    icone: string;
}

const CRITERIOS: CriterioAvaliacao[] = [
    {
        id: "atendimento",
        label: "Atendimento e Cortesia",
        descricao: "Postura e atenção dos profissionais",
        icone: "👥",
    },
    {
        id: "espera",
        label: "Tempo de Espera",
        descricao: "Agilidade da triagem e fila de atendimento",
        icone: "⏱️",
    },
    {
        id: "estrutura",
        label: "Estrutura e Higiene",
        descricao: "Limpeza, conforto e acessibilidade do local",
        icone: "🏢",
    },
    {
        id: "resolucao",
        label: "Resolução do Problema",
        descricao: "Eficácia na entrega do serviço ou encaminhamento",
        icone: "🎯",
    },
];

const TAGS_DISPONIVEIS = [
    { id: "atendimento_rapido", label: "Atendimento Rápido", positivo: true },
    { id: "equipe_prestativa", label: "Equipe Atenciosa", positivo: true },
    { id: "ambiente_limpo", label: "Ambiente Limpo", positivo: true },
    { id: "boa_acessibilidade", label: "Boa Acessibilidade", positivo: true },
    { id: "demora_excessiva", label: "Fila Excessiva", positivo: false },
    { id: "falta_medicamentos", label: "Falta de Medicamentos/Insumos", positivo: false },
    { id: "ar_condicionado_inoperante", label: "Sem Climatização", positivo: false },
    { id: "pouca_informacao", label: "Informações Insuficientes", positivo: false },
];

export default function PaginaAvaliacao({ params }: PageProps) {
    const { id } = use(params);
    const formId = useId();

    const [notaGeral, setNotaGeral] = useState<number>(0);
    const [hoverGeral, setHoverGeral] = useState<number>(0);
    const [notasCriterios, setNotasCriterios] = useState<Record<string, number>>({
        atendimento: 0,
        espera: 0,
        estrutura: 0,
        resolucao: 0,
    });
    const [tagsSelecionadas, setTagsSelecionadas] = useState<string[]>([]);
    const [relato, setRelato] = useState<string>("");
    const [dataAtendimento, setDataAtendimento] = useState<string>("");
    const [isAnonimo, setIsAnonimo] = useState<boolean>(true);
    const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
    const [isSubmitted, setIsSubmitted] = useState<boolean>(false);
    const [erroValidacao, setErroValidacao] = useState<string | null>(null);

    const toggleTag = (tagId: string) => {
        setTagsSelecionadas((prev) =>
            prev.includes(tagId) ? prev.filter((item) => item !== tagId) : [...prev, tagId]
        );
    };

    const setCriterioNota = (criterioId: string, nota: number) => {
        setNotasCriterios((prev) => ({ ...prev, [criterioId]: nota }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (notaGeral === 0) {
            setErroValidacao("Por favor, selecione uma nota geral de 1 a 5 estrelas.");
            return;
        }

        setErroValidacao(null);
        setIsSubmitting(true);

        try {
            await new Promise((resolve) => setTimeout(resolve, 600));
            setIsSubmitted(true);
        } catch {
            setErroValidacao("Ocorreu um erro ao enviar sua avaliação. Tente novamente.");
        } finally {
            setIsSubmitting(false);
        }
    };

    if (isSubmitted) {
        return (
            <main className="mx-auto max-w-xl px-4 py-20 text-center">
                <div className="rounded-3xl border border-border bg-surface p-10 shadow-elevated">
                    <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600 text-3xl dark:bg-emerald-950/50">
                        ✓
                    </div>
                    <span className="inline-block rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300">
            Avaliação Registrada
          </span>
                    <h1 className="mt-4 text-2xl sm:text-3xl font-bold text-foreground">
                        Obrigado pelo seu relato!
                    </h1>
                    <p className="mt-3 text-sm text-foreground-muted leading-relaxed">
                        Seu feedback sobre o serviço <strong>{id}</strong> foi catalogado com sucesso.
                        Os dados consolidados ajudam a comunidade e orientam melhorias públicas.
                    </p>
                    <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
                        <Link
                            href="/"
                            className="inline-flex h-11 items-center justify-center rounded-xl bg-brand px-6 text-sm font-semibold text-brand-contrast hover:bg-brand-hover transition shadow-sm"
                        >
                            Voltar ao Início
                        </Link>
                        <Link
                            href={`/servicos/${id}`}
                            className="inline-flex h-11 items-center justify-center rounded-xl border border-border bg-surface px-6 text-sm font-semibold text-foreground hover:bg-surface-subtle transition"
                        >
                            Ver Página da Unidade
                        </Link>
                    </div>
                </div>
            </main>
        );
    }

    return (
        <main className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
            {/* Navegação Superior */}
            <div className="mb-8">
                <Link
                    href={`/servicos/${id}`}
                    className="inline-flex items-center gap-1.5 text-xs font-medium text-foreground-muted hover:text-foreground transition mb-3"
                >
                    ← Voltar à página do serviço
                </Link>
                <div className="flex flex-wrap items-center gap-2">
          <span className="rounded-md bg-sky-50 px-2.5 py-0.5 text-xs font-semibold text-sky-700 border border-sky-200/60 dark:bg-sky-950/50 dark:text-sky-300 dark:border-sky-800">
            Serviço Público
          </span>
                    <span className="text-xs text-foreground-subtle">• Identificador: {id}</span>
                </div>
                <h1 className="mt-2 text-3xl font-extrabold tracking-tight text-foreground">
                    Avaliar Atendimento e Estrutura
                </h1>
                <p className="mt-1 text-sm text-foreground-muted">
                    Compartilhe sua experiência para fortalecer o controle social e a qualidade dos postos da cidade.
                </p>
            </div>

            {erroValidacao && (
                <div className="mb-6 rounded-2xl border border-rose-200 bg-rose-50/80 p-4 text-sm font-medium text-rose-800 dark:bg-rose-950/30 dark:border-rose-900/50 dark:text-rose-300">
                    ⚠️ {erroValidacao}
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
                {/* Seção 1: Nota Geral */}
                <section className="rounded-3xl border border-border bg-surface p-6 sm:p-8 shadow-card">
                    <label className="block text-base font-bold text-foreground mb-1">
                        Qual sua nota geral de satisfação? <span className="text-rose-500">*</span>
                    </label>
                    <p className="text-xs text-foreground-muted mb-6">
                        Escolha de 1 (muito insatisfeito) a 5 (totalmente satisfeito).
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
                                    className={`flex h-13 w-13 items-center justify-center rounded-2xl border text-2xl transition-all duration-150 focus:outline-none ${
                                        active
                                            ? "bg-amber-50/90 border-amber-300 text-amber-500 dark:bg-amber-950/40 dark:border-amber-700"
                                            : "bg-surface border-border text-foreground-subtle hover:border-slate-300"
                                    }`}
                                    aria-label={`${star} de 5 estrelas`}
                                >
                                    ★
                                </button>
                            );
                        })}

                        <span className="ml-3 text-sm font-semibold text-foreground-muted">
              {notaGeral === 5 && "⭐ Excelente experiência"}
                            {notaGeral === 4 && "👍 Bom atendimento"}
                            {notaGeral === 3 && "😐 Regular"}
                            {notaGeral === 2 && "⚠️ Abaixo do esperado"}
                            {notaGeral === 1 && "🚫 Péssimo"}
            </span>
                    </div>
                </section>

                {/* Seção 2: Critérios Específicos */}
                <section className="rounded-3xl border border-border bg-surface p-6 sm:p-8 shadow-card space-y-6">
                    <div>
                        <h2 className="text-base font-bold text-foreground">
                            Avaliação por Critérios
                        </h2>
                        <p className="text-xs text-foreground-muted">
                            Dê uma nota específica para cada aspecto observado na unidade.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                        {CRITERIOS.map((c) => (
                            <div
                                key={c.id}
                                className="rounded-2xl border border-border-subtle bg-surface-subtle/50 p-4 flex flex-col justify-between gap-3"
                            >
                                <div>
                                    <div className="flex items-center gap-2">
                                        <span className="text-lg">{c.icone}</span>
                                        <span className="text-xs font-semibold text-foreground">{c.label}</span>
                                    </div>
                                    <p className="mt-1 text-[11px] text-foreground-muted">{c.descricao}</p>
                                </div>

                                <div className="flex items-center gap-1.5">
                                    {[1, 2, 3, 4, 5].map((lvl) => {
                                        const isSelected = notasCriterios[c.id] === lvl;
                                        return (
                                            <button
                                                type="button"
                                                key={lvl}
                                                onClick={() => setCriterioNota(c.id, lvl)}
                                                className={`h-8 flex-1 rounded-lg text-xs font-bold border transition ${
                                                    isSelected
                                                        ? "bg-brand text-brand-contrast border-brand shadow-sm"
                                                        : "bg-surface border-border text-foreground-muted hover:border-border-strong"
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

                {/* Seção 3: Tags de Diagnóstico */}
                <section className="rounded-3xl border border-border bg-surface p-6 sm:p-8 shadow-card space-y-4">
                    <div>
                        <h2 className="text-base font-bold text-foreground">
                            Destaques e Ocorrências
                        </h2>
                        <p className="text-xs text-foreground-muted">
                            Marque as opções que resumem o que você vivenciou.
                        </p>
                    </div>

                    <div className="flex flex-wrap gap-2">
                        {TAGS_DISPONIVEIS.map((tag) => {
                            const selecionada = tagsSelecionadas.includes(tag.id);

                            let estilos = "bg-surface-subtle text-foreground-muted border-border hover:border-border-strong";

                            if (selecionada && tag.positivo) {
                                estilos = "bg-emerald-50 text-emerald-800 border-emerald-300 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-700 shadow-sm";
                            } else if (selecionada && !tag.positivo) {
                                estilos = "bg-rose-50 text-rose-800 border-rose-300 dark:bg-rose-950/60 dark:text-rose-300 dark:border-rose-700 shadow-sm";
                            }

                            return (
                                <button
                                    type="button"
                                    key={tag.id}
                                    onClick={() => toggleTag(tag.id)}
                                    className={`rounded-full border px-3.5 py-1.5 text-xs font-medium transition ${estilos}`}
                                >
                                    {tag.positivo ? "+ " : "- "}
                                    {tag.label}
                                </button>
                            );
                        })}
                    </div>
                </section>

                {/* Seção 4: Relato Descritivo */}
                <section className="rounded-3xl border border-border bg-surface p-6 sm:p-8 shadow-card space-y-4">
                    <div>
                        <label htmlFor={`${formId}-relato`} className="block text-base font-bold text-foreground">
                            Relato da Experiência (Opcional)
                        </label>
                        <p className="text-xs text-foreground-muted">
                            Compartilhe observações com detalhes respeitosos e claros.
                        </p>
                    </div>

                    <textarea
                        id={`${formId}-relato`}
                        rows={4}
                        value={relato}
                        onChange={(e) => setRelato(e.target.value)}
                        placeholder="Exemplo: Atendimento na triagem foi rápido e a equipe foi prestativa, mas havia poucos assentos na sala de espera..."
                        className="w-full rounded-2xl border border-border bg-surface p-4 text-sm text-foreground placeholder:text-foreground-subtle focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand transition"
                    />

                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 pt-2">
                        <div>
                            <label
                                htmlFor={`${formId}-data`}
                                className="block text-xs font-semibold text-foreground-muted mb-1"
                            >
                                Data do Atendimento
                            </label>
                            <input
                                type="date"
                                id={`${formId}-data`}
                                value={dataAtendimento}
                                onChange={(e) => setDataAtendimento(e.target.value)}
                                className="w-full rounded-xl border border-border bg-surface px-3 py-2 text-xs text-foreground focus:border-brand focus:outline-none"
                            />
                        </div>

                        <div className="flex items-center sm:pt-4">
                            <label className="flex items-center gap-3 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={isAnonimo}
                                    onChange={(e) => setIsAnonimo(e.target.checked)}
                                    className="h-4 w-4 rounded border-border text-brand focus:ring-brand"
                                />
                                <span className="text-xs text-foreground-muted">
                  Publicar como <strong>Cidadão Anônimo</strong> (protege sua privacidade)
                </span>
                            </label>
                        </div>
                    </div>
                </section>

                {/* Botão de Envio Sem Gradiente Agressivo */}
                <div className="pt-2">
                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full h-12 rounded-xl bg-brand text-brand-contrast font-semibold text-sm shadow-sm hover:bg-brand-hover active:scale-[0.99] disabled:opacity-50 transition"
                    >
                        {isSubmitting ? "Registrando avaliação..." : "Enviar Avaliação"}
                    </button>
                    <p className="mt-3 text-center text-xs text-foreground-subtle">
                        Seu relato será compilado no painel público para acompanhamento comunitário.
                    </p>
                </div>
            </form>
        </main>
    );
}