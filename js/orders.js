/* ==========================================
   MODERN CHAIN LINK COMPANY - ORDERS JS (MODULE 4)
========================================== */

document.addEventListener("DOMContentLoaded", function () {
    if (localStorage.getItem("isLoggedIn") !== "true") {
        window.location.href = "login.html";
        return;
    }

    const searchInput = document.getElementById("searchInput");
    const statusFilter = document.getElementById("statusFilter");

    searchInput.addEventListener("input", loadOrders);
    statusFilter.addEventListener("change", loadOrders);

    const urlParams = new URLSearchParams(window.location.search);
    const statusParam = urlParams.get("status");
    if (statusParam) {
        statusFilter.value = statusParam;
    }

    loadOrders();
});

async function loadOrders() {
    const container = document.getElementById("ordersContainer");
    const searchText = document.getElementById("searchInput").value.trim();
    const status = document.getElementById("statusFilter").value;

    try {
        const orders = await API.getOrders(status, searchText);

        document.getElementById("totalOrderCount").textContent = orders.length;
        document.getElementById("filteredOrderCount").textContent = orders.length;

        container.innerHTML = "";

        if (orders.length === 0) {
            container.innerHTML = `
                <div class="emptyCard textCenter app-card">
                    <i class="fa-solid fa-folder-open color-primary emptyIcon" style="font-size: 40px; margin-bottom: 10px;"></i>
                    <p>No Orders Found</p>
                    <small class="text-muted">Try adjusting your search query or filter criteria.</small>
                </div>
            `;
            return;
        }

        orders.forEach(function (order) {
            let statusClass = "statusPending";
            let statusIcon = "fa-clock";

            if (order.status === "Processing") {
                statusClass = "statusProcessing";
                statusIcon = "fa-spinner";
            } else if (order.status === "Delivered") {
                statusClass = "statusDelivered";
                statusIcon = "fa-circle-check";
            } else if (order.status === "Trash" || order.is_deleted) {
                statusClass = "badge-danger";
                statusIcon = "fa-trash-can";
            }

            const card = document.createElement("div");
            card.className = "orderCard app-card";

            const orderIdStr = order.order_id || order.orderId;
            const customerNameStr = order.customer_name || order.customerName;
            const phoneStr = order.phone_number || order.phoneNumber;
            const orderTypeStr = order.order_type || order.orderType || "Material";

            const totalAmountNum = Number(order.total_amount || order.totalAmount || 0);
            const balanceAmountNum = Number(order.balance_amount || order.balanceAmount || 0);
            const hasBalance = balanceAmountNum > 0;

            const isTrash = order.status === "Trash" || order.is_deleted;
            let daysRemainingText = "";
            if (isTrash && order.deleted_at) {
                const trashedTime = new Date(order.deleted_at).getTime();
                const msPassed = Date.now() - trashedTime;
                const daysRemaining = Math.max(1, 30 - Math.floor(msPassed / (24 * 60 * 60 * 1000)));
                daysRemainingText = `<span style="font-size: 11px; color: var(--danger-color); font-weight: 600; display: block; margin-top: 4px;"><i class="fa-solid fa-hourglass-half"></i> ${daysRemaining} days left in Trash</span>`;
            }

            let actionsHtml = "";
            if (isTrash) {
                actionsHtml = `
                    <div class="flexBetween flexGap mt10">
                        <button class="btn-primary btn-sm" style="flex: 1; background: #16a34a; color: white; border: none;" onclick="restoreOrderHandler('${orderIdStr}')">
                            <i class="fa-solid fa-rotate-left"></i> Restore
                        </button>
                        <button class="btn-danger btn-sm" style="flex: 1; background: #dc2626; color: white; border: none;" onclick="openDeletePasswordModal('${orderIdStr}', true)">
                            <i class="fa-solid fa-trash-can"></i> Purge Permanently
                        </button>
                    </div>
                `;
            } else {
                actionsHtml = `
                    <div class="flexBetween flexGap mt10">
                        <button class="primaryBtn btn-sm" style="flex: 1;" onclick="viewOrder('${orderIdStr}')">
                            <i class="fa-solid fa-eye"></i> View & Manage
                        </button>
                        <button class="btn-danger btn-sm" style="background: #dc2626; color: white; border: none; padding: 6px 12px; border-radius: var(--radius-md);" title="Move to Trash" onclick="openDeletePasswordModal('${orderIdStr}', false)">
                            <i class="fa-solid fa-trash"></i>
                        </button>
                    </div>
                `;
            }

            card.innerHTML = `
                <div class="orderHeader flexBetween mb10">
                    <div class="orderId font-weight-600">
                        <i class="fa-solid fa-hashtag color-primary"></i> ${orderIdStr}
                    </div>
                    <div class="badge ${statusClass}">
                        <i class="fa-solid ${statusIcon}"></i> ${isTrash ? 'Trash Vault' : order.status}
                    </div>
                </div>

                <div class="orderDetails">
                    <p class="mb10">
                        <strong><i class="fa-solid fa-user color-secondary"></i> ${customerNameStr}</strong>
                    </p>
                    <p style="font-size: 13px; color: var(--text-secondary);" class="mb10">
                        <i class="fa-solid fa-phone"></i> ${phoneStr} &nbsp;|&nbsp;
                        <i class="fa-solid fa-layer-group"></i> ${orderTypeStr}
                    </p>
                    <div class="flexBetween mt10" style="background: var(--bg-subtle); padding: 10px; border-radius: var(--radius-md);">
                        <div>
                            <small style="color: var(--text-muted);">Total Cost</small>
                            <h4 class="color-primary">₹${totalAmountNum.toLocaleString("en-IN")}</h4>
                        </div>
                        <div class="textRight">
                            <small style="color: var(--text-muted);">Balance Due</small>
                            <h4 style="color: ${hasBalance ? 'var(--danger-color)' : 'var(--success-color)'};">
                                ${hasBalance ? '₹' + balanceAmountNum.toLocaleString("en-IN") : 'Paid'}
                            </h4>
                        </div>
                    </div>
                    ${daysRemainingText}
                </div>
                ${actionsHtml}
            `;

            container.appendChild(card);
        });
    } catch (err) {
        UI.error("Failed to load orders: " + err.message);
    }
}

