# 🧪 TESTE DE FUNCIONALIDADE DO LOGIN

## Para testar se tudo funciona após o deploy, use este checklist:

### ✅ ANTES DE TESTAR
- [ ] Você copiou TODO o conteúdo de `seripm.gs` para o Google Apps Script?
- [ ] Você clicou em "Salvar"?
- [ ] Você fez Deploy e copiou a URL?
- [ ] A URL está correta em `index.html` (linha 346)?
- [ ] Você limpou o cache do navegador (Ctrl+Shift+Del)?

---

## 🔐 TESTE 1: LOGIN COM ADMIN

### Procedimento:
1. Abra https://rafaelvis89.github.io/seripm-painel/
2. Digite:
   - **Usuário**: `admin`
   - **Senha**: `admin123`
3. Clique em **"Entrar"**

### Resultado Esperado:
- ✅ Dashboard carrega sem erros
- ✅ Vê todas as abas: ENTRADA, ADMINISTRATIVO, OBRA, TELECOM, GARANTIA, COM FUNCIONÁRIO, IMPLANTAÇÃO
- ✅ Cards de status mostram números corretos
- ✅ No console (F12) NÃO há erros de CORS ou 401

### Se der erro:
Abra F12 → Console e procure por:
- `Erro de CORS` → URL do Apps Script errada
- `Credenciais inválidas` → Usuário/senha errada
- `Aba USUARIOS não encontrada` → Nome da aba diferente

---

## 👨‍💼 TESTE 2: LOGIN COM USUARIO EMPRESA

### Procedimento:
1. Crie um usuário na aba USUARIOS com:
   - **USERNAME**: `empresa`
   - **PASSWORD**: `empresa123` (ou qualquer senha)
   - **PERFIL**: `EMPRESA`
   - **STATUS**: `ATIVO`
   - **ABAS_PERMITIDAS**: `COM FUNCIONÁRIO`

2. Abra https://rafaelvis89.github.io/seripm-painel/
3. Digite:
   - **Usuário**: `empresa`
   - **Senha**: `empresa123`
4. Clique em **"Entrar"**

### Resultado Esperado:
- ✅ Dashboard carrega sem erros
- ✅ Vê apenas a aba **"COM FUNCIONÁRIO"**
- ✅ Tabela mostra protocolos com status "COM EMPRESA"
- ✅ Aparecem os **159 protocolos** (ou quantos houver)
- ✅ Colunas: DATA, PROTOCOLO, ATENDENTE, ENDERECO, REFERENCIA, SOLICITANTE, CPF, TELEFONE, BAIRRO, SERVICO, DETALHES, STATUS, OBSERVACOES

### Se der erro:
Abra F12 → Console → Aba Network:
- Clique em um request que chama `getProtocols`
- Verifique a **Response**: devem ter dados com STATUS "COM EMPRESA"
- Se Response estiver vazio, o filtro não está funcionando

---

## 📊 TESTE 3: CARDS DE STATUS

### Procedimento:
1. Faça login como **admin**
2. Observe os cards no dashboard

### Resultado Esperado:
- ✅ **TOTAL**: Soma de TODOS os protocolos em ENTRADA
- ✅ **ABERTO**: Protocolos com STATUS "ABERTO"
- ✅ **ATRASADO**: Protocolos na aba "URGENTE/ATRASADO"
- ✅ **COM EMPRESA**: Protocolos com STATUS "COM EMPRESA" OU "ENCAMINHADO AO FUNCIONÁRIO" OU "COM FUNCIONÁRIO"
- ✅ **RESOLVIDO**: Protocolos com STATUS "RESOLVIDO" OU "CONCLUÍDO"
- ✅ **CANCELADO**: Protocolos com STATUS "CANCELADO"
- ✅ **PENDENTE**: Protocolos com STATUS "PENDENTE"
- ✅ **GARANTIA**: Protocolos com STATUS "GARANTIA"

### Se der erro:
- Números não batem? → Verifique os STATUS reais na aba ENTRADA
- Card não atualiza? → Aguarde 2-3 segundos, ele atualiza automaticamente

---

## 🔄 TESTE 4: ATUALIZAR ABAS

### Procedimento:
1. Faça login como **admin**
2. Clique em **"ENTRADA"**
3. Observe a tabela
4. Clique em **"ADMINISTRATIVO"**
5. Observe a tabela
6. Observe os **checkboxes**: devem estar DESMARCADOS

