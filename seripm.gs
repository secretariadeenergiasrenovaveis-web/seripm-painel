/**
 * SISTEMA INTEGRADO SERIPM 2026 - BACK-END API OTIMIZADO E COMPLETO
 * v2.0 - Inicialização Segura do Sistema
 */

/**
 * FUNÇÃO DE INICIALIZAÇÃO - EXECUTE MANUALMENTE UMA VEZ!
 * Menu: Extensions > Apps Script > inicializarSistemaSERIPM()
 */
function inicializarSistemaSERIPM() {
  Logger.log("🔄 Iniciando setup do sistema SERIPM...");
  
  // 1. Criar abas faltantes
  criarAbasAusentes();
  
  // 2. Padronizar colunas
  padronizarColunas();
  
  // 3. Criar perfis
  inicializarPerfis();
  
  Logger.log("✅ Sistema SERIPM inicializado com sucesso!");
  SpreadsheetApp.getUi().alert("✅ SERIPM inicializado!\n\nNovas abas criadas:\n- RS\n- EXECUCAO\n- FISCALIZACAO\n\nPerfis profissionais criados.");
}

/**
 * Cria as abas faltantes (RS, EXECUCAO, FISCALIZACAO) SEM DELETAR NADA
 */
function criarAbasAusentes() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheetsExistentes = ss.getSheets().map(s => s.getName());
  
  // 1. Aba RS (Requisições de Serviço)
  if (!sheetsExistentes.includes("RS")) {
    const sheetRS = ss.insertSheet("RS");
    sheetRS.appendRow([
      "DATA",
      "NUM_RS",
      "PROTOCOLOS_IDS",
      "EMPRESA",
      "RESPONSAVEL",
      "BAIRRO",
      "OBSERVACOES",
      "STATUS",
      "DATA_ENVIO",
      "DATA_CONCLUSAO",
      "DATA_MODIFICACAO",
      "MODIFICADO_POR"
    ]);
    Logger.log("✅ Aba RS criada");
  }
  
  // 2. Aba EXECUCAO
  if (!sheetsExistentes.includes("EXECUCAO")) {
    const sheetExec = ss.insertSheet("EXECUCAO");
    sheetExec.appendRow([
      "DATA",
      "ID_EXEC",
      "RS_ID",
      "PROTOCOLO",
      "EXECUTOR",
      "DATA_EXEC",
      "HORA_INICIO",
      "HORA_FIM",
      "OBSERVACOES",
      "FOTOS_URL",
      "STATUS",
      "USUARIO_EMPRESA",
      "DATA_MODIFICACAO",
      "MODIFICADO_POR"
    ]);
    Logger.log("✅ Aba EXECUCAO criada");
  }
  
  // 3. Aba FISCALIZACAO
  if (!sheetsExistentes.includes("FISCALIZACAO")) {
    const sheetFiscal = ss.insertSheet("FISCALIZACAO");
    sheetFiscal.appendRow([
      "DATA",
      "ID_FISCAL",
      "RS_ID",
      "DATA_FISCAL",
      "FISCAL",
      "RESULTADO",
      "OBSERVACOES",
      "APROVADO",
      "MOTIVO_DEVOLUCAO",
      "FOTOS_FISCAL_URL",
      "STATUS",
      "DATA_MODIFICACAO",
      "MODIFICADO_POR"
    ]);
    Logger.log("✅ Aba FISCALIZACAO criada");
  }
}

/**
 * Padroniza colunas em todas as abas existentes
 */
function padronizarColunas() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheetsParaPadronizar = ["ENTRADA", "ADMINISTRATIVO", "OBRA", "TELECOM", "GARANTIA", "COM FUNCIONÁRIO", "IMPLANTAÇÃO"];
  
  sheetsParaPadronizar.forEach(sheetName => {
    const sheet = ss.getSheetByName(sheetName);
    if (!sheet) return;
    
    const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
    
    // Verifica se faltam colunas e adiciona no final
    if (!headers.includes("DATA_MODIFICACAO")) {
      sheet.getRange(1, sheet.getLastColumn() + 1).setValue("DATA_MODIFICACAO");
    }
    if (!headers.includes("MODIFICADO_POR")) {
      sheet.getRange(1, sheet.getLastColumn() + 1).setValue("MODIFICADO_POR");
    }
    
    Logger.log(`✅ Aba ${sheetName} padronizada`);
  });
}

