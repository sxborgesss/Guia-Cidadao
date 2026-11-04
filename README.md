# Guia Cidadão (FeedPalmas)

**Plataforma de consulta, avaliação e acompanhamento de serviços públicos de Palmas – TO.**

O Guia Cidadão é um projeto de extensão do curso de **Sistemas para Internet**, do Instituto Federal do Tocantins (IFTO), Campus Palmas. A proposta é aproximar cidadãos e serviços públicos municipais por meio de uma aplicação web que reúne informações sobre os serviços e permite registrar avaliações. A plataforma também oferece recursos administrativos e uma área para gestores acompanharem e responderem às avaliações dos serviços sob sua responsabilidade.

## Objetivos

- Facilitar o acesso a informações sobre serviços públicos de Palmas.
- Disponibilizar um canal de avaliação e manifestação dos cidadãos.
- Permitir que gestores acompanhem avaliações dos serviços vinculados às suas contas.
- Apoiar a transparência e a melhoria contínua do atendimento público.

## Funcionalidades

### Implementadas no backend

- Cadastro de cidadãos e autenticação por e-mail e senha.
- Senhas armazenadas com hash bcrypt.
- Autenticação JWT e controle de acesso por perfil: `CIDADAO`, `GESTOR` e `ADMIN`.
- Criação de usuários (incluindo gestores) por um administrador autenticado.
- Consulta pública dos serviços cadastrados.
- Cadastro e exclusão de serviços restritos ao perfil `ADMIN`.
- Criação de avaliações com identificação do cidadão obtida a partir do JWT.
- Consulta pública de avaliações com seleção limitada dos dados do autor.
- Associação muitos-para-muitos entre gestores e serviços: um gestor pode administrar vários serviços e um serviço pode ter vários gestores.
- Consulta das avaliações dos serviços vinculados ao gestor autenticado.
- Respostas institucionais: gestores vinculados podem responder às avaliações dos seus serviços. Cada avaliação pode ter uma resposta.
- Consulta pública das avaliações incluindo a resposta institucional, quando existir.

### Interface web disponível

- Página inicial e catálogo de serviços.
- Visualização de serviços em mapa.
- Cadastro e login.
- Área administrativa para gerenciamento de serviços e gestores.
- Painel do gestor com consulta de avaliações e indicadores básicos calculados a partir das avaliações recebidas.

### Em desenvolvimento / ainda não concluído

- Integração visual completa das respostas institucionais na página pública do serviço.
- Indicadores adicionais do gestor, incluindo total de avaliações respondidas e não respondidas e detalhamento por critérios.
- Escolha de anonimato pelo cidadão na avaliação.
- Denúncia de avaliações e fluxo de moderação pelo administrador.
- Painel público de transparência com indicadores consolidados.
- Revisão final de acessibilidade, responsividade, segurança e testes de ponta a ponta.

> A presença de uma rota ou componente no código não significa, por si só, que o fluxo completo já foi validado em todos os perfis. As funcionalidades devem ser testadas no ambiente local antes de uma apresentação ou implantação.

## Tecnologias

| Camada | Tecnologias |
|---|---|
| Frontend | Next.js, React, TypeScript, Tailwind CSS |
| Mapas | Leaflet e React Leaflet |
| Backend | Node.js, NestJS e TypeScript |
| ORM | TypeORM |
| Banco de dados | PostgreSQL |
| Autenticação | Passport, JWT e bcrypt |
| Versionamento | Git e GitHub |

## Estrutura do repositório

```text
Guia-Cidadao/
├── backend/       # API NestJS, regras de negócio e acesso ao banco
├── frontend/      # Aplicação web Next.js
├── README.md      # Documentação principal
└── .gitignore
```

## Pré-requisitos

- Node.js e npm instalados.
- PostgreSQL em execução e acessível pela máquina que executará o backend.
- Git para clonar e versionar o projeto.

O repositório não inclui um arquivo `docker-compose.yml`. O PostgreSQL pode ser executado por uma instalação local ou por um container Docker já configurado, desde que a porta e as credenciais correspondam às variáveis do backend.

## Configuração do banco e do backend

1. Inicie uma instância do PostgreSQL.
2. Crie um banco chamado `guia_cidadao` (caso ainda não exista).
3. Na pasta `backend/`, crie um arquivo `.env` com as variáveis abaixo:

```env
PORT=3001
DB_HOST=127.0.0.1
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=coloque_sua_senha_local
DB_DATABASE=guia_cidadao
JWT_SECRET=gere_uma_chave_secreta_forte
```

Ajuste `DB_HOST`, `DB_PORT`, `DB_USERNAME` e `DB_PASSWORD` conforme a sua instalação do PostgreSQL. `JWT_SECRET` deve ser uma chave forte, privada e mantida igual entre a emissão e a validação dos tokens.

**Não compartilhe nem envie o arquivo `.env` ao GitHub.** Cada integrante deve criar seu próprio arquivo local. Não use a chave de exemplo em ambiente de produção.

### Banco de dados e sincronização

A configuração atual do TypeORM utiliza `synchronize: true`, que cria ou ajusta estruturas de tabelas automaticamente durante a inicialização. Essa configuração facilita o desenvolvimento, mas pode causar alterações no esquema do banco. Use apenas em ambiente de desenvolvimento; antes de produção, desative-a e adote migrations revisadas e versionadas.

