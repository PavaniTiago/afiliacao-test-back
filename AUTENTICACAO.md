# Guia de Autenticação - Better Auth Integration

## 📋 Respostas às Suas Perguntas

### 1. Formato do Token

**Resposta:** Sim, o `session.token` retornado pelo Better Auth (`RLU4dV5miUDVu38VmQ6DdoVBgUcK9rOm`) é o token correto para usar no header `Authorization`.

- **Não é um JWT**: O Better Auth usa tokens de sessão armazenados no banco de dados, não JWTs
- **Formato**: É um token alfanumérico único armazenado na coluna `token` da tabela `session`
- **Uso**: Deve ser enviado no header `Authorization: Bearer {token}`

### 2. Endpoint de Sessão

**Endpoint:** `GET /api/auth/session`

- ✅ O endpoint existe e é gerenciado pelo Better Auth através do `AuthController`
- ✅ Retorna informações da sessão atual, incluindo o `token`
- ✅ Funciona com cookies ou com header `Authorization: Bearer {token}`

**Exemplo de resposta:**
```json
{
  "user": {
    "id": "user-id",
    "email": "user@example.com",
    "name": "User Name"
  },
  "session": {
    "id": "session-id",
    "token": "RLU4dV5miUDVu38VmQ6DdoVBgUcK9rOm",
    "expiresAt": "2025-12-18T16:19:31.000Z"
  }
}
```

### 3. Autenticação nas Requisições

**Resposta:** As rotas protegidas aceitam **apenas token Bearer no header Authorization**.

- ❌ **Não aceita apenas cookies**: O `AuthGuard` extrai o token do header `Authorization`
- ✅ **Aceita token Bearer**: Formato `Authorization: Bearer {token}`
- ❌ **Não aceita ambos simultaneamente**: Apenas o header é verificado

**Como funciona:**
1. O `AuthGuard` extrai o token do header `Authorization: Bearer {token}`
2. Busca a sessão no banco de dados usando o token
3. Valida se a sessão existe e não está expirada
4. Se válida, permite o acesso; caso contrário, retorna 401

### 4. Validação no Backend

**Como o backend valida:**

1. **Extrai o token** do header `Authorization: Bearer {token}`
2. **Busca no banco** a sessão correspondente ao token
3. **Valida expiração** verificando se `expiresAt > now()`
4. **Retorna dados** do usuário e sessão se válido

**Código de validação:**
```typescript
// AuthGuard extrai o token
const token = request.headers.authorization.split(' ')[1];

// BetterAuthService valida buscando no banco
const session = await db
  .select()
  .from(session)
  .innerJoin(user, eq(session.userId, user.id))
  .where(
    and(
      eq(session.token, token),
      gt(session.expiresAt, new Date())
    )
  );
```

### 5. Exemplo de Requisição Autenticada

**Requisição HTTP completa:**

```http
GET /api/plans?limit=10 HTTP/1.1
Host: localhost:3000
Authorization: Bearer RLU4dV5miUDVu38VmQ6DdoVBgUcK9rOm
Content-Type: application/json
```

**Exemplo com fetch (JavaScript):**

```typescript
const token = 'RLU4dV5miUDVu38VmQ6DdoVBgUcK9rOm'; // Do session.token

const response = await fetch('http://localhost:3000/api/plans?limit=10', {
  method: 'GET',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json',
  },
});

const data = await response.json();
```

**Exemplo com axios:**

```typescript
import axios from 'axios';

const token = 'RLU4dV5miUDVu38VmQ6DdoVBgUcK9rOm';

const response = await axios.get('http://localhost:3000/api/plans', {
  params: { limit: 10 },
  headers: {
    'Authorization': `Bearer ${token}`,
  },
});
```

## 🔧 Implementação no Frontend Next.js

### 1. Obter o Token após Login

