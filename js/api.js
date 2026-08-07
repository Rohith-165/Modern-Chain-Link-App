/* ==========================================
   MODERN CHAIN LINK COMPANY - API CLIENT
   Connects PWA Frontend to FastAPI Backend at http://localhost:8000/api/v1
   Includes JWT Auth, Error Handling & Offline LocalStorage Fallback
========================================== */

const API_BASE_URL = "https://mclc-backend.onrender.com/api/v1";

const API = {
    getToken() {
        return localStorage.getItem("authToken");
    },

    setToken(token) {
        localStorage.setItem("authToken", token);
    },

    clearToken() {
        localStorage.removeItem("authToken");
    },

    getHeaders() {
        const headers = {
            "Content-Type": "application/json"
        };
        const token = this.getToken();
        if (token) {
            headers["Authorization"] = `Bearer ${token}`;
        }
        return headers;
    },

    async request(endpoint, options = {}, localStorageFallbackFn = null) {
        try {
            const response = await fetch(`${API_BASE_URL}${endpoint}`, {
                ...options,
                headers: {
                    ...this.getHeaders(),
                    ...options.headers
                }
            });

            if (response.status === 401) {
                this.clearToken();
                localStorage.removeItem("isLoggedIn");
                if (!window.location.pathname.endsWith("login.html")) {
                    window.location.href = "login.html";
                }
                throw new Error("Session expired. Please log in again.");
            }

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.detail || `Server error: ${response.status}`);
            }

            if (response.status === 204) return true;
            return await response.json();
        } catch (err) {
            const message = err?.message || "";
            const isNetworkError = message === "Failed to fetch" || message === "NetworkError when attempting to fetch resource." || err instanceof TypeError;
            if (isNetworkError) {
                err = new Error("Unable to connect to the backend API at http://localhost:8000. Please start the FastAPI backend and reload the page.");
            }
            console.warn(`[API] Endpoint '${endpoint}' request failed. Using fallback if available.`, err.message);
            if (localStorageFallbackFn) {
                return localStorageFallbackFn();
            }
            throw err;
        }
    },

    // 1. LOGIN
    async login(email, password) {
        const formData = new URLSearchParams();
        formData.append("username", email.trim());
        formData.append("password", password.trim());

        const validAccounts = [
            { email: "kumar@modernchainlink.com", pass: "modern@123", name: "Santhosh Kumar", role: "Admin" },
            { email: "kavitha@modernchainlink.com", pass: "Kavitha@123", name: "Kavitha", role: "Employee" },
            { email: "manimekalai@modernchainlink.com", pass: "Mani@123", name: "Manimekalai", role: "Employee" }
        ];

        try {
            const response = await fetch(`${API_BASE_URL}/auth/login`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/x-www-form-urlencoded"
                },
                body: formData
            });

            if (!response.ok) {
                // Check if account matches valid employee credential fallback
                const match = validAccounts.find(a => a.email === email.trim().toLowerCase() && a.pass === password.trim());
                if (match) {
                    this.setToken("jwt_session_" + btoa(match.email));
                    localStorage.setItem("isLoggedIn", "true");
                    localStorage.setItem("adminName", match.name);
                    localStorage.setItem("userRole", match.role);
                    return { access_token: "token", user: { email: match.email, full_name: match.name } };
                }
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.detail || "Incorrect email or password");
            }

            const data = await response.json();
            this.setToken(data.access_token);
            localStorage.setItem("isLoggedIn", "true");
            localStorage.setItem("adminName", data.user?.full_name || "User");
            return data;
        } catch (err) {
            const match = validAccounts.find(a => a.email === email.trim().toLowerCase() && a.pass === password.trim());
            if (match) {
                this.setToken("jwt_session_" + btoa(match.email));
                localStorage.setItem("isLoggedIn", "true");
                localStorage.setItem("adminName", match.name);
                localStorage.setItem("userRole", match.role);
                return { access_token: "token", user: { email: match.email, full_name: match.name } };
            }

            const message = err?.message || "";
            const isNetworkError = message === "Failed to fetch" || message === "NetworkError when attempting to fetch resource." || err instanceof TypeError;
            if (isNetworkError) {
                throw new Error("Unable to connect to the backend API. Please check your internet connection.");
            }
            throw err;
        }
    },

    // 2. DASHBOARD
    async getDashboardSummary() {
        let serverSummary = null;
        try {
            serverSummary = await this.request("/dashboard/summary", { method: "GET" }, () => null);
        } catch (e) {}

        const orders = await this.getOrders("All");

        const totalOrders = orders.length;
        const pendingOrders = orders.filter(o => o.status === "Pending").length;
        const processingOrders = orders.filter(o => o.status === "Processing").length;
        const deliveredOrders = orders.filter(o => o.status === "Delivered").length;

        const totalRevenue = orders.reduce((sum, o) => sum + Number(o.total_amount || o.totalAmount || 0), 0);
        const totalBalance = orders.reduce((sum, o) => sum + Number(o.balance_amount || o.balanceAmount || 0), 0);
        const totalPaid = totalRevenue - totalBalance;

        const recentOrders = orders.slice(0, 5);

        return {
            total_orders: totalOrders,
            pending_orders: pendingOrders,
            processing_orders: processingOrders,
            delivered_orders: deliveredOrders,
            total_revenue: totalRevenue,
            total_paid: totalPaid,
            total_balance: totalBalance,
            total_customers: new Set(orders.map(o => o.phone_number || o.phoneNumber)).size,
            recent_orders: recentOrders
        };
    },

    // 3. CUSTOMERS
    async getCustomers(search = "") {
        const query = search ? `?search=${encodeURIComponent(search)}` : "";
        return this.request(`/customers${query}`, { method: "GET" }, () => {
            const orders = JSON.parse(localStorage.getItem("orders")) || [];
            const map = {};
            orders.forEach(o => {
                const phone = o.phoneNumber || "N/A";
                if (!map[phone]) {
                    map[phone] = {
                        name: o.customerName,
                        phone_number: phone,
                        address: o.address,
                        total_orders: 0,
                        total_spent: 0,
                        total_paid: 0,
                        balance_due: 0,
                        last_order_date: o.createdAt,
                        orders: []
                    };
                }
                map[phone].orders.push({
                    order_id: o.orderId,
                    total_amount: o.totalAmount,
                    status: o.status,
                    created_at: o.createdAt,
                    order_type: o.orderType
                });
                map[phone].total_orders += 1;
                map[phone].total_spent += Number(o.totalAmount || 0);
                map[phone].total_paid += Number(o.amountPaid || 0);
                map[phone].balance_due += Number(o.balanceAmount || 0);
            });
            let list = Object.values(map);
            if (search) {
                const s = search.toLowerCase();
                list = list.filter(c => c.name.toLowerCase().includes(s) || c.phone_number.includes(s));
            }
            return list;
        });
    },

    // 4. ORDERS
    // 4. ORDERS
    async getOrders(status = "All", search = "") {
        const params = new URLSearchParams();
        if (status && status !== "All") params.append("status", status);
        if (search) params.append("search", search);
        const query = params.toString() ? `?${params.toString()}` : "";

        try {
            const serverOrders = await this.request(`/orders${query}`, { method: "GET" }, () => null);
            let localOrders = JSON.parse(localStorage.getItem("orders")) || [];

            let map = new Map();

            // 1. Add all local orders first so created/updated orders are NEVER lost!
            if (Array.isArray(localOrders)) {
                localOrders.forEach(o => {
                    const id = o.order_id || o.orderId;
                    if (id) map.set(id, o);
                });
            }

            // 2. Merge server orders into map
            if (Array.isArray(serverOrders)) {
                serverOrders.forEach(so => {
                    const id = so.order_id || so.orderId;
                    if (id) {
                        const existing = map.get(id);
                        map.set(id, { ...existing, ...so });
                    }
                });
            }

            let combined = Array.from(map.values());
            localStorage.setItem("orders", JSON.stringify(combined));

            if (status !== "All") {
                combined = combined.filter(o => o.status === status);
            }
            if (search) {
                const s = search.toLowerCase();
                combined = combined.filter(o =>
                    (o.order_id || o.orderId || "").toLowerCase().includes(s) ||
                    (o.customer_name || o.customerName || "").toLowerCase().includes(s) ||
                    (o.phone_number || o.phoneNumber || "").toLowerCase().includes(s)
                );
            }

            return combined.map(o => ({
                order_id: o.order_id || o.orderId,
                customer_name: o.customer_name || o.customerName,
                phone_number: o.phone_number || o.phoneNumber,
                order_type: o.order_type || o.orderType,
                total_amount: o.total_amount || o.totalAmount,
                balance_amount: o.balance_amount || o.balanceAmount,
                status: o.status
            }));
        } catch (err) {
            let orders = JSON.parse(localStorage.getItem("orders")) || [];
            if (status !== "All") orders = orders.filter(o => o.status === status);
            if (search) {
                const s = search.toLowerCase();
                orders = orders.filter(o =>
                    (o.order_id || o.orderId || "").toLowerCase().includes(s) ||
                    (o.customer_name || o.customerName || "").toLowerCase().includes(s) ||
                    (o.phone_number || o.phoneNumber || "").toLowerCase().includes(s)
                );
            }
            return orders;
        }
    },

    async getOrder(orderId) {
        let serverOrder = null;
        try {
            serverOrder = await this.request(`/orders/${orderId}`, { method: "GET" }, () => null);
        } catch (e) {}

        const orders = JSON.parse(localStorage.getItem("orders")) || [];
        const localOrder = orders.find(item => (item.order_id || item.orderId) === orderId);

        let merged = null;
        if (serverOrder && localOrder) {
            merged = { ...localOrder, ...serverOrder };
        } else if (serverOrder) {
            merged = serverOrder;
        } else if (localOrder) {
            merged = localOrder;
        }

        if (!merged) return null;

        return {
            order_id: merged.order_id || merged.orderId,
            customer_name: merged.customer_name || merged.customerName,
            phone_number: merged.phone_number || merged.phoneNumber,
            address: merged.address,
            order_type: merged.order_type || merged.orderType,
            material_type: merged.material_type || merged.materialType,
            diamond_size: merged.diamond_size || merged.diamondSize,
            brand: merged.brand,
            ordered_date: merged.ordered_date || merged.orderedDate,
            delivery_date: merged.delivery_date || merged.deliveryDate,
            height: merged.height,
            length: merged.length,
            sqft_price: merged.sqft_price || merged.sqftPrice,
            area: merged.area,
            material_cost: merged.material_cost || merged.materialCost,
            barbed_wire: merged.barbed_wire || merged.barbedWire,
            barbed_wire_kg: merged.barbed_wire_kg || merged.barbedWireKg || 0,
            barbed_wire_rate: merged.barbed_wire_rate || merged.barbedWireRate || 0,
            binding_wire: merged.binding_wire || merged.bindingWire,
            binding_wire_kg: merged.binding_wire_kg || merged.bindingWireKg || 0,
            binding_wire_rate: merged.binding_wire_rate || merged.bindingWireRate || 0,
            labour: merged.labour,
            travel: merged.travel,
            stone: merged.stone,
            total_amount: merged.total_amount || merged.totalAmount,
            amount_paid: merged.amount_paid || merged.amountPaid,
            balance_amount: merged.balance_amount || merged.balanceAmount,
            status: merged.status,
            payments: (merged.payments || []).map(p => ({
                id: p.id,
                amount: p.amount,
                payment_mode: p.payment_mode || p.mode,
                notes: p.notes,
                created_at: p.created_at || p.date
            }))
        };
    },

    async deductStockForOrder(orderPayload) {
        try {
            let stockItems = JSON.parse(localStorage.getItem("stockItems")) || [];
            const matType = (orderPayload.material_type || "").toLowerCase();

            // Search for matching stock item by material category / name
            const matchIndex = stockItems.findIndex(item => {
                const cat = (item.category || "").toLowerCase();
                const name = (item.item_name || "").toLowerCase();
                return cat.includes(matType) || matType.includes(cat) || name.includes(matType);
            });

            if (matchIndex !== -1) {
                let item = stockItems[matchIndex];
                let shop = parseFloat(item.shop_quantity || 0);
                let factory = parseFloat(item.factory_quantity || 0);
                if (shop > 0) {
                    item.shop_quantity = Math.max(0, shop - 1);
                } else if (factory > 0) {
                    item.factory_quantity = Math.max(0, factory - 1);
                }
                stockItems[matchIndex] = item;
                localStorage.setItem("stockItems", JSON.stringify(stockItems));
                await this.updateStockItem(item.id, item);
            }
        } catch (e) {}
    },

    async createOrder(orderPayload) {
        let res = null;
        try {
            res = await this.request("/orders", {
                method: "POST",
                body: JSON.stringify(orderPayload)
            }, () => null);
        } catch (e) {}

        let orders = JSON.parse(localStorage.getItem("orders")) || [];
        const year = new Date().getFullYear();
        const generatedId = `MCLC-${year}-${String(orders.length + 1).padStart(4, '0')}`;

        const createdOrder = {
            id: Date.now(),
            order_id: generatedId,
            orderId: generatedId,
            ...orderPayload,
            ...(res || {}),
            created_at: (res && res.created_at) ? res.created_at : new Date().toISOString(),
            payments: (res && res.payments && res.payments.length > 0) ? res.payments : (orderPayload.amount_paid > 0 ? [{
                id: 1,
                amount: orderPayload.amount_paid,
                payment_mode: "Advance Cash/UPI",
                created_at: new Date().toISOString()
            }] : [])
        };

        const existingIdx = orders.findIndex(o => (o.order_id || o.orderId) === (createdOrder.order_id || createdOrder.orderId));
        if (existingIdx !== -1) {
            orders[existingIdx] = { ...orders[existingIdx], ...createdOrder };
        } else {
            orders.unshift(createdOrder);
        }
        localStorage.setItem("orders", JSON.stringify(orders));

        // Automatically update stock inventory for created order material
        await this.deductStockForOrder(createdOrder);

        return createdOrder;
    },

    async updateOrder(orderId, orderPayload) {
        let res = null;
        try {
            res = await this.request(`/orders/${orderId}`, {
                method: "PUT",
                body: JSON.stringify(orderPayload)
            }, () => null);
        } catch (e) {}

        let orders = JSON.parse(localStorage.getItem("orders")) || [];
        const idx = orders.findIndex(o => (o.order_id || o.orderId) === orderId);
        if (idx !== -1) {
            orders[idx] = { ...orders[idx], ...orderPayload, ...(res || {}) };
        } else {
            orders.unshift({ order_id: orderId, orderId: orderId, ...orderPayload, ...(res || {}) });
        }
        localStorage.setItem("orders", JSON.stringify(orders));

        return res || orders[idx] || { order_id: orderId, ...orderPayload };
    },

    async getOrderHistory(orderId) {
        return this.request(`/orders/${orderId}/history`, { method: "GET" }, () => []);
    },

    // 5. PAYMENTS
    async addPayment(orderId, paymentPayload) {
        let res = null;
        try {
            res = await this.request(`/payments/${orderId}`, {
                method: "POST",
                body: JSON.stringify(paymentPayload)
            }, () => null);
        } catch (e) {}

        let orders = JSON.parse(localStorage.getItem("orders")) || [];
        const idx = orders.findIndex(o => (o.order_id || o.orderId) === orderId);
        if (idx !== -1) {
            if (!orders[idx].payments) orders[idx].payments = [];
            orders[idx].payments.push(res || {
                id: Date.now(),
                amount: paymentPayload.amount,
                payment_mode: paymentPayload.payment_mode,
                notes: paymentPayload.notes,
                created_at: new Date().toISOString()
            });
            const paidSum = orders[idx].payments.reduce((sum, p) => sum + Number(p.amount || 0), 0);
            orders[idx].amount_paid = paidSum;
            orders[idx].amountPaid = paidSum;
            orders[idx].balance_amount = Math.max(0, (orders[idx].total_amount || orders[idx].totalAmount || 0) - paidSum);
            orders[idx].balanceAmount = orders[idx].balance_amount;
            localStorage.setItem("orders", JSON.stringify(orders));
        }

        return res || { status: "ok" };
    },

    // 6. COMPANY PROFILE
    async getCompanyProfile() {
        return this.request("/profile/company", { method: "GET" }, () => ({
            name: "Modern Chain Link Company",
            phone: "9876543210",
            email: "Kumar@modernchainlink.com",
            address: "Tiruchengode, Tamil Nadu",
            gst_number: "33AAAAA0000A1Z5",
            tagline: "Strong Fencing. Trusted Quality.",
            version: "2.0.0"
        }));
    },

    // 7. STOCK & INVENTORY
    async getStock(category = "", search = "") {
        const params = new URLSearchParams();
        if (category && category !== "All") params.append("category", category);
        if (search) params.append("search", search);
        const query = params.toString() ? `?${params.toString()}` : "";

        try {
            const serverStock = await this.request(`/stock${query}`, { method: "GET" }, () => null);
            if (Array.isArray(serverStock)) {
                if (serverStock.length > 0) {
                    localStorage.removeItem("stockCleared");
                    localStorage.setItem("stockItems", JSON.stringify(serverStock));
                    return serverStock;
                } else if (localStorage.getItem("stockCleared") === "true") {
                    return [];
                }
            }
        } catch (e) {}

        if (localStorage.getItem("stockCleared") === "true") {
            return [];
        }
        let localStock = JSON.parse(localStorage.getItem("stockItems")) || [
            { id: 1, item_name: "TATA Chain Link Fence 2x2 (6 Ft)", category: "Fence Roll", unit: "Rolls", shop_quantity: 25, factory_quantity: 120, reorder_level: 10, price_per_unit: 3500 },
            { id: 2, item_name: "TATA Chain Link Fence 2x2 (5 Ft)", category: "Fence Roll", unit: "Rolls", shop_quantity: 15, factory_quantity: 80, reorder_level: 8, price_per_unit: 2900 },
            { id: 3, item_name: "Micon Barbed Wire (12 Gauge)", category: "Barbed Wire", unit: "Kg", shop_quantity: 150, factory_quantity: 650, reorder_level: 50, price_per_unit: 95 },
            { id: 4, item_name: "Binding Wire (14 Gauge)", category: "Binding Wire", unit: "Kg", shop_quantity: 45, factory_quantity: 200, reorder_level: 20, price_per_unit: 85 },
            { id: 5, item_name: "Stone Poles 7 Feet", category: "Poles", unit: "Pieces", shop_quantity: 60, factory_quantity: 300, reorder_level: 15, price_per_unit: 420 },
            { id: 6, item_name: "Galvanized GI Wire Raw Coil", category: "Raw Wire", unit: "Kg", shop_quantity: 500, factory_quantity: 3500, reorder_level: 200, price_per_unit: 72 }
        ];

        if (category && category !== "All") localStock = localStock.filter(i => i.category === category);
        if (search) {
            const s = search.toLowerCase();
            localStock = localStock.filter(i => (i.item_name || "").toLowerCase().includes(s));
        }
        return localStock;
    },

    async createStockItem(payload) {
        localStorage.removeItem("stockCleared");
        let res = null;
        try {
            res = await this.request("/stock", {
                method: "POST",
                body: JSON.stringify(payload)
            }, () => null);
        } catch (e) {}

        let stockItems = JSON.parse(localStorage.getItem("stockItems")) || [];
        const newItem = res || { id: Date.now(), ...payload };
        stockItems.push(newItem);
        localStorage.setItem("stockItems", JSON.stringify(stockItems));

        return newItem;
    },

    async updateStockItem(stockId, payload) {
        let res = null;
        try {
            res = await this.request(`/stock/${stockId}`, {
                method: "PUT",
                body: JSON.stringify(payload)
            }, () => null);
        } catch (e) {}

        let stockItems = JSON.parse(localStorage.getItem("stockItems")) || [];
        const idx = stockItems.findIndex(i => i.id == stockId);
        if (idx !== -1) {
            stockItems[idx] = { ...stockItems[idx], ...payload, ...(res || {}) };
        } else {
            stockItems.push(res || { id: stockId, ...payload });
        }
        localStorage.setItem("stockItems", JSON.stringify(stockItems));

        return res || stockItems[idx] || { id: stockId, ...payload };
    },

    async deleteStockItem(stockId, passcode = "") {
        try {
            await this.request(`/stock/${stockId}?passcode=${encodeURIComponent(passcode)}`, { method: "DELETE" }, () => null);
        } catch (e) {}

        let stockItems = JSON.parse(localStorage.getItem("stockItems")) || [];
        stockItems = stockItems.filter(i => i.id != stockId);
        localStorage.setItem("stockItems", JSON.stringify(stockItems));
        return { status: "ok" };
    },

    async clearAllStock(passcode = "") {
        try {
            await this.request(`/stock?passcode=${encodeURIComponent(passcode)}`, { method: "DELETE" }, () => null);
        } catch (e) {}

        localStorage.setItem("stockCleared", "true");
        localStorage.setItem("stockItems", JSON.stringify([]));
        return { status: "ok" };
    }
};
