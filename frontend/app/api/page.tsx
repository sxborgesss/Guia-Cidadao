"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";

interface Servico {
    id: string;
    nome: string;
    categoria: string;
    endereco: string;
    esfera: string;
    latitude: number | string | null;
    longitude: number | string | null;
    mediaNota: number | string;
    totalAvaliacoes: number | string;
    created_at?: string;
    updated_at?: string;
}

import { API_URL } from "@/lib/api";

function numero(valor: number | string | null | undefined) {
    if (valor === null || valor === undefined || valor === "") {
        return 0;
    }

    const convertido = Number(valor);
    return Number.isFinite(convertido) ? convertido : 0;
}

function formatarData(data?: string) {
    if (!data) return "Não informado";

    const valor = new Date(data);

    if (Number.isNaN(valor.getTime())) {
        return "Não informado";
    }

    return valor.toLocaleString("pt-BR");
}

function escaparCSV(valor: unknown) {
    const texto = String(valor ?? "");
    return `"${texto.replace(/"/g, '""')}"`;
}

function normalizarCategoria(categoria: string) {
    const nomes: Record<string, string> = {
        saude: "Saúde",
        educacao: "Educação",
        transporte: "Transporte",
        zeladoria: "Zeladoria",
    };

    return nomes[categoria?.toLowerCase()] ?? categoria;
}

