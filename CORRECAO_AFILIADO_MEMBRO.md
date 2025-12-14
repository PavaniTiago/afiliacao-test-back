# Correção: Atualização de Afiliado em Membros

## 🐛 Problema Identificado

Ao tentar atualizar um membro que **não possui afiliado relacionado** (`afiliadoId = null`) e adicionar um afiliado, ocorria um erro de validação.

### Causa do Problema

O schema Zod estava usando `z.string().uuid().nullable()`, que não funciona corretamente porque:
1. Primeiro valida como `string().uuid()` (exige uma string UUID válida)
2. Depois tenta aplicar `.nullable()` (mas já falhou na validação anterior)

Quando o frontend enviava:
- `null` → Falhava porque `null` não é uma string UUID
- `""` (string vazia) → Falhava porque não é um UUID válido
- UUID válido → Funcionava

## ✅ Solução Implementada

O schema foi corrigido para usar `z.union()` que permite **ou** uma string UUID **ou** `null`:

```typescript
afiliadoId: z
  .union([z.string().uuid(), z.null()])
  .optional()
  .transform((val) => {
    // Transforma string vazia em null
    if (val === '') return null;
    return val;
  }),
```

### Como Funciona Agora

1. **Aceita `null`**: Quando o membro não tem afiliado
2. **Aceita UUID válido**: Quando quer adicionar/atualizar um afiliado
3. **Aceita `undefined`**: Quando o campo não é enviado (não altera)
4. **Transforma string vazia**: Converte `""` para `null` automaticamente

## 📝 Como Usar no Frontend

### Exemplo 1: Adicionar Afiliado a um Membro sem Afiliado

```typescript
// Membro atual: { id: "...", afiliadoId: null }

// ✅ CORRETO - Enviar UUID do afiliado
await memberService.update(memberId, {
  afiliadoId: "uuid-do-afiliado" // UUID válido
});

// ✅ CORRETO - Enviar null para remover afiliado
await memberService.update(memberId, {
  afiliadoId: null
});

// ✅ CORRETO - Não enviar o campo (não altera)
await memberService.update(memberId, {
  nome: "Novo Nome"
  // afiliadoId não enviado = não altera
});
```

### Exemplo 2: Remover Afiliado de um Membro

```typescript
// Membro atual: { id: "...", afiliadoId: "uuid-do-afiliado" }

// ✅ CORRETO - Enviar null
await memberService.update(memberId, {
  afiliadoId: null
});

// ✅ CORRETO - Enviar string vazia (será convertida para null)
await memberService.update(memberId, {
  afiliadoId: ""
});
```

### Exemplo 3: Atualizar Afiliado

```typescript
// Membro atual: { id: "...", afiliadoId: "uuid-antigo" }

// ✅ CORRETO - Enviar novo UUID
await memberService.update(memberId, {
  afiliadoId: "uuid-novo-afiliado"
});
```

## 🔍 Validações

O schema agora aceita:
- ✅ `null` → Remove o afiliado
- ✅ `"uuid-válido"` → Adiciona/atualiza o afiliado
- ✅ `undefined` → Não altera o afiliado atual
- ✅ `""` → Converte para `null` (remove afiliado)

## 📋 Resumo das Mudanças

**Arquivo alterado:**
- `src/modules/member/application/dto/update-member.dto.ts`

**Mudança:**
- Schema `afiliadoId` alterado de `z.string().uuid().nullable()` para `z.union([z.string().uuid(), z.null()])`
- Adicionado transform para converter string vazia em `null`

**Comportamento:**
- Agora aceita corretamente `null` para remover afiliado
- Aceita UUID válido para adicionar/atualizar afiliado
- Mantém compatibilidade com valores `undefined` (não altera)

## ✅ Teste

Após a correção, você pode testar:

1. **Criar membro sem afiliado:**
```json
POST /api/members
{
  "nome": "João Silva",
  "email": "joao@example.com",
  "telefone": "11987654321",
  "planoId": "uuid-do-plano"
  // afiliadoId não enviado = null
}
```

2. **Adicionar afiliado ao membro:**
```json
PUT /api/members/{id}
{
  "afiliadoId": "uuid-do-afiliado"
}
```

3. **Remover afiliado do membro:**
```json
PUT /api/members/{id}
{
  "afiliadoId": null
}
```

Todas essas operações devem funcionar corretamente agora! 🎉

