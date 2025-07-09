async function renderReportsView() {
  const app = document.getElementById("app");
  const transactions = await getAllTransactions();

  // Monta o topo com o filtro
  app.innerHTML = `
  <h1>Relatórios</h1>
  <div class="filter" id="reportFilter">
    <label for="reportMonth">Selecione o Mês:</label>
    <input type="month" id="reportMonth">
    <button id="applyReportFilter" class="btn">Aplicar</button>
  </div>

  <div style="overflow-x:auto;" class="transaction-list">
    <table id="reportTable" class="spreadsheet-table">
      <thead>
        <tr>
          <th>Data</th>
          <th>Banco</th>
          <th>Categoria</th>
          <th>Valor (R$)</th>
        </tr>
      </thead>
      <tbody></tbody>
    </table>
  </div>

  <div id="reportSummary" class="report-summary">
    <ul>
      <li>Total de Entradas: <span id="totalEntradaCell"></span></li>
      <li>Total de Saídas: <span id="totalSaidaCell"></span></li>
      <li>Saldo Líquido: <span id="saldoLiquidoCell"></span></li>
    </ul>
  </div>
`;


  const monthInput = document.getElementById("reportMonth");
  const applyBtn = document.getElementById("applyReportFilter");
  const tbody = document.querySelector("#reportTable tbody");

  const totalEntradaCell = document.getElementById("totalEntradaCell");
  const totalSaidaCell = document.getElementById("totalSaidaCell");
  const saldoLiquidoCell = document.getElementById("saldoLiquidoCell");

  function updateReport(filtered) {
    // Ordena do mais recente para o mais antigo
    filtered.sort((a, b) => new Date(b.data) - new Date(a.data));

    // Preenche as linhas da tabela
    tbody.innerHTML = filtered.map(t => `
      <tr>
        <td>${new Date(t.data).toLocaleDateString()}</td>
        <td>${t.banco}</td>
        <td>${t.categoria}</td>
        <td>R$ ${t.valor.toFixed(2).replace('.', ',')}</td>
      </tr>
    `).join('');

    // Calcula o resumen
    const totalEntradas = filtered
      .filter(t => t.valor >= 0)
      .reduce((acc, t) => acc + t.valor, 0);
    const totalSaidas = filtered
      .filter(t => t.valor < 0)
      .reduce((acc, t) => acc + t.valor, 0);
    const saldoLiquido = totalEntradas + totalSaidas;

    totalEntradaCell.textContent = `R$ ${totalEntradas.toFixed(2).replace('.', ',')}`;
    totalSaidaCell.textContent = `R$ ${Math.abs(totalSaidas).toFixed(2).replace('.', ',')}`;
    saldoLiquidoCell.textContent = `R$ ${saldoLiquido.toFixed(2).replace('.', ',')}`;


  }

  applyBtn.addEventListener("click", () => {
    const monthValue = monthInput.value;
    let filtered = transactions;
    if (monthValue) {
      filtered = transactions.filter(t => t.data.startsWith(monthValue));
    }
    updateReport(filtered);
  });

  // Carrega tudo ao inicio
  updateReport(transactions);
}