/**
 * Inicializa perfis profissionais na aba USUARIOS
 */
function inicializarPerfis() {
  const userSheet = getUserSheet();
  const data = userSheet.getDataRange().getValues();
  
  // Se USUARIOS tem menos de 3 colunas, precisa ser expandida
  if (data[0].length < 5) {
    // Limpa e recria com estrutura correta
    if (data.length > 1) {
      // Preserva dados existentes
      const usuariosBkp = data.slice(1);
      userSheet.clear();
      
      userSheet.appendRow([
        "USERNAME",
        "PASSWORD",
        "PERFIL",
        "STATUS",
        "ABAS_PERMITIDAS"
      ]);
      
      usuariosBkp.forEach(row => {
        const perfil = (row[2] || "ATENDIMENTO").toString().toUpperCase();
        const status = (row[3] || "ATIVO").toString().toUpperCase();
        userSheet.appendRow([
          row[0],
          row[1],
          perfil,
          status,
          ""
        ]);
      });
    } else {
      userSheet.clear();
      userSheet.appendRow([
        "USERNAME",
        "PASSWORD",
        "PERFIL",
        "STATUS",
        "ABAS_PERMITIDAS"
      ]);
    }
    
    Logger.log("✅ Aba USUARIOS reestruturada");
  }
  
  // Adiciona usuário SUPER ADMIN se não existir
  const usuarios = userSheet.getDataRange().getValues();
  const temSuperAdmin = usuarios.slice(1).some(row => 
    row[0].toString().toUpperCase() === "ADMIN"
  );
  
  if (!temSuperAdmin) {
    userSheet.appendRow([
      "ADMIN",
      "admin123",
      "SUPER_ADMIN",
      "ATIVO",
      "ENTRADA,ADMINISTRATIVO,OBRA,TELECOM,GARANTIA,COM FUNCIONÁRIO,IMPLANTAÇÃO,RS,EXECUCAO,FISCALIZACAO"
    ]);
    Logger.log("✅ Usuário SUPER_ADMIN criado");
  }
}

function onEdit(e) {
  if (!e) return;
  const ss = e.source;
  const range = e.range;
  const sheet = range.getSheet();
  const sheetName = sheet.getName();
  const row = range.getRow();
  const col = range.getColumn();
  let valor = range.getValue();

  if (row <= 1 || !valor || ["SUPERVISOR", "USUARIOS", "USUÁRIOS"].includes(sheetName)) return;

  // Formatação Automática
  if (col === 7) {
    let cpf = valor.toString().replace(/\D/g, "").padStart(11, '0').replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.$2.$3-$4");
    range.setNumberFormat("@").setValue(cpf);
  } else if (col === 8) {
    let tel = valor.toString().replace(/\D/g, "");
    range.setNumberFormat("@");
    if (tel.length === 11) range.setValue(tel.replace(/(\d{2})(\d{5})(\d{4})/, "($1) $2-$3"));
    else if (tel.length === 10) range.setValue(tel.replace(/(\d{2})(\d{4})(\d{4})/, "($1) $2-$3"));
  } else if (typeof valor === 'string') {
    range.setValue(valor.toUpperCase());
  }

  // Gatilho: Se alterar o STATUS manualmente na planilha (Coluna L = 12)
  if (col === 12) {
    const agora = new Date();
    sheet.getRange(row, 14).setValue(Utilities.formatDate(agora, "GMT-3", "dd/MM/yyyy HH:mm:ss")); // DATA DA MODIFICAÇÃO (N)
  }

  // Sincronização e Gatilhos na criação manual (Planilha)
  if (sheetName === "ENTRADA") {
    if (col === 6 && sheet.getRange(row, 2).getValue() === "") {
      const agora = new Date();
      const dataFormatada = Utilities.formatDate(agora, "GMT-3", "dd/MM/yyyy HH:mm:ss");
      
      sheet.getRange(row, 1).setValue(dataFormatada); // DATA FIXA (A)
      sheet.getRange(row, 2).setValue(Utilities.formatDate(agora, "GMT-3", "yyyyMMdd") + "-" + (row - 1).toString().padStart(3, '0'));
      if (sheet.getRange(row, 12).getValue() === "") sheet.getRange(row, 12).setValue("ABERTO");
      
      sheet.getRange(row, 14).setValue(dataFormatada); // DATA DA MODIFICAÇÃO INICIAL (N)
    }
  }
}