```typescript
// hooks/useAuth.ts
import { authClient } from '@/lib/auth';

export async function login(email: string, password: string) {
  const result = await authClient.signIn.email({
    email,
    password,
  });
  
  // O token está em result.data.session.token
  const token = result.data?.session?.token;
  
  if (token) {
    // Armazenar o token (localStorage, cookies, ou estado)
    localStorage.setItem('auth_token', token);
  }
  
  return result;
}
```

### 2. Criar Cliente API com Token

```typescript
// lib/api.ts
const API_URL = 'http://localhost:3000/api';

export async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  // Obter token do localStorage ou do estado
  const token = localStorage.getItem('auth_token');
  
  if (!token) {
    throw new Error('No authentication token. Please login.');
  }

  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
      ...options.headers,
    },
  });

  if (!response.ok) {
    if (response.status === 401) {
      // Token inválido - limpar e redirecionar
      localStorage.removeItem('auth_token');
      window.location.href = '/login';
      throw new Error('Session expired');
    }
    
    const error = await response.json();
    throw new Error(error.message || 'Request failed');
  }

  return response.json();
}
```

### 3. Usar o Cliente API

```typescript
// hooks/usePlans.ts
import { apiRequest } from '@/lib/api';

export function usePlans() {
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchPlans() {
      try {
        const data = await apiRequest('/plans?limit=10');
        setPlans(data.data);
      } catch (error) {
        console.error('Error fetching plans:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchPlans();
  }, []);

  return { plans, loading };
}
```

### 4. Hook com Better Auth Session

```typescript
// hooks/useApi.ts
import { useSession } from '@/lib/auth';

export function useApiRequest() {
  const { data: session } = useSession();
  
  const apiRequest = useCallback(async <T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> => {
    const token = session?.session?.token;
    
    if (!token) {
      throw new Error('Not authenticated');
    }

    const response = await fetch(`http://localhost:3000/api${endpoint}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
        ...options.headers,
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Request failed');
    }

    return response.json();
  }, [session]);

  return apiRequest;
}
```

## 🔍 Debugging

### Verificar se o Token está Sendo Enviado

```typescript
// Adicionar log antes da requisição
console.log('Token:', token);
console.log('Headers:', {
  'Authorization': `Bearer ${token}`,
});
```

### Verificar Resposta do Backend

```typescript
const response = await fetch(url, options);
console.log('Status:', response.status);
console.log('Headers:', Object.fromEntries(response.headers.entries()));

if (!response.ok) {
  const error = await response.text();
  console.error('Error:', error);
}
```

### Testar com cURL

```bash
curl -X GET "http://localhost:3000/api/plans?limit=10" \
  -H "Authorization: Bearer RLU4dV5miUDVu38VmQ6DdoVBgUcK9rOm" \
  -H "Content-Type: application/json"
```

## ⚠️ Problemas Comuns

### 1. Token não está sendo enviado
**Sintoma:** 401 "No authentication token provided"
**Solução:** Verificar se o header `Authorization` está sendo enviado

### 2. Token inválido ou expirado
**Sintoma:** 401 "Invalid or expired session"
**Solução:** 
- Verificar se o token está correto
- Verificar se a sessão não expirou no banco
- Fazer novo login para obter novo token

### 3. CORS errors
**Sintoma:** Erro de CORS no navegador
**Solução:** Verificar configuração de CORS no backend (`main.ts`)

## 📝 Resumo

1. ✅ **Token correto**: `session.token` do Better Auth
2. ✅ **Formato**: `Authorization: Bearer {token}`
3. ✅ **Validação**: Busca direta no banco de dados
4. ✅ **Endpoint**: `/api/auth/session` existe e funciona
5. ✅ **Apenas Bearer**: Não usa cookies, apenas header Authorization

O token `RLU4dV5miUDVu38VmQ6DdoVBgUcK9rOm` é válido e deve funcionar quando enviado corretamente no header `Authorization: Bearer RLU4dV5miUDVu38VmQ6DdoVBgUcK9rOm`.

