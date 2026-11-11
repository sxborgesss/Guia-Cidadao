import Link from "next/link";

const secoes = [
    {
        titulo: "1. Quais dados são coletados?",
        texto:
            "O Guia Cidadão utiliza dados necessários ao funcionamento de suas funcionalidades. Isso inclui dados de cadastro, como nome e endereço de e-mail; credenciais de acesso, cuja senha é armazenada com hash; avaliações de serviços públicos, incluindo nota, comentário e data; e manifestações da Ouvidoria, que podem conter tipo, assunto, descrição, protocolo e histórico de atendimento.",
    },
    {
        titulo: "2. Dados de autenticação",
        texto:
            "Quando o usuário entra na plataforma, é emitido um token de autenticação para permitir o acesso às funcionalidades protegidas. Na implementação atual, esse token é mantido no armazenamento local do navegador (localStorage). O usuário deve proteger seu dispositivo, evitar compartilhamento de credenciais e encerrar a sessão ao utilizar equipamentos compartilhados.",
    },
    {
        titulo: "3. Para que utilizamos os dados?",
        texto:
            "Os dados são utilizados para criar e autenticar contas, identificar o autor de operações, registrar avaliações, permitir respostas institucionais, receber e acompanhar manifestações, processar denúncias de conteúdo e disponibilizar indicadores de transparência. Também são necessários para administrar e manter a segurança e o funcionamento da plataforma.",
    },
    {
        titulo: "4. Avaliações e anonimato",
        texto:
            "O cidadão pode escolher publicar uma avaliação anonimamente quando essa opção estiver disponível. Nesse caso, seu nome não é apresentado publicamente junto à avaliação. O anonimato diz respeito à exibição pública: a plataforma ainda precisa identificar a conta responsável pelo registro para permitir autenticação, gerenciamento e prevenção de abusos.",
    },
    {
        titulo: "5. Manifestações da Ouvidoria",
        texto:
            "As manifestações são associadas à conta autenticada do cidadão e recebem um protocolo. O conteúdo pode ser consultado pelo próprio titular e por administradores autorizados para análise, atualização de status e elaboração de resposta. As manifestações não integram a listagem pública de avaliações dos serviços.",
    },
    {
        titulo: "6. Denúncias e moderação",
        texto:
            "Quando um cidadão denuncia uma avaliação, são registrados dados relacionados à denúncia, como o motivo, a descrição opcional, a avaliação denunciada e a conta responsável pelo envio. Essas informações são utilizadas para análise administrativa e moderação de conteúdo.",
    },
    {
        titulo: "7. Quem pode acessar as informações?",
        texto:
            "O próprio cidadão pode consultar suas avaliações e manifestações. Administradores possuem acesso aos recursos de gestão e moderação necessários às suas atividades. Gestores podem consultar avaliações dos serviços vinculados às suas contas e publicar respostas institucionais. Avaliações publicadas podem ser visualizadas por outros visitantes, respeitada a opção de anonimato.",
    },
    {
        titulo: "8. Compartilhamento de informações",
        texto:
            "Os dados são utilizados para as finalidades descritas neste aviso e disponibilizados conforme as permissões de cada perfil. A plataforma utiliza serviços tecnológicos necessários à sua operação, incluindo infraestrutura de banco de dados e recursos de mapas. O compartilhamento com outros operadores ou fornecedores deve ser definido e documentado pelo responsável pelo tratamento antes da disponibilização definitiva do sistema.",
    },
    {
        titulo: "9. Armazenamento e segurança",
        texto:
            "A aplicação utiliza banco de dados PostgreSQL e autenticação baseada em JWT. As senhas são armazenadas com hash, e as rotas protegidas exigem autenticação e verificação de perfil. São adotadas medidas técnicas para restringir o acesso às informações. Nenhum sistema conectado à internet pode garantir risco zero de incidentes de segurança.",
    },
    {
        titulo: "10. Por quanto tempo os dados são mantidos?",
        texto:
            "Os registros são mantidos no banco de dados enquanto necessários ao funcionamento da plataforma. Os prazos específicos de retenção, procedimentos de descarte, tratamento de contas inativas e política de preservação de registros ainda devem ser formalmente definidos pelo responsável pelo projeto, considerando as obrigações legais aplicáveis.",
    },
    {
        titulo: "11. Direitos dos titulares de dados",
        texto:
            "Nos termos da Lei Geral de Proteção de Dados Pessoais (Lei nº 13.709/2018), os titulares podem solicitar, conforme aplicável, confirmação da existência de tratamento, acesso aos dados, correção de informações incompletas ou desatualizadas, anonimização, bloqueio, eliminação de dados desnecessários ou tratados em desconformidade, portabilidade e informações sobre compartilhamento. O atendimento depende da análise do responsável pelo tratamento e das hipóteses legais de conservação.",
    },
    {
        titulo: "12. Alterações neste aviso",
        texto:
            "Este aviso poderá ser atualizado quando houver mudanças nas funcionalidades, nos procedimentos de tratamento de dados ou nas exigências legais. Recomenda-se consultar esta página periodicamente para conhecer a versão vigente.",
    },
];

