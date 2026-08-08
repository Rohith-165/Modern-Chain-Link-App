/* ==========================================
   MODERN CHAIN LINK COMPANY - STOCK JS
========================================== */

let allStockItems = [];
let currentCategoryFilter = "All";
let currentLocationFilter = "all"; // "all", "shop", "factory", "low"
let searchQuery = "";

document.addEventListener("DOMContentLoaded", function () {
    loadStockData();

    const addBtn = document.getElementById("addStockBtn");
    if (addBtn) {
        addBtn.addEventListener("click", function(e) {
            e.preventDefault();
            openAddStockModal();
        });
    }
});

async function loadStockData() {
    UI.showLoader("Loading stock inventory...");
    try {
        allStockItems = await API.getStock();
        UI.hideLoader();
        updateSummaryKPIs();
        renderStockTable();
    } catch (err) {
        UI.hideLoader();
        console.error("Error loading stock data:", err);
        UI.error("Failed to load stock data: " + err.message);
    }
}

function updateSummaryKPIs() {
    let totalShop = 0;
    let totalFactory = 0;

    allStockItems.forEach(item => {
        const shop = parseFloat(item.shop_quantity || 0);
        const factory = parseFloat(item.factory_quantity || 0);

        totalShop += shop;
        totalFactory += factory;
    });

    const shopEl = document.getElementById("totalShopStock");
    if (shopEl) shopEl.textContent = totalShop.toLocaleString('en-IN');

    const factoryEl = document.getElementById("totalFactoryStock");
    if (factoryEl) factoryEl.textContent = totalFactory.toLocaleString('en-IN');

    const combinedEl = document.getElementById("totalCombinedStock");
    if (combinedEl) combinedEl.textContent = (totalShop + totalFactory).toLocaleString('en-IN');
}

function filterByLocation(location) {
    currentLocationFilter = location;
    const banner = document.getElementById("locationFilterBanner");
    const bannerText = document.getElementById("locationFilterText");

    if (location === "shop") {
        banner.style.display = "flex";
        bannerText.innerHTML = '<i class="fa-solid fa-store"></i> Showing <strong>Shop Stock Only</strong>';
    } else if (location === "factory") {
        banner.style.display = "flex";
        bannerText.innerHTML = '<i class="fa-solid fa-industry"></i> Showing <strong>Factory Stock Only</strong>';
    } else if (location === "low") {
        banner.style.display = "flex";
        bannerText.innerHTML = '<i class="fa-solid fa-triangle-exclamation" style="color:#dc2626;"></i> Showing <strong>Low Stock Items Only</strong>';
    } else {
        banner.style.display = "none";
    }

    renderStockTable();
}

function clearLocationFilter() {
    filterByLocation("all");
}

function setStockFilter(category, btnElement) {
    currentCategoryFilter = category;
    const tabs = document.querySelectorAll(".filterTab");
    tabs.forEach(tab => tab.classList.remove("active"));
    if (btnElement) btnElement.classList.add("active");
    renderStockTable();
}

function handleStockSearch() {
    searchQuery = document.getElementById("stockSearchInput").value.toLowerCase();
    renderStockTable();
}

