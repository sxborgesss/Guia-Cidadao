
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { API_URL } from "@/lib/api";

interface UserData {
    id: string;
    nome: string;
    email: string;
    role: string;
}

interface PublicService {
    id: string;
    nome: string;
    categoria: string;
    endereco: string;
    mediaNota: number;
    totalAvaliacoes: number;
    created_at: string;
}

interface ReviewData {
    id: string;
    nota: number;
    comentario: string;
    service_id: string;
    isAnonimo: boolean;
    created_at: string;
    user?: {
        nome?: string;
    };
    service?: {
        id: string;
        nome: string;
    };
    respostaInstitucional?: {
        id: string;
        resposta: string;
        created_at: string;
    } | null;
}

type ReportStatus = "PENDENTE" | "ANALISADA" | "DESCARTADA";

interface ReportData {
    id: string;
    motivo: string;
    descricao: string | null;
    status: ReportStatus;
    created_at: string;
    review: ReviewData | null;
    reporter?: {
        id: string;
        nome: string;
    };
}

interface MensagemVinculo {
    tipo: "erro" | "sucesso";
    texto: string;
}

function formatarData(data: string) {
    if (!data) return "Data não disponível";

    const dataFormatada = new Date(data);

    if (Number.isNaN(dataFormatada.getTime())) {
        return "Data não disponível";
    }

    return dataFormatada.toLocaleDateString("pt-BR", {
        day: "2-digit",
        month: "long",
        year: "numeric",
    });
}

