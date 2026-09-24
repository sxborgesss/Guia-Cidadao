"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";

interface PublicService {
  id: string;
  nome: string;
  categoria: string;
  endereco: string;
  mediaNota: number;
  totalAvaliacoes: number;
}

interface ReviewItem {
  id: string;
  nota: number;
  comentario: string;
  created_at: string;
  user?: {
    nome: string;
  };
}

export default function AvaliarPage() {
  const routeParams = useParams();
  const rawId = routeParams?.id;
  const serviceId = Array.isArray(rawId) ? rawId[0] : (rawId as string);
  const router = useRouter();

  const [servico, setServico] = useState<PublicService | null>(null);
  const [reviews, setReviews] = useState<ReviewItem[]>([]);
  const [carregando, setCarregando] = useState(true);

  // Estados do formulário
  const [nota, setNota] = useState(5);
  const [comentario, setComentario] = useState("");
  const [enviando, setEnviando] = useState(false);

  const carregarDados = async () => {
    if (!serviceId) return;
    try {
      // 1. Obter serviços para encontrar o posto atual
      const resServicos = await fetch("http://localhost:3001/services");
      if (resServicos.ok) {
        const lista: PublicService[] = await resServicos.json();
        const encontrado = lista.find((s) => s.id === serviceId);
        if (encontrado) setServico(encontrado);
      }

      // 2. Obter avaliações do posto
      const resReviews = await fetch(`http://localhost:3001/reviews/service/${serviceId}`);
      if (resReviews.ok) {
        const dadosReviews = await resReviews.json();
        setReviews(dadosReviews);
      }
    } catch (err) {
      console.error("Erro ao carregar dados:", err);
    } finally {
      setCarregando(false);
    }
  };

  useEffect(() => {
    carregarDados();
  }, [serviceId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!serviceId) {
      alert("Identificador do posto inválido.");
      return;
    }

    const rawUser = localStorage.getItem("user");
    if (!rawUser) {
      alert("É necessário ter sessão iniciada para submeter uma avaliação.");
      router.push("/login");
      return;
    }

    if (!comentario.trim()) {
      alert("Por favor, escreva um comentário sobre o atendimento.");
      return;
    }

    const userData = JSON.parse(rawUser);

    setEnviando(true);
    try {
      const res = await fetch("http://localhost:3001/reviews", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          service_id: serviceId,
          user_id: userData.id,
          nota: Number(nota),
          comentario,
        }),
      });

      if (!res.ok) {
        const erroJson = await res.json().catch(() => null);
        throw new Error(erroJson?.message || "Falha ao registar a avaliação.");
      }

      setComentario("");
      setNota(5);
      alert("Avaliação registada com sucesso!");
      await carregarDados();
    } catch (err: any) {
      alert(err.message || "Erro de ligação ao servidor.");
    } finally {
      setEnviando(false);
    }
  };

  if (carregando) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <p className="text-sm font-semibold text-slate-500">A carregar serviço municipal...</p>
      </div>
    );
  }

  return (
    <main className="mx-auto max-w-4xl px-4 py-10 sm:px-6">
      <div className="mb-6">
        <Link
          href="/"
          className="text-xs font-semibold text-sky-600 hover:underline"
        >
          ← Voltar à Página Principal
        </Link>
      </div>

      {/* Cartão do Posto */}
      <div className="rounded-3xl border border-slate-200 bg-white p-6 sm:p-8 shadow-sm">
        <div className="flex items-center justify-between gap-2">
          <span className="text-xs font-bold uppercase tracking-wider text-sky-600">
            {servico?.categoria || "Serviço Público"}
          </span>
          <div className="flex items-center gap-1">
            <span className="text-xl text-amber-500">★</span>
            <span className="text-lg font-black text-slate-800">
              {servico ? Number(servico.mediaNota).toFixed(1) : "5.0"}
            </span>
            <span className="text-xs text-slate-500">
              ({servico?.totalAvaliacoes || 0} avaliações)
            </span>
          </div>
        </div>

        <h1 className="mt-2 text-2xl sm:text-3xl font-black text-slate-900">
          {servico?.nome || "Posto Municipal"}
        </h1>
        <p className="mt-1 text-sm text-slate-500">{servico?.endereco}</p>
      </div>

      {/* Formulário de Avaliação */}
      <section className="mt-8 rounded-3xl border border-slate-200 bg-white p-6 sm:p-8 shadow-sm">
        <h2 className="text-xl font-bold text-slate-900">Deixar Avaliação Cidadã</h2>
        <p className="text-xs text-slate-500 mt-1">
          A sua avaliação apoia a fiscalização e a melhoria dos serviços públicos da cidade.
        </p>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-2">
              Classificação do Atendimento e Estrutura
            </label>
            <div className="flex gap-3">
              {[1, 2, 3, 4, 5].map((estrela) => (
                <button
                  key={estrela}
                  type="button"
                  onClick={() => setNota(estrela)}
                  className={`h-11 w-11 rounded-xl font-bold text-sm transition ${
                    nota >= estrela
                      ? "bg-amber-400 text-slate-900 shadow-sm"
                      : "bg-slate-100 text-slate-400 hover:bg-slate-200"
                  }`}
                >
                  ★ {estrela}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Comentário / Relato
            </label>
            <textarea
              rows={4}
              value={comentario}
              onChange={(e) => setComentario(e.target.value)}
              placeholder="Descreva a sua experiência relativamente a filas, infraestrutura ou qualidade do atendimento..."
              className="w-full rounded-2xl border border-slate-200 p-4 text-sm text-slate-800 outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500"
              required
            />
          </div>

          <button
            type="submit"
            disabled={enviando}
            className="inline-flex h-11 items-center justify-center rounded-xl bg-sky-600 px-6 text-sm font-bold text-white transition hover:bg-sky-700 disabled:opacity-50"
          >
            {enviando ? "A registar avaliação..." : "Submeter Avaliação"}
          </button>
        </form>
      </section>

      {/* Histórico de Comentários */}
      <section className="mt-8 space-y-4">
        <h3 className="text-lg font-bold text-slate-900">
          Relatos da Comunidade ({reviews.length})
        </h3>

        {reviews.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50/50 p-6 text-center text-sm text-slate-500">
            Nenhum relato registado até ao momento para este equipamento.
          </div>
        ) : (
          <div className="space-y-3">
            {reviews.map((rev) => (
              <div
                key={rev.id}
                className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm space-y-2"
              >
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-slate-800">
                    {rev.user?.nome || "Cidadão"}
                  </span>
                  <span className="text-amber-500 font-bold">
                    {"★".repeat(rev.nota)}
                  </span>
                </div>
                <p className="text-sm text-slate-600 leading-relaxed">
                  "{rev.comentario}"
                </p>
                <span className="block text-[11px] text-slate-400">
                  {new Date(rev.created_at).toLocaleDateString("pt-BR")}
                </span>
              </div>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}