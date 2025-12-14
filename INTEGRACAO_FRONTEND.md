# Documentação de Integração - Frontend Next.js

Este documento descreve como integrar o frontend Next.js com o backend da API de Afiliação.

## 📋 Índice

- [Configuração Inicial](#configuração-inicial)
- [Autenticação](#autenticação)
- [Estrutura de Respostas](#estrutura-de-respostas)
- [Tratamento de Erros](#tratamento-de-erros)
- [Endpoints](#endpoints)
  - [Autenticação](#endpoints-de-autenticação)
  - [Afiliados](#endpoints-de-afiliados)
  - [Membros](#endpoints-de-membros)
  - [Planos](#endpoints-de-planos)
- [Exemplos de Código Next.js](#exemplos-de-código-nextjs)

---

## Configuração Inicial

### Variáveis de Ambiente

Configure as seguintes variáveis no seu projeto Next.js (`.env.local`):

```env
NEXT_PUBLIC_API_URL=http://localhost:3000/api
```

**Nota:** O backend roda na porta 3000 por padrão e usa o prefixo `/api` para todas as rotas.

### Base URL

Todas as requisições devem ser feitas para:
```
{API_URL}/api
```

---

## Autenticação

A API utiliza **Better Auth** para autenticação. Todas as rotas protegidas usam **cookies HTTP-only** para autenticação automática.

### Fluxo de Autenticação

1. **Registro de Usuário**
2. **Login** (cookie de sessão criado automaticamente)
3. **Requisições Autenticadas** (cookie enviado automaticamente)
4. **Sign-out** (cookie removido automaticamente)

### Endpoints de Autenticação

A autenticação é gerenciada através do Better Auth. Todos os endpoints de auth estão disponíveis em:

```
POST /api/auth/sign-up
POST /api/auth/sign-in
POST /api/auth/sign-out
GET  /api/auth/session
```

**Importante sobre Cookies:**
- O Better Auth usa **cookies HTTP-only** para armazenar o token de sessão
- Os cookies são enviados automaticamente pelo navegador em todas as requisições
- Para que isso funcione, você **DEVE** incluir `credentials: 'include'` em todas as requisições fetch
- O sign-out funciona **removendo o cookie** do navegador, não requer ação manual no frontend

### Exemplo de Configuração do Better Auth no Next.js

```typescript
// lib/auth.ts
import { createAuthClient } from 'better-auth/react';

export const authClient = createAuthClient({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000',
  // IMPORTANTE: Garante que os cookies sejam enviados
  fetchOptions: {
    credentials: 'include',
  },
});

export const {
  signIn,
  signUp,
  signOut,
  useSession,
} = authClient;
```

### Como usar o Sign-Out

O sign-out é simples - basta chamar a função `signOut()`:

```typescript
// Em um componente
import { signOut } from '@/lib/auth';

function LogoutButton() {
  const handleLogout = async () => {
    try {
      await signOut();
      // O cookie será automaticamente removido
      // Redirecione para a página de login
      window.location.href = '/login';
    } catch (error) {
      console.error('Erro ao fazer logout:', error);
    }
  };

  return <button onClick={handleLogout}>Sair</button>;
}
```

**O que acontece durante o sign-out:**
1. O frontend chama `POST /api/auth/sign-out`
2. O backend invalida a sessão no banco de dados
3. O backend envia um cookie `Set-Cookie` com `Max-Age=0` para remover o cookie
4. O navegador remove automaticamente o cookie
5. Requisições futuras não terão mais autenticação

### Configuração de Requisições

O Better Auth usa **cookies HTTP-only** para gerenciar a sessão. Isso significa que:
- O navegador envia os cookies automaticamente com cada requisição
- Você **NÃO precisa** adicionar tokens manualmente no header Authorization
- **IMPORTANTE:** Sempre inclua `credentials: 'include'` nas requisições fetch

```typescript
// lib/api.ts
export async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}${endpoint}`,
    {
      ...options,
      credentials: 'include', // IMPORTANTE: Envia cookies automaticamente
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    }
  );

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Erro na requisição');
  }

  return response.json();
}
```

---

## Estrutura de Respostas

### Resposta de Sucesso

```typescript
// Resposta única
{
  id: "uuid",
  // ... campos do recurso
  createdAt: "2024-01-01T00:00:00.000Z",
  updatedAt: "2024-01-01T00:00:00.000Z"
}

// Resposta paginada
{
  data: [...],
  nextCursor: "uuid" | null,
  hasMore: boolean
}
```

### Resposta de Erro

```typescript
{
  message: string,
  code?: string,
  statusCode: number
}
```

---

## Tratamento de Erros

A API retorna erros no seguinte formato:

```typescript
{
  message: "Mensagem de erro descritiva",
  code: "ERROR_CODE", // Opcional
  statusCode: 400 | 401 | 404 | 500
}
```

### Códigos de Status HTTP

- `200` - Sucesso
- `201` - Criado com sucesso
- `400` - Erro de validação
- `401` - Não autenticado
- `404` - Recurso não encontrado
- `500` - Erro interno do servidor

### Exemplo de Tratamento de Erros

```typescript
try {
  const data = await apiRequest('/affiliates', {
    method: 'POST',
    body: JSON.stringify(affiliateData),
  });
} catch (error) {
  if (error instanceof Error) {
    // Erro de validação ou outro erro da API
    console.error('Erro:', error.message);
  }
}
```

---

## Endpoints

### Endpoints de Afiliados

#### Criar Afiliado

```http
POST /api/affiliates
Authorization: Bearer {token}
Content-Type: application/json
```

**Body:**
```json
{
  "nome": "João Silva",
  "codigo": "AFF001"
}
```

**Validações:**
- `nome`: string, mínimo 3 caracteres, máximo 200
- `codigo`: string, mínimo 6 caracteres, máximo 20, apenas alfanumérico
- `userId`: **NÃO é necessário enviar** - o backend obtém automaticamente do usuário autenticado

**Importante:** O `userId` é preenchido automaticamente pelo backend usando o ID do usuário autenticado (obtido do token de sessão). Você **não precisa** enviar o `userId` no body da requisição.

**Resposta:**
```json
{
  "id": "uuid",
  "nome": "João Silva",
  "codigo": "AFF001",
  "userId": "uuid-do-usuario",
  "createdAt": "2024-01-01T00:00:00.000Z",
  "updatedAt": "2024-01-01T00:00:00.000Z"
}
```

#### Listar Afiliados

```http
GET /api/affiliates?cursor={uuid}&limit=10
Authorization: Bearer {token}
```

**Query Parameters:**
- `cursor` (opcional): UUID do cursor para paginação
- `limit` (opcional): Número de itens por página (1-100, padrão: 10)

**Resposta:**
```json
{
  "data": [
    {
      "id": "uuid",
      "nome": "João Silva",
      "codigo": "AFF001",
      "userId": "uuid-do-usuario",
      "createdAt": "2024-01-01T00:00:00.000Z",
      "updatedAt": "2024-01-01T00:00:00.000Z"
    }
  ],
  "nextCursor": "uuid" | null,
  "hasMore": true
}
```

#### Obter Ranking de Afiliados

```http
GET /api/affiliates/ranking?cursor={uuid}&limit=10
Authorization: Bearer {token}
```

**Query Parameters:** (mesmos da listagem)

**Resposta:**
```json
{
  "data": [
    {
      "affiliate": {
        "id": "uuid",
        "nome": "João Silva",
        "codigo": "AFF001",
        "userId": "uuid-do-usuario",
        "createdAt": "2024-01-01T00:00:00.000Z",
        "updatedAt": "2024-01-01T00:00:00.000Z"
      },
      "indicationCount": 15
    }
  ],
  "nextCursor": "uuid" | null,
  "hasMore": true
}
```

#### Obter Afiliado por ID

```http
GET /api/affiliates/{id}
Authorization: Bearer {token}
```

**Resposta:**
```json
{
  "id": "uuid",
  "nome": "João Silva",
  "codigo": "AFF001",
  "userId": "uuid-do-usuario",
  "createdAt": "2024-01-01T00:00:00.000Z",
  "updatedAt": "2024-01-01T00:00:00.000Z"
}
```

#### Atualizar Afiliado

```http
PUT /api/affiliates/{id}
Authorization: Bearer {token}
Content-Type: application/json
```

**Body:** (todos os campos são opcionais)
```json
{
  "nome": "João Silva Santos",
  "codigo": "AFF001UPD"
}
```

**Resposta:** (mesma estrutura do criar)

#### Deletar Afiliado

```http
DELETE /api/affiliates/{id}
Authorization: Bearer {token}
```

**Resposta:**
```json
{
  "message": "Affiliate deleted successfully"
}
```

---

### Endpoints de Membros

#### Criar Membro

```http
POST /api/members
Authorization: Bearer {token}
Content-Type: application/json
```

**Body:**
```json
{
  "nome": "Maria Santos",
  "email": "maria@example.com",
  "telefone": "11987654321",
  "planoId": "uuid-do-plano",
  "afiliadoId": "uuid-do-afiliado" // Opcional
}
```

**Validações:**
- `nome`: string, mínimo 3 caracteres, máximo 200
- `email`: string, email válido, máximo 255 caracteres
- `telefone`: string, mínimo 10 caracteres, máximo 11
- `planoId`: UUID válido
- `afiliadoId`: UUID válido (opcional)

**Resposta:**
```json
{
  "id": "uuid",
  "nome": "Maria Santos",
  "email": "maria@example.com",
  "telefone": "11987654321",
  "planoId": "uuid-do-plano",
  "afiliadoId": "uuid-do-afiliado" | null,
  "createdAt": "2024-01-01T00:00:00.000Z",
  "updatedAt": "2024-01-01T00:00:00.000Z"
}
```

#### Listar Membros

```http
GET /api/members?cursor={uuid}&limit=10
Authorization: Bearer {token}
```

**Query Parameters:** (mesmos da listagem de afiliados)

**Resposta:** (mesma estrutura paginada)

#### Listar Membros por Afiliado

```http
GET /api/members/by-affiliate/{affiliateId}?cursor={uuid}&limit=10
Authorization: Bearer {token}
```

**Query Parameters:** (mesmos da listagem)

**Resposta:** (mesma estrutura paginada)

#### Obter Membro por ID

```http
GET /api/members/{id}
Authorization: Bearer {token}
```

**Resposta:** (mesma estrutura do criar)

#### Atualizar Membro

```http
PUT /api/members/{id}
Authorization: Bearer {token}
Content-Type: application/json
```

**Body:** (todos os campos são opcionais)
```json
{
  "nome": "Maria Santos Silva",
  "email": "maria.silva@example.com",
  "telefone": "11987654322",
  "planoId": "uuid-do-plano",
  "afiliadoId": "uuid-do-afiliado" | null
}
```

**Resposta:** (mesma estrutura do criar)

#### Deletar Membro

```http
DELETE /api/members/{id}
Authorization: Bearer {token}
```

**Resposta:**
```json
{
  "message": "Member deleted successfully"
}
```

---

### Endpoints de Planos

#### Criar Plano

```http
POST /api/plans
Authorization: Bearer {token}
Content-Type: application/json
```

**Body:**
```json
{
  "nome": "Plano Premium",
  "precoMensal": 99.90,
  "beneficios": "Acesso completo a todas as funcionalidades premium"
}
```

**Validações:**
- `nome`: string, mínimo 3 caracteres, máximo 100
- `precoMensal`: number, positivo, máximo 1000000
- `beneficios`: string, mínimo 10 caracteres, máximo 500

**Resposta:**
```json
{
  "id": "uuid",
  "nome": "Plano Premium",
  "precoMensal": 99.90,
  "beneficios": "Acesso completo a todas as funcionalidades premium",
  "createdAt": "2024-01-01T00:00:00.000Z",
  "updatedAt": "2024-01-01T00:00:00.000Z"
}
```

#### Listar Planos

```http
GET /api/plans?cursor={uuid}&limit=10
Authorization: Bearer {token}
```

**Query Parameters:** (mesmos da listagem de afiliados)

**Resposta:** (mesma estrutura paginada)

#### Obter Plano por ID

```http
GET /api/plans/{id}
Authorization: Bearer {token}
```

**Resposta:** (mesma estrutura do criar)

#### Atualizar Plano

```http
PUT /api/plans/{id}
Authorization: Bearer {token}
Content-Type: application/json
```

**Body:** (todos os campos são opcionais)
```json
{
  "nome": "Plano Premium Plus",
  "precoMensal": 149.90,
  "beneficios": "Acesso completo + suporte prioritário"
}
```

**Resposta:** (mesma estrutura do criar)

#### Deletar Plano

```http
DELETE /api/plans/{id}
Authorization: Bearer {token}
```

**Resposta:**
```json
{
  "message": "Plan deleted successfully"
}
```

---

## Exemplos de Código Next.js

### Configuração do Cliente API

```typescript
// lib/api-client.ts
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

export class ApiClient {
  private baseURL: string;

  constructor(baseURL: string = API_URL) {
    this.baseURL = baseURL;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    const response = await fetch(url, {
      ...options,
      credentials: 'include', // IMPORTANTE: Envia cookies automaticamente
      headers,
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({
        message: 'Erro desconhecido',
      }));
      throw new Error(error.message || `Erro: ${response.status}`);
    }

    return response.json();
  }

  async get<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: 'GET' });
  }

  async post<T>(endpoint: string, data?: unknown): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async put<T>(endpoint: string, data?: unknown): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async delete<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: 'DELETE' });
  }
}

export const apiClient = new ApiClient();
```

### Tipos TypeScript

```typescript
// types/api.ts

export interface Affiliate {
  id: string;
  nome: string;
  codigo: string;
  userId: string;
  createdAt: string;
  updatedAt: string;
}

export interface AffiliateRanking {
  affiliate: Affiliate;
  indicationCount: number;
}

export interface Member {
  id: string;
  nome: string;
  email: string;
  telefone: string;
  planoId: string;
  afiliadoId: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface Plan {
  id: string;
  nome: string;
  precoMensal: number;
  beneficios: string;
  createdAt: string;
  updatedAt: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  nextCursor: string | null;
  hasMore: boolean;
}

export interface CreateAffiliateDto {
  nome: string;
  codigo: string;
  // userId não é necessário - o backend obtém automaticamente do usuário autenticado
}

export interface UpdateAffiliateDto {
  nome?: string;
  codigo?: string;
}

export interface CreateMemberDto {
  nome: string;
  email: string;
  telefone: string;
  planoId: string;
  afiliadoId?: string;
}

export interface UpdateMemberDto {
  nome?: string;
  email?: string;
  telefone?: string;
  planoId?: string;
  afiliadoId?: string | null;
}

export interface CreatePlanDto {
  nome: string;
  precoMensal: number;
  beneficios: string;
}

export interface UpdatePlanDto {
  nome?: string;
  precoMensal?: number;
  beneficios?: string;
}
```

### Serviços de API

```typescript
// services/affiliate.service.ts
import { apiClient } from '@/lib/api-client';
import type {
  Affiliate,
  AffiliateRanking,
  PaginatedResponse,
  CreateAffiliateDto,
  UpdateAffiliateDto,
} from '@/types/api';

export const affiliateService = {
  async create(data: Omit<CreateAffiliateDto, 'userId'>): Promise<Affiliate> {
    // userId não precisa ser enviado - o backend obtém automaticamente do usuário autenticado
    return apiClient.post<Affiliate>('/api/affiliates', data);
  },

  async list(params?: {
    cursor?: string;
    limit?: number;
  }): Promise<PaginatedResponse<Affiliate>> {
    const queryParams = new URLSearchParams();
    if (params?.cursor) queryParams.set('cursor', params.cursor);
    if (params?.limit) queryParams.set('limit', params.limit.toString());

    const query = queryParams.toString();
    return apiClient.get<PaginatedResponse<Affiliate>>(
      `/api/affiliates${query ? `?${query}` : ''}`
    );
  },

  async getRanking(params?: {
    cursor?: string;
    limit?: number;
  }): Promise<PaginatedResponse<AffiliateRanking>> {
    const queryParams = new URLSearchParams();
    if (params?.cursor) queryParams.set('cursor', params.cursor);
    if (params?.limit) queryParams.set('limit', params.limit.toString());

    const query = queryParams.toString();
    return apiClient.get<PaginatedResponse<AffiliateRanking>>(
      `/api/affiliates/ranking${query ? `?${query}` : ''}`
    );
  },

  async getById(id: string): Promise<Affiliate> {
    return apiClient.get<Affiliate>(`/api/affiliates/${id}`);
  },

  async update(id: string, data: UpdateAffiliateDto): Promise<Affiliate> {
    return apiClient.put<Affiliate>(`/api/affiliates/${id}`, data);
  },

  async delete(id: string): Promise<{ message: string }> {
    return apiClient.delete<{ message: string }>(`/api/affiliates/${id}`);
  },
};
```

```typescript
// services/member.service.ts
import { apiClient } from '@/lib/api-client';
import type {
  Member,
  PaginatedResponse,
  CreateMemberDto,
  UpdateMemberDto,
} from '@/types/api';

export const memberService = {
  async create(data: CreateMemberDto): Promise<Member> {
    return apiClient.post<Member>('/api/members', data);
  },

  async list(params?: {
    cursor?: string;
    limit?: number;
  }): Promise<PaginatedResponse<Member>> {
    const queryParams = new URLSearchParams();
    if (params?.cursor) queryParams.set('cursor', params.cursor);
    if (params?.limit) queryParams.set('limit', params.limit.toString());

    const query = queryParams.toString();
    return apiClient.get<PaginatedResponse<Member>>(
      `/api/members${query ? `?${query}` : ''}`
    );
  },

  async listByAffiliate(
    affiliateId: string,
    params?: { cursor?: string; limit?: number }
  ): Promise<PaginatedResponse<Member>> {
    const queryParams = new URLSearchParams();
    if (params?.cursor) queryParams.set('cursor', params.cursor);
    if (params?.limit) queryParams.set('limit', params.limit.toString());

    const query = queryParams.toString();
    return apiClient.get<PaginatedResponse<Member>>(
      `/api/members/by-affiliate/${affiliateId}${query ? `?${query}` : ''}`
    );
  },

  async getById(id: string): Promise<Member> {
    return apiClient.get<Member>(`/api/members/${id}`);
  },

  async update(id: string, data: UpdateMemberDto): Promise<Member> {
    return apiClient.put<Member>(`/api/members/${id}`, data);
  },

  async delete(id: string): Promise<{ message: string }> {
    return apiClient.delete<{ message: string }>(`/api/members/${id}`);
  },
};
```

```typescript
// services/plan.service.ts
import { apiClient } from '@/lib/api-client';
import type {
  Plan,
  PaginatedResponse,
  CreatePlanDto,
  UpdatePlanDto,
} from '@/types/api';

export const planService = {
  async create(data: CreatePlanDto): Promise<Plan> {
    return apiClient.post<Plan>('/api/plans', data);
  },

  async list(params?: {
    cursor?: string;
    limit?: number;
  }): Promise<PaginatedResponse<Plan>> {
    const queryParams = new URLSearchParams();
    if (params?.cursor) queryParams.set('cursor', params.cursor);
    if (params?.limit) queryParams.set('limit', params.limit.toString());

    const query = queryParams.toString();
    return apiClient.get<PaginatedResponse<Plan>>(
      `/api/plans${query ? `?${query}` : ''}`
    );
  },

  async getById(id: string): Promise<Plan> {
    return apiClient.get<Plan>(`/api/plans/${id}`);
  },

  async update(id: string, data: UpdatePlanDto): Promise<Plan> {
    return apiClient.put<Plan>(`/api/plans/${id}`, data);
  },

  async delete(id: string): Promise<{ message: string }> {
    return apiClient.delete<{ message: string }>(`/api/plans/${id}`);
  },
};
```

### Exemplo de Hook React (useAffiliates)

```typescript
// hooks/useAffiliates.ts
import { useState, useEffect } from 'react';
import { affiliateService } from '@/services/affiliate.service';
import type { Affiliate, PaginatedResponse } from '@/types/api';

export function useAffiliates(initialLimit = 10) {
  const [affiliates, setAffiliates] = useState<Affiliate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(false);

  const loadAffiliates = async (cursor?: string) => {
    try {
      setLoading(true);
      setError(null);

      const response: PaginatedResponse<Affiliate> = await affiliateService.list(
        { cursor, limit: initialLimit }
      );

      if (cursor) {
        setAffiliates((prev) => [...prev, ...response.data]);
      } else {
        setAffiliates(response.data);
      }

      setNextCursor(response.nextCursor);
      setHasMore(response.hasMore);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar afiliados');
    } finally {
      setLoading(false);
    }
  };

  const loadMore = () => {
    if (nextCursor && !loading) {
      loadAffiliates(nextCursor);
    }
  };

  useEffect(() => {
    loadAffiliates();
  }, []);

  return {
    affiliates,
    loading,
    error,
    hasMore,
    loadMore,
    refresh: () => loadAffiliates(),
  };
}
```

### Exemplo de Componente React

```typescript
// components/AffiliateList.tsx
'use client';

import { useAffiliates } from '@/hooks/useAffiliates';
import { affiliateService } from '@/services/affiliate.service';
import { useState } from 'react';

export function AffiliateList() {
  const { affiliates, loading, error, hasMore, loadMore } = useAffiliates();
  const [deleting, setDeleting] = useState<string | null>(null);

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja deletar este afiliado?')) {
      return;
    }

    try {
      setDeleting(id);
      await affiliateService.delete(id);
      // Recarregar lista ou remover do estado
      window.location.reload();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Erro ao deletar');
    } finally {
      setDeleting(null);
    }
  };

  if (loading && affiliates.length === 0) {
    return <div>Carregando...</div>;
  }

  if (error) {
    return <div>Erro: {error}</div>;
  }

  return (
    <div>
      <h2>Afiliados</h2>
      <ul>
        {affiliates.map((affiliate) => (
          <li key={affiliate.id}>
            <div>
              <strong>{affiliate.nome}</strong> - {affiliate.codigo}
            </div>
            <button
              onClick={() => handleDelete(affiliate.id)}
              disabled={deleting === affiliate.id}
            >
              {deleting === affiliate.id ? 'Deletando...' : 'Deletar'}
            </button>
          </li>
        ))}
      </ul>
      {hasMore && (
        <button onClick={loadMore} disabled={loading}>
          {loading ? 'Carregando...' : 'Carregar mais'}
        </button>
      )}
    </div>
  );
}
```

### Exemplo de Server Action (Next.js 14+)

```typescript
// app/actions/affiliate.actions.ts
'use server';

