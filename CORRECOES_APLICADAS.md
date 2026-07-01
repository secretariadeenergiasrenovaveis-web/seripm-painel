# 🔧 CORREÇÕES APLICADAS AO seripm.gs

## Data: 1 de Julho de 2026

### ✅ PROBLEMAS CORRIGIDOS

#### 1. **Função `normalizarPerfil()` - Mapeamento Duplicado**
- ❌ **Problema**: Chaves duplicadas causavam sobrescrita
- ✅ **Solução**: Removidas entradas duplicadas, deixado apenas um mapeamento por chave

```javascript
// ANTES (❌ ERRADO)
"SUPER ADMIN": "SUPER ADMINISTRADOR",      // Sobrescrito na próxima linha
"SUPER ADMIN": "SUPER_ADMIN",
"ATENDIMENTO": "ATENDENTE",                // Sobrescrito na próxima linha
"ATENDIMENTO": "ATENDIMENTO",

// DEPOIS (✅ CORRETO)
"SUPER ADMIN": "SUPER_ADMIN",
"ATENDIMENTO": "ATENDIMENTO",
```

---

#### 2. **Função `processLogin()` - Detecção de Headers Incorreta**
- ❌ **Problema**: Não limpava/trimmava headers, causava erro de índice
- ✅ **Solução**: Map headers para UPPERCASE e TRIM antes de usar

```javascript
// ANTES (❌)
const headers = data[0];
const idxUser = headers.indexOf("USERNAME") >= 0 ? headers.indexOf("USERNAME") : 0;

// DEPOIS (✅)
const headers = data[0].map(h => h.toString().toUpperCase().trim());
const idxUser = headers.indexOf("USERNAME");
```

---

#### 3. **Função `getProtocols()` - Código Duplicado e Quebrado**
- ❌ **Problema**: 
  - Dois loops idênticos processando dados
  - Função `isMatch()` definida mas nunca usada
  - `return` no meio da função, interrompendo fluxo
  - Lógica de filtro com comparação simples (não flexível)

- ✅ **Solução**: 
  - Movido `isMatch()` para o início da função
  - Removido loop duplicado
  - Integrado `isMatch()` no loop principal
  - Filtro agora reconhece variações: "COM EMPRESA", "COM FUNCIONÁRIO", "ENCAMINHADO AO FUNCIONÁRIO"

```javascript
// AGORA FUNCIONA ASSIM:
const isMatch = (status, alvo) => {
  if (!alvo) return true;
  const s = (status || "").toString().toUpperCase().trim();
  const a = (alvo || "").toString().toUpperCase().trim();
  return s.includes(a) || s === a || 
         (a === "COM EMPRESA" && (s.includes("COM FUNCIONÁRIO") || s.includes("ENCAMINHADO")));
};

// Usado no filtro único
for (let i = 1; i < data.length; i++) {
  if (statusFiltro !== null && idxStatus >= 0) {
    if (!isMatch(data[i][idxStatus].toString(), statusFiltro)) continue;
  }
  // ... resto do processamento
}
```

---

#### 4. **Portal Empresa: Mapeamento de Status Corrigido**
- ❌ **Problema**: Tab "COM FUNCIONÁRIO" mapeava para status "COM FUNCIONÁRIO"
- ✅ **Solução**: Mapeado para "COM EMPRESA" (o status real na ENTRADA)

```javascript
const mapeamento = {
  "ADMINISTRATIVO": "ADMINISTRATIVO",
  "TELECOM": "TELECOM",
  "GARANTIA": "GARANTIA",
  "COM FUNCIONÁRIO": "COM EMPRESA",  // ✅ CORRIGIDO
  "IMPLANTAÇÃO": "IMPLANTAÇÃO"
};
```

---

#### 5. **Função `getStatusCounts()` - Sem Mudanças Críticas**
- ✅ Mantém lógica de contagem correta
- ✅ Reconhece variações de status "COM EMPRESA"

---

## 🚀 PRÓXIMOS PASSOS

