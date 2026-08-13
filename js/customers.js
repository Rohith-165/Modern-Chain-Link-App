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
                    <div class="flexBetween mt10 mb10" style="border-bottom: 1px solid var(--border-color); padding-bottom: 6px;">
                        <h4 style="font-size: 14px; margin: 0;">
                            <i class="fa-solid fa-clock-rotate-left color-primary"></i> Order History (${customerOrders.length})
                        </h4>
                        <button class="btn-primary btn-sm" style="background: #2563eb; color: white; border: none; padding: 6px 12px; border-radius: var(--radius-md);" onclick="downloadSingleCustomerPDF(${idx})">
                            <i class="fa-solid fa-file-pdf"></i> Download PDF Statement
                        </button>
                    </div>
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

async function exportCustomersToExcel() {
    UI.showLoader("Generating Customer Excel Ledger...");
    try {
        const searchText = document.getElementById("customerSearchInput") ? document.getElementById("customerSearchInput").value.trim() : "";
        const customers = await API.getCustomers(searchText);

        if (!customers || customers.length === 0) {
            UI.hideLoader();
            UI.error("No customer records found to export.");
            return;
        }

        const excelData = customers.map((c, idx) => ({
            "S.No": idx + 1,
            "Customer Name": c.name || c.customerName,
            "Phone Number": c.phone_number || c.phoneNumber,
            "Address": c.address || "N/A",
            "Total Orders": c.total_orders || (c.orders || []).length,
            "Total Spent (₹)": c.total_spent || 0,
            "Total Paid (₹)": c.total_paid || 0,
            "Balance Due (₹)": c.balance_due || 0,
            "Last Order Date": c.last_order_date ? new Date(c.last_order_date).toLocaleDateString("en-IN") : "N/A"
        }));

        if (typeof XLSX === "undefined") {
            let csvContent = "data:text/csv;charset=utf-8,";
            const headers = Object.keys(excelData[0]);
            csvContent += headers.join(",") + "\n";
            excelData.forEach(row => {
                csvContent += headers.map(h => `"${row[h] || ''}"`).join(",") + "\n";
            });
            const encodedUri = encodeURI(csvContent);
            const link = document.createElement("a");
            link.setAttribute("href", encodedUri);
            link.setAttribute("download", `Modern_Chain_Link_Customers_${new Date().toISOString().slice(0, 10)}.csv`);
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        } else {
            const worksheet = XLSX.utils.json_to_sheet(excelData);
            const workbook = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(workbook, worksheet, "Customers");

            const colWidths = Object.keys(excelData[0]).map(key => ({
                wch: Math.max(key.length + 2, 12)
            }));
            worksheet["!cols"] = colWidths;

            XLSX.writeFile(workbook, `Modern_Chain_Link_Customers_${new Date().toISOString().slice(0, 10)}.xlsx`);
        }

        UI.hideLoader();
        UI.success("Customer Excel ledger downloaded successfully!");
    } catch (err) {
        UI.hideLoader();
        UI.error("Failed to export customers: " + err.message);
    }
}

