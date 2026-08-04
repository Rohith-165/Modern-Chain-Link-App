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
        formData.append("username", email);
        formData.append("password", password);

        try {
            const response = await fetch(`${API_BASE_URL}/auth/login`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/x-www-form-urlencoded"
                },
                body: formData
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.detail || "Invalid Email Address or Password");
            }

            const data = await response.json();
            this.setToken(data.access_token);
            localStorage.setItem("isLoggedIn", "true");
            localStorage.setItem("adminName", data.user.full_name || "Santhosh Kumar");
            return data;
        } catch (err) {
            const message = err?.message || "";
            const isNetworkError = message === "Failed to fetch" || message === "NetworkError when attempting to fetch resource." || err instanceof TypeError;
            if (isNetworkError) {
                throw new Error("Unable to connect to the backend API at http://localhost:8000. Please start the FastAPI backend and reload the page.");
            }
            throw err;
        }
    },

    // 2. DASHBOARD
    async getDashboardSummary() {
        return this.request("/dashboard/summary", { method: "GET" }, () => {
            const orders = JSON.parse(localStorage.getItem("orders")) || [];
            return {
                total_orders: orders.length,
                pending_orders: orders.filter(o => o.status === "Pending").length,
                processing_orders: orders.filter(o => o.status === "Processing").length,
                delivered_orders: orders.filter(o => o.status === "Delivered").length,
                total_revenue: orders.reduce((s, o) => s + Number(o.totalAmount || 0), 0),
                total_paid: orders.reduce((s, o) => s + Number(o.amountPaid || 0), 0),
                total_balance: orders.reduce((s, o) => s + Number(o.balanceAmount || 0), 0),
                total_customers: new Set(orders.map(o => o.phoneNumber)).size,
                recent_orders: orders.slice(-5).reverse().map(o => ({
                    order_id: o.orderId,
                    customer_name: o.customerName,
                    phone_number: o.phoneNumber,
                    total_amount: o.totalAmount,
                    balance_amount: o.balanceAmount,
                    status: o.status
                }))
            };
        });
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
    async getOrders(status = "All", search = "") {
        const params = new URLSearchParams();
        if (status && status !== "All") params.append("status", status);
        if (search) params.append("search", search);
        const query = params.toString() ? `?${params.toString()}` : "";

        return this.request(`/orders${query}`, { method: "GET" }, () => {
            let orders = JSON.parse(localStorage.getItem("orders")) || [];
            if (status !== "All") orders = orders.filter(o => o.status === status);
            if (search) {
                const s = search.toLowerCase();
                orders = orders.filter(o =>
                    (o.orderId || "").toLowerCase().includes(s) ||
                    (o.customerName || "").toLowerCase().includes(s) ||
                    (o.phoneNumber || "").toLowerCase().includes(s)
                );
            }
            return orders.map(o => ({
                order_id: o.orderId,
                customer_name: o.customerName,
                phone_number: o.phoneNumber,
                order_type: o.orderType,
                total_amount: o.totalAmount,
                balance_amount: o.balanceAmount,
                status: o.status
            }));
        });
    },

    async getOrder(orderId) {
        return this.request(`/orders/${orderId}`, { method: "GET" }, () => {
            const orders = JSON.parse(localStorage.getItem("orders")) || [];
            const o = orders.find(item => item.orderId === orderId);
            if (!o) return null;
            return {
                order_id: o.orderId,
                customer_name: o.customerName,
                phone_number: o.phoneNumber,
                address: o.address,
                order_type: o.orderType,
                material_type: o.materialType,
                diamond_size: o.diamondSize,
                brand: o.brand,
                height: o.height,
                length: o.length,
                sqft_price: o.sqftPrice,
                area: o.area,
                material_cost: o.materialCost,
                barbed_wire: o.barbedWire,
                binding_wire: o.bindingWire,
                labour: o.labour,
                travel: o.travel,
                stone: o.stone,
                total_amount: o.totalAmount,
                amount_paid: o.amountPaid,
                balance_amount: o.balanceAmount,
                status: o.status,
                payments: (o.payments || []).map(p => ({
                    id: p.id,
                    amount: p.amount,
                    payment_mode: p.mode || p.payment_mode,
                    notes: p.notes,
                    created_at: p.date || p.created_at
                }))
            };
        });
    },

    async createOrder(orderPayload) {
        return this.request("/orders", {
            method: "POST",
            body: JSON.stringify(orderPayload)
        }, () => null);
    },

    async updateOrder(orderId, orderPayload) {
        return this.request(`/orders/${orderId}`, {
            method: "PUT",
            body: JSON.stringify(orderPayload)
        }, () => null);
    },

    // 5. PAYMENTS
    async addPayment(orderId, paymentPayload) {
        return this.request(`/payments/${orderId}`, {
            method: "POST",
            body: JSON.stringify(paymentPayload)
        }, () => null);
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
    }
};