export default function DadosAbertosPage() {
    const [servicos, setServicos] = useState<Servico[]>([]);
    const [busca, setBusca] = useState("");
    const [filtroCategoria, setFiltroCategoria] = useState("TODAS");
    const [carregando, setCarregando] = useState(true);
    const [erro, setErro] = useState("");
    const [ultimaAtualizacao, setUltimaAtualizacao] = useState<Date | null>(
        null,
    );

    async function carregarDados() {
        setCarregando(true);
        setErro("");

        try {
            const response = await fetch(`${API_URL}/services`, {
                method: "GET",
                cache: "no-store",
            });

            if (!response.ok) {
                throw new Error(
                    "A API não conseguiu disponibilizar os serviços.",
                );
            }

            const dados = await response.json();

            if (!Array.isArray(dados)) {
                throw new Error("Formato de dados inválido.");
            }

            setServicos(dados);
            setUltimaAtualizacao(new Date());
        } catch (error) {
            setErro(
                error instanceof Error
                    ? error.message
                    : "Erro ao consultar a API.",
            );
        } finally {
            setCarregando(false);
        }
    }

    useEffect(() => {
        carregarDados();
    }, []);

    const categorias = useMemo(() => {
        return Array.from(
            new Set(
                servicos
                    .map((item) => item.categoria)
                    .filter(Boolean),
            ),
        );
    }, [servicos]);

    const servicosFiltrados = useMemo(() => {
        const termo = busca.trim().toLowerCase();

        return servicos.filter((item) => {
            const correspondeBusca =
                item.nome.toLowerCase().includes(termo) ||
                item.endereco.toLowerCase().includes(termo) ||
                item.categoria.toLowerCase().includes(termo);

            const correspondeCategoria =
                filtroCategoria === "TODAS" ||
                item.categoria === filtroCategoria;

            return correspondeBusca && correspondeCategoria;
        });
    }, [servicos, busca, filtroCategoria]);

    const totalAvaliacoes = servicos.reduce(
        (soma, item) => soma + Math.max(0, numero(item.totalAvaliacoes)),
        0,
    );

    const mediaGeral =
        totalAvaliacoes > 0
            ? (
                  servicos.reduce((soma, item) => {
                      const quantidade = Math.max(
                          0,
                          numero(item.totalAvaliacoes),
                      );

                      return (
                          soma +
                          (quantidade > 0
                              ? numero(item.mediaNota) * quantidade
                              : 0)
                      );
                  }, 0) / totalAvaliacoes
              ).toFixed(1)
            : "—";

    function baixarCSV() {
        if (servicosFiltrados.length === 0) return;

        const colunas = [
            "ID",
            "Nome",
            "Categoria",
            "Endereco",
            "Esfera",
            "Latitude",
            "Longitude",
            "Media das notas",
            "Total de avaliacoes",
            "Criado em",
        ];

        const linhas = servicosFiltrados.map((item) => [
            item.id,
            item.nome,
            normalizarCategoria(item.categoria),
            item.endereco,
            item.esfera,
            item.latitude ?? "",
            item.longitude ?? "",
            numero(item.totalAvaliacoes) > 0
                ? numero(item.mediaNota).toFixed(1)
                : "",
            item.totalAvaliacoes,
            item.created_at ?? "",
        ]);

        const conteudo = [
            colunas.map(escaparCSV).join(";"),
            ...linhas.map((linha) => linha.map(escaparCSV).join(";")),
        ].join("\r\n");

        const arquivo = new Blob(
            ["\uFEFF", conteudo],
            { type: "text/csv;charset=utf-8;" },
        );

        const url = URL.createObjectURL(arquivo);
        const link = document.createElement("a");

        link.href = url;
        link.download = "guia-cidadao-dados-abertos.csv";
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        URL.revokeObjectURL(url);
    }

    return (
        <main className="mx-auto max-w-7xl space-y-10 px-4 py-10 sm:px-6 lg:px-8">
            {/* Cabeçalho */}
            <header className="rounded-3xl bg-slate-900 p-8 text-white shadow-sm sm:p-10">
                <span className="inline-flex rounded-full bg-white/10 px-3 py-1 text-xs font-bold uppercase tracking-wider text-emerald-300">
                    Transparência e Dados Abertos
                </span>

                <h1 className="mt-4 text-3xl font-extrabold sm:text-4xl">
                    Dados Abertos e API
                </h1>

                <p className="mt-4 max-w-3xl text-sm leading-7 text-slate-300 sm:text-base">
                    Consulte os dados dos serviços públicos cadastrados no
                    Guia Cidadão. A plataforma disponibiliza informações
                    por meio de endpoints públicos para consulta e análise.
                </p>

                <div className="mt-7 flex flex-wrap gap-3">
                    <a
                        href={`${API_URL}/services`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="rounded-xl bg-emerald-500 px-5 py-3 text-sm font-bold text-slate-950 transition hover:bg-emerald-400"
                    >
                        Consultar API JSON
                    </a>

                    <button
                        type="button"
                        onClick={baixarCSV}
                        disabled={servicosFiltrados.length === 0}
                        className="rounded-xl border border-white/30 px-5 py-3 text-sm font-bold text-white transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                        Exportar CSV
                    </button>
                </div>
            </header>

            {/* Indicadores */}
            <section className="grid grid-cols-2 gap-4 lg:grid-cols-4">
                <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                    <p className="text-xs font-bold uppercase tracking-wide text-slate-500">
                        Serviços publicados
                    </p>
                    <p className="mt-3 text-3xl font-extrabold text-slate-900">
                        {carregando ? "—" : servicos.length}
                    </p>
                </div>

                <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                    <p className="text-xs font-bold uppercase tracking-wide text-slate-500">
                        Avaliações
                    </p>
                    <p className="mt-3 text-3xl font-extrabold text-slate-900">
                        {carregando ? "—" : totalAvaliacoes}
                    </p>
                </div>

                <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                    <p className="text-xs font-bold uppercase tracking-wide text-slate-500">
                        Média das avaliações
                    </p>
                    <p className="mt-3 text-3xl font-extrabold text-slate-900">
                        {carregando ? "—" : mediaGeral}
                    </p>
                </div>

                <div className="rounded-2xl border border-emerald-100 bg-emerald-50 p-5">
                    <p className="text-xs font-bold uppercase tracking-wide text-emerald-700">
                        API pública
                    </p>
                    <p className="mt-3 text-2xl font-extrabold text-emerald-800">
                        REST / JSON
                    </p>
                </div>
            </section>

            {/* Endpoints */}
            <section>
                <div className="mb-5">
                    <h2 className="text-2xl font-extrabold text-slate-900">
                        Endpoints disponíveis
                    </h2>
                    <p className="mt-1 text-sm text-slate-500">
                        Rotas públicas identificadas na implementação atual
                        do backend.
                    </p>
                </div>

                <div className="space-y-4">
                    <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                        <div className="flex flex-wrap items-center gap-2">
                            <span className="rounded-md bg-emerald-100 px-2.5 py-1 text-xs font-extrabold text-emerald-800">
                                GET
                            </span>
                            <span className="font-mono text-sm font-bold text-slate-800">
                                /services
                            </span>
                            <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs text-slate-600">
                                Público
                            </span>
                        </div>

                        <p className="mt-3 text-sm leading-6 text-slate-600">
                            Lista os serviços públicos cadastrados, incluindo
                            nome, endereço, categoria, esfera administrativa,
                            coordenadas e indicadores de avaliação.
                        </p>

                        <a
                            href={`${API_URL}/services`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="mt-3 inline-flex text-sm font-bold text-blue-700 hover:underline"
                        >
                            Abrir endpoint →
                        </a>
                    </article>

                    <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                        <div className="flex flex-wrap items-center gap-2">
                            <span className="rounded-md bg-emerald-100 px-2.5 py-1 text-xs font-extrabold text-emerald-800">
                                GET
                            </span>
                            <span className="font-mono text-sm font-bold text-slate-800">
                                /reviews/service/:serviceId
                            </span>
                            <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs text-slate-600">
                                Público
                            </span>
                        </div>

                        <p className="mt-3 text-sm leading-6 text-slate-600">
                            Consulta as avaliações publicadas de um serviço
                            específico. A resposta inclui nota, comentário,
                            data e eventual resposta institucional, preservando
                            a identificação pública de avaliações anônimas.
                        </p>

                        <p className="mt-3 text-xs text-slate-500">
                            Substitua <code>:serviceId</code> pelo identificador
                            de um serviço cadastrado.
                        </p>
                    </article>
                </div>
            </section>

            {/* Dados publicados */}
            <section>
                <div className="mb-5 flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
                    <div>
                        <h2 className="text-2xl font-extrabold text-slate-900">
                            Catálogo de dados
                        </h2>
                        <p className="mt-1 text-sm text-slate-500">
                            Dados retornados diretamente pela API do projeto.
                        </p>
                    </div>

                    <span className="text-xs text-slate-500">
                        {ultimaAtualizacao
                            ? `Atualizado em ${formatarData(ultimaAtualizacao.toISOString())}`
                            : "Aguardando consulta"}
                    </span>
                </div>

                <div className="mb-5 grid gap-3 sm:grid-cols-[1fr_220px]">
                    <input
                        type="search"
                        value={busca}
                        onChange={(event) => setBusca(event.target.value)}
                        placeholder="Pesquisar por nome, endereço ou categoria..."
                        aria-label="Pesquisar serviços"
                        className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-800 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                    />

                    <select
                        value={filtroCategoria}
                        onChange={(event) =>
                            setFiltroCategoria(event.target.value)
                        }
                        aria-label="Filtrar categoria"
                        className="rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-800 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                    >
                        <option value="TODAS">Todas as categorias</option>
                        {categorias.map((categoria) => (
                            <option key={categoria} value={categoria}>
                                {normalizarCategoria(categoria)}
                            </option>
                        ))}
                    </select>
                </div>

                {erro && (
                    <div className="mb-5 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
                        {erro}
                        <button
                            type="button"
                            onClick={carregarDados}
                            className="ml-2 font-bold underline"
                        >
                            Tentar novamente
                        </button>
                    </div>
                )}

                {carregando ? (
                    <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center text-sm text-slate-500">
                        Consultando dados da API...
                    </div>
                ) : servicosFiltrados.length === 0 ? (
                    <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-10 text-center">
                        <p className="font-bold text-slate-800">
                            Nenhum serviço encontrado.
                        </p>
                        <p className="mt-2 text-sm text-slate-500">
                            Altere os filtros ou consulte novamente a API.
                        </p>
                    </div>
                ) : (
                    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                        <div className="overflow-x-auto">
                            <table className="w-full min-w-[760px] text-left text-sm">
                                <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                                    <tr>
                                        <th className="px-5 py-4">Serviço</th>
                                        <th className="px-5 py-4">Categoria</th>
                                        <th className="px-5 py-4">Esfera</th>
                                        <th className="px-5 py-4">Avaliações</th>
                                        <th className="px-5 py-4">Média</th>
                                        <th className="px-5 py-4">Detalhes</th>
                                    </tr>
                                </thead>

                                <tbody className="divide-y divide-slate-100">
                                    {servicosFiltrados.map((item) => (
                                        <tr
                                            key={item.id}
                                            className="transition hover:bg-slate-50"
                                        >
                                            <td className="px-5 py-4">
                                                <p className="font-bold text-slate-900">
                                                    {item.nome}
                                                </p>
                                                <p className="mt-1 text-xs text-slate-500">
                                                    {item.endereco}
                                                </p>
                                            </td>

                                            <td className="px-5 py-4 text-slate-600">
                                                {normalizarCategoria(
                                                    item.categoria,
                                                )}
                                            </td>

                                            <td className="px-5 py-4 text-slate-600">
                                                {item.esfera}
                                            </td>

                                            <td className="px-5 py-4 text-slate-600">
                                                {item.totalAvaliacoes}
                                            </td>

                                            <td className="px-5 py-4 font-bold text-slate-800">
                                                {numero(item.totalAvaliacoes) > 0
                                                    ? numero(
                                                          item.mediaNota,
                                                      ).toFixed(1)
                                                    : "—"}
                                            </td>

                                            <td className="px-5 py-4">
                                                <Link
                                                    href={`/servicos/${item.id}`}
                                                    className="font-semibold text-blue-700 hover:underline"
                                                >
                                                    Consultar
                                                </Link>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        <div className="border-t border-slate-100 bg-slate-50 px-5 py-3 text-xs text-slate-500">
                            Exibindo {servicosFiltrados.length} de{" "}
                            {servicos.length} serviços.
                        </div>
                    </div>
                )}
            </section>

            {/* Dicionário de dados */}
            <section>
                <h2 className="text-2xl font-extrabold text-slate-900">
                    Dicionário de dados
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                    Principais campos disponibilizados pelo endpoint de
                    serviços.
                </p>

                <div className="mt-5 overflow-hidden rounded-2xl border border-slate-200 bg-white">
                    <div className="divide-y divide-slate-100">
                        {[
                            ["id", "Identificador único do serviço."],
                            ["nome", "Nome do equipamento ou serviço público."],
                            ["categoria", "Classificação do serviço."],
                            ["endereco", "Endereço cadastrado."],
                            ["esfera", "Esfera administrativa: municipal, estadual ou federal."],
                            ["latitude", "Coordenada geográfica de latitude, quando cadastrada."],
                            ["longitude", "Coordenada geográfica de longitude, quando cadastrada."],
                            ["mediaNota", "Média das notas recebidas pelo serviço."],
                            ["totalAvaliacoes", "Quantidade de avaliações registradas."],
                            ["created_at", "Data de criação do cadastro."],
                            ["updated_at", "Data da última atualização."],
                        ].map(([campo, descricao]) => (
                            <div
                                key={campo}
                                className="grid gap-1 px-5 py-3 sm:grid-cols-[180px_1fr] sm:gap-4"
                            >
                                <code className="text-sm font-bold text-blue-800">
                                    {campo}
                                </code>
                                <p className="text-sm text-slate-600">
                                    {descricao}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Privacidade */}
            <section className="rounded-2xl border border-amber-200 bg-amber-50 p-6">
                <h2 className="text-lg font-bold text-amber-900">
                    Dados protegidos e privacidade
                </h2>

                <p className="mt-2 text-sm leading-6 text-amber-900">
                    Nem todas as informações da plataforma são dados abertos.
                    Dados pessoais de usuários, manifestações individuais da
                    Ouvidoria, denúncias e informações administrativas
                    restritas exigem autenticação e controle de acesso.
                    Esta página disponibiliza apenas informações acessíveis
                    pelas rotas públicas identificadas no backend.
                </p>

                <Link
                    href="/privacidade"
                    className="mt-3 inline-flex text-sm font-bold text-amber-900 underline"
                >
                    Consultar Aviso de Privacidade
                </Link>
            </section>

            <div className="flex flex-wrap gap-3 border-t border-slate-200 pt-6">
                <Link
                    href="/"
                    className="rounded-xl border border-slate-200 px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                >
                    Voltar ao início
                </Link>

                <Link
                    href="/painel"
                    className="rounded-xl bg-blue-700 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-800"
                >
                    Painel de Transparência
                </Link>
            </div>
        </main>
    );
}