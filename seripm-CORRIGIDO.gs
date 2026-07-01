// @ts-nocheck
/**
 * SISTEMA INTEGRADO SERIPM 2026 - BACK-END API OTIMIZADO E COMPLETO
 * v2.1 - CORRIGIDO: getProtocols, normalizarPerfil, isMatch integrado
 */

function inicializarSistemaSERIPM() {
  Logger.log("🔄 Iniciando setup do sistema SERIPM...");
  
  criarAbasAusentes();
  padronizarColunas();
  inicializarPerfis();
  
  Logger.log("✅ Sistema SERIPM inicializado com sucesso!");
  SpreadsheetApp.getUi().alert("✅ SERIPM inicializado!\n\nNovas abas criadas:\n- RS\n- EXECUCAO\n- FISCALIZACAO\n\nPerfis profissionais criados.");
}

function criarAbasAusentes() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheetsExistentes = ss.getSheets().map(s => s.getName());
  
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

function padronizarColunas() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheetsParaPadronizar = ["ENTRADA", "ADMINISTRATIVO", "OBRA", "TELECOM", "GARANTIA", "COM FUNCIONÁRIO", "IMPLANTAÇÃO"];
  
  sheetsParaPadronizar.forEach(sheetName => {
    const sheet = ss.getSheetByName(sheetName);
    if (!sheet) return;
    
    const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
    
    if (!headers.includes("DATA_MODIFICACAO")) {
      sheet.getRange(1, sheet.getLastColumn() + 1).setValue("DATA_MODIFICACAO");
    }
    if (!headers.includes("MODIFICADO_POR")) {
      sheet.getRange(1, sheet.getLastColumn() + 1).setValue("MODIFICADO_POR");
    }
    
    Logger.log(`✅ Aba ${sheetName} padronizada`);
  });
}