function renderStockTable() {
    const tbody = document.getElementById("stockTableBody");
    const emptyState = document.getElementById("emptyStockState");

    tbody.innerHTML = "";

    let filtered = allStockItems.filter(item => {
        // Category Filter
        if (currentCategoryFilter !== "All" && item.category !== currentCategoryFilter) {
            return false;
        }

        // Location Filter
        const shop = parseFloat(item.shop_quantity || 0);
        const factory = parseFloat(item.factory_quantity || 0);
        const reorder = parseFloat(item.reorder_level || 5);

        if (currentLocationFilter === "shop" && shop <= 0) return false;
        if (currentLocationFilter === "factory" && factory <= 0) return false;
        if (currentLocationFilter === "low" && (shop + factory) > reorder) return false;

        // Search Filter
        if (searchQuery) {
            const name = (item.item_name || "").toLowerCase();
            const cat = (item.category || "").toLowerCase();
            const brand = (item.brand || "").toLowerCase();
            const diamond = (item.diamond_size || "").toLowerCase();
            if (!name.includes(searchQuery) && !cat.includes(searchQuery) && !brand.includes(searchQuery) && !diamond.includes(searchQuery)) {
                return false;
            }
        }

        return true;
    });

    if (filtered.length === 0) {
        tbody.parentElement.style.display = "none";
        emptyState.style.display = "block";
        return;
    }

    tbody.parentElement.style.display = "table";
    emptyState.style.display = "none";

    filtered.forEach((item, index) => {
        const shop = parseFloat(item.shop_quantity || 0);
        const factory = parseFloat(item.factory_quantity || 0);
        const total = shop + factory;

        const categoryStr = item.category || item.item_name || 'General';
        const catLower = categoryStr.toLowerCase();

        let unit = 'Ft';
        let lengthOrWeight = '100 Ft';

        if (catLower.includes("poles")) {
            unit = 'Pcs';
            lengthOrWeight = 'Count (Pcs)';
        } else if (catLower.includes("raw wire") || catLower.includes("coil")) {
            unit = 'Coils';
            lengthOrWeight = 'Count (Coils)';
        } else if (catLower.includes("barbed") || catLower.includes("binding")) {
            unit = 'Kg';
            lengthOrWeight = item.length_ft ? `${item.length_ft} Kg` : '50 Kg';
        } else {
            unit = 'Ft';
            lengthOrWeight = item.length_ft ? `${item.length_ft} Ft` : '100 Ft';
        }

        const tr = document.createElement("tr");
        tr.innerHTML = `
            <td><strong style="color: #1e293b; font-size: 0.95rem;"><i class="fa-solid fa-layer-group color-primary"></i> ${categoryStr}</strong></td>
            <td><span class="badge" style="background:#fae8ff; color:#86198f;">${item.diamond_size || 'N/A'}</span></td>
            <td><span class="badge" style="background:#fef3c7; color:#92400e;">${item.brand || 'TATA GI Wire'}</span></td>
            <td><span class="badge" style="background:#e0e7ff; color:#3730a3;">${item.height && item.height !== 'N/A' ? item.height + ' Ft' : 'N/A'}</span></td>
            <td><span class="badge" style="background:#e0f2fe; color:#0369a1; font-weight:600;">${lengthOrWeight}</span></td>
            <td>
                <div class="stock-qty-pill">
                    <span class="location-badge badge-shop"><i class="fa-solid fa-store"></i> Shop</span>
                    <span class="stock-qty-val" style="color: #0284c7;">${shop} ${unit}</span>
                </div>
            </td>
            <td>
                <div class="stock-qty-pill">
                    <span class="location-badge badge-factory"><i class="fa-solid fa-industry"></i> Factory</span>
                    <span class="stock-qty-val" style="color: #d97706;">${factory} ${unit}</span>
                </div>
            </td>
            <td>
                <strong style="font-size: 1.1rem; color: #0b8f47;">${total} ${unit}</strong>
            </td>
            <td>
                <button type="button" class="btn btn-sm btn-outline-success" onclick="editStockItem(${item.id})" title="Edit Stock Item">
                    <i class="fa-solid fa-pen-to-square"></i> Edit
                </button>
            </td>
        `;
        tbody.appendChild(tr);
    });
}

function handleStockCategoryChange() {
    const catEl = document.getElementById("stockCategory");
    const labelEl = document.getElementById("stockLengthLabel");
    const inputEl = document.getElementById("stockLength");
    const unitEl = document.getElementById("stockUnit");
    if (!catEl || !labelEl || !inputEl) return;

    const val = catEl.value.toLowerCase();
    if (val.includes("poles")) {
        labelEl.innerHTML = '<i class="fa-solid fa-cubes color-primary"></i> Integer Quantity (Pcs/Nos) <span class="text-red">*</span>';
        inputEl.placeholder = "e.g. 50";
        if (unitEl) unitEl.value = "Pieces";
    } else if (val.includes("raw wire") || val.includes("coil")) {
        labelEl.innerHTML = '<i class="fa-solid fa-circle-notch color-primary"></i> Coil Count (Coils) <span class="text-red">*</span>';
        inputEl.placeholder = "e.g. 10";
        if (unitEl) unitEl.value = "Bundles";
    } else if (val.includes("barbed") || val.includes("binding")) {
        labelEl.innerHTML = '<i class="fa-solid fa-weight-hanging color-primary"></i> Weight (Kg) <span class="text-red">*</span>';
        inputEl.placeholder = "e.g. 50";
        if (unitEl) unitEl.value = "Kg";
    } else {
        labelEl.innerHTML = '<i class="fa-solid fa-arrows-left-right color-primary"></i> Running Length (Feet) <span class="text-red">*</span>';
        inputEl.placeholder = "e.g. 100";
        if (unitEl) unitEl.value = "Rolls";
    }
}

