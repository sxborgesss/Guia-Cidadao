"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

type Perfil = "ADMIN" | "CIDADAO";

type TipoManifestacao =
    | "RECLAMACAO"
    | "DENUNCIA"
    | "SUGESTAO"
    | "ELOGIO"
    | "SOLICITACAO";

type StatusManifestacao =
    | "RECEBIDA"
    | "EM_ANALISE"
    | "RESPONDIDA"
    | "ENCERRADA";

interface Usuario {
    id: string;
    nome: string;
    email: string;
    role: string;
}

interface Manifestacao {
    id: string;
    protocolo: string;
    tipo: TipoManifestacao;
    assunto: string;
    descricao: string;
    status: StatusManifestacao;
    resposta?: string | null;
    created_at: string;
    updated_at?: string;
    usuario?: {
        id?: string;
        nome?: string;
        email?: string;
    } | null;
    user?: {
        id?: string;
        nome?: string;
        email?: string;
    } | null;
    respondidoPor?: {
        nome?: string;
    } | null;
}

const TIPOS: { value: TipoManifestacao; label: string }[] = [
    { value: "RECLAMACAO", label: "Reclamação" },
    { value: "DENUNCIA", label: "Denúncia" },
    { value: "SUGESTAO", label: "Sugestão" },
    { value: "ELOGIO", label: "Elogio" },
    { value: "SOLICITACAO", label: "Solicitação" },
];

const STATUS: { value: StatusManifestacao; label: string }[] = [
    { value: "RECEBIDA", label: "Recebida" },
    { value: "EM_ANALISE", label: "Em análise" },
    { value: "RESPONDIDA", label: "Respondida" },
    { value: "ENCERRADA", label: "Encerrada" },
];

function nomeTipo(tipo: TipoManifestacao) {
    return TIPOS.find((item) => item.value === tipo)?.label ?? tipo;
}

function nomeStatus(status: StatusManifestacao) {
    return STATUS.find((item) => item.value === status)?.label ?? status;
}

function formatarData(data?: string) {
    if (!data) return "Data não disponível";

    const dataFormatada = new Date(data);

    if (Number.isNaN(dataFormatada.getTime())) {
        return "Data não disponível";
    }

    return dataFormatada.toLocaleString("pt-BR", {
        day: "2-digit",
        month: "long",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
    });
}

function classesStatus(status: StatusManifestacao) {
    switch (status) {
        case "RECEBIDA":
            return "bg-blue-100 text-blue-800";

        case "EM_ANALISE":
            return "bg-amber-100 text-amber-800";

        case "RESPONDIDA":
            return "bg-emerald-100 text-emerald-800";

        case "ENCERRADA":
            return "bg-slate-200 text-slate-700";

        default:
            return "bg-slate-100 text-slate-700";
    }
}

async function obterMensagemErro(response: Response) {
    try {
        const data = await response.json();

        if (Array.isArray(data.message)) {
            return data.message.join(", ");
        }

        if (typeof data.message === "string") {
            return data.message;
        }
    } catch {
        // Mantém a mensagem padrão se a resposta não for JSON.
    }

    if (response.status === 401) {
        return "Sua sessão expirou. Entre novamente.";
    }

    if (response.status === 403) {
        return "Você não possui permissão para realizar esta ação.";
    }

    return "Não foi possível concluir a operação.";
}

