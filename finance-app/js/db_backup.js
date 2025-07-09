// db.js
let db;

/**
 * Inicializa o IndexedDB criando as object stores necessárias:
 * - "transactions" com keyPath "id" autoIncrement
 * - "categorias" com keyPath "nome" (string única)
 * - "bancos" com keyPath "nome" (string única)
 *
 * Usa versão 2 para garantir upgrade se já existia só "transactions".
 */
function initDB() {
    return new Promise((resolve, reject) => {
        // Versão 2: caso o banco já exista na versão 1, onupgradeneeded será chamado para criar categorias e bancos
        const request = indexedDB.open("finance-app", 2);

        request.onerror = () => reject("Erro ao abrir IndexedDB.");

        request.onsuccess = (e) => {
            db = e.target.result;
            resolve(db);
        };

        request.onupgradeneeded = (e) => {
            db = e.target.result;
            // Cria store de transações se não existir
            if (!db.objectStoreNames.contains("transactions")) {
                db.createObjectStore("transactions", { keyPath: "id", autoIncrement: true });
            }
            // Cria store de categorias se não existir
            if (!db.objectStoreNames.contains("categorias")) {
                // keyPath "nome", pois cada categoria é única pelo nome
                db.createObjectStore("categorias", { keyPath: "nome" });
            }
            // Cria store de bancos se não existir
            if (!db.objectStoreNames.contains("bancos")) {
                db.createObjectStore("bancos", { keyPath: "nome" });
            }
        };
    });
}

/* ---------- TRANSACTIONS ---------- */

/**
 * Retorna array de todas as transações armazenadas.
 * Cada item é um objeto com { id, valor, data, categoria, banco }.
 */
function getAllTransactions() {
    return new Promise((resolve, reject) => {
        const tx = db.transaction("transactions", "readonly");
        const store = tx.objectStore("transactions");
        const request = store.getAll();
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject("Erro ao buscar transações.");
    });
}

/**
 * Adiciona uma nova transação.
 * item deve ser { valor: Number, data: ISOString, categoria: String, banco: String }
 */
function addTransaction(item) {
    return new Promise((resolve, reject) => {
        const tx = db.transaction("transactions", "readwrite");
        const store = tx.objectStore("transactions");
        const request = store.add(item);
        request.onsuccess = () => resolve();
        request.onerror = () => reject("Erro ao adicionar transação.");
    });
}

/**
 * Atualiza transação existente pelo id.
 * item deve conter as mesmas propriedades e o id será atribuído para efetuar o put.
 */
function updateTransaction(id, item) {
    return new Promise((resolve, reject) => {
        const tx = db.transaction("transactions", "readwrite");
        const store = tx.objectStore("transactions");
        item.id = id;
        const request = store.put(item);
        request.onsuccess = () => resolve();
        request.onerror = () => reject("Erro ao atualizar transação.");
    });
}

/**
 * Deleta transação pelo id.
 */
function deleteTransaction(id) {
    return new Promise((resolve, reject) => {
        const tx = db.transaction("transactions", "readwrite");
        const store = tx.objectStore("transactions");
        const request = store.delete(id);
        request.onsuccess = () => resolve();
        request.onerror = () => reject("Erro ao deletar transação.");
    });
}

/* ---------- CATEGORIAS ---------- */

/**
 * Retorna array de strings com todas as categorias.
 */
function getAllCategorias() {
    return new Promise((resolve, reject) => {
        const tx = db.transaction("categorias", "readonly");
        const store = tx.objectStore("categorias");
        const request = store.getAll();
        request.onsuccess = () => {
            // Cada entry é { nome: "Categoria" }
            const categorias = request.result.map(cat => cat.nome);
            resolve(categorias);
        };
        request.onerror = () => reject("Erro ao buscar categorias.");
    });
}

/**
 * Adiciona nova categoria com nome único.
 * Se já existir uma categoria com mesmo nome, replace/put sobrescreve (mas sem duplicar).
 */
function addCategoria(nome) {
    return new Promise((resolve, reject) => {
        const tx = db.transaction("categorias", "readwrite");
        const store = tx.objectStore("categorias");
        const request = store.put({ nome });
        request.onsuccess = () => resolve();
        request.onerror = () => reject("Erro ao adicionar categoria.");
    });
}

/* ---------- BANCOS ---------- */

/**
 * Retorna array de strings com todos os bancos.
 */
function getAllBancos() {
    return new Promise((resolve, reject) => {
        const tx = db.transaction("bancos", "readonly");
        const store = tx.objectStore("bancos");
        const request = store.getAll();
        request.onsuccess = () => {
            // Cada entry é { nome: "Banco" }
            const bancos = request.result.map(b => b.nome);
            resolve(bancos);
        };
        request.onerror = () => reject("Erro ao buscar bancos.");
    });
}

// db.js

// Atualize esta função para aceitar objeto com nome e saldoInicial
function addOrUpdateBank(bank) {
    return new Promise((resolve, reject) => {
        const tx = db.transaction("bancos", "readwrite");
        const store = tx.objectStore("bancos");
        const request = store.put(bank); // put substitui ou adiciona pelo keyPath "nome"
        request.onsuccess = () => resolve();
        request.onerror = () => reject("Erro ao adicionar/atualizar banco.");
    });
}

/**
 * Busca todos os bancos completos, incluindo saldoInicial.
 * Retorna array de objetos { nome, saldoInicial }.
 */
function getAllBanks() {
    return new Promise((resolve, reject) => {
        const tx = db.transaction("bancos", "readonly");
        const store = tx.objectStore("bancos");
        const request = store.getAll();
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject("Erro ao buscar bancos.");
    });
}

/**
 * Busca banco pelo nome.
 * Retorna objeto { nome, saldoInicial } ou undefined.
 */
function getBank(nome) {
    return new Promise((resolve, reject) => {
        const tx = db.transaction("bancos", "readonly");
        const store = tx.objectStore("bancos");
        const request = store.get(nome);
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject("Erro ao buscar banco.");
    });
}

/**
 * Deleta banco pelo nome.
 */
function deleteBank(nome) {
    return new Promise((resolve, reject) => {
        const tx = db.transaction("bancos", "readwrite");
        const store = tx.objectStore("bancos");
        const request = store.delete(nome);
        request.onsuccess = () => resolve();
        request.onerror = () => reject("Erro ao deletar banco.");
    });
}
