/* ==========================================
   MODERN CHAIN LINK COMPANY - ADD ORDER JS (MODULE 4)
========================================== */

document.addEventListener("DOMContentLoaded", function () {
    if (localStorage.getItem("isLoggedIn") !== "true") {
        window.location.href = "login.html";
        return;
    }

    const orderType = document.getElementById("orderType");
    const fieldsToCalculate = [
        "height", "length", "sqftPrice", "barbedWireKg", "barbedWireRate",
        "bindingWireKg", "bindingWireRate", "barbedWire", "bindingWire",
        "labour", "travel", "stone", "amountPaid"
    ];

    orderType.addEventListener("change", toggleInstallationFields);

    fieldsToCalculate.forEach(function (id) {
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
            el.addEventListener("input", function () {
                UI.clearFieldError(el);
            });
        }
    });

    document.getElementById("orderForm").addEventListener("submit", saveOrder);

    const orderedDateInput = document.getElementById("orderedDate");
    if (orderedDateInput && !orderedDateInput.value) {
        orderedDateInput.value = new Date().toISOString().split('T')[0];
    }

    toggleInstallationFields();
    calculateAmounts();
});

function toggleInstallationFields() {
    const orderType = document.getElementById("orderType").value;
    const installationFields = document.getElementById("installationFields");
    const sqftPriceLabel = document.getElementById("sqftPriceLabel");

    if (orderType === "Installation") {
        installationFields.style.display = "block";
        if (sqftPriceLabel) {
            sqftPriceLabel.innerHTML = '<i class="fa-solid fa-tag"></i> Price per Ft (₹) *';
        }
    } else {
        installationFields.style.display = "none";
        document.getElementById("labour").value = 0;
        document.getElementById("travel").value = 0;
        document.getElementById("stone").value = 0;
        if (sqftPriceLabel) {
            sqftPriceLabel.innerHTML = '<i class="fa-solid fa-tag"></i> Price per Sq.Ft (₹) *';
        }
    }
    calculateAmounts();
}

function calculateAmounts() {
    const orderType = document.getElementById("orderType").value;
    const height = Number(document.getElementById("height").value) || 0;
    const length = Number(document.getElementById("length").value) || 0;
    const sqftPrice = Number(document.getElementById("sqftPrice").value) || 0;

    const area = height * length;
    
    // If Material + Installation, material cost is calculated per Running Ft (Length * Price per Ft)
    let materialCost = 0;
    if (orderType === "Installation") {
        materialCost = length * sqftPrice;
    } else {
        materialCost = area * sqftPrice;
    }

    // Barbed Wire calculation (Kg * Rate)
    const barbedWireKg = Number(document.getElementById("barbedWireKg").value) || 0;
    const barbedWireRate = Number(document.getElementById("barbedWireRate").value) || 0;
    const barbedWireCost = barbedWireKg * barbedWireRate;
    document.getElementById("barbedWire").value = barbedWireCost;
    const barbedTextEl = document.getElementById("barbedWireTotalText");
    if (barbedTextEl) {
        barbedTextEl.textContent = "₹" + barbedWireCost.toLocaleString("en-IN", { minimumFractionDigits: 2 });
    }

    // Binding Wire calculation (Kg * Rate)
    const bindingWireKg = Number(document.getElementById("bindingWireKg").value) || 0;
    const bindingWireRate = Number(document.getElementById("bindingWireRate").value) || 0;
    const bindingWireCost = bindingWireKg * bindingWireRate;
    document.getElementById("bindingWire").value = bindingWireCost;
    const bindingTextEl = document.getElementById("bindingWireTotalText");
    if (bindingTextEl) {
        bindingTextEl.textContent = "₹" + bindingWireCost.toLocaleString("en-IN", { minimumFractionDigits: 2 });
    }

    const labour = Number(document.getElementById("labour").value) || 0;
    const travel = Number(document.getElementById("travel").value) || 0;
    const stone = Number(document.getElementById("stone").value) || 0;
    const amountPaid = Number(document.getElementById("amountPaid").value) || 0;

    const totalAmount = materialCost + barbedWireCost + bindingWireCost + labour + travel + stone;
    const balanceAmount = Math.max(0, totalAmount - amountPaid);

    document.getElementById("area").textContent = area.toFixed(2) + " Sq.ft";
    document.getElementById("materialCost").textContent = "₹" + materialCost.toLocaleString("en-IN", { minimumFractionDigits: 2 });
    document.getElementById("totalAmount").textContent = "₹" + totalAmount.toLocaleString("en-IN", { minimumFractionDigits: 2 });
    document.getElementById("balanceAmount").textContent = "₹" + balanceAmount.toLocaleString("en-IN", { minimumFractionDigits: 2 });
}