async function downloadCustomersPDF() {
    UI.showLoader("Generating Customers Directory PDF...");
    try {
        const searchText = document.getElementById("customerSearchInput") ? document.getElementById("customerSearchInput").value.trim() : "";
        const customers = await API.getCustomers(searchText);

        if (!customers || customers.length === 0) {
            UI.hideLoader();
            UI.error("No customer records found to export.");
            return;
        }

        const printWindow = window.open("", "_blank", "width=850,height=1100");
        if (!printWindow) {
            UI.hideLoader();
            UI.error("Pop-up window blocked. Please allow pop-ups to download PDF.");
            return;
        }

        const customerRows = customers.map((c, idx) => `
            <tr>
                <td style="padding: 8px; border-bottom: 1px solid #ddd; text-align: center;">${idx + 1}</td>
                <td style="padding: 8px; border-bottom: 1px solid #ddd; font-weight: bold;">${c.name || c.customerName}</td>
                <td style="padding: 8px; border-bottom: 1px solid #ddd;">${c.phone_number || c.phoneNumber}</td>
                <td style="padding: 8px; border-bottom: 1px solid #ddd;">${c.address || 'N/A'}</td>
                <td style="padding: 8px; border-bottom: 1px solid #ddd; text-align: center;">${c.total_orders || (c.orders || []).length}</td>
                <td style="padding: 8px; border-bottom: 1px solid #ddd; text-align: right; color: #0284c7; font-weight: 600;">₹${Number(c.total_spent || 0).toLocaleString("en-IN")}</td>
                <td style="padding: 8px; border-bottom: 1px solid #ddd; text-align: right; color: #16a34a; font-weight: 600;">₹${Number(c.total_paid || 0).toLocaleString("en-IN")}</td>
                <td style="padding: 8px; border-bottom: 1px solid #ddd; text-align: right; color: ${(c.balance_due || 0) > 0 ? '#dc2626' : '#16a34a'}; font-weight: 600;">₹${Number(c.balance_due || 0).toLocaleString("en-IN")}</td>
            </tr>
        `).join("");

        const totalSpentAll = customers.reduce((sum, c) => sum + Number(c.total_spent || 0), 0);
        const totalPaidAll = customers.reduce((sum, c) => sum + Number(c.total_paid || 0), 0);
        const totalBalanceAll = customers.reduce((sum, c) => sum + Number(c.balance_due || 0), 0);

        const htmlContent = `
            <!DOCTYPE html>
            <html>
            <head>
                <title>Customer Directory PDF - Modern Chain Link Company</title>
                <style>
                    @page { size: A4 landscape; margin: 12mm; }
                    body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; color: #1e293b; padding: 15px; }
                    .header { display: flex; justify-content: space-between; align-items: center; border-bottom: 2px solid #0284c7; padding-bottom: 12px; margin-bottom: 15px; }
                    .company-title { font-size: 22px; font-weight: bold; color: #0284c7; margin: 0; }
                    .subtitle { font-size: 11px; color: #64748b; margin-top: 3px; }
                    .badge { background: #0284c7; color: white; padding: 5px 12px; border-radius: 4px; font-size: 13px; font-weight: bold; }
                    .summary-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 10px; margin-bottom: 15px; }
                    .summary-box { background: #f8fafc; border: 1px solid #cbd5e1; border-radius: 6px; padding: 8px; text-align: center; }
                    .summary-box small { color: #64748b; font-size: 10px; display: block; text-transform: uppercase; }
                    .summary-box strong { font-size: 15px; margin-top: 2px; display: block; }
                    table { width: 100%; border-collapse: collapse; margin-top: 10px; font-size: 12px; }
                    th { background: #0284c7; color: white; padding: 8px 6px; font-weight: 600; text-align: left; }
                    th.num { text-align: right; }
                    th.center { text-align: center; }
                    .footer { margin-top: 30px; border-top: 1px solid #e2e8f0; padding-top: 12px; display: flex; justify-content: space-between; font-size: 11px; color: #64748b; }
                </style>
            </head>
            <body>
                <div class="header">
                    <div>
                        <h1 class="company-title">MODERN CHAIN LINK COMPANY</h1>
                        <p class="subtitle">Customer Directory & Financial Summary Report | Tiruchengode, Tamil Nadu</p>
                    </div>
                    <div class="badge">CUSTOMER DETAILS REPORT</div>
                </div>

                <div class="summary-grid">
                    <div class="summary-box">
                        <small>Total Customers</small>
                        <strong style="color: #0284c7;">${customers.length}</strong>
                    </div>
                    <div class="summary-box">
                        <small>Total Revenue</small>
                        <strong style="color: #0f172a;">₹${totalSpentAll.toLocaleString("en-IN")}</strong>
                    </div>
                    <div class="summary-box">
                        <small>Total Collected</small>
                        <strong style="color: #16a34a;">₹${totalPaidAll.toLocaleString("en-IN")}</strong>
                    </div>
                    <div class="summary-box">
                        <small>Outstanding Balances</small>
                        <strong style="color: ${totalBalanceAll > 0 ? '#dc2626' : '#16a34a'};">₹${totalBalanceAll.toLocaleString("en-IN")}</strong>
                    </div>
                </div>

                <table>
                    <thead>
                        <tr>
                            <th class="center" style="width: 35px;">S.No</th>
                            <th>Customer Name</th>
                            <th>Phone Number</th>
                            <th>Address</th>
                            <th class="center">Orders</th>
                            <th class="num">Total Spent</th>
                            <th class="num">Total Paid</th>
                            <th class="num">Balance Due</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${customerRows}
                    </tbody>
                </table>

                <div class="footer">
                    <div>Report generated on: ${new Date().toLocaleString("en-IN")}</div>
                    <div>Modern Chain Link Company &copy; 2026</div>
                </div>

                <script>
                    window.onload = function() {
                        window.print();
                    };
                </script>
            </body>
            </html>
        `;

        printWindow.document.open();
        printWindow.document.write(htmlContent);
        printWindow.document.close();
        UI.hideLoader();
        UI.success("Customer PDF generated successfully!");
    } catch (err) {
        UI.hideLoader();
        UI.error("Failed to generate Customers PDF: " + err.message);
    }
}

