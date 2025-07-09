// edit.js

async function renderEditView(id = null, transaction = {}) {
    const app = document.getElementById("app");

    // Pega valor, data, categoria, banco e tipo da transação (se houver)
    const valor = transaction.valor !== undefined ? Math.abs(transaction.valor).toFixed(2) : "";
    const data = transaction.data ? new Date(transaction.data).toISOString().slice(0, 10) : "";
    const categoriaAtual = transaction.categoria || "";
    const bancoAtual = transaction.banco || "";
    const tipoAtual = transaction.valor >= 0 ? "entrada" : "saida";

    // Busca categorias e bancos do IndexedDB
    const categorias = await getAllCategorias();
    const bancos = await getAllBancos();

    app.innerHTML = `
        <h1>${id ? "Editar Transação" : "Nova Transação"}</h1>
        <form id="transactionForm">
            <label>
                Valor:<br />
                <input type="number" id="valor" name="valor" step="0.01" required value="${valor}">
            </label><br/><br/>

            <label>
                Data:<br />
                <input type="date" id="data" name="data" required value="${data}">
            </label><br/><br/>

            <label>
                Tipo:<br />
                <select id="tipo" name="tipo" required>
                    <option value="">Selecione</option>
                    <option value="entrada" ${tipoAtual === "entrada" ? "selected" : ""}>Entrada</option>
                    <option value="saida" ${tipoAtual === "saida" ? "selected" : ""}>Saída</option>
                </select>
            </label><br/><br/>

            <label>
                Categoria:<br />
                <select id="categoriaSelect" required>
                    <option value="">Selecione</option>
                    ${categorias.map(cat => `
                        <option value="${cat}" ${cat === categoriaAtual ? "selected" : ""}>${cat}</option>
                    `).join('')}
                    <option value="__novo">Adicionar nova categoria</option>
                </select>
                <input type="text" id="categoriaInput" placeholder="Nova categoria" style="display:none; margin-top: 8px;" />
            </label><br/><br/>

            <label>
                Banco:<br />
                <select id="bancoSelect" required>
                    <option value="">Selecione</option>
                    ${bancos.map(b => `
                        <option value="${b}" ${b === bancoAtual ? "selected" : ""}>${b}</option>
                    `).join('')}
                    <option value="__novo">Adicionar novo banco</option>
                </select>
                <input type="text" id="bancoInput" placeholder="Novo banco" style="display:none; margin-top: 8px;" />
            </label><br/><br/>

            <button type="submit">Salvar</button>
            <button type="button" id="cancelBtn">Cancelar</button>
        </form>
    `;

    // Inputs para nova categoria e banco
    const categoriaSelect = document.getElementById("categoriaSelect");
    const categoriaInput = document.getElementById("categoriaInput");
    categoriaSelect.addEventListener("change", () => {
        if (categoriaSelect.value === "__novo") {
            categoriaInput.style.display = "block";
            categoriaInput.focus();
        } else {
            categoriaInput.style.display = "none";
            categoriaInput.value = "";
        }
    });

    const bancoSelect = document.getElementById("bancoSelect");
    const bancoInput = document.getElementById("bancoInput");
    bancoSelect.addEventListener("change", () => {
        if (bancoSelect.value === "__novo") {
            bancoInput.style.display = "block";
            bancoInput.focus();
        } else {
            bancoInput.style.display = "none";
            bancoInput.value = "";
        }
    });

    // Form submit
    document.getElementById("transactionForm").addEventListener("submit", async (e) => {
        e.preventDefault();

        const valorInput = parseFloat(document.getElementById("valor").value);
        const dataInput = document.getElementById("data").value;
        const tipoInput = document.getElementById("tipo").value;

        const categoriaValor = categoriaSelect.value === "__novo" ? categoriaInput.value.trim() : categoriaSelect.value;
        const bancoValor = bancoSelect.value === "__novo" ? bancoInput.value.trim() : bancoSelect.value;

        if (isNaN(valorInput) || !dataInput || !categoriaValor || !bancoValor || !tipoInput) {
            alert("Preencha todos os campos corretamente.");
            return;
        }

        // Se nova categoria foi digitada, salva no banco
        if (categoriaSelect.value === "__novo") {
            await addCategoria(categoriaValor);
        }
        // Se novo banco foi digitado, salva no banco
        if (bancoSelect.value === "__novo") {
            await addBanco(bancoValor);
        }

        // Ajusta o valor com sinal conforme tipo
        const valorFinal = tipoInput === "saida" ? -Math.abs(valorInput) : Math.abs(valorInput);

        const item = {
            valor: valorFinal,
            data: new Date(dataInput).toISOString(),
            categoria: categoriaValor,
            banco: bancoValor,
        };

        if (id) {
            await updateTransaction(id, item);
        } else {
            await addTransaction(item);
        }

        // Volta para dashboard (você pode substituir pelo seu método)
        renderDashboardView();
    });

    // Cancelar volta para dashboard
    document.getElementById("cancelBtn").addEventListener("click", () => {
        renderDashboardView();
    });
}