O projeto não inclui um script de seed para criação do primeiro usuário `ADMIN`. O endpoint de criação administrativa exige que já exista um administrador autenticado. A equipe deve combinar e documentar um procedimento seguro de criação inicial desse usuário no ambiente de desenvolvimento.

## Instalação e execução

Execute os comandos em **dois terminais separados**. O banco deve estar ativo antes de iniciar o backend.

### 1. Clonar o repositório

```bash
git clone https://github.com/sxborgesss/Guia-Cidadao.git
cd Guia-Cidadao
```

### 2. Instalar e iniciar o backend

No primeiro terminal:

```bash
cd backend
npm install
npm run start:dev
```

A API ficará disponível em `http://localhost:3001` (ou na porta definida em `PORT`). Mantenha o terminal aberto.

### 3. Instalar e iniciar o frontend

No segundo terminal, a partir da pasta raiz do repositório:

```bash
cd frontend
npm install
npm run dev
```

A aplicação web ficará disponível em `http://localhost:3000`.

Atualmente, as chamadas do frontend à API utilizam `http://localhost:3001`. Se o backend for executado em outro endereço ou porta, será necessário ajustar os endereços utilizados pelo frontend e a configuração de CORS em `backend/src/main.ts`.

## Principais rotas da API

As rotas abaixo refletem os controllers atuais do backend. As rotas protegidas exigem o cabeçalho `Authorization: Bearer <token>`.

### Autenticação — `/auth`

| Método | Rota | Acesso | Descrição |
|---|---|---|---|
| POST | `/auth/register` | Público | Cadastra um cidadão (`CIDADAO`). |
| POST | `/auth/login` | Público | Autentica e retorna token JWT e dados básicos do usuário. |
| GET | `/auth/profile` | ADMIN | Exemplo de rota protegida para administrador. |
| POST | `/auth/admin/users` | ADMIN | Cadastra usuário com perfil definido no DTO, incluindo gestor. |

### Serviços — `/services`

| Método | Rota | Acesso | Descrição |
|---|---|---|---|
| GET | `/services` | Público | Lista serviços públicos. |
| POST | `/services` | ADMIN | Cadastra um serviço. |
| DELETE | `/services/:id` | ADMIN | Exclui um serviço. |

### Usuários e vínculos — `/users`

Todas as rotas deste controller exigem autenticação e perfil `ADMIN`.

| Método | Rota | Descrição |
|---|---|---|
| GET | `/users/gestores` | Lista gestores cadastrados. |
| GET | `/users/gestores/:gestorId/servicos` | Lista serviços vinculados ao gestor. |
| POST | `/users/gestores/:gestorId/servicos/:serviceId` | Vincula gestor a um serviço. |
| DELETE | `/users/gestores/:gestorId/servicos/:serviceId` | Desvincula gestor de um serviço. |

### Avaliações e respostas — `/reviews`

| Método | Rota | Acesso | Descrição |
|---|---|---|---|
| POST | `/reviews` | JWT | Cria avaliação. O usuário é identificado pelo token; não envie `user_id` como fonte de identidade. |
| GET | `/reviews/service/:serviceId` | Público | Lista avaliações do serviço e resposta institucional, quando houver. |
| GET | `/reviews/gestor/minhas` | GESTOR | Lista avaliações dos serviços vinculados ao gestor autenticado. |
| POST | `/reviews/:reviewId/responder` | GESTOR | Registra resposta institucional, se o gestor estiver vinculado ao serviço da avaliação. |

## Testes e verificações

Na pasta `backend/`, estão disponíveis os scripts definidos no `package.json`:

```bash
npm run build
npm run test
npm run test:e2e
```

Na pasta `frontend/`:

```bash
npm run build
npm run lint
```

Além da compilação, teste os fluxos com contas separadas de `ADMIN`, `GESTOR` e `CIDADAO`, verificando especialmente autenticação, autorização, vínculos gestor-serviço, criação de avaliações e respostas institucionais.

## Segurança e colaboração

- Não faça commit de `.env`, senhas, tokens, chaves privadas ou dados reais de usuários.
- Cada integrante deve manter suas próprias credenciais locais.
- Antes de compartilhar alterações, revise `git status` e confirme que arquivos de ambiente e diretórios gerados estão ignorados.
- Faça commits pequenos e descritivos, preferencialmente em branches de trabalho, e integre as alterações após revisão do grupo.

## Contexto acadêmico

O Guia Cidadão (também referido como FeedPalmas em materiais anteriores) é desenvolvido como projeto de extensão do curso de **Sistemas para Internet**, no Instituto Federal do Tocantins (IFTO), Campus Palmas. A proposta relaciona o desenvolvimento de aplicações web a uma necessidade social: facilitar o acesso a informações e a participação dos cidadãos em assuntos relacionados aos serviços públicos municipais.

## Equipe

- **João Rafael Gomes Manchola Cifuentes**
- **Leandro Ribeiro da Silva**
- **Samuel Borges Lopes Araújo**

**Professor responsável:** Rodrigo Luiz dos Santos.

---

O projeto permanece em desenvolvimento. Esta documentação descreve a estrutura e os endpoints encontrados no código-fonte desta versão; funcionalidades em desenvolvimento devem ser validadas e documentadas à medida que forem concluídas.
