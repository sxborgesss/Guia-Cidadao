# FeedPalmas — Guia Cidadão

**Sistema de avaliação e feedback dos serviços públicos de Palmas – TO**

O **FeedPalmas** é um projeto de extensão desenvolvido no curso de Sistemas para Internet, com o objetivo de aproximar os cidadãos dos serviços públicos de Palmas, Tocantins, por meio da tecnologia.

A aplicação busca facilitar o acesso a informações sobre serviços públicos e apoiar a participação cidadã, promovendo maior transparência e contribuindo para a melhoria da qualidade do atendimento oferecido à população.

## Objetivos do projeto

- Facilitar o acesso a informações sobre serviços públicos de Palmas.
- Incentivar a participação dos cidadãos na avaliação dos serviços públicos.
- Contribuir para a transparência e a melhoria contínua do atendimento público.
- Desenvolver uma aplicação web organizada, responsiva e com controle de acesso por perfil de usuário.

## Funcionalidades implementadas

- **Autenticação:** cadastro e login de usuários.
- **Controle de acesso:** permissões de acordo com os perfis de cidadão, gestor e administrador.
- **Gerenciamento de gestores:** cadastro e consulta de gestores pelo administrador.
- **Mapas:** visualização da localização dos serviços públicos.

O projeto continua em desenvolvimento. As funcionalidades serão documentadas como concluídas à medida que forem implementadas e testadas.

## Tecnologias utilizadas

### Frontend
- React
- Next.js
- TypeScript
- Tailwind CSS
- Leaflet e React Leaflet

### Backend
- Node.js
- NestJS
- TypeScript
- TypeORM
- JWT para autenticação
- bcrypt para proteção de senhas

### Banco de dados
- PostgreSQL

### Ferramentas
- Git
- GitHub

## Estrutura do projeto

O repositório está organizado em duas partes principais:

- `frontend/`: aplicação web e interface do usuário.
- `backend/`: API responsável pelas regras de negócio, autenticação e acesso aos dados.

## Pré-requisitos

Antes de executar o projeto, é necessário ter instalado:

- **Node.js:** ambiente de execução do JavaScript.
- **npm:** gerenciador de pacotes instalado com o Node.js.
- **PostgreSQL:** sistema de gerenciamento do banco de dados.
- **Git:** ferramenta para obter o código-fonte do repositório.

## Configuração do banco de dados

1. Inicie o PostgreSQL.
2. Crie um banco de dados chamado `guia_cidadao`.
3. Configure as variáveis de ambiente utilizadas pelo backend.

Na pasta `backend/`, crie um arquivo chamado `.env` com o seguinte conteúdo de exemplo:

```env
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=sua_senha
DB_DATABASE=guia_cidadao
```

Substitua `sua_senha` pela senha configurada no seu PostgreSQL. Ajuste também a porta caso sua instalação utilize uma diferente da porta padrão `5432`.

**Importante:** o arquivo `.env` contém configurações locais e não deve ser enviado ao GitHub com senhas reais.

## Instalação e execução

### 1. Obter o projeto

Clone o repositório e entre na pasta do projeto:

```bash
git clone https://github.com/sxborgesss/Guia-Cidadao.git
cd Guia-Cidadao
```

### 2. Instalar as dependências do backend

Abra um terminal na pasta raiz do projeto e execute:

```bash
cd backend
npm install
```

### 3. Iniciar o backend

Ainda na pasta `backend/`, execute:

```bash
npm run start:dev
```

O backend ficará disponível em:

`http://localhost:3001`

Mantenha esse terminal aberto enquanto utilizar a aplicação.

### 4. Instalar as dependências do frontend

Abra um segundo terminal, na pasta raiz do projeto, e execute:

```bash
cd frontend
npm install
```

### 5. Iniciar o frontend

Na pasta `frontend/`, execute:

```bash
npm run dev
```

A aplicação web ficará disponível em:

`http://localhost:3000`

### 6. Acessar a aplicação

Com o banco de dados e os dois servidores em execução, abra o navegador e acesse:

`http://localhost:3000`

## Observações

- O banco de dados deve estar em execução antes de iniciar o backend.
- As configurações de conexão devem corresponder à instalação local do PostgreSQL.
- O projeto utiliza `synchronize: true` na configuração do TypeORM. Essa opção pode criar ou ajustar tabelas automaticamente e deve ser avaliada com cuidado antes de utilizar o sistema em produção.
- A chave JWT atualmente configurada no código é temporária e deve ser substituída por uma configuração segura por variável de ambiente antes de uma implantação em produção.

## Contexto acadêmico

O FeedPalmas é desenvolvido como um projeto de extensão do curso de **Sistemas para Internet**, no Instituto Federal do Tocantins (IFTO), Campus Palmas.

A proposta relaciona o desenvolvimento de aplicações web a uma necessidade social: facilitar o acesso dos cidadãos às informações e aos canais de participação relacionados aos serviços públicos municipais.

Além do desenvolvimento técnico, o projeto permite aplicar conhecimentos de programação, banco de dados, autenticação, organização de sistemas e trabalho colaborativo com controle de versão.

## Equipe do projeto

- **João Rafael Gomes Manchola Cifuentes**
- **Leandro Ribeiro da Silva**
- **Samuel Borges Lopes Araújo**

**Professor responsável:** Rodrigo Luiz dos Santos.

## Contribuições no desenvolvimento

O desenvolvimento envolve atividades de planejamento, implementação e integração dos componentes da aplicação.

Entre as atividades técnicas realizadas no projeto estão:

- Desenvolvimento da interface web;
- Implementação de funcionalidades no backend;
- Integração com o banco de dados PostgreSQL;
- Implementação de autenticação e controle de acesso por perfil;
- Organização e versionamento do código-fonte com Git e GitHub;
- Desenvolvimento de funcionalidades relacionadas à localização dos serviços públicos.

O trabalho é realizado de forma colaborativa, com o objetivo de integrar os diferentes componentes da aplicação.

## Situação do projeto

O FeedPalmas encontra-se em desenvolvimento. O README será atualizado conforme novas funcionalidades forem concluídas e testadas.

A documentação também poderá evoluir para incluir capturas de tela da aplicação, detalhes das rotas da API, exemplos de uso e informações adicionais sobre a arquitetura do sistema.