let pendingDeleteOrderId = null;
let pendingDeleteIsPermanent = false;

function openDeletePasswordModal(orderId, isPermanent = false) {
    pendingDeleteOrderId = orderId;
    pendingDeleteIsPermanent = isPermanent;

    const modal = document.getElementById("deletePasswordModal");
    const orderTitle = document.getElementById("deleteModalOrderId");
    const errorEl = document.getElementById("deletePasscodeError");
    const inputEl = document.getElementById("deletePasscodeInput");

    if (orderTitle) orderTitle.textContent = `Order ${orderId}${isPermanent ? ' (Permanently)' : ' (Move to Trash)'}`;
    if (errorEl) errorEl.textContent = "";
    if (inputEl) inputEl.value = "";

    if (modal) modal.style.display = "flex";
}

function closeDeletePasswordModal() {
    const modal = document.getElementById("deletePasswordModal");
    if (modal) modal.style.display = "none";
    pendingDeleteOrderId = null;
    pendingDeleteIsPermanent = false;
}

async function submitDeleteOrderPassword() {
    const inputEl = document.getElementById("deletePasscodeInput");
    const errorEl = document.getElementById("deletePasscodeError");
    const passcode = inputEl ? inputEl.value.trim() : "";

    if (!passcode) {
        if (errorEl) errorEl.textContent = "Please enter your password.";
        return;
    }

    try {
        if (pendingDeleteIsPermanent) {
            await API.permanentlyDeleteOrder(pendingDeleteOrderId, passcode);
            UI.success(`Order ${pendingDeleteOrderId} permanently deleted.`);
        } else {
            await API.trashOrder(pendingDeleteOrderId, passcode);
            UI.success(`Order ${pendingDeleteOrderId} moved to Trash (kept for 30 days).`);
        }
        closeDeletePasswordModal();
        loadOrders();
    } catch (err) {
        if (errorEl) errorEl.textContent = err.message || "Invalid password.";
    }
}