function openAddStockModal() {
    try {
        const form = document.getElementById("stockForm");
        if (form) form.reset();
        const stockId = document.getElementById("stockId");
        if (stockId) stockId.value = "";
        const title = document.getElementById("stockModalTitle");
        if (title) title.innerHTML = '<i class="fa-solid fa-plus color-primary"></i> Add New Stock Item';
        handleStockCategoryChange();
    } catch (e) {
        console.error("Error setting modal defaults:", e);
    }
    const modal = document.getElementById("stockModal");
    if (modal) {
        modal.style.cssText = "display: flex !important; visibility: visible !important; opacity: 1 !important; z-index: 99999 !important;";
        modal.classList.add("active");
    }
}

function editStockItem(id) {
    const item = allStockItems.find(i => i.id === id);
    if (!item) return;

    try {
        if (document.getElementById("stockId")) document.getElementById("stockId").value = item.id;
        if (document.getElementById("stockItemName")) document.getElementById("stockItemName").value = item.item_name || "";
        if (document.getElementById("stockBrand")) document.getElementById("stockBrand").value = item.brand || "TATA GI Wire";
        if (document.getElementById("stockDiamondSize")) document.getElementById("stockDiamondSize").value = item.diamond_size || "2 X 2 Inch";
        if (document.getElementById("stockHeight")) document.getElementById("stockHeight").value = item.height || "6";
        if (document.getElementById("stockLength")) document.getElementById("stockLength").value = item.length_ft || "100";
        if (document.getElementById("stockCategory")) document.getElementById("stockCategory").value = item.category || "Chain Link Fence";
        if (document.getElementById("stockLocationPlace")) document.getElementById("stockLocationPlace").value = item.location_place || "Both";
        if (document.getElementById("stockShopQty")) document.getElementById("stockShopQty").value = item.shop_quantity || 0;
        if (document.getElementById("stockFactoryQty")) document.getElementById("stockFactoryQty").value = item.factory_quantity || 0;
        if (document.getElementById("stockUnit")) document.getElementById("stockUnit").value = item.unit || "Rolls";
        if (document.getElementById("stockNotes")) document.getElementById("stockNotes").value = item.notes || "";

        handleStockCategoryChange();
        const title = document.getElementById("stockModalTitle");
        if (title) title.innerHTML = '<i class="fa-solid fa-pen-to-square color-primary"></i> Edit Stock Item';
    } catch (e) {
        console.error("Error setting edit form data:", e);
    }
    const modal = document.getElementById("stockModal");
    if (modal) {
        modal.style.cssText = "display: flex !important; visibility: visible !important; opacity: 1 !important; z-index: 99999 !important;";
        modal.classList.add("active");
    }
}

function closeStockModal() {
    const modal = document.getElementById("stockModal");
    if (modal) {
        modal.style.cssText = "display: none !important;";
        modal.classList.remove("active");
        modal.classList.remove("show");
    }
}

window.openAddStockModal = openAddStockModal;
window.editStockItem = editStockItem;
window.closeStockModal = closeStockModal;

async function saveStockItem(event) {
    event.preventDefault();

    const stockId = document.getElementById("stockId") ? document.getElementById("stockId").value : "";
    const getVal = (id, fallback = "") => {
        const el = document.getElementById(id);
        return el ? el.value : fallback;
    };

    const cat = getVal("stockCategory", "Chain Link Fence");
    const itemName = `${getVal("stockBrand", "TATA GI Wire")} ${cat} ${getVal("stockHeight", "6")}ft`;

    const payload = {
        item_name: itemName,
        brand: getVal("stockBrand", "TATA GI Wire"),
        diamond_size: getVal("stockDiamondSize", "2 X 2 Inch"),
        height: getVal("stockHeight", "6"),
        length_ft: getVal("stockLength", "100").trim(),
        category: cat,
        location_place: getVal("stockLocationPlace", "Both"),
        shop_quantity: parseFloat(getVal("stockShopQty", "0")) || 0,
        factory_quantity: parseFloat(getVal("stockFactoryQty", "0")) || 0,
        unit: getVal("stockUnit", "Rolls"),
        reorder_level: 5.0,
        price_per_unit: 0.0,
        notes: getVal("stockNotes").trim()
    };

    UI.showLoader("Saving stock details...");

    try {
        if (stockId) {
            await API.updateStockItem(stockId, payload);
            UI.success("Stock item updated successfully!");
        } else {
            await API.createStockItem(payload);
            UI.success("New stock item added!");
        }

        closeStockModal();
        await loadStockData();
    } catch (err) {
        UI.hideLoader();
        UI.error("Failed to save stock item: " + err.message);
    }
}

