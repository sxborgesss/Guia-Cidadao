"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

interface PublicService {
  id: string;
  nome: string;
  categoria: string;
  endereco: string;
  mediaNota: number;
  totalAvaliacoes: number;
}

const CATEGORIAS_INFO: Record<string, { name: string; icon: string }> = {
  saude: { name: "Saúde Pública", icon: "🏥" },
  educacao: { name: "Educação Básica", icon: "🏫" },
  transporte: { name: "Transporte e Vias", icon: "🚌" },
  zeladoria: { name: "Zeladoria e Limpeza", icon: "🧹" },
};

export default function Home() {
  const [servicos, setServicos] = useState<PublicService[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [termoBusca, setTermoBusca] = useState("");

  useEffect(() => {
    async function carregar() {
      try {
        const res = await fetch("http://localhost:3001/services");
        if (res.ok) {
          const dados = await res.json();
          setServicos(dados);
        }
      } catch (err) {
        console.error("Erro ao procurar serviços:", err);
      } finally {
        setCarregando(false);
      }
    }
    carregar();
  }, []);

  const totalMonitorados = servicos.length;
  const totalAvaliacoes = servicos.reduce((acc, s) => acc + (Number(s.totalAvaliacoes) || 0), 0);
  const mediaGeral =
    totalMonitorados > 0
      ? (
          servicos.reduce((acc, s) => acc + Number(s.mediaNota || 5), 0) /
          totalMonitorados
        ).toFixed(1)
      : "5.0";

  const servicosFiltrados = servicos.filter(
    (s) =>
      s.nome.toLowerCase().includes(termoBusca.toLowerCase()) ||
      s.endereco.toLowerCase().includes(termoBusca.toLowerCase()) ||
      s.categoria.toLowerCase().includes(termoBusca.toLowerCase())
  );

  const obterBadgeStatus = (nota: number) => {
    if (nota >= 4.0) return { rotulo: "Excelente", classe: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20" };
    if (nota >= 3.0) return { rotulo: "Regular", classe: "bg-amber-500/10 text-amber-600 border-amber-500/20" };
    return { rotulo: "Atenção", classe: "bg-rose-500/10 text-rose-600 border-rose-500/20" };
  };

  return (
    <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8 space-y-16">
      {/* 1. Hero com Barra de Pesquisa */}
      <section className="relative overflow-hidden rounded-3xl bg-surface border border-border p-8 sm:p-14 shadow-card text-center flex flex-col items-center">
        <div className="inline-flex items-center gap-2 rounded-full bg-brand-light px-3.5 py-1 text-xs font-semibold text-brand mb-6">
          <span className="h-2 w-2 rounded-full bg-brand animate-pulse" />
          Painel Cidadão 2026 em Tempo Real
        </div>

        <h1 className="max-w-3xl text-3xl font-black tracking-tight sm:text-5xl text-foreground">
          O seu olhar transforma os serviços públicos da cidade
        </h1>

        <p className="mt-4 max-w-2xl text-base sm:text-lg text-foreground-muted">
          Avalie infraestrutura, atendimento e qualidade de postos e equipamentos municipais. Seus dados orientam a gestão e a comunidade.
        </p>

        <div className="mt-8 flex w-full max-w-2xl flex-col sm:flex-row gap-2.5">
          <input
            type="text"
            value={termoBusca}
            onChange={(e) => setTermoBusca(e.target.value)}
            placeholder="Procure por nome do posto, endereço ou categoria..."
            className="w-full h-12 rounded-xl border border-border bg-background px-4 text-sm text-foreground placeholder:text-foreground-muted focus:outline-none focus:ring-2 focus:ring-brand shadow-sm transition"
          />
        </div>
      </section>

      {/* 2. Indicadores da Cidade Conectados ao Banco */}
      <section className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <div className="rounded-2xl border border-border bg-surface p-5 shadow-card flex flex-col justify-between">
          <span className="text-xs font-semibold text-foreground-muted uppercase tracking-wider">Serviços Cadastrados</span>
          <div className="mt-3">
            <span className="text-2xl sm:text-3xl font-extrabold text-foreground tracking-tight">{totalMonitorados}</span>
            <p className="mt-0.5 text-xs text-foreground-muted">Postos ativos no sistema</p>
          </div>
        </div>

        <div className="rounded-2xl border border-border bg-surface p-5 shadow-card flex flex-col justify-between">
          <span className="text-xs font-semibold text-foreground-muted uppercase tracking-wider">Total de Feedbacks</span>
          <div className="mt-3">
            <span className="text-2xl sm:text-3xl font-extrabold text-foreground tracking-tight">{totalAvaliacoes}</span>
            <p className="mt-0.5 text-xs text-foreground-muted">Avaliações registadas</p>
          </div>
        </div>

        <div className="rounded-2xl border border-border bg-surface p-5 shadow-card flex flex-col justify-between">
          <span className="text-xs font-semibold text-foreground-muted uppercase tracking-wider">Média Geral</span>
          <div className="mt-3">
            <span className="text-2xl sm:text-3xl font-extrabold text-foreground tracking-tight">{mediaGeral} / 5.0</span>
            <p className="mt-0.5 text-xs text-foreground-muted">Índice global de satisfação</p>
          </div>
        </div>

        <div className="rounded-2xl border border-border bg-surface p-5 shadow-card flex flex-col justify-between">
          <span className="text-xs font-semibold text-foreground-muted uppercase tracking-wider">Sincronização</span>
          <div className="mt-3">
            <span className="text-2xl sm:text-3xl font-extrabold text-emerald-600 tracking-tight">PostgreSQL</span>
            <p className="mt-0.5 text-xs text-foreground-muted">Base de dados em linha</p>
          </div>
        </div>
      </section>

      {/* 3. Catálogo de Equipamentos Públicos Reais */}
      <section className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">Equipamentos Públicos</h2>
            <p className="text-sm text-foreground-muted">
              Unidades oficiais de atendimento catalogadas
            </p>
          </div>
        </div>

        {carregando ? (
          <p className="text-sm text-foreground-muted">A carregar serviços públicos...</p>
        ) : servicosFiltrados.length === 0 ? (
          <div className="rounded-2xl border border-border bg-surface p-8 text-center text-foreground-muted">
            Nenhum equipamento público encontrado. Cadastre novas unidades através do Painel Administrativo.
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            {servicosFiltrados.map((servico) => {
              const badge = obterBadgeStatus(Number(servico.mediaNota));
              const categoriaFormatada = CATEGORIAS_INFO[servico.categoria]?.name || servico.categoria;

              return (
                <div
                  key={servico.id}
                  className="flex flex-col justify-between rounded-2xl border border-border bg-surface p-6 shadow-card hover:shadow-hover transition"
                >
                  <div>
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-[11px] font-semibold uppercase tracking-wider text-foreground-muted">
                        {categoriaFormatada}
                      </span>
                      <span className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-semibold ${badge.classe}`}>
                        {badge.rotulo}
                      </span>
                    </div>

                    <h3 className="mt-2 text-lg font-bold text-foreground leading-snug">
                      {servico.nome}
                    </h3>
                    <p className="mt-1 text-xs text-foreground-muted">{servico.endereco}</p>
                  </div>

                  <div className="mt-6 flex items-center justify-between border-t border-border pt-4">
                    <div className="flex items-baseline gap-1">
                      <span className="text-xl font-black text-amber-500">★</span>
                      <span className="text-base font-extrabold text-foreground">
                        {Number(servico.mediaNota).toFixed(1)}
                      </span>
                      <span className="text-xs text-foreground-muted">
                        ({servico.totalAvaliacoes})
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
        )}
      </section>
    </main>
  );
}