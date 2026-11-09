
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
    respostaInstitucional?: {
        id: string;
        resposta: string;
        created_at: string;
    } | null;
}

interface DenunciaMensagem {
    tipo: "erro" | "sucesso";
    texto: string;
}

export default function AvaliarPage() {
    const routeParams = useParams();
    const rawId = routeParams?.id;
    const serviceId = Array.isArray(rawId)
        ? rawId[0]
        : (rawId as string);

    const router = useRouter();

    const [servico, setServico] = useState<PublicService | null>(null);
    const [reviews, setReviews] = useState<ReviewItem[]>([]);
    const [carregando, setCarregando] = useState(true);
    const [roleUsuario, setRoleUsuario] = useState<string | null>(null);

    // Estados do formulário de avaliação
    const [nota, setNota] = useState(5);
    const [comentario, setComentario] = useState("");
    const [enviando, setEnviando] = useState(false);
    const [isAnonimo, setIsAnonimo] = useState(false);

    // Estados das denúncias
    const [denunciaAberta, setDenunciaAberta] = useState<
        Record<string, boolean>
    >({});

    const [motivosDenuncia, setMotivosDenuncia] = useState<
        Record<string, string>
    >({});

    const [descricoesDenuncia, setDescricoesDenuncia] = useState<
        Record<string, string>
    >({});

    const [enviandoDenuncia, setEnviandoDenuncia] = useState<string | null>(
        null
    );

    const [mensagensDenuncia, setMensagensDenuncia] = useState<
        Record<string, DenunciaMensagem>
    >({});

    const [denunciadas, setDenunciadas] = useState<
        Record<string, boolean>
    >({});

    // Carregar serviços e avaliações
    const carregarDados = async () => {
        if (!serviceId) return;

        try {
            const resServicos = await fetch(
                "http://localhost:3001/services"
            );

            if (resServicos.ok) {
                const lista: PublicService[] = await resServicos.json();

                const encontrado = lista.find(
                    (s) => s.id === serviceId
                );

                if (encontrado) {
                    setServico(encontrado);
                }
            }

            const resReviews = await fetch(
                `http://localhost:3001/reviews/service/${serviceId}`
            );

            if (resReviews.ok) {
                const dadosReviews = await resReviews.json();

                setReviews(
                    Array.isArray(dadosReviews) ? dadosReviews : []
                );
            }
        } catch (err) {
            console.error("Erro ao carregar dados:", err);
        } finally {
            setCarregando(false);
        }
    };

    useEffect(() => {
        const rawUser = localStorage.getItem("user");

        if (rawUser) {
            try {
                const usuario = JSON.parse(rawUser);
                setRoleUsuario(usuario.role || null);
            } catch {
                setRoleUsuario(null);
            }
        }

        carregarDados();
    }, [serviceId]);

    // Enviar avaliação
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!serviceId) {
            alert("Identificador do posto inválido.");
            return;
        }

        const rawUser = localStorage.getItem("user");

        if (!rawUser) {
            alert(
                "É necessário ter sessão iniciada para submeter uma avaliação."
            );
            router.push("/login");
            return;
        }

        if (!comentario.trim()) {
            alert(
                "Por favor, escreva um comentário sobre o atendimento."
            );
            return;
        }

        const userData = JSON.parse(rawUser);

        setEnviando(true);

        try {
            const token = localStorage.getItem("token");

            if (!token) {
                throw new Error(
                    "Sessão expirada. Faça login novamente."
                );
            }

            const res = await fetch(
                "http://localhost:3001/reviews",
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`,
                    },
                    body: JSON.stringify({
                        service_id: serviceId,
                        user_id: userData.id,
                        nota: Number(nota),
                        comentario,
                        isAnonimo,
                    }),
                }
            );

            if (!res.ok) {
                const erroJson = await res.json().catch(() => null);

                throw new Error(
                    erroJson?.message ||
                    "Falha ao registrar a avaliação."
                );
            }

            setComentario("");
            setNota(5);
            setIsAnonimo(false);

            alert("Avaliação registrada com sucesso!");

            await carregarDados();
        } catch (err) {
            alert(
                err instanceof Error
                    ? err.message
                    : "Erro de conexão com o servidor."
            );
        } finally {
            setEnviando(false);
        }
    };

    // Abrir ou fechar o formulário de denúncia
    const alternarFormularioDenuncia = (reviewId: string) => {
        setDenunciaAberta((anteriores) => ({
            ...anteriores,
            [reviewId]: !anteriores[reviewId],
        }));
    };

    // Enviar denúncia
    const handleDenunciar = async (reviewId: string) => {
        const motivo = motivosDenuncia[reviewId];
        const descricao = descricoesDenuncia[reviewId] || "";

        if (!motivo) {
            setMensagensDenuncia((anteriores) => ({
                ...anteriores,
                [reviewId]: {
                    tipo: "erro",
                    texto: "Selecione o motivo da denúncia.",
                },
            }));

            return;
        }

        const rawUser = localStorage.getItem("user");
        const token = localStorage.getItem("token");

        if (!rawUser || !token) {
            alert("Entre na sua conta para denunciar uma avaliação.");
            router.push("/login");
            return;
        }

        try {
            const usuario = JSON.parse(rawUser);

            if (usuario.role !== "CIDADAO") {
                setMensagensDenuncia((anteriores) => ({
                    ...anteriores,
                    [reviewId]: {
                        tipo: "erro",
                        texto: "Apenas cidadãos podem denunciar avaliações.",
                    },
                }));

                return;
            }
        } catch {
            router.push("/login");
            return;
        }

        setEnviandoDenuncia(reviewId);

        setMensagensDenuncia((anteriores) => {
            const novas = { ...anteriores };
            delete novas[reviewId];
            return novas;
        });

        try {
            const response = await fetch(
                `http://localhost:3001/reviews/${reviewId}/denunciar`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`,
                    },
                    body: JSON.stringify({
                        motivo,
                        descricao,
                    }),
                }
            );

            if (!response.ok) {
                const dados = await response.json().catch(() => null);

                const mensagem = Array.isArray(dados?.message)
                    ? dados.message.join(", ")
                    : dados?.message ||
                      "Não foi possível registrar a denúncia.";

                throw new Error(mensagem);
            }

            setDenunciadas((anteriores) => ({
                ...anteriores,
                [reviewId]: true,
            }));

            setMensagensDenuncia((anteriores) => ({
                ...anteriores,
                [reviewId]: {
                    tipo: "sucesso",
                    texto: "Denúncia enviada. Obrigado por contribuir com a comunidade.",
                },
            }));

            setDenunciaAberta((anteriores) => ({
                ...anteriores,
                [reviewId]: false,
            }));

            setMotivosDenuncia((anteriores) => ({
                ...anteriores,
                [reviewId]: "",
            }));

            setDescricoesDenuncia((anteriores) => ({
                ...anteriores,
                [reviewId]: "",
            }));
        } catch (error) {
            setMensagensDenuncia((anteriores) => ({
                ...anteriores,
                [reviewId]: {
                    tipo: "erro",
                    texto:
                        error instanceof Error
                            ? error.message
                            : "Erro inesperado ao enviar denúncia.",
                },
            }));
        } finally {
            setEnviandoDenuncia(null);
        }
    };

    if (carregando) {
        return (
            <div className="flex min-h-[60vh] items-center justify-center">
                <p className="text-sm font-semibold text-slate-500">
                    A carregar serviço municipal...
                </p>
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

            {/* Cartão do serviço */}
            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
                <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-bold uppercase tracking-wider text-sky-600">
                        {servico?.categoria || "Serviço Público"}
                    </span>

                    <div className="flex items-center gap-1">
                        <span className="text-xl text-amber-500">
                            ★
                        </span>

                        <span className="text-lg font-black text-slate-800">
                            {servico
                                ? Number(servico.mediaNota).toFixed(1)
                                : "5.0"}
                        </span>

                        <span className="text-xs text-slate-500">
                            ({servico?.totalAvaliacoes || 0} avaliações)
                        </span>
                    </div>
                </div>

                <h1 className="mt-2 text-2xl font-black text-slate-900 sm:text-3xl">
                    {servico?.nome || "Posto Municipal"}
                </h1>

                <p className="mt-1 text-sm text-slate-500">
                    {servico?.endereco}
                </p>
            </div>

            {/* Formulário de avaliação */}
            <section className="mt-8 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
                <h2 className="text-xl font-bold text-slate-900">
                    Deixar Avaliação Cidadã
                </h2>

                <p className="mt-1 text-xs text-slate-500">
                    A sua avaliação apoia a fiscalização e a melhoria dos
                    serviços públicos da cidade.
                </p>

                <form onSubmit={handleSubmit} className="mt-6 space-y-4">
                    <div>
                        <label className="mb-2 block text-xs font-bold text-slate-700">
                            Classificação do Atendimento e Estrutura
                        </label>

                        <div className="flex gap-3">
                            {[1, 2, 3, 4, 5].map((estrela) => (
                                <button
                                    key={estrela}
                                    type="button"
                                    onClick={() => setNota(estrela)}
                                    className={`h-11 w-11 rounded-xl text-sm font-bold transition ${
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
                        <label className="mb-1 block text-xs font-bold text-slate-700">
                            Comentário / Relato
                        </label>

                        <textarea
                            rows={4}
                            value={comentario}
                            onChange={(e) => setComentario(e.target.value)}
                            placeholder="Descreva sua experiência com o atendimento..."
                            className="w-full rounded-2xl border border-slate-200 p-4 text-sm text-slate-800 outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500"
                            required
                        />
                    </div>

                    <div className="flex items-start gap-3 rounded-xl border border-slate-200 bg-slate-50 p-4">
                        <input
                            id="isAnonimo"
                            type="checkbox"
                            checked={isAnonimo}
                            onChange={(e) =>
                                setIsAnonimo(e.target.checked)
                            }
                            className="mt-1 h-4 w-4 cursor-pointer accent-sky-600"
                        />

                        <label
                            htmlFor="isAnonimo"
                            className="cursor-pointer"
                        >
                            <span className="block text-sm font-bold text-slate-800">
                                Publicar avaliação anonimamente
                            </span>

                            <span className="mt-1 block text-xs text-slate-500">
                                Seu nome não será exibido publicamente, mas
                                continuará vinculado à avaliação para fins de
                                segurança e moderação.
                            </span>
                        </label>
                    </div>

                    <button
                        type="submit"
                        disabled={enviando}
                        className="inline-flex h-11 items-center justify-center rounded-xl bg-sky-600 px-6 text-sm font-bold text-white transition hover:bg-sky-700 disabled:opacity-50"
                    >
                        {enviando
                            ? "Registrando avaliação..."
                            : "Submeter Avaliação"}
                    </button>
                </form>
            </section>

            {/* Histórico de comentários */}
            <section className="mt-8 space-y-4">
                <h3 className="text-lg font-bold text-slate-900">
                    Relatos da Comunidade ({reviews.length})
                </h3>

                {reviews.length === 0 ? (
                    <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50/50 p-6 text-center text-sm text-slate-500">
                        Nenhum relato registrado até o momento para este equipamento.
                    </div>
                ) : (
                    <div className="space-y-3">
                        {reviews.map((rev) => (
                            <article
                                key={rev.id}
                                className="space-y-2 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
                            >
                                <div className="flex items-center justify-between text-xs">
                                    <span className="font-bold text-slate-800">
                                        {rev.user?.nome || "Cidadão"}
                                    </span>

                                    <span className="font-bold text-amber-500">
                                        {"★".repeat(rev.nota)}
                                    </span>
                                </div>

                                <p className="text-sm leading-relaxed text-slate-600">
                                    "{rev.comentario}"
                                </p>

                                <span className="block text-[11px] text-slate-400">
                                    {new Date(
                                        rev.created_at
                                    ).toLocaleDateString("pt-BR")}
                                </span>

                                {/* Resposta institucional */}
                                {rev.respostaInstitucional?.resposta && (
                                    <div className="mt-3 rounded-xl border border-emerald-100 bg-emerald-50 p-4">
                                        <h4 className="text-sm font-bold text-emerald-800">
                                            Resposta institucional
                                        </h4>

                                        <p className="mt-2 text-sm leading-relaxed text-slate-700">
                                            {rev.respostaInstitucional.resposta}
                                        </p>

                                        <span className="mt-2 block text-xs text-slate-500">
                                            Respondida em{" "}
                                            {new Date(
                                                rev.respostaInstitucional.created_at
                                            ).toLocaleDateString("pt-BR")}
                                        </span>
                                    </div>
                                )}

                                {/* Denúncia: somente para cidadãos */}
                                {roleUsuario === "CIDADAO" && (
                                    <div className="mt-4 border-t border-slate-100 pt-3">
                                        {denunciadas[rev.id] ? (
                                            <p className="text-xs font-semibold text-emerald-700">
                                                Denúncia enviada.
                                            </p>
                                        ) : (
                                            <>
                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        alternarFormularioDenuncia(
                                                            rev.id
                                                        )
                                                    }
                                                    className="text-xs font-semibold text-slate-500 transition hover:text-red-600"
                                                >
                                                    {denunciaAberta[rev.id]
                                                        ? "Cancelar denúncia"
                                                        : "Denunciar avaliação"}
                                                </button>

                                                {denunciaAberta[rev.id] && (
                                                    <div className="mt-4 rounded-xl border border-red-100 bg-red-50/50 p-4">
                                                        <h4 className="text-sm font-bold text-slate-800">
                                                            Denunciar esta avaliação
                                                        </h4>

                                                        <p className="mt-1 text-xs text-slate-500">
                                                            Selecione o motivo e,
                                                            se necessário, explique
                                                            o ocorrido.
                                                        </p>

                                                        <select
                                                            value={
                                                                motivosDenuncia[
                                                                    rev.id
                                                                ] || ""
                                                            }
                                                            onChange={(e) =>
                                                                setMotivosDenuncia(
                                                                    (anteriores) => ({
                                                                        ...anteriores,
                                                                        [rev.id]:
                                                                            e.target.value,
                                                                    })
                                                                )
                                                            }
                                                            className="mt-3 w-full rounded-lg border border-slate-200 bg-white p-3 text-sm text-slate-700 outline-none focus:border-red-400"
                                                        >
                                                            <option value="">
                                                                Selecione o motivo
                                                            </option>

                                                            <option value="Conteúdo ofensivo ou abusivo">
                                                                Conteúdo ofensivo ou abusivo
                                                            </option>

                                                            <option value="Discurso de ódio ou preconceito">
                                                                Discurso de ódio ou preconceito
                                                            </option>

                                                            <option value="Informação falsa ou enganosa">
                                                                Informação falsa ou enganosa
                                                            </option>

                                                            <option value="Spam ou publicidade">
                                                                Spam ou publicidade
                                                            </option>

                                                            <option value="Exposição de dados pessoais">
                                                                Exposição de dados pessoais
                                                            </option>

                                                            <option value="Conteúdo fora do assunto">
                                                                Conteúdo fora do assunto
                                                            </option>

                                                            <option value="Outro">
                                                                Outro
                                                            </option>
                                                        </select>

                                                        <textarea
                                                            value={
                                                                descricoesDenuncia[
                                                                    rev.id
                                                                ] || ""
                                                            }
                                                            onChange={(e) =>
                                                                setDescricoesDenuncia(
                                                                    (anteriores) => ({
                                                                        ...anteriores,
                                                                        [rev.id]:
                                                                            e.target.value,
                                                                    })
                                                                )
                                                            }
                                                            rows={3}
                                                            maxLength={1000}
                                                            placeholder="Explique o motivo da denúncia (opcional)."
                                                            className="mt-3 w-full resize-y rounded-lg border border-slate-200 bg-white p-3 text-sm text-slate-700 outline-none focus:border-red-400"
                                                        />

                                                        <div className="mt-2 flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
                                                            <span className="text-xs text-slate-400">
                                                                {
                                                                    (
                                                                        descricoesDenuncia[
                                                                            rev.id
                                                                        ] || ""
                                                                    ).length
                                                                }/1000 caracteres
                                                            </span>

                                                            <button
                                                                type="button"
                                                                onClick={() =>
                                                                    handleDenunciar(
                                                                        rev.id
                                                                    )
                                                                }
                                                                disabled={
                                                                    enviandoDenuncia ===
                                                                    rev.id
                                                                }
                                                                className="rounded-lg bg-red-600 px-4 py-2 text-xs font-bold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
                                                            >
                                                                {enviandoDenuncia ===
                                                                rev.id
                                                                    ? "Enviando..."
                                                                    : "Enviar denúncia"}
                                                            </button>
                                                        </div>

                                                        {mensagensDenuncia[
                                                            rev.id
                                                        ] && (
                                                            <p
                                                                className={`mt-3 text-xs font-semibold ${
                                                                    mensagensDenuncia[
                                                                        rev.id
                                                                    ].tipo ===
                                                                    "sucesso"
                                                                        ? "text-emerald-700"
                                                                        : "text-red-600"
                                                                }`}
                                                            >
                                                                {
                                                                    mensagensDenuncia[
                                                                        rev.id
                                                                    ].texto
                                                                }
                                                            </p>
                                                        )}
                                                    </div>
                                                )}
                                            </>
                                        )}

                                        {mensagensDenuncia[rev.id]?.tipo ===
                                            "erro" && (
                                            <p className="mt-2 text-xs font-semibold text-red-600">
                                                {
                                                    mensagensDenuncia[rev.id]
                                                        .texto
                                                }
                                            </p>
                                        )}
                                    </div>
                                )}
                            </article>
                        ))}
                    </div>
                )}
            </section>
        </main>
    );
}