export default function OuvidoriaPage() {
    const router = useRouter();

    const [usuario, setUsuario] = useState<Usuario | null>(null);
    const [manifestacoes, setManifestacoes] = useState<Manifestacao[]>([]);
    const [carregando, setCarregando] = useState(true);

    const [tipo, setTipo] = useState<TipoManifestacao>("RECLAMACAO");
    const [assunto, setAssunto] = useState("");
    const [descricao, setDescricao] = useState("");
    const [enviando, setEnviando] = useState(false);

    const [filtroStatus, setFiltroStatus] = useState("TODOS");
    const [buscaProtocolo, setBuscaProtocolo] = useState("");

    const [statusEdicao, setStatusEdicao] = useState<
        Record<string, StatusManifestacao>
    >({});

    const [respostas, setRespostas] = useState<Record<string, string>>({});
    const [salvandoId, setSalvandoId] = useState<string | null>(null);

    const [erro, setErro] = useState<string | null>(null);
    const [sucesso, setSucesso] = useState<string | null>(null);

    const ehAdmin = usuario?.role === "ADMIN";
    const ehCidadao = usuario?.role === "CIDADAO";

    async function carregarManifestacoes(
        token: string,
        administrador: boolean,
        mostrarCarregamento = true,
    ) {
        if (mostrarCarregamento) {
            setCarregando(true);
        }

        setErro(null);

        try {
            const rota = administrador
                ? "http://localhost:3001/ouvidoria/admin/todas"
                : "http://localhost:3001/ouvidoria/minhas";

            const response = await fetch(rota, {
                method: "GET",
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            if (!response.ok) {
                throw new Error(await obterMensagemErro(response));
            }

            const dados: Manifestacao[] = await response.json();

            setManifestacoes(Array.isArray(dados) ? dados : []);
        } catch (error) {
            setErro(
                error instanceof Error
                    ? error.message
                    : "Erro ao carregar as manifestações.",
            );
        } finally {
            if (mostrarCarregamento) {
                setCarregando(false);
            }
        }
    }

    useEffect(() => {
        let ativo = true;

        async function inicializar() {
            const rawUser = localStorage.getItem("user");
            const token = localStorage.getItem("token");

            if (!rawUser || !token) {
                router.replace("/login");
                return;
            }

            try {
                const usuarioSalvo: Usuario = JSON.parse(rawUser);

                if (
                    usuarioSalvo.role !== "ADMIN" &&
                    usuarioSalvo.role !== "CIDADAO"
                ) {
                    router.replace("/");
                    return;
                }

                if (ativo) {
                    setUsuario(usuarioSalvo);
                }

                await carregarManifestacoes(
                    token,
                    usuarioSalvo.role === "ADMIN",
                );
            } catch (error) {
                if (ativo) {
                    setErro(
                        error instanceof Error
                            ? error.message
                            : "Não foi possível carregar a Ouvidoria.",
                    );
                    setCarregando(false);
                }
            }
        }

        inicializar();

        return () => {
            ativo = false;
        };
    }, [router]);

    async function registrarManifestacao(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();

        setErro(null);
        setSucesso(null);

        if (!assunto.trim() || !descricao.trim()) {
            setErro("Preencha o assunto e a descrição da manifestação.");
            return;
        }

        const token = localStorage.getItem("token");

        if (!token) {
            router.replace("/login");
            return;
        }

        setEnviando(true);

        try {
            const response = await fetch("http://localhost:3001/ouvidoria", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                    tipo,
                    assunto: assunto.trim(),
                    descricao: descricao.trim(),
                }),
            });

            if (!response.ok) {
                throw new Error(await obterMensagemErro(response));
            }

            const resultado = await response.json();

            setAssunto("");
            setDescricao("");
            setTipo("RECLAMACAO");

            setSucesso(
                `Manifestação registrada! Seu protocolo é ${resultado.protocolo}.`,
            );

            await carregarManifestacoes(token, false, false);
        } catch (error) {
            setErro(
                error instanceof Error
                    ? error.message
                    : "Não foi possível registrar sua manifestação.",
            );
        } finally {
            setEnviando(false);
        }
    }

    async function atualizarManifestacao(manifestacao: Manifestacao) {
        const token = localStorage.getItem("token");

        if (!token) {
            router.replace("/login");
            return;
        }

        const novoStatus =
            statusEdicao[manifestacao.id] ?? manifestacao.status;

        const resposta = (respostas[manifestacao.id] ?? "").trim();

        if (
            novoStatus === "RESPONDIDA" &&
            !resposta &&
            !manifestacao.resposta
        ) {
            setErro(
                `Informe uma resposta para marcar o protocolo ${manifestacao.protocolo} como respondido.`,
            );
            return;
        }

        setErro(null);
        setSucesso(null);
        setSalvandoId(manifestacao.id);

        try {
            const corpo: {
                status: StatusManifestacao;
                resposta?: string;
            } = {
                status: novoStatus,
            };

            if (resposta) {
                corpo.resposta = resposta;
            }

            const response = await fetch(
                `http://localhost:3001/ouvidoria/admin/${manifestacao.id}`,
                {
                    method: "PATCH",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`,
                    },
                    body: JSON.stringify(corpo),
                },
            );

            if (!response.ok) {
                throw new Error(await obterMensagemErro(response));
            }

            setRespostas((anteriores) => ({
                ...anteriores,
                [manifestacao.id]: "",
            }));

            setSucesso(
                `Protocolo ${manifestacao.protocolo} atualizado com sucesso.`,
            );

            await carregarManifestacoes(token, true, false);
        } catch (error) {
            setErro(
                error instanceof Error
                    ? error.message
                    : "Não foi possível atualizar a manifestação.",
            );
        } finally {
            setSalvandoId(null);
        }
    }

    const manifestacoesFiltradas = useMemo(() => {
        return manifestacoes.filter((item) => {
            const correspondeStatus =
                filtroStatus === "TODOS" || item.status === filtroStatus;

            const correspondeProtocolo = item.protocolo
                .toLowerCase()
                .includes(buscaProtocolo.trim().toLowerCase());

            return correspondeStatus && correspondeProtocolo;
        });
    }, [manifestacoes, filtroStatus, buscaProtocolo]);

    const totalRecebidas = manifestacoes.filter(
        (item) => item.status === "RECEBIDA",
    ).length;

    const totalEmAnalise = manifestacoes.filter(
        (item) => item.status === "EM_ANALISE",
    ).length;

    const totalRespondidas = manifestacoes.filter(
        (item) => item.status === "RESPONDIDA",
    ).length;

    const totalEncerradas = manifestacoes.filter(
        (item) => item.status === "ENCERRADA",
    ).length;

    if (carregando) {
        return (
            <main className="flex min-h-[60vh] items-center justify-center px-4">
                <p className="text-sm font-semibold text-slate-500">
                    Carregando Ouvidoria Aberta...
                </p>
            </main>
        );
    }

    return (
        <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
            <div className="mb-8 rounded-2xl bg-slate-900 px-6 py-8 text-white sm:px-8">
                <div className="mb-3 flex flex-wrap items-center gap-2">
                    <span className="rounded-full bg-white/15 px-3 py-1 text-xs font-bold uppercase tracking-wide">
                        FeedPalmas
                    </span>

                    <span className="rounded-full bg-emerald-400/20 px-3 py-1 text-xs font-bold text-emerald-200">
                        {ehAdmin ? "Área administrativa" : "Canal do cidadão"}
                    </span>
                </div>

                <h1 className="text-3xl font-extrabold sm:text-4xl">
                    Ouvidoria Aberta
                </h1>

                <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-300 sm:text-base">
                    Um canal para registrar reclamações, denúncias, sugestões,
                    elogios e solicitações relacionadas aos serviços públicos.
                    Acompanhe cada manifestação por meio de um protocolo.
                </p>

                {usuario && (
                    <p className="mt-5 text-sm text-slate-300">
                        Sessão ativa:{" "}
                        <span className="font-bold text-white">
                            {usuario.nome}
                        </span>
                    </p>
                )}
            </div>

            {erro && (
                <div
                    role="alert"
                    className="mb-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-800"
                >
                    {erro}
                </div>
            )}

            {sucesso && (
                <div
                    role="status"
                    className="mb-6 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-800"
                >
                    {sucesso}
                </div>
            )}

            {ehCidadao && (
                <>
                    <section className="mb-10 grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(280px,0.7fr)]">
                        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                            <h2 className="text-xl font-bold text-slate-900">
                                Registrar manifestação
                            </h2>

                            <p className="mt-1 text-sm text-slate-500">
                                Descreva sua solicitação com clareza. Ao enviar,
                                você receberá um número de protocolo.
                            </p>

                            <form
                                onSubmit={registrarManifestacao}
                                className="mt-6 space-y-5"
                            >
                                <div>
                                    <label
                                        htmlFor="tipo"
                                        className="mb-2 block text-sm font-semibold text-slate-700"
                                    >
                                        Tipo de manifestação
                                    </label>

                                    <select
                                        id="tipo"
                                        value={tipo}
                                        onChange={(event) =>
                                            setTipo(
                                                event.target
                                                    .value as TipoManifestacao,
                                            )
                                        }
                                        className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-800 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                                    >
                                        {TIPOS.map((item) => (
                                            <option
                                                key={item.value}
                                                value={item.value}
                                            >
                                                {item.label}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label
                                        htmlFor="assunto"
                                        className="mb-2 block text-sm font-semibold text-slate-700"
                                    >
                                        Assunto
                                    </label>

                                    <input
                                        id="assunto"
                                        type="text"
                                        maxLength={150}
                                        required
                                        value={assunto}
                                        onChange={(event) =>
                                            setAssunto(event.target.value)
                                        }
                                        placeholder="Ex.: Iluminação pública"
                                        className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                                    />

                                    <p className="mt-1 text-right text-xs text-slate-400">
                                        {assunto.length}/150
                                    </p>
                                </div>

                                <div>
                                    <label
                                        htmlFor="descricao"
                                        className="mb-2 block text-sm font-semibold text-slate-700"
                                    >
                                        Descrição
                                    </label>

                                    <textarea
                                        id="descricao"
                                        required
                                        rows={6}
                                        maxLength={5000}
                                        value={descricao}
                                        onChange={(event) =>
                                            setDescricao(event.target.value)
                                        }
                                        placeholder="Explique o que aconteceu, onde ocorreu e outras informações importantes..."
                                        className="w-full resize-y rounded-xl border border-slate-300 px-4 py-3 text-sm leading-6 text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                                    />

                                    <p className="mt-1 text-right text-xs text-slate-400">
                                        {descricao.length}/5000
                                    </p>
                                </div>

                                <button
                                    type="submit"
                                    disabled={enviando}
                                    className="w-full rounded-xl bg-blue-700 px-5 py-3 font-bold text-white transition hover:bg-blue-800 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
                                >
                                    {enviando
                                        ? "Enviando manifestação..."
                                        : "Enviar manifestação"}
                                </button>
                            </form>
                        </div>

                        <aside className="rounded-2xl border border-blue-100 bg-blue-50 p-6">
                            <h3 className="text-lg font-bold text-slate-900">
                                Como funciona?
                            </h3>

                            <ol className="mt-5 space-y-5">
                                <li className="flex gap-3">
                                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-blue-700 text-sm font-bold text-white">
                                        1
                                    </span>
                                    <div>
                                        <p className="font-bold text-slate-800">
                                            Registre
                                        </p>
                                        <p className="mt-1 text-sm leading-5 text-slate-600">
                                            Escolha o tipo e descreva sua
                                            manifestação.
                                        </p>
                                    </div>
                                </li>

                                <li className="flex gap-3">
                                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-blue-700 text-sm font-bold text-white">
                                        2
                                    </span>
                                    <div>
                                        <p className="font-bold text-slate-800">
                                            Receba seu protocolo
                                        </p>
                                        <p className="mt-1 text-sm leading-5 text-slate-600">
                                            Guarde o número gerado após o envio.
                                        </p>
                                    </div>
                                </li>

                                <li className="flex gap-3">
                                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-blue-700 text-sm font-bold text-white">
                                        3
                                    </span>
                                    <div>
                                        <p className="font-bold text-slate-800">
                                            Acompanhe
                                        </p>
                                        <p className="mt-1 text-sm leading-5 text-slate-600">
                                            Consulte o andamento e leia a
                                            resposta da administração nesta
                                            página.
                                        </p>
                                    </div>
                                </li>
                            </ol>

                            <div className="mt-6 rounded-xl border border-blue-100 bg-white p-4">
                                <p className="text-sm font-bold text-slate-800">
                                    Atenção
                                </p>
                                <p className="mt-1 text-sm leading-5 text-slate-600">
                                    Não inclua senhas ou dados pessoais
                                    desnecessários na descrição.
                                </p>
                            </div>
                        </aside>
                    </section>

                    <section>
                        <div className="mb-5 flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
                            <div>
                                <h2 className="text-2xl font-extrabold text-slate-900">
                                    Minhas manifestações
                                </h2>
                                <p className="mt-1 text-sm text-slate-500">
                                    Consulte os protocolos registrados em sua
                                    conta.
                                </p>
                            </div>

                            <span className="text-sm font-semibold text-slate-500">
                                {manifestacoes.length}{" "}
                                {manifestacoes.length === 1
                                    ? "manifestação"
                                    : "manifestações"}
                            </span>
                        </div>

                        {manifestacoes.length === 0 ? (
                            <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-6 py-12 text-center">
                                <h3 className="font-bold text-slate-800">
                                    Você ainda não possui manifestações
                                    registradas.
                                </h3>
                                <p className="mt-2 text-sm text-slate-500">
                                    Quando enviar sua primeira manifestação,
                                    ela aparecerá aqui.
                                </p>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {manifestacoes.map((item) => (
                                    <article
                                        key={item.id}
                                        className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6"
                                    >
                                        <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-start">
                                            <div>
                                                <p className="text-xs font-bold uppercase tracking-wide text-slate-500">
                                                    Protocolo
                                                </p>
                                                <p className="mt-1 break-all font-mono text-lg font-extrabold text-blue-800">
                                                    {item.protocolo}
                                                </p>
                                            </div>

                                            <span
                                                className={`w-fit rounded-full px-3 py-1 text-xs font-bold ${classesStatus(item.status)}`}
                                            >
                                                {nomeStatus(item.status)}
                                            </span>
                                        </div>

                                        <div className="mt-4 grid gap-3 sm:grid-cols-2">
                                            <div>
                                                <p className="text-xs font-semibold uppercase text-slate-400">
                                                    Tipo
                                                </p>
                                                <p className="mt-1 text-sm font-semibold text-slate-800">
                                                    {nomeTipo(item.tipo)}
                                                </p>
                                            </div>

                                            <div>
                                                <p className="text-xs font-semibold uppercase text-slate-400">
                                                    Data do registro
                                                </p>
                                                <p className="mt-1 text-sm text-slate-700">
                                                    {formatarData(
                                                        item.created_at,
                                                    )}
                                                </p>
                                            </div>
                                        </div>

                                        <div className="mt-4">
                                            <p className="text-xs font-semibold uppercase text-slate-400">
                                                Assunto
                                            </p>
                                            <p className="mt-1 font-bold text-slate-900">
                                                {item.assunto}
                                            </p>
                                        </div>

                                        <div className="mt-3">
                                            <p className="text-xs font-semibold uppercase text-slate-400">
                                                Descrição
                                            </p>
                                            <p className="mt-1 whitespace-pre-wrap text-sm leading-6 text-slate-600">
                                                {item.descricao}
                                            </p>
                                        </div>

                                        {item.resposta && (
                                            <div className="mt-5 rounded-xl border border-emerald-200 bg-emerald-50 p-4">
                                                <p className="text-sm font-bold text-emerald-900">
                                                    Resposta da administração
                                                </p>
                                                <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-emerald-900">
                                                    {item.resposta}
                                                </p>
                                            </div>
                                        )}
                                    </article>
                                ))}
                            </div>
                        )}
                    </section>
                </>
            )}

            {ehAdmin && (
                <section>
                    <div className="mb-6">
                        <h2 className="text-2xl font-extrabold text-slate-900">
                            Gestão de manifestações
                        </h2>
                        <p className="mt-1 text-sm text-slate-500">
                            Consulte os registros, atualize o andamento e envie
                            respostas aos cidadãos.
                        </p>
                    </div>

                    <div className="mb-7 grid grid-cols-2 gap-3 lg:grid-cols-4">
                        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                            <p className="text-sm font-medium text-slate-500">
                                Total
                            </p>
                            <p className="mt-2 text-3xl font-extrabold text-slate-900">
                                {manifestacoes.length}
                            </p>
                        </div>

                        <div className="rounded-2xl border border-blue-100 bg-blue-50 p-4">
                            <p className="text-sm font-medium text-blue-800">
                                Recebidas
                            </p>
                            <p className="mt-2 text-3xl font-extrabold text-blue-900">
                                {totalRecebidas}
                            </p>
                        </div>

                        <div className="rounded-2xl border border-amber-100 bg-amber-50 p-4">
                            <p className="text-sm font-medium text-amber-800">
                                Em análise
                            </p>
                            <p className="mt-2 text-3xl font-extrabold text-amber-900">
                                {totalEmAnalise}
                            </p>
                        </div>

                        <div className="rounded-2xl border border-emerald-100 bg-emerald-50 p-4">
                            <p className="text-sm font-medium text-emerald-800">
                                Respondidas
                            </p>
                            <p className="mt-2 text-3xl font-extrabold text-emerald-900">
                                {totalRespondidas + totalEncerradas}
                            </p>
                        </div>
                    </div>

                    <div className="mb-5 grid gap-3 rounded-2xl border border-slate-200 bg-white p-4 sm:grid-cols-[1fr_220px]">
                        <div>
                            <label
                                htmlFor="buscaProtocolo"
                                className="mb-2 block text-sm font-semibold text-slate-700"
                            >
                                Buscar protocolo
                            </label>
                            <input
                                id="buscaProtocolo"
                                type="text"
                                value={buscaProtocolo}
                                onChange={(event) =>
                                    setBuscaProtocolo(event.target.value)
                                }
                                placeholder="Digite o número do protocolo..."
                                className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                            />
                        </div>

                        <div>
                            <label
                                htmlFor="filtroStatus"
                                className="mb-2 block text-sm font-semibold text-slate-700"
                            >
                                Filtrar por status
                            </label>
                            <select
                                id="filtroStatus"
                                value={filtroStatus}
                                onChange={(event) =>
                                    setFiltroStatus(event.target.value)
                                }
                                className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                            >
                                <option value="TODOS">Todos os status</option>
                                {STATUS.map((item) => (
                                    <option
                                        key={item.value}
                                        value={item.value}
                                    >
                                        {item.label}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div className="mb-4 text-sm text-slate-500">
                        Exibindo {manifestacoesFiltradas.length} de{" "}
                        {manifestacoes.length} manifestações.
                    </div>

                    {manifestacoesFiltradas.length === 0 ? (
                        <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-6 py-12 text-center">
                            <h3 className="font-bold text-slate-800">
                                Nenhuma manifestação encontrada.
                            </h3>
                            <p className="mt-2 text-sm text-slate-500">
                                Não há registros para os filtros selecionados.
                            </p>
                        </div>
                    ) : (
                        <div className="space-y-5">
                            {manifestacoesFiltradas.map((item) => {
                                const nomeCidadao =
                                    item.usuario?.nome ??
                                    item.user?.nome ??
                                    "Cidadão";

                                const emailCidadao =
                                    item.usuario?.email ??
                                    item.user?.email;

                                const statusAtual =
                                    statusEdicao[item.id] ?? item.status;

                                return (
                                    <article
                                        key={item.id}
                                        className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6"
                                    >
                                        <div className="flex flex-col justify-between gap-3 border-b border-slate-100 pb-4 sm:flex-row sm:items-start">
                                            <div>
                                                <p className="text-xs font-bold uppercase tracking-wide text-slate-500">
                                                    Protocolo
                                                </p>
                                                <p className="mt-1 break-all font-mono text-lg font-extrabold text-blue-800">
                                                    {item.protocolo}
                                                </p>
                                                <p className="mt-2 text-sm text-slate-600">
                                                    Cidadão:{" "}
                                                    <span className="font-semibold text-slate-900">
                                                        {nomeCidadao}
                                                    </span>
                                                </p>
                                                {emailCidadao && (
                                                    <p className="text-xs text-slate-500">
                                                        {emailCidadao}
                                                    </p>
                                                )}
                                            </div>

                                            <span
                                                className={`w-fit rounded-full px-3 py-1 text-xs font-bold ${classesStatus(item.status)}`}
                                            >
                                                {nomeStatus(item.status)}
                                            </span>
                                        </div>

                                        <div className="mt-4 grid gap-3 sm:grid-cols-3">
                                            <div>
                                                <p className="text-xs font-semibold uppercase text-slate-400">
                                                    Tipo
                                                </p>
                                                <p className="mt-1 text-sm font-semibold text-slate-800">
                                                    {nomeTipo(item.tipo)}
                                                </p>
                                            </div>

                                            <div>
                                                <p className="text-xs font-semibold uppercase text-slate-400">
                                                    Registro
                                                </p>
                                                <p className="mt-1 text-sm text-slate-700">
                                                    {formatarData(
                                                        item.created_at,
                                                    )}
                                                </p>
                                            </div>

                                            <div>
                                                <p className="text-xs font-semibold uppercase text-slate-400">
                                                    Última atualização
                                                </p>
                                                <p className="mt-1 text-sm text-slate-700">
                                                    {formatarData(
                                                        item.updated_at ??
                                                            item.created_at,
                                                    )}
                                                </p>
                                            </div>
                                        </div>

                                        <div className="mt-4">
                                            <p className="text-xs font-semibold uppercase text-slate-400">
                                                Assunto
                                            </p>
                                            <p className="mt-1 font-bold text-slate-900">
                                                {item.assunto}
                                            </p>
                                        </div>

                                        <div className="mt-3">
                                            <p className="text-xs font-semibold uppercase text-slate-400">
                                                Descrição do cidadão
                                            </p>
                                            <p className="mt-1 whitespace-pre-wrap text-sm leading-6 text-slate-600">
                                                {item.descricao}
                                            </p>
                                        </div>

                                        {item.resposta && (
                                            <div className="mt-4 rounded-xl border border-emerald-200 bg-emerald-50 p-4">
                                                <p className="text-sm font-bold text-emerald-900">
                                                    Resposta registrada
                                                </p>
                                                <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-emerald-900">
                                                    {item.resposta}
                                                </p>
                                                {item.respondidoPor?.nome && (
                                                    <p className="mt-2 text-xs text-emerald-800">
                                                        Responsável:{" "}
                                                        {item.respondidoPor.nome}
                                                    </p>
                                                )}
                                            </div>
                                        )}

                                        <div className="mt-6 rounded-xl bg-slate-50 p-4">
                                            <h3 className="font-bold text-slate-900">
                                                Atualizar manifestação
                                            </h3>

                                            <div className="mt-4 grid gap-4 md:grid-cols-2">
                                                <div>
                                                    <label
                                                        htmlFor={`status-${item.id}`}
                                                        className="mb-2 block text-sm font-semibold text-slate-700"
                                                    >
                                                        Status
                                                    </label>

                                                    <select
                                                        id={`status-${item.id}`}
                                                        value={statusAtual}
                                                        onChange={(event) =>
                                                            setStatusEdicao(
                                                                (anteriores) => ({
                                                                    ...anteriores,
                                                                    [item.id]: event
                                                                        .target
                                                                        .value as StatusManifestacao,
                                                                }),
                                                            )
                                                        }
                                                        className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                                                    >
                                                        {STATUS.map(
                                                            (opcao) => (
                                                                <option
                                                                    key={
                                                                        opcao.value
                                                                    }
                                                                    value={
                                                                        opcao.value
                                                                    }
                                                                >
                                                                    {
                                                                        opcao.label
                                                                    }
                                                                </option>
                                                            ),
                                                        )}
                                                    </select>
                                                </div>

                                                <div>
                                                    <label
                                                        htmlFor={`resposta-${item.id}`}
                                                        className="mb-2 block text-sm font-semibold text-slate-700"
                                                    >
                                                        Resposta ao cidadão
                                                    </label>

                                                    <textarea
                                                        id={`resposta-${item.id}`}
                                                        rows={3}
                                                        value={
                                                            respostas[item.id] ??
                                                            ""
                                                        }
                                                        onChange={(event) =>
                                                            setRespostas(
                                                                (anteriores) => ({
                                                                    ...anteriores,
                                                                    [item.id]:
                                                                        event
                                                                            .target
                                                                            .value,
                                                                }),
                                                            )
                                                        }
                                                        placeholder="Digite uma resposta institucional..."
                                                        className="w-full resize-y rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm leading-6 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                                                    />
                                                </div>
                                            </div>

                                            <div className="mt-4 flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
                                                <p className="text-xs leading-5 text-slate-500">
                                                    Para marcar como
                                                    respondida, é necessário
                                                    haver uma resposta
                                                    registrada.
                                                </p>

                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        atualizarManifestacao(
                                                            item,
                                                        )
                                                    }
                                                    disabled={
                                                        salvandoId === item.id
                                                    }
                                                    className="rounded-xl bg-slate-900 px-5 py-3 text-sm font-bold text-white transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-60"
                                                >
                                                    {salvandoId === item.id
                                                        ? "Salvando..."
                                                        : "Salvar atualização"}
                                                </button>
                                            </div>
                                        </div>
                                    </article>
                                );
                            })}
                        </div>
                    )}
                </section>
            )}

            <div className="mt-10 border-t border-slate-200 pt-5 text-center">
                <Link
                    href="/"
                    className="text-sm font-semibold text-blue-700 transition hover:text-blue-900"
                >
                    Voltar para a página inicial
                </Link>
            </div>
        </main>
    );
}