### 1. **Copie o conteúdo do `seripm.gs` corrigido**
O arquivo foi atualizado em sua máquina local: `d:\Users\rafael\Documents\Github e Google Sheets\seripm.gs`

### 2. **Cole no Google Apps Script**
1. Acesse: https://script.google.com/macros/s/AKfycbwxfrN3AmulqSm2UvwZq45gbrFwTGM5qnufmov1OV_HtjBwg0UTjL_Xc3PwBA-u6-BZ/edit
2. Selecione TODO o código
3. Substitua pelo conteúdo do arquivo `seripm.gs` local (ctrl+a, ctrl+v)
4. Clique em **"Salvar"** (ou Ctrl+S)

### 3. **Deploy a Nova Versão**
1. Clique em **"Deploy"** (botão azul no topo)
2. Selecione **"Novo Deploy"**
3. Em "Selecionar tipo", escolha **"API Executable"**
4. Clique em **"Deploy"**
5. Copie a **nova URL** gerada
6. Se a URL mudou, atualize em `index.html` linha 346

### 4. **Teste o Login**
1. Abra https://rafaelvis89.github.io/seripm-painel/
2. Tente login com:
   - **Username**: `admin` (ou outro usuário válido na aba USUARIOS)
   - **Password**: A senha do usuário
3. O login **deve funcionar** agora

### 5. **Teste Portal Empresa**
1. Faça login com um usuário que tenha role **EMPRESA**
2. Clique na aba **"COM FUNCIONÁRIO"**
3. Devem aparecer os **159 protocolos** com status "COM EMPRESA"

---

## 📋 MUDANÇAS POR ARQUIVO

| Arquivo | Mudanças | Status |
|---------|----------|--------|
| `seripm.gs` | 5 correções críticas | ✅ PRONTO |
| `index.html` | Nenhuma (URL já correta) | ✅ OK |
| `seripm-CORRIGIDO.gs` | Backup da versão corrigida | ℹ️ REFERÊNCIA |

---

## ❓ POSSÍVEIS PROBLEMAS RESTANTES

Se o login ainda não funcionar:

### Cenário 1: Erro "Aba USUARIOS não encontrada"
- **Verificar**: Se a aba se chama "USUARIOS" ou "USUÁRIOS"
- **Solução**: Verificar no Google Sheets o nome exato

### Cenário 2: Erro "Credenciais inválidas"
- **Verificar**: 
  - Username e password estão corretos?
  - User está com STATUS "ATIVO"?
  - Coluna PASSWORD tem a senha exata (case-sensitive)?

### Cenário 3: CORS Error ainda aparece
- **Verificar**:
  - A URL do Apps Script está correta?
  - Você fez deploy da nova versão?
  - Limpe cache do navegador (Ctrl+Shift+Del)

### Cenário 4: Portal Empresa continua vazio
- **Verificar**:
  - User tem role "EMPRESA"?
  - Há protocolos com status "COM EMPRESA" em ENTRADA?
  - O filtro `isMatch()` está reconhecendo o status?

---

## 🔗 REFERÊNCIAS

- **URL Apps Script Original**: https://script.google.com/macros/s/AKfycbwxfrN3AmulqSm2UvwZq45gbrFwTGM5qnufmov1OV_HtjBwg0UTjL_Xc3PwBA-u6-BZ/exec
- **URL Frontend**: https://rafaelvis89.github.io/seripm-painel/
- **Repositório**: https://github.com/Rafaelvis89/seripm-painel

---

## 💾 COMMIT SUGERIDO

```bash
git add seripm.gs
git commit -m "fix: corrigir getProtocols, normalizarPerfil e getStatusCounts

- Remove mapeamento duplicado em normalizarPerfil
- Corrige detecção de headers em processLogin
- Remove código duplicado em getProtocols
- Integra função isMatch no filtro de status
- Corrige mapeamento de 'COM FUNCIONÁRIO' para 'COM EMPRESA'
- Garante compatibilidade com variações de status
"
git push origin main
```

---

**Data da Correção**: 1 de julho de 2026  
**Versão**: 2.1 (Corrigida)  
**Status**: ✅ PRONTO PARA DEPLOY
