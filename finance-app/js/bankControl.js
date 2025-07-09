async function renderBankControlView() {
  const banks = await getAllBanks();

  const app = document.getElementById("app");

  app.innerHTML = `
    <h1 class="filter" style="margin-bottom: 20px;">Controle dos Bancos</h1>

    <button id="addBankBtn" class="filter button" style="margin-bottom: 20px;">Adicionar Banco</button>

    <ul id="bankList" class="bancos-card">
      ${banks.map(b => `
        <li>
          <div style="display:flex; justify-content:space-between; align-items:center;">
            <span>${b.nome}</span>
            <span>R$ ${typeof b.saldoInicial === "number" ? b.saldoInicial.toFixed(2) : "0.00"}</span>
          </div>
          <div class="transaction-actions" style="margin-top: 8px;">
            <button class="editBankBtn" data-nome="${b.nome}">Editar</button>
            <button class="deleteBankBtn" data-nome="${b.nome}">Excluir</button>
          </div>
        </li>
      `).join('')}
    </ul>

    <div id="bankFormContainer" style="display:none; margin-top: 30px;">
      <h2 class="filter">Adicionar Banco</h2>
      <form id="bankForm">
        <label for="bankNome">Nome do Banco:
          <input type="text" id="bankNome" required />
        </label>
        <label for="bankSaldoInicial">Saldo Inicial:
          <input type="number" id="bankSaldoInicial" step="0.01" required />
        </label>
        <div class="filter" style="margin-top: 20px;">
          <button type="submit">Salvar</button>
          <button type="button" id="cancelBankForm">Cancelar</button>
        </div>
      </form>
    </div>
  `;

  // Eventos (sem alteração)
  const bankFormContainer = document.getElementById("bankFormContainer");
  const bankForm = document.getElementById("bankForm");
  const bankNomeInput = document.getElementById("bankNome");
  const bankSaldoInicialInput = document.getElementById("bankSaldoInicial");
  const formTitle = app.querySelector("h2.filter");

  document.getElementById("addBankBtn").addEventListener("click", () => {
    formTitle.textContent = "Adicionar Banco";
    bankNomeInput.value = "";
    bankNomeInput.disabled = false;
    bankSaldoInicialInput.value = "";
    bankFormContainer.style.display = "block";
  });

  document.getElementById("cancelBankForm").addEventListener("click", () => {
    bankFormContainer.style.display = "none";
  });

  document.querySelectorAll(".editBankBtn").forEach(btn => {
    btn.addEventListener("click", async e => {
      const nome = e.target.dataset.nome;
      const bank = await getBank(nome);
      if (bank) {
        formTitle.textContent = "Editar Banco";
        bankNomeInput.value = bank.nome;
        bankNomeInput.disabled = true;
        bankSaldoInicialInput.value = bank.saldoInicial || 0;
        bankFormContainer.style.display = "block";
      }
    });
  });

  document.querySelectorAll(".deleteBankBtn").forEach(btn => {
    btn.addEventListener("click", async e => {
      const nome = e.target.dataset.nome;
      if (confirm(`Excluir banco "${nome}"?`)) {
        await deleteBank(nome);
        renderBankControlView();
      }
    });
  });

  bankForm.addEventListener("submit", async e => {
    e.preventDefault();

    const nome = bankNomeInput.value.trim();
    const saldoInicial = parseFloat(bankSaldoInicialInput.value);

    if (!nome || isNaN(saldoInicial)) {
      alert("Preencha todos os campos corretamente.");
      return;
    }

    await addOrUpdateBank({ nome, saldoInicial });

    bankFormContainer.style.display = "none";
    renderBankControlView();
  });
}