### Resultado Esperado:
- ✅ Ao trocar de aba, a tabela recarrega
- ✅ Cada aba mostra APENAS seus protocolos (filtrados por STATUS)
- ✅ Checkboxes NÃO se "herdam" entre abas
- ✅ Sem erros no console

---

## 🐛 DEBUG: Se NADA funcionar

### 1. Verifique a URL do Apps Script
```javascript
// Abra F12 → Console → Digite:
console.log(API_URL);
// Deve mostrar: https://script.google.com/macros/s/AKfycbwxfrN3AmulqSm2UvwZq45gbrFwTGM5qnufmov1OV_HtjBwg0UTjL_Xc3PwBA-u6-BZ/exec
```

### 2. Teste a API manualmente
```javascript
// F12 → Console → Digite:
fetch("https://script.google.com/macros/s/AKfycbwxfrN3AmulqSm2UvwZq45gbrFwTGM5qnufmov1OV_HtjBwg0UTjL_Xc3PwBA-u6-BZ/exec", {
  method: 'POST',
  body: JSON.stringify({
    action: "login",
    username: "admin",
    password: "admin123"
  })
})
.then(r => r.json())
.then(d => console.log(d));

// Resultado esperado:
// { success: true, username: "admin", role: "SUPER_ADMIN", allowedTabs: "..." }
```

### 3. Verifique a aba USUARIOS
- Abra a aba USUARIOS no Google Sheets
- Copie o código HTML e verifique se as colunas são: USERNAME | PASSWORD | PERFIL | STATUS | ABAS_PERMITIDAS
- Se faltarem colunas, execute `inicializarSistemaSERIPM()` no Apps Script

### 4. Teste um refresh forçado
```
Ctrl + Shift + R  (Windows/Linux)
Cmd + Shift + R   (Mac)
```

---

## 📱 TESTE 5: RESPONSIVIDADE (Portal Empresa)

### Procedimento:
1. Faça login como **empresa**
2. Redimensione a janela do navegador (F12 → Toggle device toolbar)
3. Teste em diferentes tamanhos:
   - [ ] Desktop (1920x1080)
   - [ ] Tablet (768x1024)
   - [ ] Mobile (375x667)

### Resultado Esperado:
- ✅ Em Desktop: Tabela completa com todas as colunas
- ✅ Em Tablet: Scroll horizontal, colunas importantes visíveis
- ✅ Em Mobile: Botões acessíveis, sem overflow

---

## ✨ TESTE 6: MUDANÇA DE STATUS

### Procedimento:
1. Faça login como **admin**
2. Clique em **"ENTRADA"**
3. Selecione um protocolo (clique no checkbox)
4. Mude o status para "RESOLVIDO"
5. Volte para dashboard
6. Observe os cards

### Resultado Esperado:
- ✅ O protocolo desaparece de "ABERTO" nos cards
- ✅ Aparece em "RESOLVIDO"
- ✅ Os números dos cards atualizam automaticamente
- ✅ Sem delay notável

---

## 📋 SUMÁRIO DE TESTES

| Teste | Status | Observações |
|-------|--------|-------------|
| Login Admin | ⏳ Pendente | Básico |
| Login Empresa | ⏳ Pendente | Filtro de abas |
| Cards de Status | ⏳ Pendente | Contagem correta |
| Atualizar Abas | ⏳ Pendente | Checkbox reset |
| Debug API | ⏳ Pendente | Conexão |
| Responsividade | ⏳ Pendente | Mobile |
| Mudança Status | ⏳ Pendente | Atualização cards |

---

## 🎯 PRÓXIMAS AÇÕES

Se todos os testes passarem (✅):
1. ✅ Sistema está funcionando corretamente
2. ✅ Fazer commit final no Git
3. ✅ Planejar Portal Empresa (layout, PDF, Excel)

Se algum teste falhar (❌):
1. ❌ Abra F12 → Console
2. ❌ Copie a mensagem de erro
3. ❌ Verifique `CORRECOES_APLICADAS.md` na seção "POSSÍVEIS PROBLEMAS RESTANTES"
4. ❌ Se persistir, verifique o Apps Script novamente

---

**Última atualização**: 1 de julho de 2026  
**Versão**: 2.1  
**Status do Sistema**: Pronto para testes