function doPost(e) {
  try {
    const payload = JSON.parse(e.postData.contents);
    switch(payload.action) {
      case "login": return processLogin(payload.username, payload.password);
      case "getProtocols": return getProtocols(payload);
      case "createProtocol": return createProtocol(payload);
      case "updateStatus": return updateStatus(payload);
      case "getUsers": return getUsers(payload);
      case "saveUser": return saveUser(payload);
      case "getSheetStructure": return getSheetStructure();
      case "getAllProtocols": return getAllProtocols(payload);
      case "getPerfis": return getPerfis();
      case "getDynamicData": return getDynamicData(payload);
      case "createRS": return createRS(payload);
      case "getRS": return getRS(payload);
      case "createExecution": return createExecution(payload);
      case "getExecutions": return getExecutions(payload);
      case "createFiscalization": return createFiscalization(payload);
      case "getFiscalizations": return getFiscalizations(payload);
      case "getStatusCounts": return getStatusCounts(payload);
      default: return responseJson({ success: false, error: "Ação inválida." });
    }
  } catch (err) { return responseJson({ success: false, error: err.toString() }); }
}

function responseJson(data) {
  return ContentService.createTextOutput(JSON.stringify(data)).setMimeType(ContentService.MimeType.JSON);
}

/**
 * Mapeia os nomes de perfil da planilha para o sistema normalizado
 */
function normalizarPerfil(perfil) {
  const p = (perfil || "").toString().toUpperCase().trim();
  
  // Mapeamento de perfis
  const mapa = {
    "SUPER ADMINISTRADOR": "SUPER_ADMIN",
    "SUPER_ADMIN": "SUPER_ADMIN",
    "ADMINISTRADOR": "ADMINISTRATIVO",
    "ADMINISTRATIVO": "ADMINISTRATIVO",
    "SUPERVISOR": "SUPERVISOR",
    "SUPERVISORES": "SUPERVISOR",
    "ATENDENTE": "ATENDIMENTO",
    "ATENDIMENTO": "ATENDIMENTO",
    "EMPRESA": "EMPRESA",
    "FISCAL": "FISCAL"
  };
  
  return mapa[p] || "ATENDIMENTO"; // Padrão: ATENDIMENTO
}

function processLogin(user, pass) {
  const sheet = getUserSheet();
  const data = sheet.getDataRange().getValues();
  const headers = data[0];
  
  // Encontra índices das colunas
  const idxUser = headers.indexOf("USERNAME") >= 0 ? headers.indexOf("USERNAME") : 0;
  const idxPass = headers.indexOf("PASSWORD") >= 0 ? headers.indexOf("PASSWORD") : 1;
  const idxPerfil = headers.indexOf("PERFIL") >= 0 ? headers.indexOf("PERFIL") : 2;
  const idxStatus = headers.indexOf("STATUS") >= 0 ? headers.indexOf("STATUS") : 3;
  const idxAbas = headers.indexOf("ABAS_PERMITIDAS") >= 0 ? headers.indexOf("ABAS_PERMITIDAS") : 4;
  
  for (let i = 1; i < data.length; i++) {
    if (data[i][idxUser].toString().trim().toUpperCase() === user.toString().trim().toUpperCase() && 
        data[i][idxPass].toString() === pass.toString()) {
      
      const status = (data[i][idxStatus] || "ATIVO").toString().toUpperCase();
      if (status === "INATIVO") {
        return responseJson({ success: false, error: "Usuário inativo." });
      }
      
      const perfilBruto = (data[i][idxPerfil] || "ATENDIMENTO").toString();
      const perfilNormalizado = normalizarPerfil(perfilBruto);
      
      return responseJson({ 
        success: true, 
        username: data[i][idxUser], 
        role: perfilNormalizado,
        allowedTabs: (data[i][idxAbas] || "").toString()
      });
    }
  }
  return responseJson({ success: false, error: "Credenciais inválidas." });
}

