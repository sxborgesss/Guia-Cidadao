"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { API_URL } from "@/lib/api";

interface Usuario {
    id: string;
    nome: string;
    email: string;
    role: string;
}

interface Servico {
    id: string;
    nome: string;
    categoria: string;
    endereco: string;
    esfera: string;
    latitude: number | string | null;
    longitude: number | string | null;
    mediaNota?: number | string;
    totalAvaliacoes?: number | string;
}

interface FormularioServico {
    nome: string;
    categoria: string;
    endereco: string;
    esfera: string;
    latitude: string;
    longitude: string;
}

const FORMULARIO_INICIAL: FormularioServico = {
    nome: "",
    categoria: "saude",
    endereco: "",
    esfera: "Municipal",
    latitude: "",
    longitude: "",
};

const CATEGORIAS = [
    { value: "saude", label: "Saúde" },
    { value: "educacao", label: "Educação" },
    { value: "transporte", label: "Transporte" },
    { value: "zeladoria", label: "Zeladoria" },
];

const ESFERAS = ["Municipal", "Estadual", "Federal"];

function converterCoordenada(
    valor: number | string | null | undefined,
): string {
    if (valor === null || valor === undefined || valor === "") {
        return "";
    }

    return String(valor);
}

function validarCoordenada(
    valor: string,
    minimo: number,
    maximo: number,
    nome: string,
): string | null {
    if (!valor.trim()) return null;

    const numero = Number(valor);

    if (!Number.isFinite(numero) || numero < minimo || numero > maximo) {
        return `${nome} deve estar entre ${minimo} e ${maximo}.`;
    }

    return null;
}

async function mensagemErro(response: Response) {
    try {
        const dados = await response.json();

        if (Array.isArray(dados.message)) {
            return dados.message.join(", ");
        }

        if (typeof dados.message === "string") {
            return dados.message;
        }
    } catch {
        // Mantém a mensagem padrão.
    }

    if (response.status === 401) {
        return "Sua sessão expirou. Entre novamente.";
    }

    if (response.status === 403) {
        return "Você não possui permissão para editar serviços.";
    }

    if (response.status === 404) {
        return "Serviço não encontrado.";
    }

    return "Não foi possível concluir a operação.";
}