async function downloadSingleCustomerPDF(idx) {
    try {
        const searchText = document.getElementById("customerSearchInput") ? document.getElementById("customerSearchInput").value.trim() : "";
        const customers = await API.getCustomers(searchText);

        const customer = customers[idx];
        if (!customer) {
            UI.error("Customer record not found.");
            return;
        }

        const name = customer.name || customer.customerName || "Customer";
        const phone = customer.phone_number || customer.phoneNumber || "N/A";
        const address = customer.address || "N/A";
        const totalSpent = Number(customer.total_spent || 0);
        const totalPaid = Number(customer.total_paid || 0);
        const balanceDue = Number(customer.balance_due || 0);
        const orders = customer.orders || [];

        const printWindow = window.open("", "_blank", "width=850,height=1100");
        if (!printWindow) {
            UI.error("Pop-up window blocked. Please allow pop-ups to download PDF.");
            return;
        }

        const ordersRows = orders.map((o, i) => `
            <tr>
                <td style="padding: 8px; border-bottom: 1px solid #ddd; text-align: center;">${i + 1}</td>
                <td style="padding: 8px; border-bottom: 1px solid #ddd; font-weight: bold;">${o.order_id || o.orderId}</td>
                <td style="padding: 8px; border-bottom: 1px solid #ddd;">${new Date(o.created_at || o.createdAt || Date.now()).toLocaleDateString("en-IN")}</td>
                <td style="padding: 8px; border-bottom: 1px solid #ddd;">${o.order_type || o.orderType || 'Material'}</td>
                <td style="padding: 8px; border-bottom: 1px solid #ddd; text-align: right;">₹${Number(o.total_amount || o.totalAmount || 0).toLocaleString("en-IN")}</td>
                <td style="padding: 8px; border-bottom: 1px solid #ddd; text-align: right; color: #16a34a; font-weight: 600;">₹${Number(o.amount_paid || o.amountPaid || 0).toLocaleString("en-IN")}</td>
                <td style="padding: 8px; border-bottom: 1px solid #ddd; text-align: right; color: ${(o.balance_amount || o.balanceAmount) > 0 ? '#dc2626' : '#16a34a'}; font-weight: 600;">₹${Number(o.balance_amount || o.balanceAmount || 0).toLocaleString("en-IN")}</td>
                <td style="padding: 8px; border-bottom: 1px solid #ddd; text-align: center;"><span style="padding: 3px 8px; border-radius: 4px; font-size: 11px; background: #e0f2fe; color: #0369a1; font-weight: bold;">${o.status}</span></td>
            </tr>
        `).join("");

        const htmlContent = `
            <!DOCTYPE html>
            <html>
            <head>
                <title>Customer Statement - ${name}</title>
                <style>
                    @page { size: A4; margin: 15mm; }
                    body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; color: #1e293b; padding: 20px; }
                    .header { display: flex; justify-content: space-between; align-items: center; border-bottom: 2px solid #0284c7; padding-bottom: 15px; margin-bottom: 20px; }
                    .company-title { font-size: 24px; font-weight: bold; color: #0284c7; margin: 0; }
                    .subtitle { font-size: 12px; color: #64748b; margin-top: 4px; }
                    .statement-badge { background: #0284c7; color: white; padding: 6px 14px; border-radius: 6px; font-size: 14px; font-weight: bold; }
                    .card { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 15px; margin-bottom: 20px; }
                    .grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 15px; }
                    .stats-container { display: grid; grid-template-columns: repeat(4, 1fr); gap: 10px; margin-bottom: 20px; }
                    .stat-box { background: #fff; border: 1px solid #cbd5e1; border-radius: 6px; padding: 10px; text-align: center; }
                    .stat-box small { color: #64748b; font-size: 11px; display: block; text-transform: uppercase; }
                    .stat-box strong { font-size: 16px; margin-top: 4px; display: block; }
                    table { width: 100%; border-collapse: collapse; margin-top: 10px; font-size: 13px; }
                    th { background: #0284c7; color: white; padding: 10px 8px; font-weight: 600; text-align: left; }
                    th.num { text-align: right; }
                    .footer { margin-top: 40px; border-top: 1px solid #e2e8f0; padding-top: 15px; display: flex; justify-content: space-between; font-size: 12px; color: #64748b; }
                </style>
            </head>
            <body>
                <div class="header">
                    <div>
                        <h1 class="company-title">MODERN CHAIN LINK COMPANY</h1>
                        <p class="subtitle">Premium Fencing Solutions | Tiruchengode, Tamil Nadu | Ph: 9876543210</p>
                    </div>
                    <div class="statement-badge">CUSTOMER STATEMENT</div>
                </div>

                <div class="card">
                    <h3 style="margin-top: 0; color: #0f172a; font-size: 16px; border-bottom: 1px dashed #cbd5e1; padding-bottom: 8px;">Customer Profile Details</h3>
                    <div class="grid-2" style="font-size: 14px; margin-top: 10px;">
                        <div>
                            <p style="margin: 4px 0;"><strong>Customer Name:</strong> ${name}</p>
                            <p style="margin: 4px 0;"><strong>Phone Number:</strong> ${phone}</p>
                        </div>
                        <div>
                            <p style="margin: 4px 0;"><strong>Delivery Address:</strong> ${address}</p>
                            <p style="margin: 4px 0;"><strong>Statement Generated Date:</strong> ${new Date().toLocaleDateString("en-IN")}</p>
                        </div>
                    </div>
                </div>

                <div class="stats-container">
                    <div class="stat-box">
                        <small>Total Orders</small>
                        <strong style="color: #0284c7;">${orders.length}</strong>
                    </div>
                    <div class="stat-box">
                        <small>Total Spent</small>
                        <strong style="color: #0f172a;">₹${totalSpent.toLocaleString("en-IN")}</strong>
                    </div>
                    <div class="stat-box">
                        <small>Total Paid</small>
                        <strong style="color: #16a34a;">₹${totalPaid.toLocaleString("en-IN")}</strong>
                    </div>
                    <div class="stat-box">
                        <small>Balance Outstanding</small>
                        <strong style="color: ${balanceDue > 0 ? '#dc2626' : '#16a34a'};">₹${balanceDue.toLocaleString("en-IN")}</strong>
                    </div>
                </div>

                <h3 style="color: #0f172a; font-size: 15px; margin-bottom: 5px;">Itemized Order History</h3>
                <table>
                    <thead>
                        <tr>
                            <th style="width: 40px; text-align: center;">S.No</th>
                            <th>Order ID</th>
                            <th>Date</th>
                            <th>Order Type</th>
                            <th class="num">Total Amount</th>
                            <th class="num">Paid</th>
                            <th class="num">Balance Due</th>
                            <th style="text-align: center;">Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${ordersRows || '<tr><td colspan="8" style="text-align:center; padding: 20px; color: #94a3b8;">No orders recorded for this customer.</td></tr>'}
                    </tbody>
                </table>

                <div class="footer">
                    <div>
                        <p style="margin:0;">Thank you for trusting <strong>Modern Chain Link Company</strong>.</p>
                    </div>
                    <div style="text-align: right;">
                        <p style="margin:0;">Authorized Signature & Seal</p>
                    </div>
                </div>

                <script>
                    window.onload = function() {
                        window.print();
                    };
                </script>
            </body>
            </html>
        `;

        printWindow.document.open();
        printWindow.document.write(htmlContent);
        printWindow.document.close();
        UI.success(`Customer Statement PDF generated for ${name}!`);
    } catch (err) {
        UI.error("Failed to generate Customer PDF: " + err.message);
    }
}