function getProtocols(p) {
  // Validação de segurança: Apenas SUPER_ADMIN, SUPERVISOR e ADMINISTRATIVO veem tudo
  const rolesComAcessoTotal = ['SUPER_ADMIN', 'SUPERVISOR', 'ADMINISTRATIVO'];
  
  // ✅ NOVO: Usuários EMPRESA têm acesso automático à aba "COM FUNCIONÁRIO"
  const ehEmpresaAcessandoAbaCorreta = (p.role === 'EMPRESA' && p.tab === 'COM FUNCIONÁRIO');
  
  if (!rolesComAcessoTotal.includes(p.role) && !ehEmpresaAcessandoAbaCorreta) {
    const allowedTabsString = (p.allowedTabs || "");
    const allowed = allowedTabsString.split(',').map(s => s.trim());
    if (!allowed.includes(p.tab)) return responseJson({ success: false, error: "Acesso negado à aba " + p.tab });
  }

  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(p.tab);
  if (!sheet) return responseJson({ success: false, error: "Aba não encontrada." });
  
  const data = sheet.getDataRange().getValues();
  if (data.length < 2) return responseJson({ success: true, data: [] });

  const headers = data[0];
  let results = [];
  const idxData = headers.indexOf("DATA");

  for (let i = 1; i < data.length; i++) {
    // Filtro para ATENDIMENTO verem apenas os seus próprios registos
    if (p.role === "ATENDIMENTO" && headers.includes("ATENDENTE")) {
      const idxAtendente = headers.indexOf("ATENDENTE");
      if (data[i][idxAtendente].toString().toUpperCase() !== p.username.toString().toUpperCase()) continue;
    }

    let obj = {};
    headers.forEach((h, index) => {
      let val = data[i][index];
      // Formata datas corretamente
      if (h === "DATA" && val instanceof Date) {
        val = Utilities.formatDate(val, "GMT-3", "dd/MM/yyyy HH:mm:ss");
      }
      obj[h] = val;
    });
    results.push(obj);
  }
  return responseJson({ success: true, data: results.reverse() });
}

function createProtocol(p) {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(p.tab);
  if (!sheet) return responseJson({ success: false, error: "Aba inválida" });
  
  const agora = new Date();
  const dataFormatada = Utilities.formatDate(agora, "GMT-3", "dd/MM/yyyy HH:mm:ss");
  const prefixo = (p.tab === "OBRA") ? "OBRA-" : "";
  const proto = prefixo + Utilities.formatDate(agora, "GMT-3", "yyyyMMdd") + "-" + (sheet.getLastRow()).toString().padStart(3, '0');
  
  // Adiciona a Data na primeira coluna (A) e na última (N) 
  sheet.appendRow([
    dataFormatada, 
    proto, 
    p.username.toUpperCase(), 
    p.data.endereco, 
    p.data.referencia, 
    p.data.solicitante, 
    p.data.cpf, 
    p.data.telefone, 
    p.data.bairro, 
    p.data.servico, 
    p.data.detalhes, 
    "ABERTO", 
    p.data.observacoes, 
    dataFormatada // <- Coluna N (DATA DA MODIFICAÇÃO)
  ]);
  return responseJson({ success: true, protocolo: proto });
}

function updateStatus(p) {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(p.tab);
  const data = sheet.getDataRange().getValues();
  const headers = data[0];
  const idxProto = headers.indexOf("PROTOCOLO");
  const idxStatus = headers.indexOf("STATUS");
  const idxModifData = headers.indexOf("DATA_MODIFICACAO");
  const idxModifPor = headers.indexOf("MODIFICADO_POR");
  
  const agora = new Date();
  const dataFormatada = Utilities.formatDate(agora, "GMT-3", "dd/MM/yyyy HH:mm:ss");

  for (let i = 1; i < data.length; i++) {
    if (data[i][idxProto].toString() === p.protocolId.toString()) {
      // 1. Atualiza o Status
      if (idxStatus >= 0) sheet.getRange(i + 1, idxStatus + 1).setValue(p.newStatus.toUpperCase());
      
      // 2. Atualiza a Data da Modificação
      if (idxModifData >= 0) sheet.getRange(i + 1, idxModifData + 1).setValue(dataFormatada);
      
      // 3. Atualiza o Usuário que modificou
      if (idxModifPor >= 0) sheet.getRange(i + 1, idxModifPor + 1).setValue(p.username || "SISTEMA");
      
      return responseJson({ success: true });
    }
  }
  return responseJson({ success: false, error: "Protocolo não encontrado" });
}

function getUserSheet() { return SpreadsheetApp.getActiveSpreadsheet().getSheetByName("USUARIOS") || SpreadsheetApp.getActiveSpreadsheet().getSheetByName("USUÁRIOS"); }

