// db.js adaptado para SheetDB com tudo na mesma aba e campos de tipo

const SHEETDB_URL = "https://sheetdb.io/api/v1/9wz82m9wgjyox";

function initDB() {
  console.log("initDB: inicialização simbólica (SheetDB não requer setup)");
  return Promise.resolve();
}

/* ---------- TRANSAÇÕES ---------- */
function getAllTransactions() {
  console.log("Buscando todas as transações...");
  return fetch(`${SHEETDB_URL}`)
    .then(res => {
      console.log("Status da resposta das transações:", res.status);
      if (!res.ok) throw new Error("Erro ao buscar transações");
      return res.json();
    })
    .then(data => {
      const transacoes = data.filter(item => item.tipo === "transacao");
      console.log("Transações recebidas:", transacoes);
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
    tipo: "transacao",
    data: dataFormatada,
    valor: valorConvertido
  };

  return fetch(SHEETDB_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ data: tx })
  }).then(res => {
    if (!res.ok) throw new Error("Erro ao adicionar transação.");
  });
}

function deleteTransaction(id) {
  return fetch(`${SHEETDB_URL}/id/${id}`, {
    method: "DELETE"
  })
    .then(res => {
      if (!res.ok) throw new Error("Erro ao deletar transação.");
    });
}
function updateTransaction(id, item) {
  const dataFormatada = new Date(item.data).toISOString().split("T")[0];

  const valorConvertido = typeof item.valor === "string"
    ? parseFloat(item.valor.replace(",", "."))
    : item.valor;

  const tx = {
    ...item,
    data: dataFormatada,
    valor: valorConvertido
  };

  return fetch(`${SHEETDB_URL}/id/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ data: tx })
  }).then(res => {
    if (!res.ok) throw new Error("Erro ao atualizar transação.");
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
  return fetch(SHEETDB_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ data: { nome, tipo: "categoria" } })
  }).then(res => {
    if (!res.ok) throw new Error("Erro ao adicionar categoria.");
  });
}

/* ---------- BANCOS ---------- */
function getAllBancos() {
  console.log("Buscando todos os bancos...");
  return fetch(SHEETDB_URL)
    .then(res => {
      console.log("Status da resposta dos bancos:", res.status);
      if (!res.ok) throw new Error("Erro ao buscar bancos");
      return res.json();
    })
    .then(data => {
      const bancos = data.filter(item => item.tipo === "banco");
      console.log("Bancos recebidos:", bancos);
      return [...new Set(bancos.map(b => b.nome))];
    });
}

function getAllBanks() {
  console.log("Buscando todos os bancos...");
  return fetch(SHEETDB_URL)
    .then(res => {
      console.log("Status da resposta dos bancos:", res.status);
      if (!res.ok) throw new Error("Erro ao buscar bancos");
      return res.json();
    })
    .then(data => {
      const bancos = data.filter(item => item.tipo === "banco");
      console.log("Bancos recebidos:", bancos);
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
  console.log("Payload para salvar banco:", payloadBank);

  return fetch(`${SHEETDB_URL}/search?nome=${encodeURIComponent(bank.nome)}&tipo=banco`)
    .then(res => res.json())
    .then(data => {
      if (data.length > 0) {
        return fetch(`${SHEETDB_URL}/id/${data[0].id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ data: payloadBank })
        }).then(res => {
          if (!res.ok) throw new Error("Erro ao atualizar banco");
        });
      } else {
        return fetch(SHEETDB_URL, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ data: payloadBank })
        }).then(res => {
          if (!res.ok) throw new Error("Erro ao criar banco");
        });
      }
    });
}

function getBank(nome) {
  return fetch(`${SHEETDB_URL}/search?nome=${encodeURIComponent(nome)}&tipo=banco`)
    .then(res => res.json())
    .then(data => data[0] || null);
}

function deleteBank(nome) {
  return fetch(`${SHEETDB_URL}/search?nome=${encodeURIComponent(nome)}&tipo=banco`)
    .then(res => res.json())
    .then(data => {
      if (data.length === 0) throw new Error("Banco não encontrado");
      return fetch(`${SHEETDB_URL}/id/${data[0].id}`, {
        method: "DELETE"
      });
    })
    .then(res => {
      if (!res.ok) throw new Error("Erro ao deletar banco.");
    });
}