export default function AdminServicosPage() {
    const router = useRouter();

    const [usuario, setUsuario] = useState<Usuario | null>(null);
    const [servicos, setServicos] = useState<Servico[]>([]);

    const [formulario, setFormulario] =
        useState<FormularioServico>(FORMULARIO_INICIAL);

    const [servicoSelecionado, setServicoSelecionado] =
        useState<string | null>(null);

    const [busca, setBusca] = useState("");

    const [carregando, setCarregando] = useState(true);
    const [salvando, setSalvando] = useState(false);

    const [erro, setErro] = useState("");
    const [sucesso, setSucesso] = useState("");

    async function carregarServicos() {
        try {
            const response = await fetch(
                `${API_URL}/services`,
                {
                    method: "GET",
                    cache: "no-store",
                },
            );

            if (!response.ok) {
                throw new Error("Não foi possível carregar os serviços.");
            }

            const dados: Servico[] = await response.json();

            setServicos(Array.isArray(dados) ? dados : []);
        } catch (error) {
            setErro(
                error instanceof Error
                    ? error.message
                    : "Erro ao carregar os serviços.",
            );
        }
    }

    useEffect(() => {
        const rawUser = localStorage.getItem("user");
        const token = localStorage.getItem("token");

        if (!rawUser || !token) {
            router.replace("/login");
            return;
        }

        try {
            const usuarioSalvo: Usuario = JSON.parse(rawUser);

            if (usuarioSalvo.role !== "ADMIN") {
                router.replace("/");
                return;
            }

            setUsuario(usuarioSalvo);

            carregarServicos().finally(() => {
                setCarregando(false);
            });
        } catch {
            router.replace("/login");
        }
    }, [router]);

    function iniciarEdicao(servico: Servico) {
        setServicoSelecionado(servico.id);

        setFormulario({
            nome: servico.nome ?? "",
            categoria: servico.categoria ?? "saude",
            endereco: servico.endereco ?? "",
            esfera: servico.esfera ?? "Municipal",
            latitude: converterCoordenada(servico.latitude),
            longitude: converterCoordenada(servico.longitude),
        });

        setErro("");
        setSucesso("");

        window.scrollTo({
            top: 0,
            behavior: "smooth",
        });
    }

    function cancelarEdicao() {
        setServicoSelecionado(null);
        setFormulario(FORMULARIO_INICIAL);
        setErro("");
        setSucesso("");
    }

    function alterarCampo(
        campo: keyof FormularioServico,
        valor: string,
    ) {
        setFormulario((anterior) => ({
            ...anterior,
            [campo]: valor,
        }));
    }

    async function salvarEdicao(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();

        setErro("");
        setSucesso("");

        if (!servicoSelecionado) {
            setErro("Selecione um serviço para editar.");
            return;
        }

        if (!formulario.nome.trim() || !formulario.endereco.trim()) {
            setErro("Preencha o nome e o endereço do serviço.");
            return;
        }

        if (!formulario.categoria || !formulario.esfera) {
            setErro("Selecione a categoria e a esfera administrativa.");
            return;
        }

        const erroLatitude = validarCoordenada(
            formulario.latitude,
            -90,
            90,
            "Latitude",
        );

        const erroLongitude = validarCoordenada(
            formulario.longitude,
            -180,
            180,
            "Longitude",
        );

        if (erroLatitude || erroLongitude) {
            setErro(erroLatitude || erroLongitude || "Coordenadas inválidas.");
            return;
        }

        const token = localStorage.getItem("token");

        if (!token) {
            router.replace("/login");
            return;
        }

        setSalvando(true);

        try {
            const response = await fetch(
                `${API_URL}/services/${servicoSelecionado}`,
                {
                    method: "PATCH",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`,
                    },
                    body: JSON.stringify({
                        nome: formulario.nome.trim(),
                        categoria: formulario.categoria,
                        endereco: formulario.endereco.trim(),
                        esfera: formulario.esfera,
                        latitude: formulario.latitude.trim()
                            ? Number(formulario.latitude)
                            : null,
                        longitude: formulario.longitude.trim()
                            ? Number(formulario.longitude)
                            : null,
                    }),
                },
            );

            if (!response.ok) {
                throw new Error(await mensagemErro(response));
            }

            setSucesso("Serviço atualizado com sucesso!");

            await carregarServicos();

            setServicoSelecionado(null);
            setFormulario(FORMULARIO_INICIAL);
        } catch (error) {
            setErro(
                error instanceof Error
                    ? error.message
                    : "Não foi possível atualizar o serviço.",
            );
        } finally {
            setSalvando(false);
        }
    }

    const servicosFiltrados = servicos.filter((servico) => {
        const termo = busca.trim().toLowerCase();

        return (
            servico.nome.toLowerCase().includes(termo) ||
            servico.endereco.toLowerCase().includes(termo) ||
            servico.categoria.toLowerCase().includes(termo)
        );
    });

    if (carregando) {
        return (
            <main className="flex min-h-[60vh] items-center justify-center">
                <p className="text-sm font-semibold text-slate-500">
                    Carregando gerenciamento de serviços...
                </p>
            </main>
        );
    }

    return (
        <main className="mx-auto max-w-7xl space-y-8 px-4 py-10 sm:px-6 lg:px-8">
            {/* Cabeçalho */}
            <header className="flex flex-col justify-between gap-4 border-b border-slate-200 pb-6 sm:flex-row sm:items-center">
                <div>
                    <span className="rounded-md bg-rose-100 px-3 py-1 text-xs font-bold text-rose-800">
                        Área administrativa
                    </span>

                    <h1 className="mt-3 text-3xl font-extrabold text-slate-900">
                        Gerenciar serviços públicos
                    </h1>

                    <p className="mt-2 text-sm text-slate-500">
                        Edite informações, endereços e coordenadas dos
                        equipamentos públicos cadastrados.
                    </p>

                    {usuario && (
                        <p className="mt-2 text-xs text-slate-500">
                            Administrador: {usuario.nome}
                        </p>
                    )}
                </div>

                <Link
                    href="/admin"
                    className="inline-flex items-center justify-center rounded-xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                >
                    Voltar ao painel Admin
                </Link>
            </header>

            {/* Mensagens */}
            {erro && (
                <div
                    role="alert"
                    className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm font-medium text-red-700"
                >
                    {erro}
                </div>
            )}

            {sucesso && (
                <div
                    role="status"
                    className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm font-medium text-emerald-800"
                >
                    {sucesso}
                </div>
            )}

            {/* Formulário de edição */}
            {servicoSelecionado && (
                <section
                    id="formulario-edicao"
                    className="rounded-2xl border border-blue-200 bg-white p-6 shadow-sm sm:p-8"
                >
                    <div className="mb-6">
                        <span className="text-xs font-bold uppercase tracking-wide text-blue-700">
                            Edição de cadastro
                        </span>

                        <h2 className="mt-2 text-xl font-extrabold text-slate-900">
                            Atualizar serviço público
                        </h2>

                        <p className="mt-1 text-sm text-slate-500">
                            Altere os campos desejados e salve as modificações.
                        </p>
                    </div>

                    <form
                        onSubmit={salvarEdicao}
                        className="grid gap-5 md:grid-cols-2"
                    >
                        <div className="md:col-span-2">
                            <label
                                htmlFor="nome"
                                className="mb-2 block text-sm font-semibold text-slate-700"
                            >
                                Nome do serviço
                            </label>

                            <input
                                id="nome"
                                type="text"
                                required
                                maxLength={255}
                                value={formulario.nome}
                                onChange={(event) =>
                                    alterarCampo("nome", event.target.value)
                                }
                                className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                            />
                        </div>

                        <div>
                            <label
                                htmlFor="categoria"
                                className="mb-2 block text-sm font-semibold text-slate-700"
                            >
                                Categoria
                            </label>

                            <select
                                id="categoria"
                                required
                                value={formulario.categoria}
                                onChange={(event) =>
                                    alterarCampo("categoria", event.target.value)
                                }
                                className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                            >
                                {CATEGORIAS.map((categoria) => (
                                    <option
                                        key={categoria.value}
                                        value={categoria.value}
                                    >
                                        {categoria.label}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label
                                htmlFor="esfera"
                                className="mb-2 block text-sm font-semibold text-slate-700"
                            >
                                Esfera administrativa
                            </label>

                            <select
                                id="esfera"
                                required
                                value={formulario.esfera}
                                onChange={(event) =>
                                    alterarCampo("esfera", event.target.value)
                                }
                                className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                            >
                                {ESFERAS.map((esfera) => (
                                    <option key={esfera} value={esfera}>
                                        {esfera}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="md:col-span-2">
                            <label
                                htmlFor="endereco"
                                className="mb-2 block text-sm font-semibold text-slate-700"
                            >
                                Endereço
                            </label>

                            <input
                                id="endereco"
                                type="text"
                                required
                                maxLength={255}
                                value={formulario.endereco}
                                onChange={(event) =>
                                    alterarCampo("endereco", event.target.value)
                                }
                                className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                            />
                        </div>

                        <div>
                            <label
                                htmlFor="latitude"
                                className="mb-2 block text-sm font-semibold text-slate-700"
                            >
                                Latitude
                            </label>

                            <input
                                id="latitude"
                                type="number"
                                step="any"
                                min="-90"
                                max="90"
                                value={formulario.latitude}
                                onChange={(event) =>
                                    alterarCampo("latitude", event.target.value)
                                }
                                placeholder="Ex.: -10.1844"
                                className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                            />

                            <p className="mt-1 text-xs text-slate-400">
                                Deixe vazio para remover a latitude.
                            </p>
                        </div>

                        <div>
                            <label
                                htmlFor="longitude"
                                className="mb-2 block text-sm font-semibold text-slate-700"
                            >
                                Longitude
                            </label>

                            <input
                                id="longitude"
                                type="number"
                                step="any"
                                min="-180"
                                max="180"
                                value={formulario.longitude}
                                onChange={(event) =>
                                    alterarCampo("longitude", event.target.value)
                                }
                                placeholder="Ex.: -48.3336"
                                className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                            />

                            <p className="mt-1 text-xs text-slate-400">
                                Deixe vazio para remover a longitude.
                            </p>
                        </div>

                        <div className="mt-2 flex flex-col-reverse gap-3 border-t border-slate-100 pt-5 sm:flex-row sm:justify-end md:col-span-2">
                            <button
                                type="button"
                                onClick={cancelarEdicao}
                                disabled={salvando}
                                className="rounded-xl border border-slate-300 px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:opacity-50"
                            >
                                Cancelar
                            </button>

                            <button
                                type="submit"
                                disabled={salvando}
                                className="rounded-xl bg-blue-700 px-6 py-3 text-sm font-bold text-white transition hover:bg-blue-800 disabled:cursor-not-allowed disabled:opacity-60"
                            >
                                {salvando
                                    ? "Salvando alterações..."
                                    : "Salvar alterações"}
                            </button>
                        </div>
                    </form>
                </section>
            )}

            {/* Lista de serviços */}
            <section>
                <div className="mb-5 flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
                    <div>
                        <h2 className="text-2xl font-extrabold text-slate-900">
                            Serviços cadastrados
                        </h2>

                        <p className="mt-1 text-sm text-slate-500">
                            Selecione um serviço para alterar seu cadastro.
                        </p>
                    </div>

                    <span className="text-sm font-semibold text-slate-500">
                        {servicos.length}{" "}
                        {servicos.length === 1 ? "serviço" : "serviços"}
                    </span>
                </div>

                <input
                    type="search"
                    value={busca}
                    onChange={(event) => setBusca(event.target.value)}
                    placeholder="Pesquisar por nome, endereço ou categoria..."
                    aria-label="Pesquisar serviços cadastrados"
                    className="mb-5 w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                />

                {servicosFiltrados.length === 0 ? (
                    <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-10 text-center">
                        <p className="font-bold text-slate-800">
                            Nenhum serviço encontrado.
                        </p>
                        <p className="mt-2 text-sm text-slate-500">
                            Verifique sua pesquisa ou cadastre um novo serviço.
                        </p>
                    </div>
                ) : (
                    <div className="grid gap-4 md:grid-cols-2">
                        {servicosFiltrados.map((servico) => {
                            const estaEditando =
                                servicoSelecionado === servico.id;

                            const temCoordenadas =
                                servico.latitude !== null &&
                                servico.latitude !== undefined &&
                                servico.longitude !== null &&
                                servico.longitude !== undefined;

                            return (
                                <article
                                    key={servico.id}
                                    className={`rounded-2xl border bg-white p-5 shadow-sm transition ${
                                        estaEditando
                                            ? "border-blue-400 ring-2 ring-blue-100"
                                            : "border-slate-200 hover:border-blue-200"
                                    }`}
                                >
                                    <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-start">
                                        <div>
                                            <h3 className="font-bold text-slate-900">
                                                {servico.nome}
                                            </h3>

                                            <p className="mt-1 text-sm text-slate-500">
                                                {servico.endereco}
                                            </p>
                                        </div>

                                        <span className="w-fit rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
                                            {servico.esfera}
                                        </span>
                                    </div>

                                    <div className="mt-4 grid grid-cols-2 gap-3">
                                        <div>
                                            <p className="text-xs font-semibold uppercase text-slate-400">
                                                Categoria
                                            </p>
                                            <p className="mt-1 text-sm font-semibold text-slate-700">
                                                {servico.categoria}
                                            </p>
                                        </div>

                                        <div>
                                            <p className="text-xs font-semibold uppercase text-slate-400">
                                                Coordenadas
                                            </p>
                                            <p className="mt-1 text-sm font-semibold text-slate-700">
                                                {temCoordenadas
                                                    ? "Cadastradas"
                                                    : "Ausentes"}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-4">
                                        <span className="text-xs text-slate-500">
                                            {Number(servico.totalAvaliacoes ?? 0)}{" "}
                                            avaliações
                                        </span>

                                        <button
                                            type="button"
                                            onClick={() =>
                                                estaEditando
                                                    ? cancelarEdicao()
                                                    : iniciarEdicao(servico)
                                            }
                                            className={`rounded-xl px-4 py-2.5 text-xs font-bold transition ${
                                                estaEditando
                                                    ? "border border-slate-200 text-slate-700 hover:bg-slate-50"
                                                    : "bg-blue-700 text-white hover:bg-blue-800"
                                            }`}
                                        >
                                            {estaEditando
                                                ? "Fechar edição"
                                                : "Editar serviço"}
                                        </button>
                                    </div>
                                </article>
                            );
                        })}
                    </div>
                )}
            </section>
        </main>
    );
}