function getUsers(p) {
  const rolesComAcesso = ['SUPER_ADMIN', 'SUPERVISOR', 'ADMINISTRATIVO'];
  if (!rolesComAcesso.includes(p.role)) return responseJson({ success: false, error: "Acesso negado" });
  const data = getUserSheet().getDataRange().getValues();
  return responseJson({ success: true, data: data.slice(1).map(r => ({ username: r[0], role: r[2], status: r[3], tabs: r[4] })) });
}

function saveUser(p) {
  const rolesComAcesso = ['SUPER_ADMIN', 'SUPERVISOR', 'ADMINISTRATIVO'];
  if (!rolesComAcesso.includes(p.role)) return responseJson({ success: false, error: "Acesso negado" });
  const sheet = getUserSheet();
  const data = sheet.getDataRange().getValues();
  for (let i = 1; i < data.length; i++) {
    if (data[i][0].toString().toUpperCase() === p.userData.username.toUpperCase()) {
      sheet.getRange(i + 1, 2).setValue(p.userData.password);
      sheet.getRange(i + 1, 3).setValue(p.userData.role);
      sheet.getRange(i + 1, 5).setValue(p.userData.tabs);
      return responseJson({ success: true });
    }
  }
  sheet.appendRow([p.userData.username, p.userData.password, p.userData.role, "ATIVO", p.userData.tabs]);
  return responseJson({ success: true });
}

/**
 * Retorna a estrutura de todas as abas (colunas e quantidade de dados)
 */
function getSheetStructure() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheets = ss.getSheets();
  const structure = {};

  sheets.forEach(sheet => {
    const sheetName = sheet.getName();
    const data = sheet.getDataRange().getValues();
    
    if (data.length > 0) {
      structure[sheetName] = {
        columns: data[0], // Headers
        rowCount: data.length - 1, // Quantidade de dados (sem header)
        lastRow: sheet.getLastRow()
      };
    }
  });

  return responseJson({ 
    success: true, 
    structure: structure,
    timestamp: new Date().toISOString()
  });
}

/**
 * Retorna TODOS os protocolos (sem restrições de aba)
 * Usado para Relatórios Centralizados
 */
function getAllProtocols(p) {
  if (p.role !== "SUPER_ADMIN" && p.role !== "ADMINISTRATIVO" && p.role !== "FISCAL") {
    return responseJson({ success: false, error: "Acesso negado" });
  }

  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const abas = ["ENTRADA", "ADMINISTRATIVO", "OBRA", "TELECOM", "GARANTIA", "COM FUNCIONÁRIO", "IMPLANTAÇÃO"];
  let todosProtocolos = [];

  abas.forEach(abaName => {
    const sheet = ss.getSheetByName(abaName);
    if (!sheet) return;
    
    const data = sheet.getDataRange().getValues();
    if (data.length < 2) return;

    const headers = data[0];
    for (let i = 1; i < data.length; i++) {
      let obj = { ABA: abaName };
      headers.forEach((h, index) => {
        obj[h] = data[i][index];
      });
      todosProtocolos.push(obj);
    }
  });

  return responseJson({ success: true, data: todosProtocolos });
}

/**
 * Retorna lista de perfis profissionais
 */
function getPerfis() {
  return responseJson({ 
    success: true, 
    perfis: [
      "SUPER_ADMIN",
      "ADMINISTRATIVO",
      "ATENDIMENTO",
      "EMPRESA",
      "FISCAL"
    ],
    descricoes: {
      "SUPER_ADMIN": "Acesso total ao sistema",
      "ADMINISTRATIVO": "Gerencia protocolos, RS e fiscalização",
      "ATENDIMENTO": "Abre protocolos",
      "EMPRESA": "Executa serviços",
      "FISCAL": "Fiscaliza execuções"
    }
  });
}

/**
 * Busca dados dinâmicos da planilha (Status, Bairros, Tipos de Serviço)
 */