function inicializarPerfis() {
  const userSheet = getUserSheet();
  const data = userSheet.getDataRange().getValues();
  
  if (data[0].length < 5) {
    if (data.length > 1) {
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

  if (col === 7) {
    let cpf = valor.toString().replace(/\D/g, "").padStart(11, '0').replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.$2.$3-$4");
    if (valor.toString() !== cpf) {
      range.setNumberFormat("@").setValue(cpf);
    }
  } else if (col === 8) {
    let tel = valor.toString().replace(/\D/g, "");
    range.setNumberFormat("@");
    if (tel.length === 11) {
      let telFmt = tel.replace(/(\d{2})(\d{5})(\d{4})/, "($1) $2-$3");
      if (valor.toString() !== telFmt) range.setValue(telFmt);
    } else if (tel.length === 10) {
      let telFmt = tel.replace(/(\d{2})(\d{4})(\d{4})/, "($1) $2-$3");
      if (valor.toString() !== telFmt) range.setValue(telFmt);
    }
  } else if (typeof valor === 'string') {
    if (valor !== valor.toUpperCase()) {
      range.setValue(valor.toUpperCase());
    }
  }

  if (col === 12) {
    const agora = new Date();
    sheet.getRange(row, 14).setValue(Utilities.formatDate(agora, "GMT-3", "dd/MM/yyyy HH:mm:ss"));
  }

  if (sheetName === "ENTRADA" || sheetName === "OBRA") {
    if (col === 6 && sheet.getRange(row, 2).getValue() === "") {
      const agora = new Date();
      const dataFormatada = Utilities.formatDate(agora, "GMT-3", "dd/MM/yyyy HH:mm:ss");
      const prefixo = (sheetName === "OBRA") ? "OBRA-" : "";
      const proto = prefixo + Utilities.formatDate(agora, "GMT-3", "yyyyMMdd") + "-" + (row - 1).toString().padStart(3, '0');
      
      sheet.getRange(row, 1).setValue(dataFormatada);
      sheet.getRange(row, 2).setValue(proto);
      
      if (sheet.getRange(row, 12).getValue() === "") {
        sheet.getRange(row, 12).setValue("ABERTO");
      }
      
      sheet.getRange(row, 14).setValue(dataFormatada);
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
 * ✅ CORRIGIDO: Normalização de Perfil com mapeamento consistente
 */
function normalizarPerfil(perfil) {
  const p = (perfil || "").toString().toUpperCase().trim();
  
  // Mapeamento consistente - uma entrada por chave
  const mapa = {
    "SUPER ADMINISTRADOR": "SUPER_ADMIN",
    "SUPER ADMIN": "SUPER_ADMIN",
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
  
  return mapa[p] || "ATENDIMENTO";
}

function processLogin(user, pass) {
  const sheet = getUserSheet();
  const data = sheet.getDataRange().getValues();
  const headers = data[0].map(h => h.toString().toUpperCase().trim());
  
  const idxUser = headers.indexOf("USERNAME");
  const idxPass = headers.indexOf("PASSWORD");
  const idxPerfil = headers.indexOf("PERFIL");
  const idxStatus = headers.indexOf("STATUS");
  const idxAbas = headers.indexOf("ABAS_PERMITIDAS");

  for (let i = 1; i < data.length; i++) {
    const rowUser = (data[i][idxUser] || "").toString().trim().toUpperCase();
    const inputUser = user.toString().trim().toUpperCase();
    const rowPass = (data[i][idxPass] || "").toString().trim();
    const inputPass = pass.toString().trim();

    if (rowUser === inputUser && rowPass === inputPass) {
      const status = (data[i][idxStatus] || "").toString().toUpperCase().trim();
      if (status === "INATIVO") {
        return responseJson({ success: false, error: "Usuário inativo." });
      }
      
      const perfilNormalizado = normalizarPerfil(data[i][idxPerfil]);
      
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

/**
 * ✅ CORRIGIDO: getProtocols com lógica clara e sem duplicação
 */
function getProtocols(p) {
  // Funções auxiliares
  const isMatch = (status, alvo) => {
    if (!alvo) return true; // Se não tem filtro, mostra tudo
    const s = (status || "").toString().toUpperCase().trim();
    const a = (alvo || "").toString().toUpperCase().trim();
    return s.includes(a) || s === a || 
           (a === "COM EMPRESA" && (s.includes("COM FUNCIONÁRIO") || s.includes("ENCAMINHADO")));
  };
  
  // Validação de segurança
  const rolesComAcessoTotal = ['SUPER_ADMIN', 'SUPERVISOR', 'ADMINISTRATIVO', 'FISCAL'];
  const ehEmpresaAcessandoAbaCorreta = (p.role === 'EMPRESA' && p.tab === 'COM FUNCIONÁRIO');
  
  if (!rolesComAcessoTotal.includes(p.role) && !ehEmpresaAcessandoAbaCorreta) {
    const allowedTabsString = (p.allowedTabs || "");
    const allowed = allowedTabsString.split(',').map(s => s.trim());
    if (!allowed.includes(p.tab)) return responseJson({ success: false, error: "Acesso negado à aba " + p.tab });
  }

  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName(p.tab);
  let statusFiltro = null;
  
  // Definir qual STATUS filtrar
  if (p.tab !== "OBRA" && p.tab !== "ENTRADA" && p.tab !== "SUPERVISOR") {
    const mapeamento = {
      "ADMINISTRATIVO": "ADMINISTRATIVO",
      "TELECOM": "TELECOM",
      "GARANTIA": "GARANTIA",
      "COM FUNCIONÁRIO": "COM EMPRESA",  // ✅ CORRIGIDO: Buscar "COM EMPRESA" não "COM FUNCIONÁRIO"
      "IMPLANTAÇÃO": "IMPLANTAÇÃO"
    };
    statusFiltro = mapeamento[p.tab] || null;
  }
  
  // Se precisa filtrar por STATUS, busca da aba ENTRADA
  if (statusFiltro !== null) {
    sheet = ss.getSheetByName("ENTRADA");
  }
  
  if (!sheet) return responseJson({ success: false, error: "Aba não encontrada." });
  
  const data = sheet.getDataRange().getValues();
  if (data.length < 2) return responseJson({ success: true, data: [] });

  const headers = data[0];
  let results = [];
  const idxData = headers.indexOf("DATA");
  const idxStatus = headers.indexOf("STATUS");
  const idxAtendente = headers.indexOf("ATENDENTE");

  for (let i = 1; i < data.length; i++) {
    // Filtro 1: Se tem statusFiltro definido, só mostra registros com esse status
    if (statusFiltro !== null && idxStatus >= 0) {
      if (!isMatch(data[i][idxStatus].toString(), statusFiltro)) {
        continue;
      }
    }
    
    // Filtro 2: ATENDIMENTO vê apenas seus próprios registos
    if (p.role === "ATENDIMENTO" && idxAtendente >= 0) {
      if (data[i][idxAtendente].toString().toUpperCase() !== p.username.toString().toUpperCase()) {
        continue;
      }
    }

    // Construir objeto com todos os dados
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
    dataFormatada
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
      if (idxStatus >= 0) sheet.getRange(i + 1, idxStatus + 1).setValue(p.newStatus.toUpperCase());
      if (idxModifData >= 0) sheet.getRange(i + 1, idxModifData + 1).setValue(dataFormatada);
      if (idxModifPor >= 0) sheet.getRange(i + 1, idxModifPor + 1).setValue(p.username || "SISTEMA");
      
      return responseJson({ success: true });
    }
  }
  return responseJson({ success: false, error: "Protocolo não encontrado" });
}

function getUserSheet() { 
  return SpreadsheetApp.getActiveSpreadsheet().getSheetByName("USUARIOS") || 
         SpreadsheetApp.getActiveSpreadsheet().getSheetByName("USUÁRIOS"); 
}

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

function getSheetStructure() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheets = ss.getSheets();
  const structure = {};

  sheets.forEach(sheet => {
    const sheetName = sheet.getName();
    const data = sheet.getDataRange().getValues();
    
    if (data.length > 0) {
      structure[sheetName] = {
        columns: data[0],
        rowCount: data.length - 1,
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

function getPerfis() {
  return responseJson({ 
    success: true, 
    perfis: [
      "SUPER_ADMIN",
      "ADMINISTRATIVO",
      "ATENDIMENTO",
      "EMPRESA",
      "FISCAL",
      "SUPERVISOR"
    ],
    descricoes: {
      "SUPER_ADMIN": "Acesso total ao sistema",
      "ADMINISTRATIVO": "Gerencia protocolos, RS e fiscalização",
      "ATENDIMENTO": "Abre protocolos",
      "EMPRESA": "Executa serviços",
      "FISCAL": "Fiscaliza execuções",
      "SUPERVISOR": "Supervisiona operações"
    }
  });
}

function getDynamicData(p) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const entradaSheet = ss.getSheetByName("ENTRADA");
  
  if (!entradaSheet) {
    return responseJson({ success: false, error: "Aba ENTRADA não encontrada" });
  }
  
  const data = entradaSheet.getDataRange().getValues();
  const headers = data[0];
  
  const idxStatus = headers.indexOf("STATUS");
  const idxBairro = headers.indexOf("BAIRRO");
  const idxServico = headers.indexOf("SERVICO") >= 0 ? headers.indexOf("SERVICO") : headers.indexOf("TIPO_SOLICITAÇÃO") >= 0 ? headers.indexOf("TIPO_SOLICITAÇÃO") : headers.indexOf("SOLICITAÇÃO");
  
  let statusSet = new Set();
  let bairroSet = new Set();
  let servicoSet = new Set();
  
  for (let i = 1; i < data.length; i++) {
    if (idxStatus >= 0 && data[i][idxStatus]) statusSet.add(String(data[i][idxStatus]).trim().toUpperCase());
    if (idxBairro >= 0 && data[i][idxBairro]) bairroSet.add(String(data[i][idxBairro]).trim());
    if (idxServico >= 0 && data[i][idxServico]) servicoSet.add(String(data[i][idxServico]).trim());
  }
  
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
 * ✅ CORRIGIDO: getStatusCounts com lógica clara
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

  // Contar TOTAL: todas as linhas com dados (excluindo cabeçalho)
  counts["TOTAL"] = dataEntrada.length - 1;

  // Contar ATRASADO da aba "URGENTE/ATRASADO" (se existir)
  if (sheetAtrasado) {
    const dataAtrasado = sheetAtrasado.getDataRange().getValues();
    counts["ATRASADO"] = Math.max(0, dataAtrasado.length - 1);
  }

  // Contar os outros status da aba ENTRADA
  for (let i = 1; i < dataEntrada.length; i++) {
    const status = (dataEntrada[i][idxStatus] || "").toString().toUpperCase().trim();
    
    if (!status) continue;
    
    if (status === "ABERTO") {
      counts["ABERTO"]++;
    } else if (status === "COM EMPRESA" || status === "ENCAMINHADO AO FUNCIONÁRIO" || status === "COM FUNCIONÁRIO") {
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
