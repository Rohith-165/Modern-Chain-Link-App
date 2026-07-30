/* ==========================================
   MODERN CHAIN LINK COMPANY - HOME JS (MODULE 2)
========================================== */

document.addEventListener("DOMContentLoaded", function () {
    if (localStorage.getItem("isLoggedIn") !== "true") {
        window.location.href = "login.html";
        return;
    }

    const adminName = localStorage.getItem("adminName") || "Admin";
    document.getElementById("adminName").textContent = adminName;

    const greeting = document.getElementById("greeting");
    const hour = new Date().getHours();
    if (hour < 12) {
        greeting.innerHTML = '<i class="fa-solid fa-sun color-primary"></i> Good Morning,';
    } else if (hour < 17) {
        greeting.innerHTML = '<i class="fa-solid fa-cloud-sun color-primary"></i> Good Afternoon,';
    } else {
        greeting.innerHTML = '<i class="fa-solid fa-moon color-primary"></i> Good Evening,';
    }

    const today = new Date();
    const options = { weekday: "long", day: "numeric", month: "long", year: "numeric" };
    document.getElementById("currentDate").textContent = today.toLocaleDateString("en-IN", options);

    loadDashboardStats();
});

async function loadDashboardStats() {
    try {
        const summary = await API.getDashboardSummary();

        document.getElementById("totalOrders").textContent = summary.total_orders || 0;
        document.getElementById("pendingOrders").textContent = summary.pending_orders || 0;
        document.getElementById("totalRevenue").textContent = "₹" + Number(summary.total_revenue || 0).toLocaleString("en-IN");
        document.getElementById("totalBalance").textContent = "₹" + Number(summary.total_balance || 0).toLocaleString("en-IN");

        const recentContainer = document.getElementById("recentOrdersContainer");
        recentContainer.innerHTML = "";

        const recent = summary.recent_orders || [];

        if (recent.length === 0) {
            recentContainer.innerHTML = `
                <div class="emptyCard textCenter">
                    <i class="fa-solid fa-inbox color-primary emptyIcon"></i>
                    <p>No Orders Available</p>
                </div>
            `;
            return;
        }

        recent.forEach(order => {
            let statusClass = "statusPending";
            if (order.status === "Processing") statusClass = "statusProcessing";
            if (order.status === "Delivered") statusClass = "statusDelivered";

            const card = document.createElement("div");
            card.className = "orderCard app-card mb10";
            card.style.cursor = "pointer";
            card.onclick = () => {
                localStorage.setItem("selectedOrderId", order.order_id || order.orderId);
                window.location.href = "view-order.html";
            };

            const orderIdStr = order.order_id || order.orderId;
            const customerNameStr = order.customer_name || order.customerName;
            const totalAmountNum = Number(order.total_amount || order.totalAmount || 0);
            const balanceAmountNum = Number(order.balance_amount || order.balanceAmount || 0);

            card.innerHTML = `
                <div class="flexBetween mb10">
                    <span class="orderId font-weight-600"><i class="fa-solid fa-hashtag color-primary"></i> ${orderIdStr}</span>
                    <span class="badge ${statusClass}">${order.status}</span>
                </div>
                <div class="flexBetween">
                    <div>
                        <strong><i class="fa-solid fa-user color-secondary"></i> ${customerNameStr}</strong>
                        <p class="text-muted" style="font-size: 13px;"><i class="fa-solid fa-phone"></i> ${order.phone_number || order.phoneNumber || ''}</p>
                    </div>
                    <div class="textRight">
                        <span class="color-primary font-weight-600" style="font-size: 16px;">₹${totalAmountNum.toLocaleString("en-IN")}</span>
                        <p style="font-size: 12px; color: ${balanceAmountNum > 0 ? '#dc2626' : '#16a34a'};">
                            ${balanceAmountNum > 0 ? `Bal: ₹${balanceAmountNum.toLocaleString("en-IN")}` : 'Paid'}
                        </p>
                    </div>
                </div>
            `;
            recentContainer.appendChild(card);
        });
    } catch (err) {
        UI.error("Failed to load dashboard data: " + err.message);
    }
}