async function restoreOrderHandler(orderId) {
    try {
        await API.restoreOrder(orderId);
        UI.success(`Order ${orderId} restored to active orders!`);
        loadOrders();
    } catch (err) {
        UI.error("Failed to restore order: " + err.message);
    }
}

function viewOrder(orderId) {
    localStorage.setItem("selectedOrderId", orderId);
    window.location.href = "view-order.html";
}

async function exportOrdersToExcel() {
    UI.showLoader("Generating Excel Spreadsheet...");
    try {
        const searchText = document.getElementById("searchInput") ? document.getElementById("searchInput").value.trim() : "";
        const status = document.getElementById("statusFilter") ? document.getElementById("statusFilter").value : "All";

        const orders = await API.getOrders(status, searchText);

        if (!orders || orders.length === 0) {
            UI.hideLoader();
            UI.error("No order data available to export.");
            return;
        }

        const excelData = orders.map((o, idx) => ({
            "S.No": idx + 1,
            "Order ID": o.order_id || o.orderId,
            "Customer Name": o.customer_name || o.customerName,
            "Phone Number": o.phone_number || o.phoneNumber,
            "Order Type": o.order_type || o.orderType || "Material",
            "Material Type": o.material_type || o.materialType || "Fence",
            "Diamond Size": o.diamond_size || o.diamondSize || "2 X 2 Inch",
            "Brand": o.brand || "TATA",
            "Ordered Date": o.ordered_date || o.orderedDate || (o.created_at ? new Date(o.created_at).toLocaleDateString("en-IN") : "N/A"),
            "Expected Delivery Date": o.delivery_date || o.deliveryDate || "N/A",
            "Height (Ft)": o.height || 0,
            "Length (Ft)": o.length || 0,
            "Total Area (Sq.Ft)": o.area || ((o.height || 0) * (o.length || 0)),
            "Price per Sq.Ft / Ft (₹)": o.sqft_price || o.sqftPrice || 0,
            "Material Cost (₹)": o.material_cost || o.materialCost || 0,
            "Total Amount (₹)": o.total_amount || o.totalAmount || 0,
            "Amount Paid (₹)": o.amount_paid || o.amountPaid || 0,
            "Balance Due (₹)": o.balance_amount || o.balanceAmount || 0,
            "Status": o.status || "Pending"
        }));

        if (typeof XLSX === "undefined") {
            // Fallback CSV generation if SheetJS CDN is offline
            let csvContent = "data:text/csv;charset=utf-8,";
            const headers = Object.keys(excelData[0]);
            csvContent += headers.join(",") + "\n";
            excelData.forEach(row => {
                csvContent += headers.map(h => `"${row[h] || ''}"`).join(",") + "\n";
            });
            const encodedUri = encodeURI(csvContent);
            const link = document.createElement("a");
            link.setAttribute("href", encodedUri);
            link.setAttribute("download", `Modern_Chain_Link_Orders_${new Date().toISOString().slice(0, 10)}.csv`);
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        } else {
            const worksheet = XLSX.utils.json_to_sheet(excelData);
            const workbook = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(workbook, worksheet, "Orders");
            
            // Set auto column width
            const colWidths = Object.keys(excelData[0]).map(key => ({
                wch: Math.max(key.length + 2, 12)
            }));
            worksheet["!cols"] = colWidths;

            XLSX.writeFile(workbook, `Modern_Chain_Link_Orders_${new Date().toISOString().slice(0, 10)}.xlsx`);
        }

        UI.hideLoader();
        UI.success("Excel sheet downloaded successfully!");
    } catch (err) {
        UI.hideLoader();
        UI.error("Failed to export Excel: " + err.message);
    }
}