import { apiClient } from '@/lib/api-client';
import type { CreateAffiliateDto, Affiliate } from '@/types/api';

export async function createAffiliate(
  data: Omit<CreateAffiliateDto, 'userId'>
): Promise<{ success: boolean; data?: Affiliate; error?: string }> {
  try {
    // userId não precisa ser enviado - o backend obtém automaticamente do usuário autenticado
    const affiliate = await apiClient.post<Affiliate>('/api/affiliates', data);
    return { success: true, data: affiliate };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Erro desconhecido',
    };
  }
}
```

---

## Paginação com Cursor

A API utiliza paginação baseada em cursor. Para navegar entre páginas:

1. **Primeira requisição:** Não envie o parâmetro `cursor`
2. **Próximas páginas:** Use o valor de `nextCursor` da resposta anterior
3. **Verificar mais páginas:** Use o campo `hasMore` para saber se há mais dados

### Exemplo de Implementação

```typescript
let cursor: string | null = null;
let hasMore = true;
const allAffiliates: Affiliate[] = [];

while (hasMore) {
  const response = await affiliateService.list({
    cursor: cursor || undefined,
    limit: 50,
  });

  allAffiliates.push(...response.data);
  cursor = response.nextCursor;
  hasMore = response.hasMore;
}
```

---

## Notas Importantes

1. **CORS:** O backend está configurado para aceitar requisições do frontend. Certifique-se de que a URL do frontend está configurada corretamente no backend.

2. **Autenticação:** Todas as rotas (exceto auth) requerem autenticação. Sempre inclua o token Bearer no header `Authorization`.

3. **Validação:** A API valida todos os dados usando Zod. Erros de validação retornam status 400 com mensagens descritivas.

4. **IDs:** Todos os IDs são UUIDs. Certifique-se de usar UUIDs válidos ao fazer referências.

5. **Datas:** Todas as datas são retornadas no formato ISO 8601 (UTC).

---

## Troubleshooting

### Sign-Out não remove a autenticação

Se o sign-out não estiver funcionando corretamente, verifique:

1. **Cookies não estão sendo enviados:**
   - Certifique-se de incluir `credentials: 'include'` em **todas** as requisições fetch
   - Verifique se o `authClient` está configurado com `fetchOptions: { credentials: 'include' }`

2. **CORS bloqueando cookies:**
   - O backend já está configurado com `credentials: true` no CORS
   - Certifique-se de que a URL do frontend está correta no `.env` do backend (`APP_URL`)
   - Em desenvolvimento, backend e frontend devem estar na mesma origem ou CORS deve permitir

3. **Testando em diferentes domínios:**
   - Cookies HTTP-only **não funcionam** entre domínios diferentes (ex: localhost:3000 → localhost:4000)
   - Use um proxy ou certifique-se de que ambos estão no mesmo domínio

4. **Verificar se o cookie foi definido:**
   - Abra DevTools → Application → Cookies
   - Procure por um cookie com nome similar a `better-auth.session_token`
   - Após sign-out, este cookie deve ser removido

5. **Cache do navegador:**
   - Limpe o cache e cookies do navegador
   - Teste em uma aba anônima

### Exemplo de Debug

```typescript
// Para verificar se a sessão está ativa
import { useSession } from '@/lib/auth';

function DebugAuth() {
  const { data: session } = useSession();

  console.log('Sessão ativa:', session);

  return (
    <div>
      <pre>{JSON.stringify(session, null, 2)}</pre>
    </div>
  );
}
```

---

## Suporte

Para dúvidas ou problemas na integração, consulte a documentação do Better Auth ou entre em contato com a equipe de desenvolvimento.

