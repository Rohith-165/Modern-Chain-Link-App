/* ==========================================
   MODERN CHAIN LINK COMPANY - CUSTOMERS JS (MODULE 3)
========================================== */

document.addEventListener("DOMContentLoaded", function () {
    if (localStorage.getItem("isLoggedIn") !== "true") {
        window.location.href = "login.html";
        return;
    }

    const searchInput = document.getElementById("customerSearchInput");
    searchInput.addEventListener("input", renderCustomers);

    renderCustomers();
});

async function renderCustomers() {
    const container = document.getElementById("customersContainer");
    const searchText = document.getElementById("customerSearchInput").value.trim();

    try {
        const customers = await API.getCustomers(searchText);

        // Calculate global customer summary counters
        const totalCustomersCount = customers.length;
        const totalRevenue = customers.reduce((sum, c) => sum + Number(c.total_spent || 0), 0);
        const totalBalance = customers.reduce((sum, c) => sum + Number(c.balance_due || 0), 0);

        document.getElementById("totalCustomersCount").textContent = totalCustomersCount;
        document.getElementById("totalCustomerRevenue").textContent = "₹" + totalRevenue.toLocaleString("en-IN");
        document.getElementById("totalCustomerBalance").textContent = "₹" + totalBalance.toLocaleString("en-IN");

        container.innerHTML = "";

        if (customers.length === 0) {
            container.innerHTML = `
                <div class="emptyCard textCenter app-card">
                    <i class="fa-solid fa-users-slash color-primary emptyIcon" style="font-size: 40px; margin-bottom: 10px;"></i>
                    <p>No Customers Found</p>
                    <small class="text-muted">Try a different search term or add a new order.</small>
                </div>
            `;
            return;
        }

        customers.forEach((customer, idx) => {
            const card = document.createElement("div");
            card.className = "customerCard app-card mb20";

            const balanceDueNum = Number(customer.balance_due || 0);
            const hasBalance = balanceDueNum > 0;
            const customerOrders = customer.orders || [];

            card.innerHTML = `
                <div class="customerHeader flexBetween" onclick="toggleCustomerDetails(${idx})" style="cursor: pointer;">
                    <div>
                        <h3><i class="fa-solid fa-user color-primary"></i> ${customer.name || customer.customerName}</h3>
                        <p style="font-size: 13px; color: var(--text-secondary); margin-top: 4px;">
                            <i class="fa-solid fa-phone"></i> ${customer.phone_number || customer.phoneNumber} &bull; 
                            <i class="fa-solid fa-location-dot"></i> ${(customer.address || '').substring(0, 30)}${(customer.address || '').length > 30 ? '...' : ''}
                        </p>
                    </div>
                    <div class="textRight">
                        <span class="badge ${hasBalance ? 'badge-danger' : 'badge-paid'}" style="margin-bottom: 4px;">
                            ${hasBalance ? 'Bal Due: ₹' + balanceDueNum.toLocaleString("en-IN") : 'All Paid'}
                        </span>
                        <p style="font-size: 12px; color: var(--text-muted);"><i class="fa-solid fa-angle-down" id="arrow-${idx}"></i> Details</p>
                    </div>
                </div>

                <div class="customerStatsGrid grid3 mt10" style="background: var(--bg-subtle); padding: 12px; border-radius: var(--radius-md);">
                    <div>
                        <small style="color: var(--text-muted);">Orders</small>
                        <p class="font-weight-600">${customer.total_orders || customerOrders.length}</p>
                    </div>
                    <div>
                        <small style="color: var(--text-muted);">Total Spent</small>
                        <p class="color-primary font-weight-600">₹${Number(customer.total_spent || 0).toLocaleString("en-IN")}</p>
                    </div>
                    <div>
                        <small style="color: var(--text-muted);">Total Paid</small>
                        <p class="color-secondary font-weight-600">₹${Number(customer.total_paid || 0).toLocaleString("en-IN")}</p>
                    </div>
                </div>

                <div id="customerDetails-${idx}" class="customerOrdersList mt10" style="display: none;">
                    <h4 class="mt10 mb10" style="font-size: 14px; border-bottom: 1px solid var(--border-color); padding-bottom: 6px;">
                        <i class="fa-solid fa-clock-rotate-left color-primary"></i> Order History (${customerOrders.length})
                    </h4>
                    ${customerOrders.map(order => `
                        <div class="flexBetween mb10 p10" style="background: var(--bg-surface); border: 1px solid var(--border-color); border-radius: var(--radius-sm); padding: 10px;">
                            <div>
                                <span class="font-weight-600"><i class="fa-solid fa-hashtag color-primary"></i> ${order.order_id || order.orderId}</span>
                                <span class="badge ${order.status === 'Delivered' ? 'statusDelivered' : order.status === 'Processing' ? 'statusProcessing' : 'statusPending'}" style="margin-left: 6px;">${order.status}</span>
                                <p style="font-size: 12px; color: var(--text-muted); margin-top: 2px;">
                                    ${new Date(order.created_at || order.createdAt).toLocaleDateString("en-IN", { day: 'numeric', month: 'short', year: 'numeric' })} &bull; ${order.order_type || order.orderType || 'Material'}
                                </p>
                            </div>
                            <div class="textRight">
                                <strong style="color: var(--primary-color);">₹${Number(order.total_amount || order.totalAmount || 0).toLocaleString("en-IN")}</strong>
                                <br>
                                <button class="btn-outline btn-sm mt10" onclick="viewOrderFromCustomer('${order.order_id || order.orderId}')">
                                    View
                                </button>
                            </div>
                        </div>
                    `).join('')}
                </div>
            `;

            container.appendChild(card);
        });
    } catch (err) {
        UI.error("Failed to load customer records: " + err.message);
    }
}

function toggleCustomerDetails(idx) {
    const details = document.getElementById(`customerDetails-${idx}`);
    const arrow = document.getElementById(`arrow-${idx}`);
    if (details.style.display === "none") {
        details.style.display = "block";
        if (arrow) arrow.className = "fa-solid fa-angle-up";
    } else {
        details.style.display = "none";
        if (arrow) arrow.className = "fa-solid fa-angle-down";
    }
}

function viewOrderFromCustomer(orderId) {
    localStorage.setItem("selectedOrderId", orderId);
    window.location.href = "view-order.html";
}
