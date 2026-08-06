/* ==========================================
   MODERN CHAIN LINK COMPANY - VIEW ORDER JS (MODULE 5)
========================================== */

let currentOrder = null;
let currentOrderId = null;

document.addEventListener("DOMContentLoaded", function () {
    if (localStorage.getItem("isLoggedIn") !== "true") {
        window.location.href = "login.html";
        return;
    }

    loadOrder();

    document.getElementById("orderType").addEventListener("change", toggleInstallationFields);

    const calculationFields = [
        "height", "length", "sqftPrice", "barbedWire",
        "bindingWire", "labour", "travel", "stone"
    ];

    calculationFields.forEach(function (id) {
        const el = document.getElementById(id);
        if (el) {
            el.addEventListener("input", function () {
                UI.clearFieldError(el);
                calculateAmounts();
            });
        }
    });

    ["customerName", "phoneNumber", "address"].forEach(function (id) {
        const el = document.getElementById(id);
        if (el) {
            el.addEventListener("input", () => UI.clearFieldError(el));
        }
    });

    document.getElementById("viewOrderForm").addEventListener("submit", updateOrder);
    document.getElementById("addPaymentBtn").addEventListener("click", showAddPaymentModal);
});

async function loadOrder() {
    currentOrderId = localStorage.getItem("selectedOrderId");

    if (!currentOrderId) {
        UI.error("No order selected");
        setTimeout(() => { window.location.href = "orders.html"; }, 500);
        return;
    }

    try {
        currentOrder = await API.getOrder(currentOrderId);

        if (!currentOrder) {
            UI.error("Order not found");
            setTimeout(() => { window.location.href = "orders.html"; }, 500);
            return;
        }

        document.getElementById("orderId").value = currentOrder.order_id || currentOrder.orderId;
        document.getElementById("customerName").value = currentOrder.customer_name || currentOrder.customerName;
        document.getElementById("phoneNumber").value = currentOrder.phone_number || currentOrder.phoneNumber;
        document.getElementById("address").value = currentOrder.address;

        document.getElementById("orderType").value = currentOrder.order_type || currentOrder.orderType || "Material";
        document.getElementById("materialType").value = currentOrder.material_type || currentOrder.materialType || "Fence";
        document.getElementById("diamondSize").value = currentOrder.diamond_size || currentOrder.diamondSize || "2 X 2 Inch";
        document.getElementById("brand").value = currentOrder.brand || "TATA";

        document.getElementById("height").value = currentOrder.height;
        document.getElementById("length").value = currentOrder.length;
        document.getElementById("sqftPrice").value = currentOrder.sqft_price || currentOrder.sqftPrice;

        document.getElementById("barbedWire").value = currentOrder.barbed_wire || currentOrder.barbedWire || 0;
        document.getElementById("bindingWire").value = currentOrder.binding_wire || currentOrder.bindingWire || 0;
        document.getElementById("labour").value = currentOrder.labour || 0;
        document.getElementById("travel").value = currentOrder.travel || 0;
        document.getElementById("stone").value = currentOrder.stone || 0;

        document.getElementById("status").value = currentOrder.status || "Pending";

        toggleInstallationFields();
        calculateAmounts();
        renderPaymentHistory();
        renderAuditHistory();
    } catch (err) {
        UI.error("Error loading order: " + err.message);
    }
}