function getDynamicData(p) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const entradaSheet = ss.getSheetByName("ENTRADA");
  
  if (!entradaSheet) {
    return responseJson({ success: false, error: "Aba ENTRADA não encontrada" });
  }
  
  const data = entradaSheet.getDataRange().getValues();
  const headers = data[0];
  
  // Encontra os índices das colunas
  const idxStatus = headers.indexOf("STATUS");
  const idxBairro = headers.indexOf("BAIRRO");
  const idxServico = headers.indexOf("TIPO_SERVICO") >= 0 ? headers.indexOf("TIPO_SERVICO") : headers.indexOf("SERVIÇO") >= 0 ? headers.indexOf("SERVIÇO") : headers.indexOf("SERVICO");
  
  // Coleta valores únicos (remove vazios e duplicatas)
  let statusSet = new Set();
  let bairroSet = new Set();
  let servicoSet = new Set();
  
  for (let i = 1; i < data.length; i++) {
    if (idxStatus >= 0 && data[i][idxStatus]) statusSet.add(String(data[i][idxStatus]).trim().toUpperCase());
    if (idxBairro >= 0 && data[i][idxBairro]) bairroSet.add(String(data[i][idxBairro]).trim());
    if (idxServico >= 0 && data[i][idxServico]) servicoSet.add(String(data[i][idxServico]).trim());
  }
  
  // Converte para array e ordena
  const statusArray = Array.from(statusSet).sort();
  const bairroArray = Array.from(bairroSet).sort();
  const servicoArray = Array.from(servicoSet).sort();
  
  return responseJson({
    success: true,
    status: statusArray.length > 0 ? statusArray : ["ABERTO", "EM ANDAMENTO", "RESOLVIDO"],
    bairros: bairroArray,
    servicos: servicoArray
  });
}

/**
 * Cria nova Requisição de Serviço (RS)
 */
function createRS(p) {
  if (p.role !== "SUPER_ADMIN" && p.role !== "ADMINISTRATIVO") {
    return responseJson({ success: false, error: "Acesso negado" });
  }

  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("RS");
  if (!sheet) return responseJson({ success: false, error: "Aba RS não encontrada" });
  
  const agora = new Date();
  const dataFormatada = Utilities.formatDate(agora, "GMT-3", "dd/MM/yyyy HH:mm:ss");
  const numRS = "RS-" + Utilities.formatDate(agora, "GMT-3", "yyyyMMdd") + "-" + (sheet.getLastRow()).toString().padStart(4, '0');
  
  sheet.appendRow([
    dataFormatada,
    numRS,
    p.data.protocolosIds || "",
    p.data.empresa || "",
    p.data.responsavel || p.username,
    p.data.bairro || "",
    p.data.observacoes || "",
    "RASCUNHO",
    "",
    "",
    dataFormatada,
    p.username
  ]);
  
  return responseJson({ success: true, rs: numRS });
}

/**
 * Retorna todas as RS
 */
function getRS(p) {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("RS");
  if (!sheet) return responseJson({ success: true, data: [] });
  
  const data = sheet.getDataRange().getValues();
  if (data.length < 2) return responseJson({ success: true, data: [] });

  const headers = data[0];
  let results = [];
  for (let i = 1; i < data.length; i++) {
    let obj = {};
    headers.forEach((h, index) => {
      obj[h] = data[i][index];
    });
    results.push(obj);
  }
  
  return responseJson({ success: true, data: results.reverse() });
}

/**
 * Cria novo registro de Execução
 */
function createExecution(p) {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("EXECUCAO");
  if (!sheet) return responseJson({ success: false, error: "Aba EXECUCAO não encontrada" });
  
  const agora = new Date();
  const dataFormatada = Utilities.formatDate(agora, "GMT-3", "dd/MM/yyyy HH:mm:ss");
  const idExec = "EXEC-" + Utilities.formatDate(agora, "GMT-3", "yyyyMMdd") + "-" + (sheet.getLastRow()).toString().padStart(4, '0');
  
  sheet.appendRow([
    dataFormatada,
    idExec,
    p.data.rsId || "",
    p.data.protocolo || "",
    p.data.executor || p.username,
    p.data.dataExec || "",
    p.data.horaInicio || "",
    p.data.horaFim || "",
    p.data.observacoes || "",
    p.data.fotosUrl || "",
    "EM_EXECUCAO",
    p.username,
    dataFormatada,
    p.username
  ]);
  
  return responseJson({ success: true, execId: idExec });
}

/**
 * Retorna todas as Execuções
 */
