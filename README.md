# 🏆 Sistema de Afiliação - Backend API

Backend NestJS profissional seguindo **Domain-Driven Design (DDD)**, **Left-Right Pattern** e **Clean Code** para gerenciamento de sócios-torcedores e programas de afiliação.

[![NestJS](https://img.shields.io/badge/NestJS-E0234E?style=flat&logo=nestjs&logoColor=white)](https://nestjs.com/)
[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=flat&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-316192?style=flat&logo=postgresql&logoColor=white)](https://www.postgresql.org/)
[![Docker](https://img.shields.io/badge/Docker-2496ED?style=flat&logo=docker&logoColor=white)](https://www.docker.com/)

## 🚀 Stack Técnica

- **NestJS** - Framework backend
- **Drizzle ORM** - Type-safe ORM
- **PostgreSQL** - Banco de dados relacional
- **Better Auth** - Autenticação com Drizzle adapter
- **Zod** - Validação de schemas
- **TypeScript** - Type safety
- **Docker** - Containerização

## 🏗️ Arquitetura

### DDD (Domain-Driven Design)

```
src/
├── shared/                    # Shared Kernel
│   ├── domain/               # Either, Result, Entity base, Value Object base
│   ├── infrastructure/       # Database, Auth
│   └── application/          # DTOs compartilhados
│
├── modules/                  # Bounded Contexts
│   ├── plan/                # Contexto de Planos
│   │   ├── domain/          # Entidades, VOs, Interfaces
│   │   ├── application/     # Services + DTOs
│   │   ├── infrastructure/  # Repositórios + Schemas
│   │   └── presentation/    # Controllers
│   ├── member/              # Contexto de Membros
│   └── affiliate/           # Contexto de Afiliados
```

### Left-Right Pattern

Tratamento de erros type-safe usando `Either<Error, Success>`:

```typescript
type Result<T> = Either<DomainError, T>;

// Domínio retorna Result
const planOrError = Plan.create({ nome, precoMensal, beneficios });
if (planOrError.isLeft()) {
  return fail(planOrError.value); // propaga erro
}

// Controller converte para HTTP
const result = await this.service.create(dto);
if (result.isLeft()) {
  throw new HttpException(result.value.message, result.value.statusCode);
}
```

## 🚀 Quick Start com Docker (Recomendado)

A forma mais rápida de executar o projeto é usando Docker Compose, que configura automaticamente a API e o banco de dados.

### Pré-requisitos

- [Docker](https://www.docker.com/get-started) (versão 20.10+)
- [Docker Compose](https://docs.docker.com/compose/install/) (versão 2.0+)

### Passos para Executar

1. **Clone o repositório** (se ainda não tiver feito)
   ```bash
   git clone <repository-url>
   cd desafio-afiliacao
   ```

2. **Configure as variáveis de ambiente**
   ```bash
   cp .env.example .env
   ```
   
   Edite o arquivo `.env` e configure especialmente o `AUTH_SECRET`:
   ```env
   AUTH_SECRET=seu-secret-key-super-seguro-com-pelo-menos-32-caracteres
   ```

3. **Inicie os serviços com Docker Compose**
   ```bash
   docker-compose up -d
   ```
   
   Este comando irá:
   - ✅ Construir a imagem da API (multi-stage build otimizado)
   - ✅ Iniciar o PostgreSQL 16
   - ✅ Configurar a rede Docker
   - ✅ Aplicar health checks automáticos

4. **Aguarde os serviços iniciarem** (cerca de 30-60 segundos)
   ```bash
   docker-compose ps
   ```
   
   Você deve ver ambos os serviços com status `Up (healthy)`.

5. **Aplique as migrations do banco de dados**
   ```bash
   docker-compose exec api pnpm db:push
   ```

6. **Acesse a API**
   - API: http://localhost:3000/api
   - Health Check: http://localhost:3000/api (GET)

### Comandos Docker Úteis

```bash
# Ver logs em tempo real
docker-compose logs -f api

# Ver logs apenas do banco
docker-compose logs -f postgres

# Parar os serviços
docker-compose down

# Parar e remover volumes (⚠️ apaga dados)
docker-compose down -v

# Reconstruir a imagem da API
docker-compose build api

# Reiniciar apenas a API
docker-compose restart api

# Executar comandos dentro do container da API
docker-compose exec api pnpm db:studio
docker-compose exec api pnpm test
```

## 📦 Instalação Local (Desenvolvimento)

Se preferir executar localmente sem Docker:

### Pré-requisitos

- [Node.js](https://nodejs.org/) (versão 20+)
- [pnpm](https://pnpm.io/) (gerenciador de pacotes)
- [PostgreSQL](https://www.postgresql.org/download/) (versão 16+)

### Passos para Executar

1. **Instalar dependências**
   ```bash
   pnpm install
   ```

2. **Configurar variáveis de ambiente**
   ```bash
   cp .env.example .env
   ```
   
   Configure as variáveis no `.env`:
   ```env
   DB_HOST=localhost
   DB_PORT=5432
   DB_USER=postgres
   DB_PASSWORD=postgres
   DB_NAME=afiliacao_db
   AUTH_SECRET=seu-secret-key-super-seguro-com-pelo-menos-32-caracteres
   ```

3. **Iniciar PostgreSQL** (se não estiver usando Docker)
   ```bash
   # Com Docker (apenas banco)
   docker-compose up -d postgres
   
   # Ou use seu PostgreSQL local
   ```

4. **Aplicar migrations**
   ```bash
   pnpm db:push
   ```

5. **Iniciar em modo desenvolvimento**
   ```bash
   pnpm start:dev
   ```

   O servidor estará rodando em: **http://localhost:3000/api**

### Produção Local

```bash
pnpm build
pnpm start:prod
```

## 📚 Endpoints da API

Todos os endpoints (exceto `/api/auth/*`) requerem autenticação via Bearer token.

### Autenticação

- `POST /api/auth/sign-up` - Registrar usuário
- `POST /api/auth/sign-in` - Login
- `GET /api/auth/session` - Verificar sessão
- `POST /api/auth/sign-out` - Logout

### Plans

- `POST /api/plans` - Criar plano
- `GET /api/plans?cursor=&limit=10` - Listar planos (paginado)
- `GET /api/plans/:id` - Buscar plano por ID
- `PUT /api/plans/:id` - Atualizar plano
- `DELETE /api/plans/:id` - Deletar plano

### Members

- `POST /api/members` - Criar membro
- `GET /api/members?cursor=&limit=10` - Listar membros (paginado)
- `GET /api/members/:id` - Buscar membro por ID
- `GET /api/members/by-affiliate/:affiliateId?cursor=&limit=10` - Membros por afiliado
- `PUT /api/members/:id` - Atualizar membro
- `DELETE /api/members/:id` - Deletar membro

### Affiliates

- `POST /api/affiliates` - Criar afiliado
- `GET /api/affiliates?cursor=&limit=10` - Listar afiliados (paginado)
- `GET /api/affiliates/:id` - Buscar afiliado por ID
- `GET /api/affiliates/ranking?cursor=&limit=10` - Ranking de afiliados (por indicações)
- `PUT /api/affiliates/:id` - Atualizar afiliado
- `DELETE /api/affiliates/:id` - Deletar afiliado

## 🗄️ Modelo de Dados

### Entidades

#### Plan
- `id` (UUID)
- `nome` (string, 3-100 chars)
- `precoMensal` (decimal, > 0)
- `beneficios` (string, 10-500 chars)

#### Member
- `id` (UUID)
- `nome` (string, 3-200 chars)
- `email` (string, unique, formato válido)
- `telefone` (string, 10-11 dígitos)
- `planoId` (UUID, FK → Plan) **obrigatório**
- `afiliadoId` (UUID, FK → Affiliate) **opcional**

#### Affiliate
- `id` (UUID)
- `nome` (string, 3-200 chars)
- `codigo` (string, 6-20 chars, alfanumérico, unique)
- `userId` (UUID, FK → Better Auth User)

### Relacionamentos

- **Member → Plan**: N:1 (obrigatório, onDelete: RESTRICT)
- **Member → Affiliate**: N:1 (opcional, onDelete: SET NULL)
- **Affiliate → User**: 1:1 (obrigatório, onDelete: CASCADE)

## 🔧 Scripts Úteis

```bash
# Desenvolvimento
pnpm start:dev          # Rodar em modo watch
pnpm start:debug        # Rodar em modo debug

# Build
pnpm build              # Compilar TypeScript

# Database
pnpm db:generate        # Gerar migrations
pnpm db:push            # Aplicar migrations
pnpm db:studio          # Abrir Drizzle Studio
pnpm db:drop            # Dropar schema

# Testes
pnpm test               # Rodar testes unitários
pnpm test:e2e           # Rodar testes E2E
pnpm test:cov           # Cobertura de testes

# Lint
pnpm lint               # Rodar ESLint
pnpm format             # Formatar código com Prettier
```

## 🎯 Funcionalidades Principais

### ✅ CRUD Completo
- Plans, Members e Affiliates com validação completa

### ✅ Autenticação
- Better Auth com sessões no banco
- Todos os endpoints protegidos (exceto auth)
- Guard personalizado para NestJS

### ✅ Paginação Cursor-Based
- Performance otimizada para grandes datasets
- Query params: `?cursor=uuid&limit=10`
- Response: `{ data, nextCursor, hasMore }`

### ✅ Endpoints Especiais
- **Ranking de Afiliados**: JOIN + COUNT + ORDER BY indicações
- **Membros por Afiliado**: Filtro por `afiliadoId`

### ✅ Validação em Camadas
- **Presentation**: Zod schemas nos DTOs
- **Domain**: Value Objects com regras de negócio

### ✅ Error Handling Type-Safe
- Left-Right Pattern (Railway-Oriented Programming)
- Erros de domínio com code + statusCode
- Propagação sem exceptions no domínio

## 📖 Padrões de Design Utilizados

### DDD (Domain-Driven Design)
- **Bounded Contexts**: Plan, Member, Affiliate
- **Entities**: Agregados com invariantes
- **Value Objects**: Validação de dados (Email, Phone, etc.)
- **Repository Pattern**: Abstração de persistência

### Clean Code
- **Single Responsibility**: Uma responsabilidade por classe
- **Dependency Inversion**: Domínio não depende de infraestrutura
- **Interface Segregation**: Interfaces específicas

### Left-Right Pattern
- **Type Safety**: Erros em tempo de compilação
- **Railway-Oriented**: Either<Error, Success>
- **Sem Exceptions no Domínio**: Erros como valores

## 🔐 Segurança

- ✅ Autenticação obrigatória em todos os endpoints
- ✅ Validação de dados com Zod
- ✅ Foreign Keys para integridade referencial
- ✅ CORS configurado
- ✅ Passwords não retornados nas responses

## 📝 Notas Técnicas

### Cursor Pagination
- Usa `id` + `createdAt` como cursor
- Query: `WHERE id > cursor ORDER BY createdAt DESC, id DESC LIMIT n+1`
- Performance superior ao offset-based

### Better Auth Integration
- Schemas gerenciados pelo Drizzle
- Session token no header: `Authorization: Bearer <token>`
- Validação via guard personalizado

### Database Constraints
- UUIDs para todos os IDs
- Unique: `member.email`, `affiliate.codigo`
- FK policies: RESTRICT, SET NULL, CASCADE

## 🐳 Docker

### Estrutura Docker

O projeto utiliza Docker Compose para orquestração de serviços:

- **API**: Container NestJS com build multi-stage otimizado
- **PostgreSQL**: Banco de dados com persistência de dados
- **Network**: Rede isolada para comunicação entre serviços
- **Volumes**: Persistência de dados do PostgreSQL

### Dockerfile

O Dockerfile utiliza build multi-stage para otimizar o tamanho da imagem:

- **Stage 1 (builder)**: Instala dependências e compila o projeto
- **Stage 2 (production)**: Copia apenas arquivos necessários e dependências de produção

### Variáveis de Ambiente no Docker

As variáveis podem ser configuradas no arquivo `.env` ou diretamente no `docker-compose.yml`. O Docker Compose automaticamente:

- Conecta a API ao PostgreSQL usando o nome do serviço (`postgres`)
- Configura health checks para garantir que os serviços estão prontos
- Gerencia dependências entre serviços (API aguarda PostgreSQL estar saudável)

### Build e Deploy

```bash
# Build da imagem
docker-compose build

# Build sem cache
docker-compose build --no-cache

# Push para registry (exemplo)
docker tag desafio-afiliacao-api:latest seu-registry/api:latest
docker push seu-registry/api:latest
```

## 🚧 Próximos Passos (Opcional)

- [x] Docker multi-stage build
- [x] Health check endpoint
- [ ] Testes unitários e E2E
- [ ] Swagger/OpenAPI documentation
- [ ] Rate limiting
- [ ] Logs estruturados
- [ ] CI/CD pipeline
- [ ] Monitoramento e métricas

## 🤝 Contribuindo

Contribuições são bem-vindas! Por favor:

1. Faça um fork do projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## 📝 Estrutura do Projeto

```
desafio-afiliacao/
├── src/
│   ├── modules/              # Módulos de negócio (DDD)
│   │   ├── plan/            # Contexto de Planos
│   │   ├── member/          # Contexto de Membros
│   │   └── affiliate/       # Contexto de Afiliados
│   ├── shared/              # Código compartilhado
│   │   ├── domain/         # Base classes (Entity, ValueObject, Either)
│   │   ├── infrastructure/ # Database, Auth
│   │   └── application/    # DTOs compartilhados
│   └── database/           # Schemas e migrations
├── test/                    # Testes E2E
├── Dockerfile              # Build multi-stage da API
├── docker-compose.yml     # Orquestração de serviços
├── .env.example           # Template de variáveis de ambiente
└── README.md              # Este arquivo
```

## 📄 Licença

Este projeto está sob a licença UNLICENSED. Todos os direitos reservados.

---

**Desenvolvido com ❤️ usando NestJS, DDD e Clean Architecture**