export default function PrivacidadePage() {
    return (
        <main className="mx-auto max-w-4xl px-4 py-10 sm:px-6 lg:px-8">
            <header className="mb-10 border-b border-border pb-8">
                <span className="text-xs font-bold uppercase tracking-wider text-brand">
                    Guia Cidadão
                </span>

                <h1 className="mt-3 text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl">
                    Aviso de Privacidade e LGPD
                </h1>

                <p className="mt-4 text-sm leading-7 text-foreground-muted">
                    Saiba como os dados pessoais são utilizados nas
                    funcionalidades do Guia Cidadão e conheça os direitos
                    dos titulares previstos na legislação de proteção de
                    dados pessoais.
                </p>
            </header>

            <section className="mb-8 rounded-2xl border border-brand/20 bg-brand-light p-5">
                <h2 className="font-bold text-foreground">
                    Respeito à privacidade
                </h2>

                <p className="mt-2 text-sm leading-6 text-foreground-muted">
                    O Guia Cidadão busca tratar informações pessoais de
                    maneira responsável, transparente e limitada às
                    necessidades de funcionamento da plataforma. A
                    proteção de dados é parte importante da confiança
                    entre cidadãos e serviços públicos.
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
                            {secao.texto}
                        </p>
                    </section>
                ))}
            </div>

            <section className="mt-8 rounded-2xl border border-amber-200 bg-amber-50 p-5">
                <h2 className="font-bold text-amber-900">
                    Informação institucional importante
                </h2>

                <p className="mt-2 text-sm leading-6 text-amber-900">
                    Para uma implantação oficial, o responsável pelo
                    tratamento deverá identificar o controlador dos dados,
                    disponibilizar um canal de contato para solicitações
                    dos titulares e definir os prazos de retenção, as bases
                    legais aplicáveis e os operadores envolvidos. Essas
                    informações institucionais ainda precisam ser
                    formalizadas no projeto.
                </p>
            </section>

            <section className="mt-8 rounded-2xl border border-border bg-surface p-6">
                <h2 className="font-bold text-foreground">
                    Legislação de referência
                </h2>

                <p className="mt-2 text-sm leading-6 text-foreground-muted">
                    Este aviso considera como referência a Lei nº
                    13.709/2018, conhecida como Lei Geral de Proteção de
                    Dados Pessoais (LGPD).
                </p>

                <Link
                    href="https://www.planalto.gov.br/ccivil_03/_ato2015-2018/2018/lei/l13709.htm"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-4 inline-flex text-sm font-bold text-brand hover:underline"
                >
                    Consultar a LGPD →
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
                    href="/termos"
                    className="inline-flex items-center justify-center rounded-xl bg-brand px-5 py-3 text-sm font-semibold text-brand-contrast transition hover:bg-brand-hover"
                >
                    Consultar Termos de Uso
                </Link>
            </div>
        </main>
    );
}