function getExecutions(p) {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("EXECUCAO");
  if (!sheet) return responseJson({ success: true, data: [] });
  
  const data = sheet.getDataRange().getValues();
  if (data.length < 2) return responseJson({ success: true, data: [] });

  const headers = data[0];
  let results = [];
  for (let i = 1; i < data.length; i++) {
    let obj = {};
    headers.forEach((h, index) => {
      obj[h] = data[i][index];
    });
    results.push(obj);
  }
  
  return responseJson({ success: true, data: results.reverse() });
}

/**
 * Cria novo registro de Fiscalização
 */
function createFiscalization(p) {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("FISCALIZACAO");
  if (!sheet) return responseJson({ success: false, error: "Aba FISCALIZACAO não encontrada" });
  
  const agora = new Date();
  const dataFormatada = Utilities.formatDate(agora, "GMT-3", "dd/MM/yyyy HH:mm:ss");
  const idFiscal = "FISCAL-" + Utilities.formatDate(agora, "GMT-3", "yyyyMMdd") + "-" + (sheet.getLastRow()).toString().padStart(4, '0');
  
  sheet.appendRow([
    dataFormatada,
    idFiscal,
    p.data.rsId || "",
    dataFormatada,
    p.username,
    p.data.resultado || "",
    p.data.observacoes || "",
    p.data.aprovado || "PENDENTE",
    p.data.motivoDevolucao || "",
    p.data.fotosFiscalUrl || "",
    "PENDENTE",
    dataFormatada,
    p.username
  ]);
  
  return responseJson({ success: true, fiscalId: idFiscal });
}

/**
 * Retorna todas as Fiscalizações
 */
function getFiscalizations(p) {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("FISCALIZACAO");
  if (!sheet) return responseJson({ success: true, data: [] });
  
  const data = sheet.getDataRange().getValues();
  if (data.length < 2) return responseJson({ success: true, data: [] });

  const headers = data[0];
  let results = [];
  for (let i = 1; i < data.length; i++) {
    let obj = {};
    headers.forEach((h, index) => {
      obj[h] = data[i][index];
    });
    results.push(obj);
  }
  
  return responseJson({ success: true, data: results.reverse() });
}

/**
 * NOVO: Retorna contagem de protocolos por STATUS
 * Busca dados sempre da aba ENTRADA para garantir precisão
 */
function getStatusCounts(p) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheetEntrada = ss.getSheetByName("ENTRADA");
  const sheetAtrasado = ss.getSheetByName("URGENTE/ATRASADO");
  
  if (!sheetEntrada) return responseJson({ success: false, error: "Aba ENTRADA não encontrada" });
  
  const dataEntrada = sheetEntrada.getDataRange().getValues();
  if (dataEntrada.length < 2) return responseJson({ success: true, counts: {} });

  const headers = dataEntrada[0];
  const idxStatus = headers.indexOf("STATUS");
  
  if (idxStatus < 0) return responseJson({ success: false, error: "Coluna STATUS não encontrada" });

  let counts = {
    "TOTAL": 0,
    "ABERTO": 0,
    "ATRASADO": 0,
    "COM EMPRESA": 0,
    "RESOLVIDO": 0,
    "CANCELADO": 0,
    "PENDENTE": 0,
    "GARANTIA": 0
  };

  // Contar ATRASADO da aba "URGENTE/ATRASADO" (se existir)
  if (sheetAtrasado) {
    const dataAtrasado = sheetAtrasado.getDataRange().getValues();
    // Conta todas as linhas de dados (menos o cabeçalho)
    counts["ATRASADO"] = Math.max(0, dataAtrasado.length - 1);
  }

  // Contar os outros status da aba ENTRADA
  for (let i = 1; i < dataEntrada.length; i++) {
    const status = (dataEntrada[i][idxStatus] || "").toString().toUpperCase().trim();
    
    if (!status) continue;
    
    counts["TOTAL"]++;
    
    if (status === "ABERTO" || status === "PENDENTE") {
      counts["ABERTO"]++;
    } else if (status === "COM EMPRESA" || status === "ENCAMINHADO AO FUNCIONÁRIO") {
      counts["COM EMPRESA"]++;
    } else if (status === "RESOLVIDO" || status === "CONCLUÍDO") {
      counts["RESOLVIDO"]++;
    } else if (status === "CANCELADO") {
      counts["CANCELADO"]++;
    } else if (status === "PENDENTE") {
      counts["PENDENTE"]++;
    } else if (status === "GARANTIA") {
      counts["GARANTIA"]++;
    }
  }

  return responseJson({ success: true, counts: counts });
}