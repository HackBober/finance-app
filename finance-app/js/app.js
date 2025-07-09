// app.js

document.addEventListener("DOMContentLoaded", async () => {
    // Inicializa o banco
    await initDB();

    // Renderiza o dashboard inicialmente
    renderDashboardView();

    // Toggle sidebar
    const sidebar = document.getElementById("sidebar");
    document.getElementById("toggleSidebarBtn").addEventListener("click", () => {
        sidebar.classList.toggle("collapsed");
    });

    // Navegação do menu
    document.getElementById("menuDashboard").addEventListener("click", () => {
        renderDashboardView();
        sidebar.classList.add("collapsed");
    });

    document.getElementById("menuAdd").addEventListener("click", () => {
        renderEditView();
        sidebar.classList.add("collapsed");
    });

    document.getElementById("menuReports").addEventListener("click", () => {
        renderReportsView();
        sidebar.classList.add("collapsed");
    });

    document.getElementById("menuBankControl").addEventListener("click", () => {
        renderBankControlView();
        sidebar.classList.add("collapsed");
    });
});

