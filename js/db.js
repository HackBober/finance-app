const SHEETDB_URL = "https://script.google.com/macros/s/AKfycbztbW0fyoQZBuOHlZO_Oh4NGDt6fIPjerWd_iY5VRVYwA-uNrYcDuZQjDrhiSYlhvZH/exec";

function initDB() {
  console.log("initDB: inicialização simbólica (Google Apps Script API)");
  return Promise.resolve();
}

function generateId() {
  return Date.now().toString() + Math.floor(Math.random() * 1000).toString();
}

/* ---------- TRANSAÇÕES ---------- */

function getAllTransactions() {
  console.log("Buscando todas as transações...");
  return fetch(SHEETDB_URL)
    .then(res => {
      if (!res.ok) throw new Error("Erro ao buscar transações");
      return res.json();
    })
    .then(data => {
      const transacoes = data.filter(item => item.tipo === "transacao");
      return transacoes.map(tx => ({
        ...tx,
        id: Number(tx.id),
        valor: parseFloat(tx.valor),
        data: tx.data
      }));
    });
}

function addTransaction(item) {
  const dataFormatada = new Date(item.data).toISOString().split("T")[0];
  const valorConvertido = typeof item.valor === "string"
    ? parseFloat(item.valor.replace(",", "."))
    : item.valor;

  const tx = {
    ...item,
    id: generateId(),
    tipo: "transacao",
    data: dataFormatada,
    valor: valorConvertido
  };

  return fetch(SHEETDB_URL, {
    method: "POST",
    headers: { "Content-Type": "text/plain" }, // evita preflight
    body: JSON.stringify({ action: "add", data: tx })
  }).then(res => {
    if (!res.ok) throw new Error("Erro ao adicionar transação.");
    return res.json();
  });
}

function updateTransaction(id, item) {
  const dataFormatada = new Date(item.data).toISOString().split("T")[0];
  const valorConvertido = typeof item.valor === "string"
    ? parseFloat(item.valor.replace(",", "."))
    : item.valor;

  const tx = {
    ...item,
    id,
    data: dataFormatada,
    valor: valorConvertido
  };

  return fetch(SHEETDB_URL, {
    method: "POST",
    headers: { "Content-Type": "text/plain" },
    body: JSON.stringify({ action: "update", data: tx })
  }).then(res => {
    if (!res.ok) throw new Error("Erro ao atualizar transação.");
    return res.json();
  });
}

function deleteTransaction(id) {
  return fetch(SHEETDB_URL, {
    method: "POST",
    headers: { "Content-Type": "text/plain" },
    body: JSON.stringify({ action: "delete", data: { id } })
  }).then(res => {
    if (!res.ok) throw new Error("Erro ao deletar transação.");
    return res.json();
  });
}

/* ---------- CATEGORIAS ---------- */

function getAllCategorias() {
  return fetch(SHEETDB_URL)
    .then(res => res.json())
    .then(data => {
      const categorias = data.filter(item => item.tipo === "categoria");
      return [...new Set(categorias.map(cat => cat.nome))];
    });
}

function addCategoria(nome) {
  const cat = {
    id: generateId(),
    nome,
    tipo: "categoria"
  };
  return fetch(SHEETDB_URL, {
    method: "POST",
    headers: { "Content-Type": "text/plain" },
    body: JSON.stringify({ action: "add", data: cat })
  }).then(res => {
    if (!res.ok) throw new Error("Erro ao adicionar categoria.");
    return res.json();
  });
}

/* ---------- BANCOS ---------- */

function getAllBancos() {
  return fetch(SHEETDB_URL)
    .then(res => {
      if (!res.ok) throw new Error("Erro ao buscar bancos");
      return res.json();
    })
    .then(data => {
      const bancos = data.filter(item => item.tipo === "banco");
      return [...new Set(bancos.map(b => b.nome))];
    });
}

function getAllBanks() {
  return fetch(SHEETDB_URL)
    .then(res => {
      if (!res.ok) throw new Error("Erro ao buscar bancos");
      return res.json();
    })
    .then(data => {
      const bancos = data.filter(item => item.tipo === "banco");
      return bancos.map(b => ({
        nome: b.nome,
        saldoInicial: parseFloat(b.saldoInicial) || 0
      }));
    });
}

function addOrUpdateBank(bank) {
  const payloadBank = {
    nome: bank.nome,
    saldoInicial: String(Number(bank.saldoInicial) || 0),
    tipo: "banco"
  };

  return updateBank(payloadBank)
    .catch(() => addBank(payloadBank));
}

function updateBank(bank) {
  return fetch(SHEETDB_URL, {
    method: "POST",
    headers: { "Content-Type": "text/plain" },
    body: JSON.stringify({ action: "update", data: bank })
  }).then(res => {
    if (!res.ok) throw new Error("Erro ao atualizar banco");
    return res.json();
  });
}

function addBank(bank) {
  const b = {
    ...bank,
    id: generateId()
  };
  return fetch(SHEETDB_URL, {
    method: "POST",
    headers: { "Content-Type": "text/plain" },
    body: JSON.stringify({ action: "add", data: b })
  }).then(res => {
    if (!res.ok) throw new Error("Erro ao criar banco");
    return res.json();
  });
}

function getBank(nome) {
  return fetch(SHEETDB_URL)
    .then(res => res.json())
    .then(data => {
      const bancos = data.filter(item => item.tipo === "banco" && item.nome === nome);
      return bancos[0] || null;
    });
}

function deleteBank(nome) {
  return getBank(nome).then(bank => {
    if (!bank) throw new Error("Banco não encontrado");
    return fetch(SHEETDB_URL, {
      method: "POST",
      headers: { "Content-Type": "text/plain" },
      body: JSON.stringify({ action: "delete", data: { id: bank.id } })
    }).then(res => {
      if (!res.ok) throw new Error("Erro ao deletar banco");
      return res.json();
    });
  });
}