async function renderAuditHistory() {
    const container = document.getElementById("auditHistoryContainer");
    if (!container) return;

    try {
        const history = await API.getOrderHistory(currentOrderId);
        container.innerHTML = "";

        if (!history || history.length === 0) {
            container.innerHTML = `
                <p class="text-muted textCenter mt10" style="font-size: 13px;">
                    <i class="fa-solid fa-circle-info"></i> No activity history recorded yet.
                </p>
            `;
            return;
        }

        history.forEach(log => {
            const dateStr = new Date(log.created_at).toLocaleString("en-IN", {
                dateStyle: "medium",
                timeStyle: "short"
            });

            let badgeColor = "var(--primary-color)";
            let iconClass = "fa-pen-to-square";
            if (log.action.includes("Created")) {
                badgeColor = "var(--success-color)";
                iconClass = "fa-circle-plus";
            } else if (log.action.includes("Payment")) {
                badgeColor = "#0284c7";
                iconClass = "fa-indian-rupee-sign";
            }

            const item = document.createElement("div");
            item.className = "auditItem mt10";
            item.style.cssText = "padding: 12px; border-left: 3px solid " + badgeColor + "; background: var(--bg-subtle); border-radius: 6px; margin-bottom: 10px;";
            item.innerHTML = `
                <div class="flexBetween mb5">
                    <span style="font-weight: 600; color: ${badgeColor}; font-size: 13px;">
                        <i class="fa-solid ${iconClass}"></i> ${log.action}
                    </span>
                    <small style="color: var(--text-muted); font-size: 11px;">
                        <i class="fa-solid fa-clock"></i> ${dateStr}
                    </small>
                </div>
                <div style="font-size: 13px; color: var(--text-primary);" class="mb5">
                    ${log.details || 'Updated order specifications'}
                </div>
                <div style="font-size: 11px; color: var(--text-muted);">
                    <i class="fa-solid fa-user-check"></i> Performed by: <strong>${log.user_name}</strong> (${log.user_email})
                </div>
            `;
            container.appendChild(item);
        });
    } catch (err) {
        container.innerHTML = `<p class="text-danger textCenter" style="font-size: 12px;">Failed to load activity logs.</p>`;
    }
}

function toggleInstallationFields() {
    const orderType = document.getElementById("orderType").value;
    const installationFields = document.getElementById("installationFields");

    if (orderType === "Installation") {
        installationFields.style.display = "block";
    } else {
        installationFields.style.display = "none";
        document.getElementById("labour").value = 0;
        document.getElementById("travel").value = 0;
        document.getElementById("stone").value = 0;
    }
    calculateAmounts();
}

function calculateAmounts() {
    const height = Number(document.getElementById("height").value) || 0;
    const length = Number(document.getElementById("length").value) || 0;
    const sqftPrice = Number(document.getElementById("sqftPrice").value) || 0;

    const area = height * length;
    const materialCost = area * sqftPrice;

    const barbedWire = Number(document.getElementById("barbedWire").value) || 0;
    const bindingWire = Number(document.getElementById("bindingWire").value) || 0;
    const labour = Number(document.getElementById("labour").value) || 0;
    const travel = Number(document.getElementById("travel").value) || 0;
    const stone = Number(document.getElementById("stone").value) || 0;

    let amountPaid = Number(currentOrder ? (currentOrder.amount_paid || currentOrder.amountPaid || 0) : 0);
    if (currentOrder && currentOrder.payments && currentOrder.payments.length > 0) {
        amountPaid = currentOrder.payments.reduce((sum, p) => sum + Number(p.amount || 0), 0);
    }
    document.getElementById("amountPaid").value = amountPaid;

    const totalAmount = materialCost + barbedWire + bindingWire + labour + travel + stone;
    const balanceAmount = Math.max(0, totalAmount - amountPaid);

    document.getElementById("area").textContent = area.toFixed(2) + " Sq.ft";
    document.getElementById("materialCost").textContent = "₹" + materialCost.toLocaleString("en-IN", { minimumFractionDigits: 2 });
    document.getElementById("totalAmount").textContent = "₹" + totalAmount.toLocaleString("en-IN", { minimumFractionDigits: 2 });
    document.getElementById("displayAmountPaid").textContent = "₹" + amountPaid.toLocaleString("en-IN", { minimumFractionDigits: 2 });
    document.getElementById("balanceAmount").textContent = "₹" + balanceAmount.toLocaleString("en-IN", { minimumFractionDigits: 2 });
}

function renderPaymentHistory() {
    const container = document.getElementById("paymentHistoryContainer");
    container.innerHTML = "";

    const payments = currentOrder ? (currentOrder.payments || []) : [];

    if (payments.length === 0) {
        container.innerHTML = `<p class="text-muted textCenter">No payments recorded yet.</p>`;
        return;
    }

    payments.forEach((payment) => {
        const item = document.createElement("div");
        item.className = "flexBetween mb10 p10";
        item.style.cssText = "background: var(--bg-subtle); padding: 12px; border-radius: var(--radius-md); border-left: 4px solid var(--primary-color);";

        const dateVal = payment.created_at || payment.date;
        const dateStr = dateVal ? new Date(dateVal).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" }) : '';

        item.innerHTML = `
            <div>
                <strong>₹${Number(payment.amount).toLocaleString("en-IN")}</strong>
                <span class="badge badge-paid" style="margin-left: 8px;">${payment.payment_mode || payment.mode || 'Cash'}</span>
                <p style="font-size: 12px; color: var(--text-secondary); margin-top: 4px;">
                    <i class="fa-regular fa-clock"></i> ${dateStr} ${payment.notes ? ` &bull; ${payment.notes}` : ''}
                </p>
            </div>
            <span class="badge badge-paid"><i class="fa-solid fa-lock"></i> Audited Record</span>
        `;

        container.appendChild(item);
    });
}

