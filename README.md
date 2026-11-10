# Guia Cidadão (FeedPalmas)

**Plataforma de consulta, avaliação e acompanhamento de serviços públicos de Palmas – TO.**

O Guia Cidadão é um projeto de extensão do curso de **Sistemas para Internet**, do Instituto Federal do Tocantins (IFTO), Campus Palmas. A proposta é aproximar cidadãos e serviços públicos municipais por meio de uma aplicação web que reúne informações sobre os serviços, permite registrar avaliações e manifestações e oferece ferramentas de acompanhamento e transparência.

A plataforma também disponibiliza áreas específicas para gestores e administradores, permitindo o gerenciamento dos serviços, o acompanhamento das avaliações, o registro de respostas institucionais e a moderação de avaliações denunciadas pelos cidadãos.

## Objetivos

- Facilitar o acesso a informações sobre serviços públicos de Palmas.
- Disponibilizar um canal de avaliação e manifestação dos cidadãos.
- Permitir que gestores acompanhem e respondam às avaliações dos serviços sob sua responsabilidade.
- Oferecer mecanismos de denúncia e moderação de avaliações.
- Ampliar a transparência e incentivar a participação dos cidadãos.
- Apoiar a melhoria contínua dos serviços públicos.

## Funcionalidades

### Área pública

- Página inicial e catálogo de serviços públicos.
- Visualização dos serviços em mapa.
- Consulta pública das avaliações dos serviços.
- Visualização das respostas institucionais.
- Cadastro e autenticação de cidadãos.
- Possibilidade de realizar avaliações anônimas.
- Acesso à Ouvidoria Aberta para registro de manifestações.

### Área do cidadão

- Área pessoal com acesso às próprias avaliações.
- Acompanhamento das respostas institucionais às avaliações.
- Consulta das próprias manifestações registradas na Ouvidoria.
- Acompanhamento dos protocolos e do andamento das manifestações.
- Consulta de manifestações pelo número do protocolo.

### Área do gestor

- Consulta das avaliações dos serviços vinculados ao gestor.
- Acompanhamento de indicadores básicos das avaliações.
- Registro de respostas institucionais às avaliações.

### Área administrativa

- Gerenciamento de serviços públicos.
- Cadastro e gerenciamento de gestores.
- Associação de gestores aos serviços correspondentes.
- Consulta e gerenciamento das avaliações.
- Recebimento e acompanhamento de denúncias de avaliações.
- Moderação de avaliações denunciadas.
- Gerenciamento das manifestações registradas na Ouvidoria.

### Painel de Transparência

- Apresentação de indicadores gerais das avaliações.
- Ranking de serviços públicos.
- Indicadores por categoria.
- Evolução mensal das avaliações.
- Panorama dos serviços cadastrados.
- A página pública do painel está disponível em `/painel`.

## Tecnologias

| Camada | Tecnologias |
|---|---|
| Frontend | Next.js, React, TypeScript e Tailwind CSS |
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

O repositório não inclui um arquivo `docker-compose.yml`. O PostgreSQL pode ser executado por uma instalação local ou por um container Docker já configurado.

## Configuração do banco e do backend

1. Inicie uma instância do PostgreSQL.
2. Crie um banco de dados chamado `guia_cidadao`.
3. Na pasta `backend/`, crie um arquivo `.env` com as seguintes variáveis:

```env
PORT=3001
DB_HOST=localhost
DB_PORT=5433
DB_USERNAME=postgres
DB_PASSWORD=sua_senha_local
DB_DATABASE=guia_cidadao
JWT_SECRET=sua_chave_secreta_forte
```

Ajuste as configurações conforme sua instalação do PostgreSQL.

A variável `JWT_SECRET` é obrigatória para a autenticação. Utilize uma chave forte e privada, mantendo-a igual entre a emissão e a validação dos tokens.

**Importante:** não compartilhe nem envie o arquivo `.env` ao GitHub. Cada integrante deve criar seu próprio arquivo local. Nunca utilize chaves de exemplo em ambiente de produção.

### Banco de dados e sincronização

A configuração atual do TypeORM utiliza `synchronize: true`, que cria ou ajusta estruturas de tabelas automaticamente durante a inicialização.

Essa configuração facilita o desenvolvimento, mas pode causar alterações no esquema do banco. Deve ser utilizada somente em ambiente de desenvolvimento. Antes de uma implantação em produção, recomenda-se desativá-la e adotar migrations revisadas e versionadas.

O projeto também exige um procedimento seguro para a criação inicial do usuário `ADMIN`, pois as rotas de gerenciamento administrativo dependem de autenticação e autorização.

## Instalação e execução

Execute os comandos em dois terminais separados. O banco de dados deve estar ativo antes de iniciar o backend.

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

A API ficará disponível em:

`http://localhost:3001`

### 3. Instalar e iniciar o frontend

No segundo terminal, a partir da pasta raiz do repositório:

```bash
cd frontend
npm install
npm run dev
```

A aplicação web ficará disponível em:

`http://localhost:3000`

