const SHEETDB_URL = "https://script.google.com/macros/s/AKfycby2SzCkkJvn96oiMKt0-AsX7R489Dfy6drXv2JFpB1Sy47dd4X1G2fJHobXFLq8B0UD/exec";

function initDB() {
  console.log("initDB: inicialização simbólica (Google Apps Script API)");
  return Promise.resolve();
}

function generateId() {
  return Date.now().toString() + Math.floor(Math.random() * 1000).toString();
}

// Helper: verificar cache e atualizar
function fetchWithCache(key, fetchFunc, maxAgeMs = 120000) { // cache 2 minutos
  const now = Date.now();
  const cached = localStorage.getItem(key);
  const cacheTime = localStorage.getItem(key + "_time");
  
  if (cached && cacheTime && now - parseInt(cacheTime) < maxAgeMs) {
    const data = JSON.parse(cached);
    // Retorna um objeto que já tem dados do cache e uma promise que atualiza em segundo plano
    fetchFunc().then(freshData => {
      const freshJson = JSON.stringify(freshData);
      if (freshJson !== cached) {
        localStorage.setItem(key, freshJson);
        localStorage.setItem(key + "_time", now.toString());
        // Opcional: disparar evento ou callback para avisar que tem dados novos
      } else {
      }
    }).catch(e => console.warn(`Erro atualizando cache ${key}:`, e));
    return Promise.resolve(data);
  } else {
    return fetchFunc().then(data => {
      localStorage.setItem(key, JSON.stringify(data));
      localStorage.setItem(key + "_time", now.toString());
      return data;
    });
  }
}

/* ---------- TRANSAÇÕES ---------- */

function getAllTransactions() {
  return fetchWithCache("transacoesCache", () => {
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
    // Limpa cache pois os dados mudaram
    localStorage.removeItem("transacoesCache");
    localStorage.removeItem("transacoesCache_time");
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
    localStorage.removeItem("transacoesCache");
    localStorage.removeItem("transacoesCache_time");
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
    localStorage.removeItem("transacoesCache");
    localStorage.removeItem("transacoesCache_time");
    return res.json();
  });
}

/* ---------- CATEGORIAS ---------- */

function getAllCategorias() {
  return fetchWithCache("categoriasCache", () => {
    return fetch(SHEETDB_URL)
      .then(res => res.json())
      .then(data => {
        const categorias = data.filter(item => item.tipo === "categoria");
        return [...new Set(categorias.map(cat => cat.nome))];
      });
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
    localStorage.removeItem("categoriasCache");
    localStorage.removeItem("categoriasCache_time");
    return res.json();
  });
}

/* ---------- BANCOS ---------- */

function getAllBancos() {
  return fetchWithCache("bancosCache", () => {
    return fetch(SHEETDB_URL)
      .then(res => {
        if (!res.ok) throw new Error("Erro ao buscar bancos");
        return res.json();
      })
      .then(data => {
        const bancos = data.filter(item => item.tipo === "banco");
        return [...new Set(bancos.map(b => b.nome))];
      });
  });
}

function getAllBanks() {
  return fetchWithCache("banksCache", () => {
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
    localStorage.removeItem("bancosCache");
    localStorage.removeItem("bancosCache_time");
    localStorage.removeItem("banksCache");
    localStorage.removeItem("banksCache_time");
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
    localStorage.removeItem("bancosCache");
    localStorage.removeItem("bancosCache_time");
    localStorage.removeItem("banksCache");
    localStorage.removeItem("banksCache_time");
    return res.json();
  });
}

function getBank(nome) {
  return fetchWithCache("bancosCache", () => {
    return fetch(SHEETDB_URL)
      .then(res => res.json())
      .then(data => {
        const bancos = data.filter(item => item.tipo === "banco" && item.nome === nome);
        return bancos[0] || null;
      });
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
      localStorage.removeItem("bancosCache");
      localStorage.removeItem("bancosCache_time");
      localStorage.removeItem("banksCache");
      localStorage.removeItem("banksCache_time");
      return res.json();
    });
  });
}