async function showAddPaymentModal() {
    const amountStr = prompt("Enter payment amount (₹):");
    if (!amountStr) return;

    const amount = Number(amountStr);
    if (isNaN(amount) || amount <= 0) {
        UI.error("Please enter a valid positive payment amount");
        return;
    }

    const mode = prompt("Payment mode (e.g., Cash, UPI, GPay, Bank Transfer):", "Cash / UPI") || "Cash";
    const notes = prompt("Notes (optional):", "Partial payment received") || "";

    UI.showLoader("Recording Payment...");

    try {
        await API.addPayment(currentOrderId, {
            amount: amount,
            payment_mode: mode,
            notes: notes
        });

        UI.hideLoader();
        UI.success(`Recorded payment of ₹${amount.toLocaleString("en-IN")}`);
        await loadOrder();
    } catch (err) {
        UI.hideLoader();
        UI.error("Failed to add payment: " + err.message);
    }
}

function validateViewForm() {
    let isValid = true;
    const name = document.getElementById("customerName");
    const phone = document.getElementById("phoneNumber");
    const address = document.getElementById("address");
    const height = document.getElementById("height");
    const length = document.getElementById("length");
    const sqftPrice = document.getElementById("sqftPrice");

    if (name.value.trim() === "") {
        UI.showFieldError(name, "Customer Name is required");
        isValid = false;
    }

    if (!UI.validatePhone(phone.value.trim())) {
        UI.showFieldError(phone, "Enter a valid 10-digit Phone Number");
        isValid = false;
    }

    if (address.value.trim() === "") {
        UI.showFieldError(address, "Address is required");
        isValid = false;
    }

    if (!UI.validateNumber(height.value, 1, false)) {
        UI.showFieldError(height, "Select a valid Height");
        isValid = false;
    }

    if (!UI.validateNumber(length.value, 1, false)) {
        UI.showFieldError(length, "Length must be greater than 0");
        isValid = false;
    }

    if (!UI.validateNumber(sqftPrice.value, 0.1, false)) {
        UI.showFieldError(sqftPrice, "Price must be greater than 0");
        isValid = false;
    }

    return isValid;
}

async function updateOrder(event) {
    event.preventDefault();

    if (!validateViewForm()) {
        UI.error("Please fix validation errors");
        return;
    }

    UI.showLoader("Updating Order...");

    try {
        const orderPayload = {
            customer_name: document.getElementById("customerName").value.trim(),
            phone_number: document.getElementById("phoneNumber").value.trim(),
            address: document.getElementById("address").value.trim(),
            order_type: document.getElementById("orderType").value,
            material_type: document.getElementById("materialType").value,
            diamond_size: document.getElementById("diamondSize").value,
            brand: document.getElementById("brand").value,
            height: Number(document.getElementById("height").value || 0),
            length: Number(document.getElementById("length").value || 0),
            sqft_price: Number(document.getElementById("sqftPrice").value || 0),
            barbed_wire: Number(document.getElementById("barbedWire").value || 0),
            binding_wire: Number(document.getElementById("bindingWire").value || 0),
            labour: Number(document.getElementById("labour").value || 0),
            travel: Number(document.getElementById("travel").value || 0),
            stone: Number(document.getElementById("stone").value || 0),
            amount_paid: Number(document.getElementById("amountPaid").value || 0),
            status: document.getElementById("status").value
        };

        await API.updateOrder(currentOrderId, orderPayload);

        UI.hideLoader();
        UI.success("Order updated successfully!");

        setTimeout(() => {
            window.location.href = "orders.html";
        }, 500);
    } catch (err) {
        UI.hideLoader();
        UI.error("Failed to update order: " + err.message);
    }
}