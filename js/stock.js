/* ==========================================
   MODERN CHAIN LINK COMPANY - STOCK JS
========================================== */

let allStockItems = [];
let currentCategoryFilter = "All";
let currentLocationFilter = "all"; // "all", "shop", "factory", "low"
let searchQuery = "";

document.addEventListener("DOMContentLoaded", function () {
    loadStockData();
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
    let lowStockCount = 0;

    allStockItems.forEach(item => {
        const shop = parseFloat(item.shop_quantity || 0);
        const factory = parseFloat(item.factory_quantity || 0);
        const reorder = parseFloat(item.reorder_level || 5);

        totalShop += shop;
        totalFactory += factory;

        if ((shop + factory) <= reorder) {
            lowStockCount++;
        }
    });

    document.getElementById("totalShopStock").textContent = totalShop.toLocaleString('en-IN') + " Units";
    document.getElementById("totalFactoryStock").textContent = totalFactory.toLocaleString('en-IN') + " Units";
    document.getElementById("lowStockCount").textContent = lowStockCount;
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
            if (!name.includes(searchQuery) && !cat.includes(searchQuery)) {
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
        const reorder = parseFloat(item.reorder_level || 5);

        let statusBadge = '';
        if (total <= 0) {
            statusBadge = '<span class="statusBadge badge-cancelled"><i class="fa-solid fa-circle-xmark"></i> Out of Stock</span>';
        } else if (total <= reorder) {
            statusBadge = '<span class="statusBadge badge-pending"><i class="fa-solid fa-triangle-exclamation"></i> Low Stock</span>';
        } else {
            statusBadge = '<span class="statusBadge badge-completed"><i class="fa-solid fa-circle-check"></i> In Stock</span>';
        }

        const tr = document.createElement("tr");
        tr.innerHTML = `
            <td><strong>#${item.id || (index + 1)}</strong></td>
            <td>
                <div style="font-weight: 700; color: #1e293b;">${item.item_name}</div>
                <div style="font-size: 0.8rem; color: #64748b;">${item.notes || 'Standard specifications'}</div>
            </td>
            <td><span class="categoryBadge">${item.category || 'General'}</span></td>
            <td>
                <div class="stock-qty-pill">
                    <span class="location-badge badge-shop"><i class="fa-solid fa-store"></i> Shop</span>
                    <span class="stock-qty-val" style="color: #0284c7;">${shop} ${item.unit}</span>
                </div>
            </td>
            <td>
                <div class="stock-qty-pill">
                    <span class="location-badge badge-factory"><i class="fa-solid fa-industry"></i> Factory</span>
                    <span class="stock-qty-val" style="color: #d97706;">${factory} ${item.unit}</span>
                </div>
            </td>
            <td>
                <strong style="font-size: 1.1rem; color: #0b8f47;">${total} ${item.unit}</strong>
            </td>
            <td>
                ₹${(item.price_per_unit || 0).toLocaleString('en-IN')} / ${item.unit}
            </td>
            <td>${statusBadge}</td>
            <td>
                <div class="actionButtons">
                    <button class="btnAction btnEdit" title="Edit Stock Item" onclick="editStockItem(${item.id})">
                        <i class="fa-solid fa-pen"></i>
                    </button>
                    <button class="btnAction btnDelete" title="Delete Stock Item" onclick="confirmDeleteStock(${item.id})">
                        <i class="fa-solid fa-trash"></i>
                    </button>
                </div>
            </td>
        `;
        tbody.appendChild(tr);
    });
}

function openAddStockModal() {
    document.getElementById("stockForm").reset();
    document.getElementById("stockId").value = "";
    document.getElementById("stockModalTitle").innerHTML = '<i class="fa-solid fa-plus color-primary"></i> Add New Stock Item';
    document.getElementById("stockModal").style.display = "flex";
}

function editStockItem(id) {
    const item = allStockItems.find(i => i.id === id);
    if (!item) return;

    document.getElementById("stockId").value = item.id;
    document.getElementById("stockItemName").value = item.item_name || "";
    document.getElementById("stockCategory").value = item.category || "Fence Roll";
    document.getElementById("stockUnit").value = item.unit || "Rolls";
    document.getElementById("stockShopQty").value = item.shop_quantity || 0;
    document.getElementById("stockFactoryQty").value = item.factory_quantity || 0;
    document.getElementById("stockReorderLevel").value = item.reorder_level || 5;
    document.getElementById("stockPrice").value = item.price_per_unit || 0;
    document.getElementById("stockNotes").value = item.notes || "";

    document.getElementById("stockModalTitle").innerHTML = '<i class="fa-solid fa-pen-to-square color-primary"></i> Edit Stock Item';
    document.getElementById("stockModal").style.display = "flex";
}

function closeStockModal() {
    document.getElementById("stockModal").style.display = "none";
}

async function saveStockItem(event) {
    event.preventDefault();

    const stockId = document.getElementById("stockId").value;
    const payload = {
        item_name: document.getElementById("stockItemName").value.trim(),
        category: document.getElementById("stockCategory").value,
        unit: document.getElementById("stockUnit").value,
        shop_quantity: parseFloat(document.getElementById("stockShopQty").value) || 0,
        factory_quantity: parseFloat(document.getElementById("stockFactoryQty").value) || 0,
        reorder_level: parseFloat(document.getElementById("stockReorderLevel").value) || 5,
        price_per_unit: parseFloat(document.getElementById("stockPrice").value) || 0,
        notes: document.getElementById("stockNotes").value.trim()
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

async function confirmDeleteStock(id) {
    if (!confirm("Are you sure you want to delete this stock item?")) return;

    UI.showLoader("Deleting stock item...");
    try {
        await API.deleteStockItem(id);
        UI.hideLoader();
        UI.success("Stock item deleted!");
        await loadStockData();
    } catch (err) {
        UI.hideLoader();
        UI.error("Failed to delete stock item: " + err.message);
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
            "Item Name": item.item_name,
            "Category": item.category,
            "Shop Quantity": item.shop_quantity,
            "Factory Quantity": item.factory_quantity,
            "Total Available Quantity": (parseFloat(item.shop_quantity || 0) + parseFloat(item.factory_quantity || 0)),
            "Unit": item.unit,
            "Unit Price (₹)": item.price_per_unit,
            "Low Stock Reorder Level": item.reorder_level,
            "Status": (parseFloat(item.shop_quantity || 0) + parseFloat(item.factory_quantity || 0)) <= item.reorder_level ? "LOW STOCK" : "IN STOCK",
            "Notes": item.notes || ""
        }));

        if (typeof XLSX !== "undefined") {
            const worksheet = XLSX.utils.json_to_sheet(data);
            const workbook = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(workbook, worksheet, "Shop & Factory Stock");

            const colWidths = [
                { wch: 6 },
                { wch: 35 },
                { wch: 15 },
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