Atualmente, as chamadas do frontend à API utilizam `http://localhost:3001`. Caso o backend seja executado em outro endereço ou porta, será necessário ajustar os endereços utilizados pelo frontend e a configuração de CORS em `backend/src/main.ts`.

## Principais rotas da API

As rotas protegidas exigem autenticação por meio do cabeçalho:

```http
Authorization: Bearer <token>
```

### Autenticação — `/auth`

| Método | Rota | Acesso | Descrição |
|---|---|---|---|
| POST | `/auth/register` | Público | Cadastra um cidadão. |
| POST | `/auth/login` | Público | Autentica e retorna o token JWT e os dados básicos do usuário. |
| GET | `/auth/profile` | ADMIN | Rota protegida para administrador. |
| POST | `/auth/admin/users` | ADMIN | Cadastra usuários com perfil definido. |

### Serviços — `/services`

| Método | Rota | Acesso | Descrição |
|---|---|---|---|
| GET | `/services` | Público | Lista os serviços públicos. |
| POST | `/services` | ADMIN | Cadastra um serviço. |
| DELETE | `/services/:id` | ADMIN | Exclui um serviço. |

### Usuários e vínculos — `/users`

As rotas deste controller exigem autenticação e perfil `ADMIN`.

| Método | Rota | Descrição |
|---|---|---|
| GET | `/users/gestores` | Lista os gestores cadastrados. |
| GET | `/users/gestores/:gestorId/servicos` | Lista os serviços vinculados ao gestor. |
| POST | `/users/gestores/:gestorId/servicos/:serviceId` | Vincula um gestor a um serviço. |
| DELETE | `/users/gestores/:gestorId/servicos/:serviceId` | Desvincula um gestor de um serviço. |

### Avaliações — `/reviews`

| Método | Rota | Acesso | Descrição |
|---|---|---|---|
| POST | `/reviews` | JWT | Cria uma avaliação. |
| GET | `/reviews/service/:serviceId` | Público | Lista as avaliações de um serviço. |
| GET | `/reviews/minhas` | CIDADAO | Lista as avaliações do cidadão autenticado. |
| GET | `/reviews/gestor/minhas` | GESTOR | Lista avaliações dos serviços vinculados ao gestor. |
| POST | `/reviews/:reviewId/responder` | GESTOR | Registra resposta institucional. |
| POST | `/reviews/:reviewId/denunciar` | CIDADAO | Registra denúncia de uma avaliação. |
| GET | `/reviews/admin/todas` | ADMIN | Lista avaliações para administração. |
| DELETE | `/reviews/admin/:reviewId` | ADMIN | Exclui uma avaliação. |
| GET | `/reviews/admin/denuncias` | ADMIN | Lista denúncias recebidas. |
| PATCH | `/reviews/admin/denuncias/:reportId/status` | ADMIN | Atualiza o status de uma denúncia. |

### Ouvidoria — `/ouvidoria`

| Método | Rota | Acesso | Descrição |
|---|---|---|---|
| POST | `/ouvidoria` | CIDADAO | Registra uma manifestação. |
| GET | `/ouvidoria/minhas` | CIDADAO | Lista as manifestações do cidadão autenticado. |
| GET | `/ouvidoria/protocolo/:protocolo` | CIDADAO | Consulta uma manifestação pelo protocolo. |
| GET | `/ouvidoria/admin/todas` | ADMIN | Lista todas as manifestações. |
| PATCH | `/ouvidoria/admin/:id` | ADMIN | Atualiza uma manifestação. |

As rotas e os controles de acesso devem ser conferidos no código-fonte antes de futuras alterações nesta documentação.

## Testes e verificações

Na pasta `backend/`, estão disponíveis os seguintes comandos:

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

Além da compilação, recomenda-se testar os principais fluxos utilizando contas separadas para `ADMIN`, `GESTOR` e `CIDADAO`, verificando especialmente:

- Cadastro e autenticação.
- Controle de acesso por perfil.
- Gerenciamento de serviços e gestores.
- Criação de avaliações, inclusive anônimas.
- Respostas institucionais.
- Denúncias e moderação.
- Registro e acompanhamento de manifestações.
- Consulta das informações na Minha Área do Cidadão.
- Exibição dos indicadores do Painel de Transparência.

## Contexto acadêmico

O Guia Cidadão (também referido como FeedPalmas em materiais anteriores) é desenvolvido como projeto de extensão do curso de **Sistemas para Internet**, no Instituto Federal do Tocantins (IFTO), Campus Palmas.

A proposta relaciona o desenvolvimento de aplicações web a uma necessidade social: facilitar o acesso a informações e a participação dos cidadãos em assuntos relacionados aos serviços públicos municipais.

## Equipe

- **João Rafael Gomes Manchola Cifuentes**
- **Leandro Ribeiro da Silva**
- **Samuel Borges Lopes Araújo**

**Professor responsável:** Rodrigo Luiz dos Santos.

---

O projeto permanece em desenvolvimento e sujeito a melhorias, correções e validações. Esta documentação apresenta as funcionalidades e a estrutura da versão atual do sistema.