function validateOrderForm() {
    let isValid = true;

    const customerName = document.getElementById("customerName");
    const phoneNumber = document.getElementById("phoneNumber");
    const address = document.getElementById("address");
    const height = document.getElementById("height");
    const length = document.getElementById("length");
    const sqftPrice = document.getElementById("sqftPrice");

    if (customerName.value.trim() === "") {
        UI.showFieldError(customerName, "Customer Name is required");
        isValid = false;
    }

    if (!UI.validatePhone(phoneNumber.value.trim())) {
        UI.showFieldError(phoneNumber, "Enter a valid 10-digit Phone Number");
        isValid = false;
    }

    if (address.value.trim() === "") {
        UI.showFieldError(address, "Address is required");
        isValid = false;
    }

    if (!UI.validateNumber(height.value, 0.1, false)) {
        UI.showFieldError(height, "Enter a valid Height in feet (e.g. 5.5)");
        isValid = false;
    }

    if (!UI.validateNumber(length.value, 1, false)) {
        UI.showFieldError(length, "Enter a valid Running Length (greater than 0)");
        isValid = false;
    }

    if (!UI.validateNumber(sqftPrice.value, 0.1, false)) {
        UI.showFieldError(sqftPrice, "Enter a valid Price");
        isValid = false;
    }

    ["barbedWireKg", "barbedWireRate", "bindingWireKg", "bindingWireRate", "labour", "travel", "stone", "amountPaid"].forEach(id => {
        const el = document.getElementById(id);
        if (el && !UI.validateNumber(el.value, 0, true)) {
            UI.showFieldError(el, "Amount cannot be negative");
            isValid = false;
        }
    });

    return isValid;
}

async function saveOrder(event) {
    event.preventDefault();

    if (!validateOrderForm()) {
        UI.error("Please correct highlighted errors before saving");
        return;
    }

    UI.showLoader("Saving Order...");

    try {
        const barbedWireKg = Number(document.getElementById("barbedWireKg").value || 0);
        const barbedWireRate = Number(document.getElementById("barbedWireRate").value || 0);
        const barbedWireCost = barbedWireKg * barbedWireRate;

        const bindingWireKg = Number(document.getElementById("bindingWireKg").value || 0);
        const bindingWireRate = Number(document.getElementById("bindingWireRate").value || 0);
        const bindingWireCost = bindingWireKg * bindingWireRate;

        const orderPayload = {
            customer_name: document.getElementById("customerName").value.trim(),
            phone_number: document.getElementById("phoneNumber").value.trim(),
            address: document.getElementById("address").value.trim(),
            order_type: document.getElementById("orderType").value,
            material_type: document.getElementById("materialType").value,
            diamond_size: document.getElementById("diamondSize").value,
            brand: document.getElementById("brand").value,
            ordered_date: document.getElementById("orderedDate").value || new Date().toISOString().split('T')[0],
            delivery_date: document.getElementById("deliveryDate").value || null,
            height: Number(document.getElementById("height").value || 0),
            length: Number(document.getElementById("length").value || 0),
            sqft_price: Number(document.getElementById("sqftPrice").value || 0),
            barbed_wire: barbedWireCost,
            barbed_wire_kg: barbedWireKg,
            barbed_wire_rate: barbedWireRate,
            binding_wire: bindingWireCost,
            binding_wire_kg: bindingWireKg,
            binding_wire_rate: bindingWireRate,
            labour: Number(document.getElementById("labour").value || 0),
            travel: Number(document.getElementById("travel").value || 0),
            stone: Number(document.getElementById("stone").value || 0),
            amount_paid: Number(document.getElementById("amountPaid").value || 0),
            status: document.getElementById("status").value
        };

        const res = await API.createOrder(orderPayload);
        const createdId = res ? (res.order_id || res.orderId) : "New Order";

        UI.hideLoader();
        UI.success(`Order ${createdId} saved successfully!`);

        setTimeout(() => {
            window.location.href = "orders.html";
        }, 600);
    } catch (err) {
        UI.hideLoader();
        UI.error("Failed to save order: " + err.message);
    }
}