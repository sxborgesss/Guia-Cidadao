"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

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

export default function AdminPage() {
  const router = useRouter();
  const [user, setUser] = useState<UserData | null>(null);
  const [carregando, setCarregando] = useState(true);

  // Estados de controle e dados
  const [abaAtiva, setAbaAtiva] = useState<"servicos" | "feedbacks">("servicos");
  const [servicos, setServicos] = useState<PublicService[]>([]);
  const [salvando, setSalvando] = useState(false);

  // Campos do formulário
  const [nome, setNome] = useState("");
  const [categoria, setCategoria] = useState("saude");
  const [endereco, setEndereco] = useState("");

  const carregarServicos = async () => {
    try {
      const res = await fetch("http://localhost:3001/services");
      if (res.ok) {
        const data = await res.json();
        setServicos(data);
      }
    } catch (err) {
      console.error("Erro ao buscar serviços:", err);
    }
  };

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
    } catch {
      router.push("/login");
    } finally {
      setCarregando(false);
    }
  }, [router]);

  const handleCadastrar = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nome.trim() || !endereco.trim()) {
      alert("Por favor, preencha todos os campos.");
      return;
    }

    setSalvando(true);
    try {
      const res = await fetch("http://localhost:3001/services", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ nome, categoria, endereco }),
      });

      if (!res.ok) {
        throw new Error("Falha ao cadastrar equipamento público");
      }

      // Limpa os campos e atualiza a lista
      setNome("");
      setEndereco("");
      setCategoria("saude");
      await carregarServicos();
      alert("Equipamento cadastrado com sucesso!");
    } catch (err: any) {
      alert(err.message || "Erro de conexão com o servidor.");
    } finally {
      setSalvando(false);
    }
  };

  const handleRemover = async (id: string) => {
    if (!confirm("Tem certeza que deseja remover este equipamento público?")) return;

    try {
      const res = await fetch(`http://localhost:3001/services/${id}`, {
        method: "DELETE",
      });

      if (res.ok) {
        setServicos((prev) => prev.filter((s) => s.id !== id));
      } else {
        alert("Erro ao remover serviço.");
      }
    } catch (err) {
      alert("Erro ao conectar com o servidor.");
    }
  };

  if (carregando) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <p className="text-sm font-semibold text-slate-500">A verificar permissões de administrador...</p>
      </div>
    );
  }

  return (
    <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Cabeçalho do Painel */}
      <div className="mb-8 flex flex-col justify-between gap-4 border-b border-slate-200 pb-6 sm:flex-row sm:items-center">
        <div>
          <div className="flex items-center gap-2">
            <span className="rounded-md bg-rose-100 px-2.5 py-0.5 text-xs font-bold text-rose-800">
              Módulo Restrito
            </span>
            <span className="text-xs font-medium text-slate-500">FeedPalmas v1.0</span>
          </div>
          <h1 className="mt-2 text-2xl font-extrabold text-slate-900 sm:text-3xl">
            Painel de Gestão & Controlo Social
          </h1>
          <p className="text-sm text-slate-600">
            Sessão ativa como: <span className="font-bold text-slate-800">{user?.nome}</span> ({user?.email})
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/"
            className="inline-flex h-9 items-center justify-center rounded-lg border border-slate-200 bg-white px-4 text-xs font-semibold text-slate-700 hover:bg-slate-50"
          >
            Voltar ao Site Público
          </Link>
        </div>
      </div>

      {/* Cartões Rápidos de Resumo */}
      <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
          <span className="text-xs font-semibold uppercase text-slate-500">Postos Cadastrados</span>
          <p className="mt-2 text-2xl font-bold text-slate-800">{servicos.length}</p>
          <span className="text-xs text-emerald-600 font-medium">Sincronizado com PostgreSQL</span>
        </div>
        <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
          <span className="text-xs font-semibold uppercase text-slate-500">Avaliações Pendentes</span>
          <p className="mt-2 text-2xl font-bold text-slate-800">0</p>
          <span className="text-xs text-amber-600 font-medium">Aguardam moderação</span>
        </div>
        <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
          <span className="text-xs font-semibold uppercase text-slate-500">Média Geral Municipal</span>
          <p className="mt-2 text-2xl font-bold text-slate-800">5.0 / 5.0</p>
          <span className="text-xs text-sky-600 font-medium">Nota padrão inicial</span>
        </div>
      </div>

      {/* Abas */}
      <div className="mb-6 flex gap-2 border-b border-slate-200">
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
      </div>

      {abaAtiva === "servicos" && (
        <div className="space-y-8">
          {/* Formulário de Cadastro */}
          <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
            <h2 className="mb-4 text-lg font-bold text-slate-800">Cadastrar Novo Equipamento Público</h2>

            <form onSubmit={handleCadastrar} className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1 block text-xs font-bold text-slate-700">Nome do Local/Posto</label>
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
                <label className="mb-1 block text-xs font-bold text-slate-700">Categoria</label>
                <select
                  value={categoria}
                  onChange={(e) => setCategoria(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 p-2.5 text-sm outline-none focus:border-sky-500"
                >
                  <option value="saude">Saúde & Atendimento</option>
                  <option value="educacao">Educação</option>
                  <option value="transporte">Transporte & Mobilidade</option>
                  <option value="zeladoria">Zeladoria & Iluminação</option>
                </select>
              </div>
              <div className="sm:col-span-2">
                <label className="mb-1 block text-xs font-bold text-slate-700">Endereço / Localização</label>
                <input
                  type="text"
                  value={endereco}
                  onChange={(e) => setEndereco(e.target.value)}
                  placeholder="Ex: Quadra 104 Sul, Av. LO-01, Plano Diretor Sul"
                  className="w-full rounded-xl border border-slate-200 p-2.5 text-sm outline-none focus:border-sky-500"
                  required
                />
              </div>
              <div className="sm:col-span-2">
                <button
                  type="submit"
                  disabled={salvando}
                  className="inline-flex h-10 items-center justify-center rounded-xl bg-sky-600 px-6 text-sm font-bold text-white transition hover:bg-sky-700 disabled:opacity-50"
                >
                  {salvando ? "A salvar no banco..." : "Salvar Equipamento Público"}
                </button>
              </div>
            </form>
          </div>

          {/* Listagem em Tabela */}
          <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
            <h2 className="mb-4 text-lg font-bold text-slate-800">Equipamentos Cadastrados no Sistema</h2>

            {servicos.length === 0 ? (
              <p className="text-sm text-slate-500">Nenhum equipamento cadastrado ainda. Cadastre o primeiro acima.</p>
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
                      <tr key={item.id} className="hover:bg-slate-50/80">
                        <td className="px-4 py-3 font-semibold text-slate-900">{item.nome}</td>
                        <td className="px-4 py-3 capitalize">{item.categoria}</td>
                        <td className="px-4 py-3 text-slate-500">{item.endereco}</td>
                        <td className="px-4 py-3 text-center font-bold text-sky-600">{Number(item.mediaNota).toFixed(1)}</td>
                        <td className="px-4 py-3 text-right">
                          <button
                            type="button"
                            onClick={() => handleRemover(item.id)}
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

      {abaAtiva === "feedbacks" && (
        <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
          <h2 className="mb-2 text-lg font-bold text-slate-800">Fila de Moderação</h2>
          <p className="text-sm text-slate-500">Nenhum comentário com denúncia ou pendente de revisão no momento.</p>
        </div>
      )}
    </main>
  );
}