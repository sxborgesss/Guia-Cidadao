import Link from "next/link";

const secoes = [
    {
        titulo: "1. Sobre a plataforma",
        conteudo:
            "O Guia Cidadão é uma plataforma independente desenvolvida com a finalidade de facilitar a consulta de serviços públicos e incentivar a participação social. Permite consultar serviços cadastrados, registrar avaliações e encaminhar manifestações à Ouvidoria.",
    },
    {
        titulo: "2. Cadastro e responsabilidade do usuário",
        conteudo:
            "O usuário deve fornecer informações verdadeiras no cadastro e manter a confidencialidade de suas credenciais. Cada usuário é responsável pelas atividades realizadas por meio de sua conta. Não compartilhe sua senha ou token de acesso.",
    },
    {
        titulo: "3. Avaliações dos serviços públicos",
        conteudo:
            "As avaliações devem refletir experiências reais ou opiniões legítimas sobre os serviços cadastrados. Comentários devem ser respeitosos, pertinentes e não podem conter ameaças, ofensas, discurso discriminatório, dados pessoais de terceiros ou conteúdo ilegal.",
    },
    {
        titulo: "4. Anonimato nas avaliações",
        conteudo:
            "Quando disponível, o usuário poderá escolher publicar uma avaliação anonimamente. Nessa situação, o nome do autor não será exibido publicamente na avaliação. O anonimato de exibição não significa que a plataforma deixe de processar os dados necessários à autenticação e ao funcionamento do serviço.",
    },
    {
        titulo: "5. Ouvidoria Aberta",
        conteudo:
            "As manifestações registradas na Ouvidoria recebem um protocolo para acompanhamento. O cidadão pode consultar o andamento e as respostas disponibilizadas pela administração. O envio de uma manifestação pela plataforma não equivale, por si só, à abertura de processo administrativo oficial perante um órgão público.",
    },
    {
        titulo: "6. Política de moderação",
        conteudo:
            "Avaliações e conteúdos publicados podem ser denunciados quando apresentarem indícios de abuso, discriminação, informações pessoais expostas, spam, conteúdo enganoso ou assuntos sem relação com o serviço avaliado. As denúncias são encaminhadas à análise administrativa.",
    },
    {
        titulo: "7. Medidas de moderação",
        conteudo:
            "Após análise, a administração poderá manter ou remover avaliações que violem estas regras. A remoção deve considerar o motivo da denúncia e a pertinência do conteúdo. A ferramenta de moderação não deve ser utilizada para eliminar críticas legítimas ou opiniões desfavoráveis.",
    },
    {
        titulo: "8. Limitações e disponibilidade",
        conteudo:
            "As informações sobre serviços são apresentadas conforme os dados cadastrados e disponíveis na plataforma. Podem existir informações incompletas, desatualizadas ou indisponibilidade temporária. O Guia Cidadão não substitui os canais oficiais dos órgãos públicos, nem deve ser utilizado para emergências.",
    },
    {
        titulo: "9. Uso indevido",
        conteudo:
            "É proibido utilizar a plataforma para fraudes, tentativas de acesso não autorizado, ataques, envio automatizado abusivo, publicação de conteúdo ilegal ou qualquer atividade que comprometa a segurança e o funcionamento do sistema.",
    },
    {
        titulo: "10. Atualizações dos termos",
        conteudo:
            "Estes termos podem ser atualizados para refletir mudanças nas funcionalidades, nas regras de utilização e nos procedimentos de moderação. A versão disponibilizada nesta página representa as condições informadas pela plataforma.",
    },
];

export default function TermosPage() {
    return (
        <main className="mx-auto max-w-4xl px-4 py-10 sm:px-6 lg:px-8">
            <header className="mb-10 border-b border-border pb-8">
                <span className="text-xs font-bold uppercase tracking-wider text-brand">
                    Guia Cidadão
                </span>

                <h1 className="mt-3 text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl">
                    Termos de Uso e Política de Moderação
                </h1>

                <p className="mt-4 text-sm leading-7 text-foreground-muted">
                    Conheça as regras de utilização da plataforma, as
                    responsabilidades dos usuários e os critérios para
                    moderação de conteúdo.
                </p>
            </header>

            <section className="mb-8 rounded-2xl border border-brand/20 bg-brand-light p-5">
                <h2 className="font-bold text-foreground">
                    Nosso compromisso
                </h2>

                <p className="mt-2 text-sm leading-6 text-foreground-muted">
                    O Guia Cidadão busca promover uma participação social
                    responsável, transparente e respeitosa. Críticas
                    construtivas são importantes e fazem parte do propósito
                    da plataforma.
                </p>
            </section>

            <div className="space-y-8">
                {secoes.map((secao) => (
                    <section
                        key={secao.titulo}
                        className="border-b border-border pb-7 last:border-0"
                    >
                        <h2 className="text-lg font-bold text-foreground">
                            {secao.titulo}
                        </h2>

                        <p className="mt-3 text-sm leading-7 text-foreground-muted">
                            {secao.conteudo}
                        </p>
                    </section>
                ))}
            </div>

            <section className="mt-8 rounded-2xl border border-border bg-surface p-6">
                <h2 className="font-bold text-foreground">
                    Proteção de dados pessoais
                </h2>

                <p className="mt-2 text-sm leading-6 text-foreground-muted">
                    O tratamento de dados pessoais deve observar as regras
                    aplicáveis de proteção de dados. Consulte nossa página
                    de privacidade para conhecer as informações sobre o
                    tratamento de dados na plataforma.
                </p>

                <Link
                    href="/privacidade"
                    className="mt-4 inline-flex text-sm font-bold text-brand hover:underline"
                >
                    Consultar LGPD e Privacidade →
                </Link>
            </section>

            <div className="mt-10 flex flex-wrap gap-3">
                <Link
                    href="/"
                    className="inline-flex items-center justify-center rounded-xl border border-border px-5 py-3 text-sm font-semibold text-foreground transition hover:bg-surface-muted"
                >
                    Voltar ao início
                </Link>

                <Link
                    href="/ouvidoria"
                    className="inline-flex items-center justify-center rounded-xl bg-brand px-5 py-3 text-sm font-semibold text-brand-contrast transition hover:bg-brand-hover"
                >
                    Acessar Ouvidoria
                </Link>
            </div>
        </main>
    );
}