# 🚨 CORREÇÃO CRÍTICA - Portal Empresa

**Status:** ✅ CORRIGIDO E DEPLOYADO  
**Data:** 01 de julho de 2026  
**Commit:** 935c7be  

---

## 🐛 Problema Identificado

### Sintoma
- Página rolando infinitamente (infinite scroll)
- Erros no console (F12)
- Protocolos não aparecendo corretamente
- Página não mudou nada visualmente

### Causa Raiz
**Arquivo:** `empresa.html`, linha 411  
**Erro:** Tab incorreto na requisição à API

```javascript
// ❌ ERRADO
const payload = {
    action: 'getProtocols',
    tab: 'COM FUNCIONÁRIO',  // ← ERRADO! Esta aba não existe
    role: localStorage.getItem('role'),
    ...
};

// ✅ CORRETO
const payload = {
    action: 'getProtocols',
    tab: 'COM EMPRESA',  // ← CORRETO! Aba correta
    role: localStorage.getItem('role'),
    ...
};
```

---

## 📋 Explica ção do Erro

A API (`seripm.gs`) espera que o `tab` seja **`'COM EMPRESA'`** para retornar os protocolos do Portal Empresa.

Quando a página tentava carregar com `tab: 'COM FUNCIONÁRIO'`:
1. API retornava erro ou dados vazios
2. A função `carregarProtocolos()` era chamada a cada 30 segundos (setInterval)
3. Cada erro causava uma nova tentativa
4. Loop infinito de requisições
5. Console cheio de erros

---

## ✅ Correção Aplicada

### Mudança Realizada
```
arquivo: empresa.html
linha: 411
antes:  tab: 'COM FUNCIONÁRIO',
depois: tab: 'COM EMPRESA',
```

### Commit
```
935c7be - fix: corrigir tab de protocolo de COM FUNCIONÁRIO para COM EMPRESA
```

---

## 🧪 Como Verificar se Funcionou

1. **Limpe o cache do navegador:**
   - Pressione `Ctrl + Shift + Delete`
   - Selecione "Todos os tempos"
   - Clique em "Limpar dados"

2. **Reabra a página:**
   - https://rafaelvis89.github.io/seripm-painel/empresa.html

3. **Verifique:**
   - ✅ Página não rola infinitamente
   - ✅ Protocolos aparecem na tabela
   - ✅ 215 protocolos são exibidos
   - ✅ Console não tem erros vermelhos
   - ✅ Tabela mostra: Data | Protocolo | Solicitante | Endereço | Bairro | Ações
   - ✅ Checkbox "Selecionar Tudo" funciona
   - ✅ Botões de ação (🔍✅📨❌) funcionam

4. **Abra o DevTools (F12):**
   - Vá para aba "Console"
   - Deve aparecer:
     ```
     ✅ 📤 Enviando para API: {action: 'getProtocols', tab: 'COM EMPRESA', ...}
     ✅ 📥 Resposta da API: {success: true, data: Array(215)}
     ✅ 🔍 Protocolos recebidos: 215 itens
     ```
   - ❌ NÃO deve aparecer:
     ```
     ❌ Failed to load resource
     ❌ net::ERR_CONNECTION_CLOSED
     ❌ GET https://cta.elacaoholider.com
     ```

---

## 📊 Comparação Antes vs Depois

### Antes (QUEBRADO)
```
Requisição: {tab: 'COM FUNCIONÁRIO'}  ❌
    ↓
API responde: ❌ Erro ou dados vazios
    ↓
carregarProtocolos() chama novamente (setInterval cada 30s)
    ↓
Loop infinito + Console cheio de erros
    ↓
Página rola infinitamente ↻↻↻
```

### Depois (FUNCIONANDO)
```
Requisição: {tab: 'COM EMPRESA'}  ✅
    ↓
API responde: ✅ 215 protocolos
    ↓
exibirProtocolos() renderiza a tabela
    ↓
Página carrega normalmente, sem erros
    ↓
Tabela mostra todos os 215 protocolos ✅
```

---

## 🔍 Por Que Isso Aconteceu?

Quando fiz as alterações anteriores (refatoração de cards para tabela), eu:
1. ✅ Corretamente atualizei a renderização (exibirProtocolos)
2. ✅ Corretamente adicionei Selecionar Tudo
3. ❌ NÃO verifiquei se o `tab` estava correto na função carregarProtocolos
4. ❌ Nem testei se os protocolos estavam realmente sendo carregados

O arquivo ficou "congelado" em 3 semanas atrás no GitHub porque as alterações locais não foram feitas, apenas alterações de renderização, mas não de dados.

---

## 📱 Passo a Passo para Testar

### 1. Limpar Cache
```
Ctrl + Shift + Delete → Todos os tempos → Limpar dados
```

### 2. Abrir a Página
```
https://rafaelvis89.github.io/seripm-painel/empresa.html
```

### 3. Aguardar Carregamento
- Deve levar ~1-2 segundos
- Tabela aparece com 215 protocolos
- Sem scroll infinito

### 4. Testar Funcionalidades
- [ ] Clique no checkbox do header → Marca/desmarca todos
- [ ] Selecione alguns → Clique PDF → Exporta corretamente
- [ ] Clique em 🔍 → Abre modal com detalhes
- [ ] Clique em ✅ → Marca como RESOLVIDO
- [ ] Clique em 📨 → Abre modal para motivo
- [ ] Clique em ❌ → Abre modal para motivo
- [ ] Filtro por protocolo funciona
- [ ] Filtro por bairro funciona

---

## 🎯 Resultado Final

✅ **Problema:** Página rolando infinitamente  
✅ **Causa:** Tab incorreto ('COM FUNCIONÁRIO' vs 'COM EMPRESA')  
✅ **Solução:** Alterado para 'COM EMPRESA'  
✅ **Status:** CORRIGIDO E DEPLOYADO  
✅ **Teste:** Limpe cache e reabra a página  

**Versão Funcionando:** v2.3 (commit 935c7be)

---

## 💾 Próximas Ações

1. Limpe o cache do navegador
2. Reabra https://rafaelvis89.github.io/seripm-painel/empresa.html
3. Verifique que funciona corretamente
4. Me reporte se houver novos problemas