export default function AdminPage() {
    const router = useRouter();

    const [user, setUser] = useState<UserData | null>(null);
    const [carregando, setCarregando] = useState(true);

    // Abas principais
    const [abaAtiva, setAbaAtiva] = useState<
        "servicos" | "gestores" | "feedbacks"
    >("servicos");

    const [gestores, setGestores] = useState<UserData[]>([]);
    const [carregandoGestores, setCarregandoGestores] = useState(false);
    const [servicos, setServicos] = useState<PublicService[]>([]);
    const [salvando, setSalvando] = useState(false);

    // Serviços vinculados aos gestores
    const [servicosDosGestores, setServicosDosGestores] = useState<
        Record<string, PublicService[]>
    >({});

    const [servicoSelecionado, setServicoSelecionado] = useState<
        Record<string, string>
    >({});

    const [operacaoGestor, setOperacaoGestor] = useState<string | null>(null);

    const [mensagensVinculo, setMensagensVinculo] = useState<
        Record<string, MensagemVinculo>
    >({});

    // Moderação de avaliações
    const [avaliacoes, setAvaliacoes] = useState<ReviewData[]>([]);
    const [carregandoAvaliacoes, setCarregandoAvaliacoes] = useState(false);
    const [removendoAvaliacao, setRemovendoAvaliacao] = useState<string | null>(
        null
    );
    const [erroModeracao, setErroModeracao] = useState<string | null>(null);
    const [sucessoModeracao, setSucessoModeracao] = useState<string | null>(
        null
    );

    // Moderação de denúncias
    const [abaModeracao, setAbaModeracao] = useState<
        "avaliacoes" | "denuncias"
    >("avaliacoes");

    const [denuncias, setDenuncias] = useState<ReportData[]>([]);
    const [carregandoDenuncias, setCarregandoDenuncias] = useState(false);
    const [erroDenuncias, setErroDenuncias] = useState<string | null>(null);
    const [sucessoDenuncias, setSucessoDenuncias] = useState<string | null>(
        null
    );

    const [filtroDenuncia, setFiltroDenuncia] = useState<
        "TODAS" | ReportStatus
    >("TODAS");

    const [atualizandoDenuncia, setAtualizandoDenuncia] = useState<
        string | null
    >(null);

    // Formulário de serviço
    const [nome, setNome] = useState("");
    const [categoria, setCategoria] = useState("saude");
    const [endereco, setEndereco] = useState("");
    const [esfera, setEsfera] = useState("Municipal");
    const [latitude, setLatitude] = useState("");
    const [longitude, setLongitude] = useState("");

    // Formulário de gestor
    const [nomeGestor, setNomeGestor] = useState("");
    const [emailGestor, setEmailGestor] = useState("");
    const [senhaGestor, setSenhaGestor] = useState("");
    const [confirmarSenhaGestor, setConfirmarSenhaGestor] = useState("");
    const [cadastrandoGestor, setCadastrandoGestor] = useState(false);
    const [erroGestor, setErroGestor] = useState<string | null>(null);
    const [sucessoGestor, setSucessoGestor] = useState<string | null>(null);

    // Requisitos da senha para criação de gestores
    const requisitosSenhaGestor = [
        {
            texto: "Entre 8 e 64 caracteres",
            valido: senhaGestor.length >= 8 && senhaGestor.length <= 64,
        },
        {
            texto: "Uma letra maiúscula",
            valido: /[A-Z]/.test(senhaGestor),
        },
        {
            texto: "Uma letra minúscula",
            valido: /[a-z]/.test(senhaGestor),
        },
        {
            texto: "Pelo menos um número",
            valido: /\d/.test(senhaGestor),
        },
        {
            texto: "Um caractere especial (!@#$...)",
            valido: /[^A-Za-z0-9\s]/.test(senhaGestor),
        },
        {
            texto: "Não conter espaços",
            valido: senhaGestor.length > 0 && !/\s/.test(senhaGestor),
        },
    ];

    const senhaGestorValida = requisitosSenhaGestor.every(
        (requisito) => requisito.valido,
    );

    const senhasGestorCoincidem =
        confirmarSenhaGestor.length > 0 &&
        senhaGestor === confirmarSenhaGestor;

    // Carregar serviços
    const carregarServicos = async () => {
        try {
            const response = await fetch(`${API_URL}/services`);

            if (!response.ok) {
                throw new Error("Erro ao carregar serviços.");
            }

            const data = await response.json();

            setServicos(Array.isArray(data) ? data : []);
        } catch (error) {
            console.error("Erro ao buscar serviços:", error);
        }
    };

    // Carregar serviços de um gestor
    const carregarServicosDoGestor = async (
        gestorId: string,
        token: string
    ) => {
        const response = await fetch(
            `${API_URL}/users/gestores/${gestorId}/servicos`,
            {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            }
        );

        if (!response.ok) {
            throw new Error(
                "Não foi possível carregar os serviços do gestor."
            );
        }

        const data = await response.json();

        setServicosDosGestores((anteriores) => ({
            ...anteriores,
            [gestorId]: Array.isArray(data) ? data : [],
        }));
    };

    // Carregar gestores e seus vínculos
    const carregarGestores = async () => {
        const token = localStorage.getItem("token");

        if (!token) return;

        setCarregandoGestores(true);

        try {
            const response = await fetch(
                `${API_URL}/users/gestores`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            if (!response.ok) {
                throw new Error("Erro ao carregar gestores.");
            }

            const data: UserData[] = await response.json();
            const listaGestores = Array.isArray(data) ? data : [];

            setGestores(listaGestores);

            const vinculos = await Promise.all(
                listaGestores.map(async (gestor) => {
                    try {
                        const res = await fetch(
                            `${API_URL}/users/gestores/${gestor.id}/servicos`,
                            {
                                headers: {
                                    Authorization: `Bearer ${token}`,
                                },
                            }
                        );

                        if (!res.ok) {
                            return [gestor.id, []] as const;
                        }

                        const dados = await res.json();

                        return [
                            gestor.id,
                            Array.isArray(dados) ? dados : [],
                        ] as const;
                    } catch {
                        return [gestor.id, []] as const;
                    }
                })
            );

            setServicosDosGestores(Object.fromEntries(vinculos));
        } catch (error) {
            console.error("Erro ao carregar gestores:", error);
        } finally {
            setCarregandoGestores(false);
        }
    };

    // Carregar avaliações para moderação
    const carregarAvaliacoes = async () => {
        const token = localStorage.getItem("token");

        if (!token) {
            router.push("/login");
            return;
        }

        setCarregandoAvaliacoes(true);
        setErroModeracao(null);

        try {
            const response = await fetch(
                `${API_URL}/reviews/admin/todas`,
                {
                    method: "GET",
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            if (response.status === 401) {
                throw new Error("Sua sessão expirou. Entre novamente.");
            }

            if (response.status === 403) {
                throw new Error(
                    "Você não possui permissão para moderar avaliações."
                );
            }

            if (!response.ok) {
                throw new Error(
                    "Não foi possível carregar as avaliações."
                );
            }

            const data: ReviewData[] = await response.json();

            setAvaliacoes(Array.isArray(data) ? data : []);
        } catch (error) {
            setErroModeracao(
                error instanceof Error
                    ? error.message
                    : "Erro inesperado ao carregar avaliações."
            );
        } finally {
            setCarregandoAvaliacoes(false);
        }
    };

    // Carregar denúncias
    const carregarDenuncias = async () => {
        const token = localStorage.getItem("token");

        if (!token) {
            router.push("/login");
            return;
        }

        setCarregandoDenuncias(true);
        setErroDenuncias(null);
        setSucessoDenuncias(null);

        try {
            const response = await fetch(
                `${API_URL}/reviews/admin/denuncias`,
                {
                    method: "GET",
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            if (response.status === 401) {
                throw new Error("Sua sessão expirou. Entre novamente.");
            }

            if (response.status === 403) {
                throw new Error(
                    "Você não possui permissão para consultar denúncias."
                );
            }

            if (!response.ok) {
                throw new Error("Não foi possível carregar as denúncias.");
            }

            const data: ReportData[] = await response.json();

            setDenuncias(Array.isArray(data) ? data : []);
        } catch (error) {
            setErroDenuncias(
                error instanceof Error
                    ? error.message
                    : "Erro inesperado ao carregar denúncias."
            );
        } finally {
            setCarregandoDenuncias(false);
        }
    };

    // Carregar gestores quando a aba for selecionada
    useEffect(() => {
        if (abaAtiva === "gestores") {
            carregarGestores();
        }

        if (abaAtiva === "feedbacks") {
            if (abaModeracao === "avaliacoes") {
                carregarAvaliacoes();
            } else {
                carregarDenuncias();
            }
        }
    }, [abaAtiva, abaModeracao]);

    // Verificar autenticação administrativa e carregar dados iniciais
    useEffect(() => {
        const rawUser = localStorage.getItem("user");
        const token = localStorage.getItem("token");

        if (!rawUser || !token) {
            router.push("/login");
            return;
        }

        try {
            const parsedUser: UserData = JSON.parse(rawUser);

            if (parsedUser.role !== "ADMIN") {
                alert("Acesso restrito a administradores.");
                router.push("/");
                return;
            }

            setUser(parsedUser);

            carregarServicos();
            carregarAvaliacoes();
        } catch {
            router.push("/login");
        } finally {
            setCarregando(false);
        }
    }, [router]);

    // Cadastrar serviço
    const handleCadastrar = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!nome.trim() || !endereco.trim()) {
            alert("Por favor, preencha todos os campos obrigatórios.");
            return;
        }

        setSalvando(true);

        try {
            const token = localStorage.getItem("token");

            if (!token) {
                throw new Error("Sessão expirada. Faça login novamente.");
            }

            const response = await fetch(`${API_URL}/services`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                    nome,
                    categoria,
                    endereco,
                    esfera,
                    latitude: latitude ? parseFloat(latitude) : null,
                    longitude: longitude ? parseFloat(longitude) : null,
                }),
            });

            if (!response.ok) {
                throw new Error(
                    "Falha ao cadastrar equipamento público."
                );
            }

            setNome("");
            setEndereco("");
            setCategoria("saude");
            setEsfera("Municipal");
            setLatitude("");
            setLongitude("");

            await carregarServicos();

            alert("Equipamento cadastrado com sucesso!");
        } catch (error) {
            alert(
                error instanceof Error
                    ? error.message
                    : "Erro de conexão com o servidor."
            );
        } finally {
            setSalvando(false);
        }
    };

    // Excluir serviço
    const handleRemover = async (id: string) => {
        if (
            !confirm(
                "Tem certeza que deseja remover este equipamento público?"
            )
        ) {
            return;
        }

        try {
            const token = localStorage.getItem("token");

            if (!token) {
                throw new Error("Sessão expirada. Faça login novamente.");
            }

            const response = await fetch(
                `${API_URL}/services/${id}`,
                {
                    method: "DELETE",
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            if (!response.ok) {
                throw new Error("Erro ao remover serviço.");
            }

            await carregarServicos();
            await carregarGestores();
        } catch (error) {
            alert(
                error instanceof Error
                    ? error.message
                    : "Erro ao conectar com o servidor."
            );
        }
    };

    // Vincular gestor a serviço
    const handleVincularServico = async (gestorId: string) => {
        const serviceId = servicoSelecionado[gestorId];
        const token = localStorage.getItem("token");

        if (!serviceId) {
            setMensagensVinculo((anteriores) => ({
                ...anteriores,
                [gestorId]: {
                    tipo: "erro",
                    texto: "Selecione um serviço para vincular.",
                },
            }));

            return;
        }

        if (!token) {
            router.push("/login");
            return;
        }

        setOperacaoGestor(`vincular-${gestorId}`);

        setMensagensVinculo((anteriores) => {
            const novas = { ...anteriores };
            delete novas[gestorId];
            return novas;
        });

        try {
            const response = await fetch(
                `${API_URL}/users/gestores/${gestorId}/servicos/${serviceId}`,
                {
                    method: "POST",
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            if (!response.ok) {
                const dados = await response.json().catch(() => null);

                const mensagem = Array.isArray(dados?.message)
                    ? dados.message.join(", ")
                    : dados?.message || "Não foi possível vincular o serviço.";

                throw new Error(mensagem);
            }

            await carregarServicosDoGestor(gestorId, token);

            setServicoSelecionado((anteriores) => ({
                ...anteriores,
                [gestorId]: "",
            }));

            setMensagensVinculo((anteriores) => ({
                ...anteriores,
                [gestorId]: {
                    tipo: "sucesso",
                    texto: "Serviço vinculado ao gestor com sucesso!",
                },
            }));
        } catch (error) {
            setMensagensVinculo((anteriores) => ({
                ...anteriores,
                [gestorId]: {
                    tipo: "erro",
                    texto:
                        error instanceof Error
                            ? error.message
                            : "Erro ao vincular serviço.",
                },
            }));
        } finally {
            setOperacaoGestor(null);
        }
    };

    // Desvincular gestor de serviço
    const handleDesvincularServico = async (
        gestorId: string,
        serviceId: string
    ) => {
        if (
            !confirm(
                "Deseja realmente desvincular este serviço do gestor?"
            )
        ) {
            return;
        }

        const token = localStorage.getItem("token");

        if (!token) {
            router.push("/login");
            return;
        }

        setOperacaoGestor(`desvincular-${gestorId}-${serviceId}`);

        setMensagensVinculo((anteriores) => {
            const novas = { ...anteriores };
            delete novas[gestorId];
            return novas;
        });

        try {
            const response = await fetch(
                `${API_URL}/users/gestores/${gestorId}/servicos/${serviceId}`,
                {
                    method: "DELETE",
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            if (!response.ok) {
                const dados = await response.json().catch(() => null);

                const mensagem = Array.isArray(dados?.message)
                    ? dados.message.join(", ")
                    : dados?.message ||
                      "Não foi possível desvincular o serviço.";

                throw new Error(mensagem);
            }

            await carregarServicosDoGestor(gestorId, token);

            setMensagensVinculo((anteriores) => ({
                ...anteriores,
                [gestorId]: {
                    tipo: "sucesso",
                    texto: "Serviço desvinculado com sucesso!",
                },
            }));
        } catch (error) {
            setMensagensVinculo((anteriores) => ({
                ...anteriores,
                [gestorId]: {
                    tipo: "erro",
                    texto:
                        error instanceof Error
                            ? error.message
                            : "Erro ao desvincular serviço.",
                },
            }));
        } finally {
            setOperacaoGestor(null);
        }
    };

    // Cadastrar gestor
    const handleCadastrarGestor = async (e: React.FormEvent) => {
        e.preventDefault();

        setErroGestor(null);
        setSucessoGestor(null);

        if (!senhaGestorValida) {
            setErroGestor(
                "A senha deve ter entre 8 e 64 caracteres, incluindo letra maiúscula, letra minúscula, número e caractere especial, sem espaços.",
            );
            return;
        }

        if (!senhasGestorCoincidem) {
            setErroGestor("As senhas não coincidem.");
            return;
        }

        const token = localStorage.getItem("token");

        if (!token) {
            setErroGestor("Sessão administrativa não encontrada.");
            return;
        }

        setCadastrandoGestor(true);

        try {
            const response = await fetch(
                `${API_URL}/auth/admin/users`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`,
                    },
                    body: JSON.stringify({
                        nome: nomeGestor,
                        email: emailGestor,
                        senha: senhaGestor,
                        role: "GESTOR",
                    }),
                }
            );

            const data = await response.json();

            if (!response.ok) {
                const mensagem = Array.isArray(data.message)
                    ? data.message.join(", ")
                    : data.message || "Erro ao cadastrar gestor.";

                throw new Error(mensagem);
            }

            setSucessoGestor("Gestor cadastrado com sucesso!");

            setNomeGestor("");
            setEmailGestor("");
            setSenhaGestor("");
            setConfirmarSenhaGestor("");

            await carregarGestores();
        } catch (error) {
            setErroGestor(
                error instanceof Error
                    ? error.message
                    : "Erro ao cadastrar gestor."
            );
        } finally {
            setCadastrandoGestor(false);
        }
    };

    // Excluir avaliação
    const handleRemoverAvaliacao = async (reviewId: string) => {
        const avaliacao = avaliacoes.find(
            (item) => item.id === reviewId
        );

        if (!avaliacao) return;

        const confirmado = confirm(
            `Deseja realmente excluir esta avaliação?\n\n` +
            `Serviço: ${avaliacao.service?.nome || "Serviço público"}\n` +
            `Comentário: ${avaliacao.comentario}\n\n` +
            "Essa ação não poderá ser desfeita."
        );

        if (!confirmado) return;

        const token = localStorage.getItem("token");

        if (!token) {
            router.push("/login");
            return;
        }

        setRemovendoAvaliacao(reviewId);
        setErroModeracao(null);
        setSucessoModeracao(null);

        try {
            const response = await fetch(
                `${API_URL}/reviews/admin/${reviewId}`,
                {
                    method: "DELETE",
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            if (!response.ok) {
                const dados = await response.json().catch(() => null);

                const mensagem = Array.isArray(dados?.message)
                    ? dados.message.join(", ")
                    : dados?.message ||
                      "Não foi possível excluir a avaliação.";

                throw new Error(mensagem);
            }

            setAvaliacoes((anteriores) =>
                anteriores.filter((item) => item.id !== reviewId)
            );

            setSucessoModeracao(
                "Avaliação removida com sucesso. As estatísticas do serviço foram atualizadas."
            );

            await carregarServicos();
            await carregarDenuncias();
        } catch (error) {
            setErroModeracao(
                error instanceof Error
                    ? error.message
                    : "Erro inesperado ao remover avaliação."
            );
        } finally {
            setRemovendoAvaliacao(null);
        }
    };

    // Atualizar status de uma denúncia
    const handleAtualizarStatusDenuncia = async (
        reportId: string,
        status: ReportStatus
    ) => {
        const token = localStorage.getItem("token");

        if (!token) {
            router.push("/login");
            return;
        }

        const acao =
            status === "ANALISADA"
                ? "marcar esta denúncia como analisada"
                : "descartar esta denúncia";

        if (!confirm(`Deseja realmente ${acao}?`)) {
            return;
        }

        setAtualizandoDenuncia(reportId);
        setErroDenuncias(null);
        setSucessoDenuncias(null);

        try {
            const response = await fetch(
                `${API_URL}/reviews/admin/denuncias/${reportId}/status`,
                {
                    method: "PATCH",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`,
                    },
                    body: JSON.stringify({ status }),
                }
            );

            if (!response.ok) {
                const dados = await response.json().catch(() => null);

                const mensagem = Array.isArray(dados?.message)
                    ? dados.message.join(", ")
                    : dados?.message ||
                      "Não foi possível atualizar a denúncia.";

                throw new Error(mensagem);
            }

            setDenuncias((anteriores) =>
                anteriores.map((denuncia) =>
                    denuncia.id === reportId
                        ? { ...denuncia, status }
                        : denuncia
                )
            );

            setSucessoDenuncias(
                status === "ANALISADA"
                    ? "Denúncia marcada como analisada."
                    : "Denúncia descartada com sucesso."
            );
        } catch (error) {
            setErroDenuncias(
                error instanceof Error
                    ? error.message
                    : "Erro inesperado ao atualizar a denúncia."
            );
        } finally {
            setAtualizandoDenuncia(null);
        }
    };

    // Indicadores gerais
    const totalAvaliacoes = avaliacoes.length;

    const totalPendentes = avaliacoes.filter(
        (avaliacao) => !avaliacao.respostaInstitucional?.id
    ).length;

    const totalNotas = servicos.reduce(
        (soma, servico) =>
            soma + Number(servico.totalAvaliacoes || 0),
        0
    );

    const somaNotasPonderadas = servicos.reduce(
        (soma, servico) =>
            soma +
            Number(servico.mediaNota || 0) *
                Number(servico.totalAvaliacoes || 0),
        0
    );

    const mediaGeralMunicipal =
        totalNotas > 0
            ? (somaNotasPonderadas / totalNotas).toFixed(1)
            : "—";

    const totalAnonimas = avaliacoes.filter(
        (avaliacao) => avaliacao.isAnonimo
    ).length;

    // Indicadores de denúncias
    const denunciasPendentes = denuncias.filter(
        (denuncia) => denuncia.status === "PENDENTE"
    ).length;

    const denunciasAnalisadas = denuncias.filter(
        (denuncia) => denuncia.status === "ANALISADA"
    ).length;

    const denunciasDescartadas = denuncias.filter(
        (denuncia) => denuncia.status === "DESCARTADA"
    ).length;

    const denunciasFiltradas = denuncias.filter((denuncia) =>
        filtroDenuncia === "TODAS"
            ? true
            : denuncia.status === filtroDenuncia
    );

    const totalRespostasInstitucionais = avaliacoes.filter(
        (avaliacao) => Boolean(avaliacao.respostaInstitucional?.id)
    ).length;

    if (carregando) {
        return (
            <div className="flex min-h-[60vh] items-center justify-center">
                <p className="text-sm font-semibold text-slate-500">
                    A verificar permissões de administrador...
                </p>
            </div>
        );
    }

    return (
        <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">

            {/* Cabeçalho */}
            <div className="mb-8 flex flex-col justify-between gap-4 border-b border-slate-200 pb-6 sm:flex-row sm:items-center">
                <div>
                    <div className="flex items-center gap-2">
                        <span className="rounded-md bg-rose-100 px-2.5 py-0.5 text-xs font-bold text-rose-800">
                            Módulo Restrito
                        </span>

                        <span className="text-xs font-medium text-slate-500">
                            FeedPalmas v1.0
                        </span>
                    </div>

                    <h1 className="mt-2 text-2xl font-extrabold text-slate-900 sm:text-3xl">
                        Painel de Gestão &amp; Controlo Social
                    </h1>

                    <p className="text-sm text-slate-600">
                        Sessão ativa como:{" "}
                        <span className="font-bold text-slate-800">
                            {user?.nome}
                        </span>{" "}
                        ({user?.email})
                    </p>
                </div>

                <Link
                    href="/"
                    className="inline-flex h-9 items-center justify-center rounded-lg border border-slate-200 bg-white px-4 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                >
                    Voltar ao Site Público
                </Link>
            </div>

            {/* Indicadores administrativos */}
            <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
                <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
                    <span className="text-xs font-semibold uppercase text-slate-500">
                        Postos cadastrados
                    </span>

                    <p className="mt-2 text-2xl font-bold text-slate-800">
                        {servicos.length}
                    </p>

                    <span className="text-xs font-medium text-emerald-600">
                        Sincronizado com PostgreSQL
                    </span>
                </div>

                <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
                    <span className="text-xs font-semibold uppercase text-slate-500">
                        Avaliações sem resposta
                    </span>

                    <p className="mt-2 text-2xl font-bold text-amber-600">
                        {carregandoAvaliacoes ? "..." : totalPendentes}
                    </p>

                    <span className="text-xs font-medium text-slate-500">
                        Aguardam retorno institucional
                    </span>
                </div>

                <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
                    <span className="text-xs font-semibold uppercase text-slate-500">
                        Média geral municipal
                    </span>

                    <p className="mt-2 text-2xl font-bold text-slate-800">
                        {mediaGeralMunicipal}
                        {totalNotas > 0 && (
                            <span className="text-base font-semibold text-slate-400">
                                {" "}/ 5.0
                            </span>
                        )}
                    </p>

                    <span className="text-xs font-medium text-sky-600">
                        {totalNotas} avaliações consideradas
                    </span>
                </div>
            </div>

            {/* Abas principais */}
            <div className="mb-6 flex flex-wrap gap-2 border-b border-slate-200">
                <button
                    onClick={() => setAbaAtiva("servicos")}
                    className={`border-b-2 px-4 py-2 text-sm font-semibold transition ${
                        abaAtiva === "servicos"
                            ? "border-sky-600 text-sky-600"
                            : "border-transparent text-slate-500 hover:text-slate-800"
                    }`}
                >
                    Gestão de Serviços / Postos
                </button>

                <button
                    onClick={() => setAbaAtiva("feedbacks")}
                    className={`border-b-2 px-4 py-2 text-sm font-semibold transition ${
                        abaAtiva === "feedbacks"
                            ? "border-sky-600 text-sky-600"
                            : "border-transparent text-slate-500 hover:text-slate-800"
                    }`}
                >
                    Moderação de Avaliações
                </button>

                <button
                    onClick={() => setAbaAtiva("gestores")}
                    className={`border-b-2 px-4 py-2 text-sm font-semibold transition ${
                        abaAtiva === "gestores"
                            ? "border-sky-600 text-sky-600"
                            : "border-transparent text-slate-500 hover:text-slate-800"
                    }`}
                >
                    Gestão de Gestores
                </button>
            </div>

            {/* ABA: SERVIÇOS */}
            {abaAtiva === "servicos" && (
                <div className="space-y-8">

                    {/* Cadastro */}
                    <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
                        <h2 className="mb-4 text-lg font-bold text-slate-800">
                            Cadastrar Novo Equipamento Público
                        </h2>

                        <form
                            onSubmit={handleCadastrar}
                            className="grid grid-cols-1 gap-4 sm:grid-cols-2"
                        >
                            <div>
                                <label className="mb-1 block text-xs font-bold text-slate-700">
                                    Nome do Local/Posto *
                                </label>

                                <input
                                    type="text"
                                    value={nome}
                                    onChange={(e) => setNome(e.target.value)}
                                    placeholder="Ex: UBS Dr. Francisco, ETI Padre Josimo..."
                                    className="w-full rounded-xl border border-slate-200 p-2.5 text-sm outline-none focus:border-sky-500"
                                    required
                                />
                            </div>

                            <div>
                                <label className="mb-1 block text-xs font-bold text-slate-700">
                                    Esfera Governamental *
                                </label>

                                <select
                                    value={esfera}
                                    onChange={(e) => setEsfera(e.target.value)}
                                    className="w-full rounded-xl border border-slate-200 p-2.5 text-sm outline-none focus:border-sky-500"
                                >
                                    <option value="Municipal">Municipal</option>
                                    <option value="Estadual">Estadual</option>
                                    <option value="Federal">Federal</option>
                                </select>
                            </div>

                            <div>
                                <label className="mb-1 block text-xs font-bold text-slate-700">
                                    Categoria *
                                </label>

                                <select
                                    value={categoria}
                                    onChange={(e) => setCategoria(e.target.value)}
                                    className="w-full rounded-xl border border-slate-200 p-2.5 text-sm outline-none focus:border-sky-500"
                                >
                                    <option value="saude">Saúde &amp; Atendimento</option>
                                    <option value="educacao">Educação</option>
                                    <option value="transporte">Transporte &amp; Mobilidade</option>
                                    <option value="zeladoria">Zeladoria &amp; Iluminação</option>
                                </select>
                            </div>

                            <div>
                                <label className="mb-1 block text-xs font-bold text-slate-700">
                                    Endereço / Localização *
                                </label>

                                <input
                                    type="text"
                                    value={endereco}
                                    onChange={(e) => setEndereco(e.target.value)}
                                    placeholder="Ex: Quadra 104 Sul, Av. LO-01"
                                    className="w-full rounded-xl border border-slate-200 p-2.5 text-sm outline-none focus:border-sky-500"
                                    required
                                />
                            </div>

                            <div>
                                <label className="mb-1 block text-xs font-bold text-slate-700">
                                    Latitude (Opcional - Para Mapa)
                                </label>

                                <input
                                    type="number"
                                    step="any"
                                    value={latitude}
                                    onChange={(e) => setLatitude(e.target.value)}
                                    placeholder="Ex: -10.1844"
                                    className="w-full rounded-xl border border-slate-200 p-2.5 text-sm outline-none focus:border-sky-500"
                                />
                            </div>

                            <div>
                                <label className="mb-1 block text-xs font-bold text-slate-700">
                                    Longitude (Opcional - Para Mapa)
                                </label>

                                <input
                                    type="number"
                                    step="any"
                                    value={longitude}
                                    onChange={(e) => setLongitude(e.target.value)}
                                    placeholder="Ex: -48.3336"
                                    className="w-full rounded-xl border border-slate-200 p-2.5 text-sm outline-none focus:border-sky-500"
                                />
                            </div>

                            <div className="mt-2 sm:col-span-2">
                                <button
                                    type="submit"
                                    disabled={salvando}
                                    className="inline-flex h-10 items-center justify-center rounded-xl bg-sky-600 px-6 text-sm font-bold text-white transition hover:bg-sky-700 disabled:opacity-50"
                                >
                                    {salvando
                                        ? "A salvar no banco..."
                                        : "Salvar Equipamento Público"}
                                </button>
                            </div>
                        </form>
                    </div>

                    {/* Lista de serviços */}
                    <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
                        <h2 className="mb-4 text-lg font-bold text-slate-800">
                            Equipamentos Cadastrados no Sistema
                        </h2>

                        {servicos.length === 0 ? (
                            <p className="text-sm text-slate-500">
                                Nenhum equipamento cadastrado ainda.
                            </p>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full text-left text-sm text-slate-600">
                                    <thead className="border-b border-slate-200 bg-slate-50 text-xs font-bold uppercase text-slate-700">
                                        <tr>
                                            <th className="px-4 py-3">Nome</th>
                                            <th className="px-4 py-3">Categoria</th>
                                            <th className="px-4 py-3">Endereço</th>
                                            <th className="px-4 py-3 text-center">Nota</th>
                                            <th className="px-4 py-3 text-right">Ações</th>
                                        </tr>
                                    </thead>

                                    <tbody className="divide-y divide-slate-100">
                                        {servicos.map((item) => (
                                            <tr
                                                key={item.id}
                                                className="hover:bg-slate-50/80"
                                            >
                                                <td className="px-4 py-3 font-semibold text-slate-900">
                                                    {item.nome}
                                                </td>

                                                <td className="px-4 py-3 capitalize">
                                                    {item.categoria}
                                                </td>

                                                <td className="px-4 py-3 text-slate-500">
                                                    {item.endereco}
                                                </td>

                                                <td className="px-4 py-3 text-center font-bold text-sky-600">
                                                    {Number(item.mediaNota).toFixed(1)}
                                                </td>

                                                <td className="px-4 py-3 text-right">
                                                    <button
                                                        type="button"
                                                        onClick={() =>
                                                            handleRemover(item.id)
                                                        }
                                                        className="rounded-lg border border-rose-200 bg-rose-50 px-2.5 py-1 text-xs font-semibold text-rose-700 hover:bg-rose-100"
                                                    >
                                                        Excluir
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* ABA: GESTORES */}
            {abaAtiva === "gestores" && (
                <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">

                    <h2 className="mb-2 text-lg font-bold text-slate-800">
                        Cadastrar Gestor
                    </h2>

                    <p className="mb-6 text-sm text-slate-500">
                        Crie uma conta de gestor para administrar os serviços públicos e as avaliações.
                    </p>

                    {erroGestor && (
                        <div className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-600">
                            {erroGestor}
                        </div>
                    )}

                    {sucessoGestor && (
                        <div className="mb-4 rounded-lg bg-green-50 p-3 text-sm text-green-600">
                            {sucessoGestor}
                        </div>
                    )}

                    <form
                        onSubmit={handleCadastrarGestor}
                        className="max-w-2xl space-y-5"
                    >
                        <div>
                            <label className="mb-1 block text-sm font-semibold text-slate-700">
                                Nome completo
                            </label>

                            <input
                                type="text"
                                value={nomeGestor}
                                onChange={(e) => setNomeGestor(e.target.value)}
                                placeholder="Digite o nome do gestor"
                                required
                                className="w-full rounded-lg border border-slate-300 px-4 py-2.5 text-sm outline-none focus:border-sky-500"
                            />
                        </div>

                        <div>
                            <label className="mb-1 block text-sm font-semibold text-slate-700">
                                E-mail
                            </label>

                            <input
                                type="email"
                                value={emailGestor}
                                onChange={(e) => setEmailGestor(e.target.value)}
                                placeholder="gestor@email.com"
                                required
                                className="w-full rounded-lg border border-slate-300 px-4 py-2.5 text-sm outline-none focus:border-sky-500"
                            />
                        </div>

                        <div>
                            <label className="mb-1 block text-sm font-semibold text-slate-700">
                                Senha
                            </label>

                            <input
                                type="password"
                                value={senhaGestor}
                                onChange={(e) => setSenhaGestor(e.target.value)}
                                placeholder="Crie uma senha forte"
                                autoComplete="new-password"
                                required
                                minLength={8}
                                maxLength={64}
                                className="w-full rounded-lg border border-slate-300 px-4 py-2.5 text-sm outline-none focus:border-sky-500"
                            />
                        </div>

                        <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                            <p className="mb-3 text-sm font-bold text-slate-700">
                                Requisitos da senha
                            </p>

                            <div className="space-y-2">
                                {requisitosSenhaGestor.map((requisito, index) => (
                                    <div
                                        key={index}
                                        className={`flex items-center gap-2 text-sm ${
                                            requisito.valido
                                                ? "text-emerald-700"
                                                : "text-slate-500"
                                        }`}
                                    >
                                        <span className="font-bold">
                                            {requisito.valido ? "✓" : "○"}
                                        </span>
                                        <span>{requisito.texto}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div>
                            <label className="mb-1 block text-sm font-semibold text-slate-700">
                                Confirmar senha
                            </label>

                            <input
                                type="password"
                                value={confirmarSenhaGestor}
                                onChange={(e) =>
                                    setConfirmarSenhaGestor(e.target.value)
                                }
                                placeholder="Digite a senha novamente"
                                autoComplete="new-password"
                                required
                                minLength={8}
                                maxLength={64}
                                className="w-full rounded-lg border border-slate-300 px-4 py-2.5 text-sm outline-none focus:border-sky-500"
                            />

                            {confirmarSenhaGestor.length > 0 && (
                                <p
                                    className={`mt-2 text-xs font-medium ${
                                        senhasGestorCoincidem
                                            ? "text-emerald-700"
                                            : "text-rose-600"
                                    }`}
                                >
                                    {senhasGestorCoincidem
                                        ? "✓ As senhas coincidem"
                                        : "✗ As senhas não coincidem"}
                                </p>
                            )}
                        </div>

                        <button
                            type="submit"
                            disabled={
                                cadastrandoGestor ||
                                !senhaGestorValida ||
                                !senhasGestorCoincidem
                            }
                            className="rounded-lg bg-sky-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-sky-700 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                            {cadastrandoGestor
                                ? "Cadastrando..."
                                : "Cadastrar Gestor"}
                        </button>
                    </form>

                    {/* Gestores cadastrados */}
                    <div className="mt-10">
                        <div className="mb-5">
                            <h2 className="text-xl font-bold text-slate-800">
                                Gestores cadastrados
                            </h2>

                            <p className="mt-1 text-sm text-slate-500">
                                Gerencie os gestores e os serviços sob sua responsabilidade.
                            </p>
                        </div>

                        {carregandoGestores ? (
                            <div className="rounded-xl border border-slate-200 bg-white p-6 text-center">
                                <p className="text-sm text-slate-500">
                                    Carregando gestores...
                                </p>
                            </div>
                        ) : gestores.length === 0 ? (
                            <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 p-8 text-center">
                                <p className="font-medium text-slate-700">
                                    Nenhum gestor cadastrado.
                                </p>

                                <p className="mt-1 text-sm text-slate-500">
                                    Cadastre um novo gestor utilizando o formulário acima.
                                </p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 gap-4">
                                {gestores.map((gestor) => {
                                    const servicosVinculados =
                                        servicosDosGestores[gestor.id] || [];

                                    const servicosDisponiveis = servicos.filter(
                                        (servico) =>
                                            !servicosVinculados.some(
                                                (vinculado) =>
                                                    vinculado.id === servico.id
                                            )
                                    );

                                    return (
                                        <div
                                            key={gestor.id}
                                            className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm"
                                        >
                                            <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                                                <div className="flex items-center gap-4">
                                                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-sky-100 text-lg font-bold text-sky-600">
                                                        {gestor.nome.charAt(0).toUpperCase()}
                                                    </div>

                                                    <div>
                                                        <h3 className="font-semibold text-slate-800">
                                                            {gestor.nome}
                                                        </h3>

                                                        <p className="mt-1 text-sm text-slate-500">
                                                            {gestor.email}
                                                        </p>
                                                    </div>
                                                </div>

                                                <span className="w-fit rounded-full bg-sky-50 px-3 py-1 text-xs font-semibold text-sky-600">
                                                    GESTOR
                                                </span>
                                            </div>

                                            <div className="mt-6 border-t border-slate-100 pt-5">
                                                <h4 className="mb-3 text-sm font-bold text-slate-800">
                                                    Serviços vinculados
                                                </h4>

                                                {servicosVinculados.length === 0 ? (
                                                    <p className="rounded-lg bg-slate-50 p-3 text-sm text-slate-500">
                                                        Este gestor ainda não possui serviços vinculados.
                                                    </p>
                                                ) : (
                                                    <div className="space-y-2">
                                                        {servicosVinculados.map((servico) => (
                                                            <div
                                                                key={servico.id}
                                                                className="flex flex-col justify-between gap-2 rounded-lg border border-slate-200 p-3 sm:flex-row sm:items-center"
                                                            >
                                                                <div>
                                                                    <p className="text-sm font-semibold text-slate-800">
                                                                        {servico.nome}
                                                                    </p>

                                                                    <p className="mt-1 text-xs capitalize text-slate-500">
                                                                        {servico.categoria}
                                                                    </p>
                                                                </div>

                                                                <button
                                                                    type="button"
                                                                    onClick={() =>
                                                                        handleDesvincularServico(
                                                                            gestor.id,
                                                                            servico.id
                                                                        )
                                                                    }
                                                                    disabled={
                                                                        operacaoGestor ===
                                                                        `desvincular-${gestor.id}-${servico.id}`
                                                                    }
                                                                    className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-xs font-semibold text-rose-700 transition hover:bg-rose-100 disabled:opacity-50"
                                                                >
                                                                    {operacaoGestor ===
                                                                    `desvincular-${gestor.id}-${servico.id}`
                                                                        ? "Desvinculando..."
                                                                        : "Desvincular"}
                                                                </button>
                                                            </div>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>

                                            <div className="mt-5 border-t border-slate-100 pt-5">
                                                <h4 className="mb-3 text-sm font-bold text-slate-800">
                                                    Vincular novo serviço
                                                </h4>

                                                {servicosDisponiveis.length === 0 ? (
                                                    <p className="rounded-lg bg-slate-50 p-3 text-sm text-slate-500">
                                                        Todos os serviços cadastrados já estão vinculados a este gestor.
                                                    </p>
                                                ) : (
                                                    <div className="flex flex-col gap-3 sm:flex-row">
                                                        <select
                                                            value={
                                                                servicoSelecionado[gestor.id] || ""
                                                            }
                                                            onChange={(e) =>
                                                                setServicoSelecionado(
                                                                    (anteriores) => ({
                                                                        ...anteriores,
                                                                        [gestor.id]: e.target.value,
                                                                    })
                                                                )
                                                            }
                                                            className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm text-slate-700 outline-none focus:border-sky-500"
                                                        >
                                                            <option value="">
                                                                Selecione um serviço
                                                            </option>

                                                            {servicosDisponiveis.map((servico) => (
                                                                <option
                                                                    key={servico.id}
                                                                    value={servico.id}
                                                                >
                                                                    {servico.nome}
                                                                </option>
                                                            ))}
                                                        </select>

                                                        <button
                                                            type="button"
                                                            onClick={() =>
                                                                handleVincularServico(gestor.id)
                                                            }
                                                            disabled={
                                                                !servicoSelecionado[gestor.id] ||
                                                                operacaoGestor ===
                                                                    `vincular-${gestor.id}`
                                                            }
                                                            className="rounded-lg bg-sky-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-sky-700 disabled:cursor-not-allowed disabled:opacity-50"
                                                        >
                                                            {operacaoGestor ===
                                                            `vincular-${gestor.id}`
                                                                ? "Vinculando..."
                                                                : "Vincular serviço"}
                                                        </button>
                                                    </div>
                                                )}
                                            </div>

                                            {mensagensVinculo[gestor.id] && (
                                                <p
                                                    className={`mt-4 rounded-lg p-3 text-sm font-medium ${
                                                        mensagensVinculo[gestor.id].tipo ===
                                                        "sucesso"
                                                            ? "bg-emerald-50 text-emerald-700"
                                                            : "bg-red-50 text-red-700"
                                                    }`}
                                                >
                                                    {mensagensVinculo[gestor.id].texto}
                                                </p>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* ABA: MODERAÇÃO */}
            {abaAtiva === "feedbacks" && (
                <div className="space-y-6">

                    {/* Subabas */}
                    <div className="flex flex-wrap gap-2 border-b border-slate-200">
                        <button
                            type="button"
                            onClick={() => setAbaModeracao("avaliacoes")}
                            className={`border-b-2 px-4 py-3 text-sm font-semibold transition ${
                                abaModeracao === "avaliacoes"
                                    ? "border-sky-600 text-sky-600"
                                    : "border-transparent text-slate-500 hover:text-slate-800"
                            }`}
                        >
                            Avaliações
                        </button>

                        <button
                            type="button"
                            onClick={() => setAbaModeracao("denuncias")}
                            className={`border-b-2 px-4 py-3 text-sm font-semibold transition ${
                                abaModeracao === "denuncias"
                                    ? "border-red-600 text-red-600"
                                    : "border-transparent text-slate-500 hover:text-slate-800"
                            }`}
                        >
                            Denúncias
                            {denunciasPendentes > 0 && (
                                <span className="ml-2 rounded-full bg-red-100 px-2 py-0.5 text-xs text-red-700">
                                    {denunciasPendentes}
                                </span>
                            )}
                        </button>
                    </div>

                    {/* SUBABA: AVALIAÇÕES */}
                    {abaModeracao === "avaliacoes" && (
                        <div className="space-y-6">
                            <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                                <div>
                                    <h2 className="text-xl font-bold text-slate-800">
                                        Moderação de Avaliações
                                    </h2>

                                    <p className="mt-1 text-sm text-slate-500">
                                        Consulte as manifestações registradas pelos cidadãos.
                                    </p>
                                </div>

                                <button
                                    type="button"
                                    onClick={carregarAvaliacoes}
                                    disabled={carregandoAvaliacoes}
                                    className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:opacity-50"
                                >
                                    {carregandoAvaliacoes
                                        ? "Atualizando..."
                                        : "Atualizar avaliações"}
                                </button>
                            </div>

                            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                                <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
                                    <span className="text-xs font-semibold uppercase text-slate-500">
                                        Total de avaliações
                                    </span>

                                    <p className="mt-2 text-3xl font-bold text-slate-800">
                                        {avaliacoes.length}
                                    </p>
                                </div>

                                <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
                                    <span className="text-xs font-semibold uppercase text-slate-500">
                                        Avaliações anônimas
                                    </span>

                                    <p className="mt-2 text-3xl font-bold text-sky-600">
                                        {totalAnonimas}
                                    </p>
                                </div>

                                <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
                                    <span className="text-xs font-semibold uppercase text-slate-500">
                                        Com resposta institucional
                                    </span>

                                    <p className="mt-2 text-3xl font-bold text-emerald-600">
                                        {totalRespostasInstitucionais}
                                    </p>
                                </div>
                            </div>

                            {erroModeracao && (
                                <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm font-medium text-red-700">
                                    {erroModeracao}
                                </div>
                            )}

                            {sucessoModeracao && (
                                <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm font-medium text-emerald-700">
                                    {sucessoModeracao}
                                </div>
                            )}

                            {carregandoAvaliacoes && (
                                <div className="rounded-xl border border-slate-200 bg-white p-8 text-center">
                                    <p className="text-sm font-semibold text-slate-500">
                                        Carregando avaliações...
                                    </p>
                                </div>
                            )}

                            {!carregandoAvaliacoes &&
                                avaliacoes.length === 0 &&
                                !erroModeracao && (
                                    <div className="rounded-xl border border-dashed border-slate-300 bg-white p-10 text-center">
                                        <h3 className="font-bold text-slate-700">
                                            Nenhuma avaliação encontrada.
                                        </h3>

                                        <p className="mt-2 text-sm text-slate-500">
                                            As avaliações enviadas pelos cidadãos aparecerão aqui.
                                        </p>
                                    </div>
                                )}

                            {!carregandoAvaliacoes &&
                                avaliacoes.length > 0 && (
                                    <div className="space-y-4">
                                        {avaliacoes.map((avaliacao) => (
                                            <article
                                                key={avaliacao.id}
                                                className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
                                            >
                                                <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-start">
                                                    <div>
                                                        <h3 className="font-bold text-slate-800">
                                                            {avaliacao.service?.nome ||
                                                                "Serviço público"}
                                                        </h3>

                                                        <p className="mt-1 text-xs text-slate-500">
                                                            Publicada em{" "}
                                                            {formatarData(
                                                                avaliacao.created_at
                                                            )}
                                                        </p>
                                                    </div>

                                                    <div className="flex items-center gap-1">
                                                        <span className="text-amber-500">
                                                            ★
                                                        </span>

                                                        <span className="text-sm font-bold text-slate-800">
                                                            {avaliacao.nota}/5
                                                        </span>
                                                    </div>
                                                </div>

                                                <div className="mt-4">
                                                    <span
                                                        className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${
                                                            avaliacao.isAnonimo
                                                                ? "bg-slate-100 text-slate-600"
                                                                : "bg-sky-50 text-sky-700"
                                                        }`}
                                                    >
                                                        {avaliacao.isAnonimo
                                                            ? "Cidadão anônimo"
                                                            : avaliacao.user?.nome ||
                                                              "Cidadão"}
                                                    </span>
                                                </div>

                                                <div className="mt-4 rounded-xl bg-slate-50 p-4">
                                                    <h4 className="text-xs font-bold uppercase text-slate-500">
                                                        Comentário do cidadão
                                                    </h4>

                                                    <p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed text-slate-700">
                                                        {avaliacao.comentario}
                                                    </p>
                                                </div>

                                                {avaliacao.respostaInstitucional?.resposta && (
                                                    <div className="mt-3 rounded-xl border border-emerald-100 bg-emerald-50 p-4">
                                                        <h4 className="text-xs font-bold uppercase text-emerald-800">
                                                            Resposta institucional
                                                        </h4>

                                                        <p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed text-slate-700">
                                                            {avaliacao.respostaInstitucional.resposta}
                                                        </p>

                                                        <span className="mt-2 block text-xs text-slate-500">
                                                            Respondida em{" "}
                                                            {formatarData(
                                                                avaliacao.respostaInstitucional.created_at
                                                            )}
                                                        </span>
                                                    </div>
                                                )}

                                                <div className="mt-4 flex flex-col justify-between gap-3 border-t border-slate-100 pt-4 sm:flex-row sm:items-center">
                                                    <span className="text-xs text-slate-400">
                                                        ID: {avaliacao.id}
                                                    </span>

                                                    <button
                                                        type="button"
                                                        onClick={() =>
                                                            handleRemoverAvaliacao(
                                                                avaliacao.id
                                                            )
                                                        }
                                                        disabled={
                                                            removendoAvaliacao ===
                                                            avaliacao.id
                                                        }
                                                        className="rounded-lg border border-rose-200 bg-rose-50 px-4 py-2 text-xs font-bold text-rose-700 transition hover:bg-rose-100 disabled:cursor-not-allowed disabled:opacity-50"
                                                    >
                                                        {removendoAvaliacao ===
                                                        avaliacao.id
                                                            ? "Removendo..."
                                                            : "Excluir avaliação"}
                                                    </button>
                                                </div>
                                            </article>
                                        ))}
                                    </div>
                                )}
                        </div>
                    )}

                    {/* SUBABA: DENÚNCIAS */}
                    {abaModeracao === "denuncias" && (
                        <div className="space-y-6">
                            <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                                <div>
                                    <h2 className="text-xl font-bold text-slate-800">
                                        Fila de Denúncias
                                    </h2>

                                    <p className="mt-1 text-sm text-slate-500">
                                        Analise as denúncias encaminhadas pelos cidadãos.
                                    </p>
                                </div>

                                <button
                                    type="button"
                                    onClick={carregarDenuncias}
                                    disabled={carregandoDenuncias}
                                    className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:opacity-50"
                                >
                                    {carregandoDenuncias
                                        ? "Atualizando..."
                                        : "Atualizar denúncias"}
                                </button>
                            </div>

                            {/* Indicadores */}
                            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                                <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
                                    <span className="text-xs font-semibold uppercase text-slate-500">
                                        Pendentes
                                    </span>

                                    <p className="mt-2 text-3xl font-bold text-amber-600">
                                        {denunciasPendentes}
                                    </p>
                                </div>

                                <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
                                    <span className="text-xs font-semibold uppercase text-slate-500">
                                        Analisadas
                                    </span>

                                    <p className="mt-2 text-3xl font-bold text-emerald-600">
                                        {denunciasAnalisadas}
                                    </p>
                                </div>

                                <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
                                    <span className="text-xs font-semibold uppercase text-slate-500">
                                        Descartadas
                                    </span>

                                    <p className="mt-2 text-3xl font-bold text-slate-600">
                                        {denunciasDescartadas}
                                    </p>
                                </div>
                            </div>

                            {/* Filtro */}
                            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                                <label
                                    htmlFor="filtroDenuncia"
                                    className="text-sm font-semibold text-slate-700"
                                >
                                    Filtrar denúncias
                                </label>

                                <select
                                    id="filtroDenuncia"
                                    value={filtroDenuncia}
                                    onChange={(e) =>
                                        setFiltroDenuncia(
                                            e.target.value as
                                                | "TODAS"
                                                | ReportStatus
                                        )
                                    }
                                    className="rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm text-slate-700 outline-none focus:border-sky-500"
                                >
                                    <option value="TODAS">Todas</option>
                                    <option value="PENDENTE">Pendentes</option>
                                    <option value="ANALISADA">Analisadas</option>
                                    <option value="DESCARTADA">Descartadas</option>
                                </select>
                            </div>

                            {/* Mensagens */}
                            {erroDenuncias && (
                                <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm font-medium text-red-700">
                                    {erroDenuncias}
                                </div>
                            )}

                            {sucessoDenuncias && (
                                <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm font-medium text-emerald-700">
                                    {sucessoDenuncias}
                                </div>
                            )}

                            {/* Carregamento */}
                            {carregandoDenuncias && (
                                <div className="rounded-xl border border-slate-200 bg-white p-8 text-center">
                                    <p className="text-sm font-semibold text-slate-500">
                                        Carregando denúncias...
                                    </p>
                                </div>
                            )}

                            {/* Lista vazia */}
                            {!carregandoDenuncias &&
                                denunciasFiltradas.length === 0 &&
                                !erroDenuncias && (
                                    <div className="rounded-xl border border-dashed border-slate-300 bg-white p-10 text-center">
                                        <h3 className="font-bold text-slate-700">
                                            Nenhuma denúncia encontrada.
                                        </h3>

                                        <p className="mt-2 text-sm text-slate-500">
                                            Não existem denúncias para o filtro selecionado.
                                        </p>
                                    </div>
                                )}

                            {/* Lista de denúncias */}
                            {!carregandoDenuncias &&
                                denunciasFiltradas.length > 0 && (
                                    <div className="space-y-4">
                                        {denunciasFiltradas.map((denuncia) => (
                                            <article
                                                key={denuncia.id}
                                                className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
                                            >
                                                <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-start">
                                                    <div>
                                                        <h3 className="font-bold text-slate-800">
                                                            Denúncia
                                                        </h3>

                                                        <p className="mt-1 text-xs text-slate-500">
                                                            Recebida em{" "}
                                                            {formatarData(
                                                                denuncia.created_at
                                                            )}
                                                        </p>

                                                        <p className="mt-2 text-xs text-slate-500">
                                                            Denunciante:{" "}
                                                            <strong className="text-slate-700">
                                                                {denuncia.reporter?.nome ||
                                                                    "Cidadão"}
                                                            </strong>
                                                        </p>
                                                    </div>

                                                    <span
                                                        className={`w-fit rounded-full px-3 py-1 text-xs font-semibold ${
                                                            denuncia.status ===
                                                            "PENDENTE"
                                                                ? "bg-amber-100 text-amber-800"
                                                                : denuncia.status ===
                                                                    "ANALISADA"
                                                                  ? "bg-emerald-100 text-emerald-800"
                                                                  : "bg-slate-100 text-slate-600"
                                                        }`}
                                                    >
                                                        {denuncia.status}
                                                    </span>
                                                </div>

                                                {/* Motivo */}
                                                <div className="mt-4 rounded-xl border border-red-100 bg-red-50/50 p-4">
                                                    <h4 className="text-xs font-bold uppercase text-red-700">
                                                        Motivo da denúncia
                                                    </h4>

                                                    <p className="mt-2 text-sm font-semibold text-slate-800">
                                                        {denuncia.motivo}
                                                    </p>

                                                    {denuncia.descricao && (
                                                        <div className="mt-3 border-t border-red-100 pt-3">
                                                            <h5 className="text-xs font-bold text-slate-600">
                                                                Descrição complementar
                                                            </h5>

                                                            <p className="mt-1 whitespace-pre-wrap text-sm leading-relaxed text-slate-700">
                                                                {denuncia.descricao}
                                                            </p>
                                                        </div>
                                                    )}
                                                </div>

                                                {/* Avaliação denunciada */}
                                                <div className="mt-4 rounded-xl bg-slate-50 p-4">
                                                    <h4 className="text-xs font-bold uppercase text-slate-500">
                                                        Avaliação denunciada
                                                    </h4>

                                                    {denuncia.review ? (
                                                        <>
                                                            <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
                                                                <div>
                                                                    <p className="font-bold text-slate-800">
                                                                        {denuncia.review.service?.nome ||
                                                                            "Serviço público"}
                                                                    </p>

                                                                    <p className="mt-1 text-xs text-slate-500">
                                                                        Publicada em{" "}
                                                                        {formatarData(
                                                                            denuncia.review.created_at
                                                                        )}
                                                                    </p>
                                                                </div>

                                                                <span className="font-bold text-amber-500">
                                                                    {"★".repeat(
                                                                        denuncia.review.nota
                                                                    )}{" "}
                                                                    {denuncia.review.nota}/5
                                                                </span>
                                                            </div>

                                                            <p className="mt-3 text-xs text-slate-500">
                                                                Autor:{" "}
                                                                <strong>
                                                                    {denuncia.review.isAnonimo
                                                                        ? "Cidadão anônimo"
                                                                        : denuncia.review.user?.nome ||
                                                                          "Cidadão"}
                                                                </strong>
                                                            </p>

                                                            <p className="mt-3 whitespace-pre-wrap text-sm leading-relaxed text-slate-700">
                                                                {denuncia.review.comentario}
                                                            </p>
                                                        </>
                                                    ) : (
                                                        <p className="mt-2 text-sm text-slate-500">
                                                            A avaliação associada não está mais disponível.
                                                        </p>
                                                    )}
                                                </div>

                                                {/* Ações */}
                                                <div className="mt-4 flex flex-col justify-between gap-3 border-t border-slate-100 pt-4 sm:flex-row sm:items-center">
                                                    <span className="text-xs text-slate-400">
                                                        ID: {denuncia.id}
                                                    </span>

                                                    {denuncia.status ===
                                                        "PENDENTE" && (
                                                        <div className="flex flex-wrap gap-2">
                                                            <button
                                                                type="button"
                                                                onClick={() =>
                                                                    handleAtualizarStatusDenuncia(
                                                                        denuncia.id,
                                                                        "ANALISADA"
                                                                    )
                                                                }
                                                                disabled={
                                                                    atualizandoDenuncia ===
                                                                    denuncia.id
                                                                }
                                                                className="rounded-lg bg-emerald-600 px-4 py-2 text-xs font-bold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-50"
                                                            >
                                                                {atualizandoDenuncia ===
                                                                denuncia.id
                                                                    ? "Atualizando..."
                                                                    : "Marcar como analisada"}
                                                            </button>

                                                            <button
                                                                type="button"
                                                                onClick={() =>
                                                                    handleAtualizarStatusDenuncia(
                                                                        denuncia.id,
                                                                        "DESCARTADA"
                                                                    )
                                                                }
                                                                disabled={
                                                                    atualizandoDenuncia ===
                                                                    denuncia.id
                                                                }
                                                                className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-xs font-bold text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
                                                            >
                                                                Descartar denúncia
                                                            </button>
                                                        </div>
                                                    )}
                                                </div>
                                            </article>
                                        ))}
                                    </div>
                                )}
                        </div>
                    )}
                </div>
            )}
        </main>
    );
}