function verifyAdminAccess() {
    const adminPass = prompt("🔐 SECURITY AUTHORIZATION REQUIRED\n\nEnter Admin Password to authorize deletion:");
    if (!adminPass) {
        UI.warning("Deletion cancelled. Security access code required.");
        return null;
    }
    if (adminPass.trim() !== "modern@123") {
        UI.error("🚫 Access Denied! Invalid Admin Password. You do not have authorization to delete stock.");
        return null;
    }
    return adminPass.trim();
}

async function confirmDeleteStock(id) {
    const passcode = verifyAdminAccess();
    if (!passcode) return;

    if (!confirm("Are you sure you want to delete this stock item?")) return;

    UI.showLoader("Deleting stock item...");
    try {
        await API.deleteStockItem(id, passcode);
        UI.hideLoader();
        UI.success("Stock item deleted!");
        await loadStockData();
    } catch (err) {
        UI.hideLoader();
        UI.error("Failed to delete stock item: " + err.message);
    }
}

async function confirmDeleteAllStock() {
    const passcode = verifyAdminAccess();
    if (!passcode) return;

    if (!confirm("⚠️ Are you sure you want to DELETE ALL STOCK ITEMS? This will clear all shop and factory inventory!")) return;

    UI.showLoader("Clearing all stock items...");
    try {
        await API.clearAllStock(passcode);
        UI.hideLoader();
        UI.success("All stock items have been deleted!");
        await loadStockData();
    } catch (err) {
        UI.hideLoader();
        UI.error("Failed to clear stock items: " + err.message);
    }
}

function exportStockToExcel() {
    if (!allStockItems || allStockItems.length === 0) {
        UI.warning("No stock items available to export.");
        return;
    }

    try {
        const data = allStockItems.map((item, idx) => ({
            "S.No": idx + 1,
            "Material Type": item.category || item.item_name,
            "Diamond Size": item.diamond_size || "N/A",
            "Brand": item.brand || "TATA GI Wire",
            "Height (Feet)": item.height || "N/A",
            "Running Length (Ft) / Weight (Kg)": item.length_ft || "N/A",
            "Storage Location": item.location_place || "Both",
            "Shop Quantity": item.shop_quantity,
            "Factory Quantity": item.factory_quantity,
            "Total Stock": (parseFloat(item.shop_quantity || 0) + parseFloat(item.factory_quantity || 0)),
            "Unit": item.unit,
            "Notes": item.notes || ""
        }));

        if (typeof XLSX !== "undefined") {
            const worksheet = XLSX.utils.json_to_sheet(data);
            const workbook = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(workbook, worksheet, "Stock Inventory");
            XLSX.writeFile(workbook, `Stock_Inventory_${new Date().toISOString().split('T')[0]}.xlsx`);
            UI.success("Stock inventory exported to Excel!");
        } else {
            UI.error("Excel export library not loaded");
        }
    } catch (err) {
        UI.error("Failed to export Excel: " + err.message);
    }
}
                { wch: 15 },
                { wch: 16 },
                { wch: 22 },
                { wch: 10 },
                { wch: 14 },
                { wch: 22 },
                { wch: 14 },
                { wch: 25 }
            ];
            worksheet['!cols'] = colWidths;

            const dateStr = new Date().toISOString().split('T')[0];
            XLSX.writeFile(workbook, `Modern_Chain_Link_Stock_Report_${dateStr}.xlsx`);
            UI.success("Stock inventory exported to Excel successfully!");
        } else {
            let csv = "S.No,Item Name,Category,Shop Qty,Factory Qty,Total Qty,Unit,Price,Status\n";
            data.forEach(row => {
                csv += `"${row["S.No"]}","${row["Item Name"]}","${row["Category"]}","${row["Shop Quantity"]}","${row["Factory Quantity"]}","${row["Total Available Quantity"]}","${row["Unit"]}","${row["Unit Price (₹)"]}","${row["Status"]}"\n`;
            });
            const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
            const link = document.createElement("a");
            link.href = URL.createObjectURL(blob);
            link.download = `Modern_Chain_Link_Stock_Report_${new Date().toISOString().split('T')[0]}.csv`;
            link.click();
            UI.success("Stock inventory exported to CSV!");
        }
    } catch (err) {
        console.error("Excel Export Error:", err);
        UI.error("Failed to export Excel file.");
    }
}
