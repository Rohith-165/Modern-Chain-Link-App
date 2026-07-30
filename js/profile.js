/* ==========================================
   MODERN CHAIN LINK COMPANY - PROFILE JS (MODULE 6)
========================================== */

document.addEventListener("DOMContentLoaded", function () {
    if (localStorage.getItem("isLoggedIn") !== "true") {
        window.location.href = "login.html";
        return;
    }

    loadAdminDetails();
    loadCompanyProfile();
    loadDashboardSummary();
});

function loadAdminDetails() {
    const adminName = localStorage.getItem("adminName") || "Administrator";
    document.getElementById("adminName").textContent = adminName;
    document.getElementById("adminEmail").innerHTML = '<i class="fa-solid fa-envelope"></i> Kumar@modernchainlink.com';
}

async function loadCompanyProfile() {
    try {
        const company = await API.getCompanyProfile();
        if (company) {
            document.getElementById("companyName").textContent = company.name || "Modern Chain Link Company";
            document.getElementById("companyGst").textContent = company.gst_number || "33AAAAA0000A1Z5";
            document.getElementById("companyAddress").textContent = company.address || "Tiruchengode, Tamil Nadu";
            document.getElementById("companyVersion").textContent = `v${company.version || '2.0.0'} (FastAPI PWA)`;
        }
    } catch (err) {
        console.warn("Failed to load company profile:", err.message);
    }
}

async function loadDashboardSummary() {
    try {
        const summary = await API.getDashboardSummary();
        document.getElementById("totalOrders").textContent = summary.total_orders || 0;
        document.getElementById("pendingOrders").textContent = summary.pending_orders || 0;
    } catch (err) {
        console.warn("Failed to load profile summary:", err.message);
    }
}

function exportData() {
    const orders = localStorage.getItem("orders") || "[]";
    const blob = new Blob([orders], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `MCLC-Orders-Backup-${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
    UI.success("Backup file exported successfully!");
}

async function importData() {
    const jsonStr = prompt("Paste your JSON backup data here to restore orders:");
    if (!jsonStr) return;

    try {
        const parsed = JSON.parse(jsonStr);
        if (!Array.isArray(parsed)) {
            UI.error("Invalid JSON format. Expected an array of orders.");
            return;
        }

        const confirmRestore = await UI.confirm(
            "Restore Data",
            `Found ${parsed.length} orders in backup. Do you want to replace current data?`,
            "Restore Data",
            "Cancel"
        );

        if (confirmRestore) {
            localStorage.setItem("orders", JSON.stringify(parsed));
            loadDashboardSummary();
            UI.success("Orders restored successfully!");
        }
    } catch (err) {
        UI.error("Failed to parse JSON backup string.");
    }
}