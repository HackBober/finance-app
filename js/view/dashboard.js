async function renderDashboardView() {
    transactionsCache = await getAllTransactions();
    const bancos = await getAllBanks();

    // Calcula totais de entradas e saídas no geral
    let totalEntradas = 0;
    let totalSaidas = 0;

    transactionsCache.forEach(t => {
        if (t.valor >= 0) {
            totalEntradas += t.valor;
        } else {
            totalSaidas += t.valor;
        }
    });

    // Saldo base será a soma dos saldos iniciais dos bancos
    const saldoBase = bancos.reduce((acc, b) => acc + (b.saldoInicial || 0), 0);

    // Saldo disponível é saldoBase + total movimentado
    const saldoDisponivel = saldoBase + totalEntradas + totalSaidas;

    // Agrupar por banco: iniciando com saldo inicial de cada banco
    const bancosInfo = {};
    bancos.forEach(b => {
        bancosInfo[b.nome] = {
            saldoInicial: b.saldoInicial || 0,
            entradas: 0,
            saidas: 0
        };
    });

    // Preencher entradas e saídas por banco
    transactionsCache.forEach(t => {
        if (!bancosInfo[t.banco]) {
            bancosInfo[t.banco] = { saldoInicial: 0, entradas: 0, saidas: 0 };
        }
        if (t.valor >= 0) {
            bancosInfo[t.banco].entradas += t.valor;
        } else {
            bancosInfo[t.banco].saidas += t.valor;
        }
    });

    // Cores dos bancos
    const bankColors = {
        "Itaú": "#ff7f00",
        "Bradesco": "#cc0925",
        "Nubank": "#8a05be",
        "Banco do Brasil": "#ffcc00",
        "Santander": "#ff0000",
        "Caixa": "#005ca9",
        "Inter": "#ff7f50",
        "C6": "#000000",
        "Neon": "#00ffda",
        "Mercado Pago": "#009ee3",
        "PicPay": "#21c25e",
        "Will Bank": "#ffef00",
        "BTG": "#191919",
        "Neon+": "#04d9b2",
        "Sofisa": "#00313f",
        "BS2": "#2e79b9"
    };


    const app = document.getElementById("app");

    app.innerHTML = `
        <h1>Dashboard</h1>
        <section class="dashboard-cards">
            <div class="card">
                <h2>Saldo Disponível</h2>
                <p>R$ ${saldoDisponivel.toFixed(2)}</p>
            </div>
            <div class="card">
                <h2>Entradas Totais</h2>
                <p>R$ ${totalEntradas.toFixed(2)}</p>
            </div>
            <div class="card">
                <h2>Gastos Totais</h2>
                <p>R$ ${Math.abs(totalSaidas).toFixed(2)}</p>
            </div>
        </section>

        <section class="bank-cards">
            ${Object.entries(bancosInfo).map(([banco, info]) => `
                <div class="card" style="background:${bankColors[banco] || "#95a5a6"}">
                    <h2>${banco}</h2>
                    <p>Saldo: R$ ${(info.saldoInicial + info.entradas + info.saidas).toFixed(2)}</p>
                    <p>Entradas: R$ ${info.entradas.toFixed(2)}</p>
                    <p>Gastos: R$ ${Math.abs(info.saidas).toFixed(2)}</p>
                </div>
            `).join("")}
        </section>

        <h2>Transções</h2>
        <div class="filter">
            <label for="filterBank">Banco:</label>
            <select id="filterBank">
                <option value="">Todos</option>
                ${bancos.map(b => `<option value="${b.nome}">${b.nome}</option>`).join('')}
            </select>

            <label for="filterMonth">Mês:</label>
            <input id="filterMonth" type="month">
            <button id="filterBtn">Filtrar</button>
        </div>

        <ul id="transactionList" class="transaction-list">
            <!-- Transições serão populadas pelo JavaScript -->
        </ul>
    `;

    function showTransactions(transactions) {
        transactions = transactions.slice().sort((a, b) => new Date(b.data) - new Date(a.data));

        document.getElementById("transactionList").innerHTML = transactions.map(t => {
            const valorFormatado = (t.valor || 0).toFixed(2).replace('.', ',');
            return `
            <li>
                <span>${new Date(t.data).toLocaleDateString()} - ${t.categoria} - ${t.banco} - R$ ${valorFormatado}</span>
                <div class="transaction-actions">
                    <button class="editBtn" data-id="${t.id}">Editar</button>
                    <button class="deleteBtn" data-id="${t.id}">Excluir</button>
                </div>
            </li>
        `;
        }).join("");

        document.querySelectorAll(".editBtn").forEach(btn => {
            btn.addEventListener("click", e => {
                const id = Number(e.target.dataset.id);
                const transaction = transactionsCache.find(t => t.id === id);
                if (transaction) {
                    renderEditView(id, transaction);
                }
            });
        });

        document.querySelectorAll(".deleteBtn").forEach(btn => {
            btn.addEventListener("click", async e => {
                const id = Number(e.target.dataset.id);
                if (confirm("Excluir esta transação?")) {
                    await deleteTransaction(id);
                    renderDashboardView();
                }
            });
        });
    }

    showTransactions(transactionsCache);

    document.getElementById("filterBtn").addEventListener("click", () => {
        const bank = document.getElementById("filterBank").value;
        const month = document.getElementById("filterMonth").value;

        let filtradas = transactionsCache;

        if (bank) {
            filtradas = filtradas.filter(t => t.banco === bank);
        }
        if (month) {
            filtradas = filtradas.filter(t => t.data.startsWith(month));
        }
        showTransactions(filtradas);
    });
}
